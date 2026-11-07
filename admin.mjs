import { createSurveyClient } from "./admin-api.mjs";
import { createAdminView } from "./admin-view.mjs";

const view = createAdminView();
const errors = {
  LOGIN_REQUIRED: "请先登录管理员账号。",
  MFA_REQUIRED: "请先完成身份验证。",
  NOT_AUTHORIZED: "此账号没有查看权限，请联系项目管理员。",
  SESSION_EXPIRED: "登录已失效，请重新登录。",
  INVALID_CODE: "请输入6位动态验证码。",
  REQUEST_FAILED: "操作未完成，请检查输入后重试；首次配置请确认后台已设置。",
  NETWORK_ERROR: "网络连接失败，请检查网络后重试。",
  TIMEOUT: "请求超时，请稍后重试。",
  INVALID_RESPONSE: "答卷或后台返回的格式不正确，请联系项目管理员。",
  RATE_LIMITED: "操作过于频繁，请稍后再试。",
  NOT_FOUND: "未找到这份答卷，请刷新列表。",
};
let client, revision = 0, detailRevision = 0, stage = "login";
let cursor = null, history = [], currentRows = [], hasNext = false;
let busy = false;

function reset(message = "") {
  revision++; detailRevision++;
  stage = "login"; cursor = null; history = []; currentRows = []; hasNext = false;
  client?.clearSession();
  view.stage("login"); view.status(message); view.busy(false);
  busy = false; pagination();
}
function pagination() {
  view.get("previous").disabled = busy || !history.length;
  view.get("next").disabled = busy || !hasNext;
  view.get("page-number").textContent = "第" + (history.length + 1) + "页";
}
function fail(error) {
  if (error.code === "SESSION_CHANGED") return;
  view.status(errors[error.code] || "操作未完成，请稍后重试。", true);
}
async function loadList() {
  const operation = ++revision; detailRevision++;
  busy = true; view.busy(true); pagination(); currentRows = []; hasNext = false;
  view.clearDetail(); view.get("response-list").replaceChildren();
  view.status("正在读取答卷…");
  try {
    const result = await client.list(cursor);
    if (operation !== revision) return;
    currentRows = result.rows; hasNext = result.hasNext;
    view.list(result, loadDetail);
    view.status(result.rows.length ? "本页 " + result.rows.length + " 份答卷" : "尚未收到答卷。");
  } catch (error) { if (operation === revision) fail(error); }
  finally { if (operation === revision) { busy = false; view.busy(false); pagination(); } }
}
async function loadDetail(id) {
  const operation = ++detailRevision, sessionRevision = revision;
  view.clearDetail(); view.status("正在读取详情…");
  try {
    const raw = await client.detail(id);
    if (operation !== detailRevision || sessionRevision !== revision) return;
    view.detail(raw); view.status("已打开答卷，题目默认按对方提交时的语言显示，可在详情里切换。");
  } catch (error) {
    if (operation === detailRevision && sessionRevision === revision) fail(error);
  }
}
async function login(event) {
  event.preventDefault(); if (busy) return;
  const operation = ++revision;
  busy = true; view.busy(true); view.status("正在登录…");
  const password = view.get("password").value; view.get("password").value = "";
  try {
    await client.signIn(view.get("email").value.trim(), password);
    const setup = await client.prepareMfa();
    if (operation !== revision) return;
    stage = "mfa"; view.mfa(setup.secret); view.status("请完成身份验证。");
  } catch (error) {
    if (operation !== revision) return;
    reset(); fail(error);
  } finally { if (operation === revision || stage === "login") { busy = false; view.busy(false); } }
}
async function verify(event) {
  event.preventDefault(); if (busy) return;
  const operation = revision;
  busy = true; view.busy(true); view.status("正在验证…");
  const code = view.get("code").value.trim(); view.get("code").value = "";
  try {
    await client.verifyMfa(code);
    if (operation !== revision) return;
    stage = "ready"; view.stage("ready"); busy = false;
    await loadList();
  } catch (error) { if (operation === revision) fail(error); }
  finally { if (operation === revision) { busy = false; view.busy(false); } }
}
async function logout() {
  const pending = client.signOut();
  reset("已退出登录。");
  try { await pending; }
  catch { if (stage === "login") view.status("本页已退出。服务器注销未完成，请关闭此页面。", true); }
}

const config = globalThis.SURVEY_CONFIG?.supabase;
if (!config?.url || !config?.anonKey) {
  reset("管理页尚未配置数据库连接，请联系项目管理员。");
  view.get("login-form").querySelector("button").disabled = true;
} else {
  client = createSurveyClient(config, { onExpired: () => reset("登录已失效，请重新登录。") });
  view.get("login-form").addEventListener("submit", login);
  view.get("mfa-form").addEventListener("submit", verify);
  view.get("logout").addEventListener("click", logout);
  view.get("refresh").addEventListener("click", () => { cursor = null; history = []; loadList(); });
  view.get("previous").addEventListener("click", () => {
    if (busy || !history.length) return;
    cursor = history.pop(); loadList();
  });
  view.get("next").addEventListener("click", () => {
    if (busy || !hasNext || !currentRows.length) return;
    history.push(cursor);
    const last = currentRows.at(-1); cursor = { created_at: last.created_at, id: last.id }; loadList();
  });
  view.get("detail").addEventListener("click", event => {
    if (event.target.id !== "download-response") return;
    if (!client.isReady()) { reset("登录已失效，请重新登录。"); return; }
    try { view.download(); } catch (error) { fail(error); }
  });
  // Periodic cleanup and pagehide also protect data on idle tabs and back/forward cache.
  setInterval(() => {
    if (stage === "ready" && !client.isReady()) reset("登录已失效，请重新登录。");
  }, 15000);
  window.addEventListener("pagehide", () => reset());
}
