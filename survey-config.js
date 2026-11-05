/* ===== Configuration: edit before deploying ===== */
globalThis.SURVEY_CONFIG = {
  // How the team is described to respondents. Switch to the product name once the trademark and domains are secured.
  brand: { en: "an Auckland POS startup", zh: "奥克兰的一家POS系统初创团队" },
  contactEmail: "frankliu.work@outlook.com", // where respondents can ask questions or request deletion
  // Supabase project used to store submissions as JSON (see README for the table SQL).
  // Leave url or anonKey empty to let respondents download or copy their answers and email them instead.
  // The publishable (anon) key is public by design; never put the secret key here. the table's row-level security only allows inserts.
  supabase: { url: "https://lqhdboipglxyfoqixsmz.supabase.co", anonKey: "sb_publishable_qlSD12af6YfPjdT7wale3Q_-iOJQYfB", table: "survey_responses" },
  // Shown in the privacy notice when online submission is on.
  providerNote: { en: "Submitted answers are stored in my database hosted by Supabase.", zh: "在线提交的答卷保存在我的数据库中，由 Supabase 托管。" },
  retentionNote: { en: "I keep responses for up to 24 months, then delete them.", zh: "答卷最长保存24个月，之后删除。" }
};
/* ================================================= */