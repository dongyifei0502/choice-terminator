// 全局状态管理 — 内存中的运行时状态
const Store = {
  // 决策上下文（一次完整决策流程中的状态）
  quiz: {
    category: 'general',   // string — 当前场景分类 'food'|'shopping'|'travel'|'general'
    options: [],          // string[] — 用户输入的选项
    questions: [],        // object[] — 当前轮次选中的题目
    currentIndex: 0,      // number — 当前题目索引
    scores: {},           // { questionId: { option: score } }
    finalScores: {},      // { option: totalWeightedScore }
    recommendation: '',   // string — 推荐选项名
    reason: '',           // string — 推荐理由文本
    tiedOptions: []       // string[] — 平局时的所有同分选项
  },

  // 页面当前状态
  currentPage: 'home',   // 'home' | 'quiz' | 'result' | 'history' | 'admin'

  // 管理员鉴权状态（密码已废弃，保留结构兼容）
  admin: {
    isLoggedIn: true,
    loginAttempts: 0,
    lockUntil: null
  },

  // 数据缓存（加载后缓存在内存中）
  questions: [],
  history: [],
  config: {},

  // 外部标记（不在 quiz 内，避免被 resetQuiz 清除）
  _viewingFromHistory: false,

  // 重置决策上下文（保留 category）
  resetQuiz() {
    const savedCategory = this.quiz.category;
    this.quiz = {
      category: savedCategory,
      options: [],
      questions: [],
      currentIndex: 0,
      scores: {},
      finalScores: {},
      recommendation: '',
      reason: '',
      tiedOptions: []
    };
  }
};
