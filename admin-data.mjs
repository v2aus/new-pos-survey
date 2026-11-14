import { SurveyError } from "./admin-http.mjs";
const isObject = value => value !== null && typeof value === "object" && !Array.isArray(value);
const text = value => typeof value === "string" && value.trim() ? value : "未填写";

/**
 * Show the question and section in the language the respondent used. Submissions store English text,
 * so the Chinese text comes from the shared question bank by question id; if the id is unknown
 * (or the bank is not loaded) fall back to what was stored.
 */
function localizedText(answer, language) {
  const stored = { section: answer.section, question: answer.question };
  const bank = globalThis.SURVEY_SECTIONS;
  if (language !== "zh" || !Array.isArray(bank)) return stored;
  for (const section of bank) {
    const found = section.qs.find(question => question.id === answer.id);
    if (found) return { section: section.zh, question: found.zh };
  }
  return stored;
}

/**
 * The number the question had on the page the respondent saw. Submissions store it as `n`; an older
 * submission without a usable `n` falls back to the question's position in the shared bank, or to no
 * number when the id is unknown. The id is not shown: it is stable on purpose and does not follow the order.
 */
function questionNumber(answer) {
  if (Number.isSafeInteger(answer.n) && answer.n > 0) return answer.n;
  const bank = globalThis.SURVEY_SECTIONS;
  if (!Array.isArray(bank)) return null;
  let position = 0;
  for (const section of bank) {
    for (const question of section.qs) {
      position += 1;
      if (question.id === answer.id) return position;
    }
  }
  return null;
}

/** Validate legacy data without treating submitted text as markup or guessing identity. */
export function normalizeResponse(row, languageOverride) {
  if (!isObject(row) || !isObject(row.payload)) throw new SurveyError("INVALID_RESPONSE");
  const payload = row.payload;
  if (payload.answers !== undefined && !Array.isArray(payload.answers)) throw new SurveyError("INVALID_RESPONSE");
  const meta = isObject(payload.meta) ? payload.meta : {};
  const submitted = row.language === "zh" || payload.language === "zh" ? "zh" : "en";
  const language = languageOverride === "zh" || languageOverride === "en" ? languageOverride : submitted;
  const answers = (payload.answers ?? []).map(answer => {
    if (!isObject(answer) || typeof answer.answer !== "string") throw new SurveyError("INVALID_RESPONSE");
    const shown = localizedText(answer, language);
    return { id: text(answer.id), number: questionNumber(answer), section: text(shown.section),
      question: text(shown.question), answer: answer.answer };
  });
  return { id: text(row.id), company: text(row.company || meta.company),
    name: text(meta.name), role: text(meta.role), website: text(meta.website),
    email: text(meta.email), phone: text(meta.phone), language: text(row.language), displayLanguage: language, submittedLanguage: submitted,
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
