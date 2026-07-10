// Backend content endpoints intentionally return locale-neutral enum tokens
// (status/maturity/difficulty) so content_check and the Pydantic schemas stay
// language-agnostic. These maps translate those tokens for display only.

const STATUS_LABELS: Record<string, { 'zh-CN': string; 'en-US': string }> = {
  Verified: { 'zh-CN': '已验证', 'en-US': 'Verified' },
  Draft: { 'zh-CN': '草稿', 'en-US': 'Draft' },
  Stale: { 'zh-CN': '待更新', 'en-US': 'Stale' },
  Deprecated: { 'zh-CN': '已废弃', 'en-US': 'Deprecated' },
};

const MATURITY_LABELS: Record<string, { 'zh-CN': string; 'en-US': string }> = {
  'Early Adoption': { 'zh-CN': '早期采用', 'en-US': 'Early Adoption' },
  'Production Ready': { 'zh-CN': '生产就绪', 'en-US': 'Production Ready' },
  Mature: { 'zh-CN': '成熟稳定', 'en-US': 'Mature' },
  Experimental: { 'zh-CN': '实验性', 'en-US': 'Experimental' },
};

const DIFFICULTY_LABELS: Record<string, { 'zh-CN': string; 'en-US': string }> = {
  Beginner: { 'zh-CN': '入门', 'en-US': 'Beginner' },
  Intermediate: { 'zh-CN': '中级', 'en-US': 'Intermediate' },
  Advanced: { 'zh-CN': '高级', 'en-US': 'Advanced' },
};

function translate(
  labels: Record<string, { 'zh-CN': string; 'en-US': string }>,
  value: string,
  locale: string,
): string {
  const entry = labels[value];
  if (!entry) return value;
  return locale.startsWith('en') ? entry['en-US'] : entry['zh-CN'];
}

export function translateStatus(status: string, locale: string): string {
  return translate(STATUS_LABELS, status, locale);
}

export function translateMaturity(maturity: string, locale: string): string {
  return translate(MATURITY_LABELS, maturity, locale);
}

export function translateDifficulty(difficulty: string, locale: string): string {
  return translate(DIFFICULTY_LABELS, difficulty, locale);
}
