import { requestJson, SurveyError } from "./admin-http.mjs";

const PAGE_SIZE = 20;
const FACTOR_NAME = "POS Survey Admin";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:\d{2})$/;

/** Memory-only Auth and read API. Database RLS is the authorization boundary. */
export function createSurveyClient(config, options = {}) { return new SurveyClient(config, options); }
class SurveyClient {
  #config; #options; #transport; #now;
  #session = null; #factorId = null; #ready = false; #epoch = 0;
  #lifetime = new AbortController();
  constructor(config, options) {
    this.#config = config; this.#options = options;
    this.#transport = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.#now = options.now ?? Date.now;
  }
  clearSession() {
    this.#lifetime.abort(); this.#lifetime = new AbortController();
    this.#session = null; this.#factorId = null; this.#ready = false; this.#epoch++;
  }
  expire() { this.clearSession(); this.#options.onExpired?.(); }
  requireSession() {
    if (this.#session && this.#now() >= this.#session.expiresAt) this.expire();
    if (!this.#session) throw new SurveyError("LOGIN_REQUIRED");
  }
  saveToken(result) {
    if (typeof result?.access_token !== "string"
      || !Number.isFinite(result.expires_in) || result.expires_in <= 0) {
      throw new SurveyError("INVALID_RESPONSE");
    }
    // Refresh tokens are deliberately discarded; refresh requires a new login.
    this.#session = { token: result.access_token, expiresAt: this.#now() + result.expires_in * 1000 };
  }
  async call(path, body, method = "GET") {
    const generation = this.#epoch;
    const headers = { apikey: this.#config.anonKey, "Content-Type": "application/json" };
    if (this.#session) headers.Authorization = "Bearer " + this.#session.token;
    try {
      const result = await requestJson({
        url: this.#config.url.replace(/\/$/, "") + path, fetch: this.#transport,
        timeoutMs: this.#options.timeoutMs ?? 12000, signal: this.#lifetime.signal,
        init: { method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }) },
      });
      if (generation !== this.#epoch) throw new SurveyError("SESSION_CHANGED");
      return result;
    } catch (error) {
      if (generation !== this.#epoch) throw new SurveyError("SESSION_CHANGED");
      if (error.code === "SESSION_EXPIRED") this.expire();
      throw error;
    }
  }
  async signIn(email, password) {
    this.clearSession();
    const result = await this.call("/auth/v1/token?grant_type=password", { email, password }, "POST");
    this.saveToken(result);
  }
  async prepareMfa() {
    this.requireSession();
    const member = await this.call("/rest/v1/rpc/is_survey_admin", {}, "POST");
    if (member !== true) { this.clearSession(); throw new SurveyError("NOT_AUTHORIZED"); }
    const user = await this.call("/auth/v1/user");
    const factors = Array.isArray(user?.factors) ? user.factors : [];
    const verified = factors.find(item => item.factor_type === "totp" && item.status === "verified");
    if (verified && UUID.test(verified.id)) {
      this.#factorId = verified.id;
      return { secret: null };
    }
    // Abandoned unverified enrollments cannot be reused without their secret.
    for (const factor of factors) {
      if (factor.factor_type === "totp" && factor.status === "unverified"
        && factor.friendly_name === FACTOR_NAME && UUID.test(factor.id)) {
        await this.call("/auth/v1/factors/" + factor.id, undefined, "DELETE");
      }
    }
    const enrolled = await this.call("/auth/v1/factors",
      { factor_type: "totp", friendly_name: FACTOR_NAME }, "POST");
    if (!UUID.test(enrolled?.id) || typeof enrolled?.totp?.secret !== "string") {
      throw new SurveyError("INVALID_RESPONSE");
    }
    this.#factorId = enrolled.id;
    return { secret: enrolled.totp.secret };
  }
  async verifyMfa(code) {
    if (!/^\d{6}$/.test(code)) throw new SurveyError("INVALID_CODE");
    this.requireSession();
    if (!this.#factorId) throw new SurveyError("MFA_REQUIRED");
    const challenge = await this.call("/auth/v1/factors/" + this.#factorId + "/challenge", {}, "POST");
    if (typeof challenge?.id !== "string") throw new SurveyError("INVALID_RESPONSE");
    const result = await this.call("/auth/v1/factors/" + this.#factorId + "/verify",
      { challenge_id: challenge.id, code }, "POST");
    this.saveToken(result); this.#ready = true;
  }
  requireReady() {
    this.requireSession();
    if (!this.#ready) throw new SurveyError("MFA_REQUIRED");
  }
  async list(cursor = null) {
    this.requireReady();
    const query = new URLSearchParams({
      select: "id,created_at,company,language,respondent_name,answered_count",
      order: "created_at.desc,id.desc", limit: String(PAGE_SIZE + 1),
    });
    if (cursor) {
      if (!UUID.test(cursor.id) || !TIMESTAMP.test(cursor.created_at)) throw new SurveyError("INVALID_CURSOR");
      query.set("or", "(created_at.lt." + cursor.created_at + ",and(created_at.eq."
        + cursor.created_at + ",id.lt." + cursor.id + "))");
    }
    const rows = await this.call("/rest/v1/survey_response_summaries?" + query);
    if (!Array.isArray(rows) || rows.some(row => !UUID.test(row?.id)
      || !TIMESTAMP.test(row?.created_at))) throw new SurveyError("INVALID_RESPONSE");
    return { rows: rows.slice(0, PAGE_SIZE), hasNext: rows.length > PAGE_SIZE };
  }
  async detail(id) {
    this.requireReady();
    if (!UUID.test(id)) throw new SurveyError("INVALID_ID");
    const query = new URLSearchParams({
      select: "id,created_at,company,language,contact_ok,payload", id: "eq." + id, limit: "1",
    });
    const rows = await this.call("/rest/v1/survey_responses?" + query);
    if (!Array.isArray(rows)) throw new SurveyError("INVALID_RESPONSE");
    if (!rows.length) throw new SurveyError("NOT_FOUND");
    return rows[0];
  }
  async signOut() {
    const token = this.#session?.token;
    this.clearSession();
    if (!token) return;
    await requestJson({
      url: this.#config.url.replace(/\/$/, "") + "/auth/v1/logout?scope=local", fetch: this.#transport,
      timeoutMs: this.#options.timeoutMs ?? 12000,
      init: { method: "POST", headers: { apikey: this.#config.anonKey, Authorization: "Bearer " + token } },
    });
  }
  isReady() { return this.#ready && this.#session !== null && this.#now() < this.#session.expiresAt; }
}
