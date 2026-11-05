/** Typed, safe errors; raw Auth/PostgREST messages may contain sensitive data. */
export class SurveyError extends Error {
  constructor(code) { super(code); this.code = code; }
}

/** Fetch JSON with a bounded lifetime. Inject fetch for offline fault tests. */
export async function requestJson(options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);
  const abort = () => controller.abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  try {
    const response = await options.fetch(options.url, {
      ...options.init, signal: controller.signal, cache: "no-store",
    });
    if (!response.ok) {
      const code = response.status === 401 ? "SESSION_EXPIRED"
        : response.status === 403 ? "NOT_AUTHORIZED"
        : response.status === 429 ? "RATE_LIMITED" : "REQUEST_FAILED";
      throw new SurveyError(code);
    }
    if (response.status === 204) return null;
    try { return await response.json(); }
    catch { throw new SurveyError("INVALID_RESPONSE"); }
  } catch (error) {
    if (error instanceof SurveyError) throw error;
    if (options.signal?.aborted) throw new SurveyError("SESSION_CHANGED");
    if (controller.signal.aborted) throw new SurveyError("TIMEOUT");
    throw new SurveyError("NETWORK_ERROR");
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", abort);
  }
}
