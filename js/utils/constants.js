// 所有硬编码常量集中管理
const CONSTANTS = {
  SCORE_MIN: 1,
  SCORE_MAX: 5,
  SCORE_DEFAULT: 3,
  WEIGHT_MIN: 1,
  WEIGHT_MAX: 3,
  OPTION_MIN: 2,
  OPTION_MAX: 10,
  MAX_QUESTIONS_PER_QUIZ: 5,
  MAX_HISTORY_RECORDS: 10,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 5 * 60 * 1000,
  AI_TIMEOUT_MS: 5000,
  SEPARATORS: [',', '，', ' '],
  QUESTION_ID_PREFIX: 'q',
  HISTORY_ID_PREFIX: 'h',
  DEFAULT_ADMIN_PASSWORD: 'admin',
  STORAGE_KEY_QUESTIONS: 'ct_questions',
  STORAGE_KEY_HISTORY: 'ct_history',
  STORAGE_KEY_CONFIG: 'ct_config',
  STORAGE_KEY_BACKUP: 'ct_questions_backup',
  CATEGORIES: {
    food:     { id: 'food',     label: '🍽️ 餐饮',   placeholder: '输入想吃的东西，如：火锅, 烧烤, 日料' },
    shopping: { id: 'shopping', label: '🛒 购物',   placeholder: '输入想买的东西，如：iPhone, 华为, 小米' },
    travel:   { id: 'travel',   label: '✈️ 旅行',   placeholder: '输入想去的地方，如：成都, 大理, 三亚' },
    general:  { id: 'general',  label: '📋 通用',   placeholder: '输入选项，用逗号分隔，如：选项A, 选项B, 选项C' }
  }
};
