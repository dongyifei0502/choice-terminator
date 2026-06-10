const HistoryService = {
  /**
   * 加载历史记录（优先从 localStorage，其次从 history.json）
   */
  load() {
    try {
      const raw = localStorage.getItem(CONSTANTS.STORAGE_KEY_HISTORY);
      if (raw) {
        const data = JSON.parse(raw);
        Store.history = data || [];
        return Store.history;
      }
    } catch (e) {
      console.warn('无法从 localStorage 加载历史记录', e);
    }
    Store.history = [];
    return Store.history;
  },

  /**
   * 保存一条决策记录
   * 包含：id, timestamp, options, scores, weights, questions, finalScores, recommendation, reason
   * 最多保留 MAX_HISTORY_RECORDS 条，超出淘汰最早的
   */
  save(record) {
    const records = this.getAll();
    // 添加到开头（最新）
    records.unshift(record);
    // 最多保留 MAX_HISTORY_RECORDS 条
    if (records.length > CONSTANTS.MAX_HISTORY_RECORDS) {
      records.length = CONSTANTS.MAX_HISTORY_RECORDS;
    }
    this._persist(records);
    Store.history = records;
  },

  /**
   * 根据 id 获取单条记录
   */
  getById(id) {
    const records = this.getAll();
    return records.find(r => r.id === id) || null;
  },

  /**
   * 获取全部记录（按时间倒序）
   */
  getAll() {
    if (Store.history.length > 0) return Store.history;
    return this.load();
  },

  /**
   * 清空全部记录
   */
  clearAll() {
    Store.history = [];
    this._persist([]);
  },

  /**
   * 生成唯一 ID：h + 时间戳 + 随机
   */
  generateId() {
    return CONSTANTS.HISTORY_ID_PREFIX + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },

  /**
   * 持久化到 localStorage
   */
  _persist(records) {
    try {
      localStorage.setItem(CONSTANTS.STORAGE_KEY_HISTORY, JSON.stringify(records));
    } catch (e) {
      console.warn('无法写入 localStorage', e);
      alert('本地存储不可用，历史记录无法保存');
    }
  }
};
