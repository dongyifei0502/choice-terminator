/**
 * API 服务封装 — 所有后端请求统一处理
 */
const ApiService = {
  // 后端地址（同源部署时为空，开发时填写完整URL）
  BASE: '',

  _token() {
    return Store.user.token || '';
  },

  async _fetch(method, path, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (this._token()) {
      opts.headers['Authorization'] = 'Bearer ' + this._token();
    }
    if (body) {
      opts.body = JSON.stringify(body);
    }
    const resp = await fetch(this.BASE + path, opts);
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || '请求失败');
    }
    return data;
  },

  // ── 认证 ──
  register(username, password) {
    return this._fetch('POST', '/api/auth/register', { username, password });
  },

  login(username, password) {
    return this._fetch('POST', '/api/auth/login', { username, password });
  },

  getMe() {
    return this._fetch('GET', '/api/auth/me');
  },

  // ── 问题库 ──
  getQuestions() {
    return this._fetch('GET', '/api/questions');
  },

  saveQuestions(questions) {
    return this._fetch('PUT', '/api/questions', { questions });
  },

  // ── 历史记录 ──
  getHistory() {
    return this._fetch('GET', '/api/history');
  },

  saveHistory(record) {
    return this._fetch('POST', '/api/history', {
      id: record.id,
      category: record.category,
      options: record.options,
      questions: record.questions,
      scores: record.scores,
      finalScores: record.finalScores,
      recommendation: record.recommendation,
      reason: record.reason
    });
  },

  deleteHistory(recordId) {
    return this._fetch('DELETE', '/api/history/' + recordId);
  },

  clearHistory() {
    return this._fetch('DELETE', '/api/history/clear');
  },

  // ── 配置 ──
  getConfig() {
    return this._fetch('GET', '/api/config');
  }
};
