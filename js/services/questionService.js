const QuestionService = {
  /**
   * 从 Store.questions 中选取本轮题目：
   * 1. 筛选 enabled === true
   * 2. 按 category 过滤（如果指定）
   * 3. 按 weight 降序排列
   * 4. 取前 MAX_QUESTIONS_PER_QUIZ 题
   * @param {string} category - 场景分类，可选
   * @returns {object[]}
   */
  selectQuestions(category) {
    let pool = Store.questions.filter(q => q.enabled);
    if (category) {
      pool = pool.filter(q => q.category === category);
    }
    // 如果该分类下没有题目，回退到全部启用的题目
    if (pool.length === 0) {
      pool = Store.questions.filter(q => q.enabled);
    }
    pool.sort((a, b) => b.weight - a.weight);
    return pool.slice(0, CONSTANTS.MAX_QUESTIONS_PER_QUIZ);
  },

  /**
   * 获取所有分类
   * @returns {string[]}
   */
  getCategories() {
    const cats = new Set(Store.questions.map(q => q.category));
    return [...cats].filter(Boolean);
  },

  /**
   * 从 questions.json 加载问题到 Store
   * 优先 localStorage，其次 fetch JSON 文件，最后默认数据
   */
  async loadQuestions() {
    // 优先从 localStorage 加载
    try {
      const raw = localStorage.getItem(CONSTANTS.STORAGE_KEY_QUESTIONS);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.length > 0) {
          Store.questions = data;
          return;
        }
      }
    } catch (e) {
      console.warn('无法从 localStorage 加载问题');
    }

    // 其次从 JSON 文件加载
    try {
      const resp = await fetch('data/questions.json');
      const data = await resp.json();
      Store.questions = data.questions || [];
    } catch (e) {
      console.warn('无法加载 questions.json，使用默认问题');
      Store.questions = getDefaultQuestions();
    }
  },

  /**
   * 新增问题
   */
  addQuestion(text, weight, category) {
    const id = CONSTANTS.QUESTION_ID_PREFIX + String(Store.questions.length + 1).padStart(3, '0');
    let finalId = id;
    let counter = Store.questions.length + 1;
    while (Store.questions.some(q => q.id === finalId)) {
      counter++;
      finalId = CONSTANTS.QUESTION_ID_PREFIX + String(counter).padStart(3, '0');
    }
    const newQ = {
      id: finalId,
      category: category || 'general',
      text: text,
      weight: weight,
      enabled: true,
      createdAt: new Date().toISOString()
    };
    Store.questions.push(newQ);
    return newQ;
  },

  /**
   * 更新问题
   */
  updateQuestion(id, updates) {
    const q = Store.questions.find(q => q.id === id);
    if (!q) return false;
    if (updates.text !== undefined) q.text = updates.text;
    if (updates.weight !== undefined) q.weight = updates.weight;
    if (updates.category !== undefined) q.category = updates.category;
    if (updates.enabled !== undefined) q.enabled = updates.enabled;
    return true;
  },

  /**
   * 删除问题
   */
  deleteQuestion(id) {
    const idx = Store.questions.findIndex(q => q.id === id);
    if (idx === -1) return false;
    Store.questions.splice(idx, 1);
    return true;
  },

  /**
   * 保存问题到 localStorage
   */
  saveQuestions() {
    try {
      localStorage.setItem(CONSTANTS.STORAGE_KEY_QUESTIONS, JSON.stringify(Store.questions));
      localStorage.setItem(CONSTANTS.STORAGE_KEY_BACKUP, JSON.stringify(Store.questions));
      return true;
    } catch (e) {
      console.warn('无法保存问题到 localStorage', e);
      return false;
    }
  }
};

/**
 * 硬编码的默认问题（fetch 失败时的兜底）
 */
function getDefaultQuestions() {
  return [
    { id: 'q001', category: 'food', text: '你对价格敏感吗？', weight: 3, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q002', category: 'food', text: '口味对你来说有多重要？', weight: 2, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q003', category: 'food', text: '用餐环境和服务重要吗？', weight: 1, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q004', category: 'food', text: '距离远近会影响你的选择吗？', weight: 2, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q005', category: 'food', text: '健康/卡路里对你重要吗？', weight: 1, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q006', category: 'shopping', text: '你的预算上限是多少？', weight: 3, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q007', category: 'shopping', text: '品牌对你来说重要吗？', weight: 2, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q008', category: 'shopping', text: '你更看重实用性还是颜值？', weight: 2, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q009', category: 'shopping', text: '售后和保修服务重要吗？', weight: 1, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q010', category: 'shopping', text: '好评率和口碑会影响你吗？', weight: 2, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q011', category: 'travel', text: '你对预算敏感吗？', weight: 3, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q012', category: 'travel', text: '风景和文化体验重要吗？', weight: 2, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q013', category: 'travel', text: '交通便利程度重要吗？', weight: 2, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q014', category: 'travel', text: '安全和语言障碍影响大吗？', weight: 2, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q015', category: 'travel', text: '季节和天气对你影响大吗？', weight: 1, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q016', category: 'general', text: '成本对你来说有多重要？', weight: 3, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q017', category: 'general', text: '时间投入是关键因素吗？', weight: 2, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q018', category: 'general', text: '长期价值和回报重要吗？', weight: 2, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q019', category: 'general', text: '风险大小会影响你吗？', weight: 1, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' },
    { id: 'q020', category: 'general', text: '个人兴趣和偏好程度？', weight: 2, enabled: true, createdAt: '2026-06-10T12:00:00+08:00' }
  ];
}
