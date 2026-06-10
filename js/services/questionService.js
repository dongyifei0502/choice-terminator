const QuestionService = {
  selectQuestions(category) {
    var pool = Store.questions.filter(function(q) { return q.enabled; });
    if (category) {
      pool = pool.filter(function(q) { return q.category === category; });
    }
    if (pool.length === 0) {
      pool = Store.questions.filter(function(q) { return q.enabled; });
    }
    pool.sort(function(a, b) { return b.weight - a.weight; });
    return pool.slice(0, CONSTANTS.MAX_QUESTIONS_PER_QUIZ);
  },

  getCategories() {
    var cats = [];
    Store.questions.forEach(function(q) { if (cats.indexOf(q.category) === -1) cats.push(q.category); });
    return cats;
  },

  async loadQuestions() {
    // 优先 localStorage（离线兜底）
    try {
      var raw = localStorage.getItem(CONSTANTS.STORAGE_KEY_QUESTIONS);
      if (raw) {
        var data = JSON.parse(raw);
        if (data && data.length > 0) { Store.questions = data; return; }
      }
    } catch (e) {}

    // 本地 JSON 兜底
    try {
      var resp = await fetch('data/questions.json');
      var json = await resp.json();
      Store.questions = (json.questions || []).map(function(q) {
        return { id: q.id, category: q.category, text: q.text, weight: q.weight, enabled: q.enabled !== false, createdAt: q.createdAt || q.created_at, user_id: q.user_id || null };
      });
    } catch (e) {
      Store.questions = getDefaultQuestions();
    }
  },

  addQuestion(text, weight, category) {
    var counter = Store.questions.length + 1;
    var finalId;
    do {
      finalId = CONSTANTS.QUESTION_ID_PREFIX + String(counter).padStart(3, '0');
      counter++;
    } while (Store.questions.some(function(q) { return q.id === finalId; }));
    var newQ = { id: finalId, category: category || 'general', text: text, weight: weight, enabled: true, createdAt: new Date().toISOString(), user_id: Store.user.isLoggedIn ? -1 : null };
    Store.questions.push(newQ);
    return newQ;
  },

  updateQuestion(id, updates) {
    var q = Store.questions.find(function(q) { return q.id === id; });
    if (!q) return false;
    if (updates.text !== undefined) q.text = updates.text;
    if (updates.weight !== undefined) q.weight = updates.weight;
    if (updates.category !== undefined) q.category = updates.category;
    if (updates.enabled !== undefined) q.enabled = updates.enabled;
    return true;
  },

  deleteQuestion(id) {
    var idx = Store.questions.findIndex(function(q) { return q.id === id; });
    if (idx === -1) return false;
    Store.questions.splice(idx, 1);
    return true;
  },

  saveQuestions() {
    try {
      localStorage.setItem(CONSTANTS.STORAGE_KEY_QUESTIONS, JSON.stringify(Store.questions));
      localStorage.setItem(CONSTANTS.STORAGE_KEY_BACKUP, JSON.stringify(Store.questions));
      return true;
    } catch (e) { return false; }
  }
};

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
