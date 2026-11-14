import { normalizeResponse, downloadText, formatTime } from "./admin-data.mjs";

/** Make elements with textContent only: response strings are never interpreted as HTML. */
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

/** A small DOM adapter; state, authentication and network calls live elsewhere. */
export function createAdminView() { return new AdminView(); }
const get = id => document.getElementById(id);
class AdminView {
  #selected = null;
  #language = null; // null = 按答卷提交时的语言；"zh" / "en" = 管理员手动切换
  get = get;
  status(message = "", error = false) {
    get("status").textContent = message;
    get("status").className = error ? "error" : "";
  }
  clearDetail() {
    this.#selected = null; this.#language = null;
    const empty = element("div", undefined, "empty");
    empty.append(element("h2", "选择一份答卷"), element("p", "从列表中选择，即可逐题查看回答。"));
    get("detail").replaceChildren(empty);
  }
  stage(name) {
    for (const [id, expected] of [["login-panel", "login"], ["mfa-panel", "mfa"], ["workspace", "ready"]]) {
      get(id).hidden = name !== expected;
    }
    get("logout").hidden = name === "login";
    get("setup-secret").textContent = "";
    get("enrollment").hidden = true;
    get("password").value = ""; get("code").value = "";
    get("response-list").replaceChildren();
    this.clearDetail();
    if (name === "login") get("email").focus();
    if (name === "mfa") get("code").focus();
  }
  busy(value) {
    for (const form of document.querySelectorAll("form")) {
      for (const control of form.elements) control.disabled = value;
    }
    get("refresh").disabled = value;
    get("workspace").setAttribute("aria-busy", String(value));
  }
  mfa(secret) {
    this.stage("mfa");
    get("enrollment").hidden = !secret;
    get("setup-secret").textContent = secret || "";
  }
  list(result, select) {
    get("response-list").replaceChildren();
    if (!result.rows.length) get("response-list").append(element("p", "暂无答卷。", "muted"));
    for (const row of result.rows) {
      const button = element("button", undefined, "response");
      button.type = "button"; button.setAttribute("aria-pressed", "false");
      button.append(element("strong", row.company || "未填写公司"),
        element("span", formatTime(row.created_at)),
        element("span", (row.respondent_name || "未填写姓名") + " · " + (row.answered_count ?? 0) + "题"));
      button.addEventListener("click", () => {
        for (const item of get("response-list").children) item.setAttribute("aria-pressed", String(item === button));
        select(row.id);
      });
      get("response-list").append(button);
    }
  }
  detail(raw, keepLanguage = false) {
    if (!keepLanguage) this.#language = null;
    const response = normalizeResponse(raw, this.#language);
    this.#selected = raw;
    const panel = get("detail"); panel.replaceChildren();
    const head = element("div", undefined, "section-head");
    const download = element("button", "下载答卷");
    download.type = "button"; download.id = "download-response";
    head.append(element("h2", response.company), download); panel.append(head);
    panel.append(this.#languageSwitch(response));
    panel.append(element("p", formatTime(response.createdAt) + " · 新西兰时间", "small"));
    const meta = element("dl");
    const fields = [["姓名", response.name], ["职位", response.role], ["官网", response.website],
      ["邮箱", response.email], ["电话", response.phone], ["答卷语言", response.language],
      ["后续联系", response.contactOk ? "已同意" : "未勾选"], ["答卷编号", response.id]];
    for (const [label, value] of fields) meta.append(element("dt", label), element("dd", value));
    panel.append(meta);
    if (!response.answers.length) panel.append(element("p", "此答卷没有已回答的问题。", "muted"));
    for (const answer of response.answers) {
      const section = element("section", undefined, "answer");
      const number = answer.number === null ? "" : "第 " + answer.number + " 题 · ";
      section.append(element("small", number + answer.section),
        element("h3", answer.question), element("p", answer.answer));
      panel.append(section);
    }
    panel.focus({ preventScroll: true });
  }
  /** 题目语言切换：默认是对方提交时的语言，管理员可以手动改看另一种语言。 */
  #languageSwitch(response) {
    const bar = element("div", undefined, "lang-switch");
    bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "题目语言");
    bar.append(element("span", "题目语言：", "small"));
    for (const [code, label] of [["zh", "中文"], ["en", "English"]]) {
      const button = element("button", label);
      button.type = "button"; button.setAttribute("aria-pressed", String(response.displayLanguage === code));
      button.addEventListener("click", () => { this.#language = code; this.detail(this.#selected, true); });
      bar.append(button);
    }
    bar.append(element("span", "（此答卷提交时用" + (response.submittedLanguage === "zh" ? "中文" : "English") + "）", "small"));
    return bar;
  }
  download() {
    if (!this.#selected) return;
    const blob = new Blob([downloadText(this.#selected)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob), link = element("a");
    link.href = url; link.download = "survey-" + this.#selected.id + ".json";
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
