// 全局状态管理 — 内存中的运行时状态
const Store = {
  // 决策上下文
  quiz: {
    category: 'general',
    options: [],
    questions: [],
    currentIndex: 0,
    scores: {},
    finalScores: {},
    recommendation: '',
    reason: '',
    tiedOptions: []
  },

  currentPage: 'home',

  // 用户认证状态
  user: {
    token: localStorage.getItem('ct_token') || '',
    username: localStorage.getItem('ct_username') || '',
    role: localStorage.getItem('ct_role') || '',
    isLoggedIn: !!localStorage.getItem('ct_token')
  },

  admin: {
    isLoggedIn: true,
    loginAttempts: 0,
    lockUntil: null
  },

  questions: [],
  history: [],
  config: {},

  _viewingFromHistory: false,

  // 用户登录
  setUser(token, username, role) {
    this.user.token = token;
    this.user.username = username;
    this.user.role = role;
    this.user.isLoggedIn = true;
    localStorage.setItem('ct_token', token);
    localStorage.setItem('ct_username', username);
    localStorage.setItem('ct_role', role);
  },

  // 用户登出
  logout() {
    this.user.token = '';
    this.user.username = '';
    this.user.role = '';
    this.user.isLoggedIn = false;
    localStorage.removeItem('ct_token');
    localStorage.removeItem('ct_username');
    localStorage.removeItem('ct_role');
  },

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
