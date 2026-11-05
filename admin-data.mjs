import { SurveyError } from "./admin-http.mjs";
const isObject = value => value !== null && typeof value === "object" && !Array.isArray(value);
const text = value => typeof value === "string" && value.trim() ? value : "未填写";

/** Validate legacy data without treating submitted text as markup or guessing identity. */
export function normalizeResponse(row) {
  if (!isObject(row) || !isObject(row.payload)) throw new SurveyError("INVALID_RESPONSE");
  const payload = row.payload;
  if (payload.answers !== undefined && !Array.isArray(payload.answers)) throw new SurveyError("INVALID_RESPONSE");
  const meta = isObject(payload.meta) ? payload.meta : {};
  const answers = (payload.answers ?? []).map(answer => {
    if (!isObject(answer) || typeof answer.answer !== "string") throw new SurveyError("INVALID_RESPONSE");
    return { id: text(answer.id), section: text(answer.section),
      question: text(answer.question), answer: answer.answer };
  });
  return { id: text(row.id), company: text(row.company || meta.company),
    name: text(meta.name), role: text(meta.role), website: text(meta.website),
    email: text(meta.email), phone: text(meta.phone), language: text(row.language),
    createdAt: row.created_at, contactOk: row.contact_ok === true, answers };
}

/** Export only the selected original response; never interpolate into HTML or CSV. */
export function downloadText(row) {
  normalizeResponse(row);
  return JSON.stringify(row, null, 2);
}

/** Consistent display time including NZ daylight saving; retain UTC in the export. */
export function formatTime(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "时间未知";
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "Pacific/Auckland",
    dateStyle: "medium", timeStyle: "short" }).format(date);
}
