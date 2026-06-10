(function() {
  'use strict';

  console.log('🎯 选择困难终结 — 初始化完成');

  // ==================== 首页逻辑 ====================

  let currentCategory = 'general';

  function initHome() {
    const inputEl = document.getElementById('option-input');
    const tagsEl = document.getElementById('tags-container');
    const btnStart = document.getElementById('btn-start');
    const sceneSelector = document.getElementById('scene-selector');
    const TAG_COLORS = ['yellow', 'pink', 'mint', 'peach'];

    // 恢复场景
    if (Store.quiz.category) {
      currentCategory = Store.quiz.category;
      updateSceneButtons(sceneSelector, currentCategory);
      updatePlaceholder(currentCategory);
    }

    // 场景切换
    sceneSelector.querySelectorAll('.scene-btn').forEach(btn => {
      btn.onclick = function() {
        currentCategory = this.dataset.category;
        Store.quiz.category = currentCategory;
        updateSceneButtons(sceneSelector, currentCategory);
        updatePlaceholder(currentCategory);
        inputEl.focus();
      };
    });

    function updatePlaceholder(cat) {
      const catInfo = CONSTANTS.CATEGORIES[cat];
      inputEl.placeholder = catInfo ? catInfo.placeholder : CONSTANTS.CATEGORIES.general.placeholder;
    }

    function updateSceneButtons(container, activeCat) {
      container.querySelectorAll('.scene-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.category === activeCat);
      });
    }

    function renderTags(options) {
      if (!options || options.length === 0) {
        tagsEl.innerHTML = '<span class="tags-empty">输入选项后将在此显示标签</span>';
        btnStart.classList.add('btn-disabled');
        return;
      }
      tagsEl.innerHTML = options.map((opt, i) =>
        '<span class="tag ' + TAG_COLORS[i % TAG_COLORS.length] + '">' +
          escapeHTML(opt) +
          ' <span class="tag-close" data-index="' + i + '">✕</span>' +
        '</span>'
      ).join('');
      if (options.length >= CONSTANTS.OPTION_MIN) {
        btnStart.classList.remove('btn-disabled');
      } else {
        btnStart.classList.add('btn-disabled');
      }
    }

    inputEl.oninput = function() {
      const options = parseOptions(this.value);
      renderTags(options);
      Store.quiz.options = options;
    };

    tagsEl.onclick = function(e) {
      if (e.target.classList.contains('tag-close')) {
        const idx = parseInt(e.target.dataset.index);
        Store.quiz.options.splice(idx, 1);
        inputEl.value = Store.quiz.options.join(', ');
        renderTags(Store.quiz.options);
      }
    };

    btnStart.onclick = function() {
      if (this.classList.contains('btn-disabled')) return;
      if (Store.quiz.options.length < CONSTANTS.OPTION_MIN) {
        alert('请至少输入 2 个选项');
        return;
      }
      if (Store.quiz.options.length > CONSTANTS.OPTION_MAX) {
        alert('最多支持 ' + CONSTANTS.OPTION_MAX + ' 个选项');
        return;
      }
      Store.quiz.category = currentCategory;
      const enabledCount = Store.questions.filter(q => q.enabled && q.category === currentCategory).length;
      if (enabledCount === 0) {
        // 当前场景无题目，尝试用全部
        const allEnabled = Store.questions.filter(q => q.enabled).length;
        if (allEnabled === 0) {
          alert('暂无可用问题，请在管理页中启用至少 1 道题');
          return;
        }
      }
      if (!Store.questions || Store.questions.length === 0) {
        QuestionService.loadQuestions().then(() => Router.navigate('quiz'));
      } else {
        Router.navigate('quiz');
      }
    };

    document.getElementById('btn-goto-history').onclick = function() {
      Router.navigate('history');
    };
    document.getElementById('btn-goto-admin').onclick = function() {
      Router.navigate('admin');
    };

    if (Store.quiz.options.length > 0) {
      inputEl.value = Store.quiz.options.join(', ');
      renderTags(Store.quiz.options);
    }
  }

  // ==================== 问答页逻辑 ====================

  function initQuiz() { /* noop — startQuiz handles it */ }

  function startQuiz() {
    Store.quiz.questions = QuestionService.selectQuestions(Store.quiz.category);

    if (!Store.quiz.questions || Store.quiz.questions.length === 0) {
      alert('暂无可用问题，请在管理页中启用至少 1 道题');
      Router.navigate('home');
      return;
    }

    Store.quiz.currentIndex = 0;
    Store.quiz.scores = {};
    Store.quiz.tiedOptions = [];
    renderCurrentQuestion();
  }

  function renderCurrentQuestion() {
    if (!Store.quiz.questions || Store.quiz.questions.length === 0) {
      alert('暂无可用问题，请联系管理员');
      Router.navigate('home');
      return;
    }

    const q = Store.quiz.questions[Store.quiz.currentIndex];
    const idx = Store.quiz.currentIndex;
    const total = Store.quiz.questions.length;

    updateProgress(idx + 1, total);
    document.getElementById('quiz-weight-badge').textContent = '权重 ×' + q.weight;
    document.getElementById('quiz-question-text').textContent = q.text;

    const saved = Store.quiz.scores[q.id] || {};
    document.getElementById('quiz-sliders-container').innerHTML =
      renderSlidersHTML(q, Store.quiz.options, saved);
    bindSliderEvents();

    document.getElementById('btn-prev').style.visibility = idx === 0 ? 'hidden' : 'visible';

    const isLast = idx === total - 1;
    const btnNext = document.getElementById('btn-next');
    btnNext.textContent = isLast ? '✨ 查看结果' : '下一题 →';
    btnNext.className = isLast ? 'btn btn-pink' : 'btn btn-primary';
  }

  function goNext() {
    const q = Store.quiz.questions[Store.quiz.currentIndex];
    Store.quiz.scores[q.id] = collectScores();

    if (Store.quiz.currentIndex >= Store.quiz.questions.length - 1) {
      Router.navigate('result');
      return;
    }
    Store.quiz.currentIndex++;
    renderCurrentQuestion();
  }

  function goPrev() {
    if (Store.quiz.currentIndex <= 0) return;
    const q = Store.quiz.questions[Store.quiz.currentIndex];
    Store.quiz.scores[q.id] = collectScores();
    Store.quiz.currentIndex--;
    renderCurrentQuestion();
  }

  // ==================== 结果页逻辑 ====================

  function initResult(data) {
    if (data && data.fromHistory) {
      renderResultPage(data.record);
      return;
    }

    const result = ScoreEngine.run(
      Store.quiz.options,
      Store.quiz.questions,
      Store.quiz.scores
    );
    Store.quiz.finalScores = result.finalScores;
    Store.quiz.recommendation = result.winner;
    Store.quiz.tiedOptions = result.tiedOptions || [];
    Store.quiz._isTie = result.isTie;

    renderResultPage({
      options: Store.quiz.options,
      questions: Store.quiz.questions,
      scores: Store.quiz.scores,
      finalScores: result.finalScores,
      recommendation: result.winner,
      reason: Store.quiz.reason || '',
      isTie: result.isTie,
      tiedOptions: result.tiedOptions || []
    });

    const btnSave = document.getElementById('btn-save-history');
    if (btnSave) btnSave.style.display = '';
    btnSave.onclick = saveToHistory;
  }

  function renderResultPage(record) {
    const { options, questions, scores, finalScores, recommendation, reason, isTie, tiedOptions } = record;

    document.getElementById('result-winner').textContent = '🏆 ' + recommendation;
    document.getElementById('result-score').textContent =
      '加权总分 · ' + finalScores[recommendation] + ' 分';

    // 平局标记
    const tieBadge = document.getElementById('result-tie-badge');
    const tieActions = document.getElementById('result-tie-actions');
    if (isTie && tiedOptions && tiedOptions.length > 1) {
      tieBadge.style.display = '';
      tieActions.style.display = '';
      // 换一个按钮
      document.getElementById('btn-reroll').onclick = function() {
        Store.quiz.recommendation = ScoreEngine.reroll(
          Store.quiz.recommendation, tiedOptions, finalScores
        );
        const newReason = ReasonGenerator.generate(
          Store.quiz.recommendation, finalScores, scores, questions, options, true, tiedOptions
        );
        Store.quiz.reason = newReason;
        document.getElementById('result-winner').textContent = '🏆 ' + Store.quiz.recommendation;
        document.getElementById('result-score').textContent =
          '加权总分 · ' + finalScores[Store.quiz.recommendation] + ' 分';
        document.getElementById('reason-text').textContent = newReason;
        renderBarChart('chartResult', options, finalScores, Store.quiz.recommendation);
      };
    } else {
      tieBadge.style.display = 'none';
      tieActions.style.display = 'none';
    }

    renderScoreDetailTable(options, questions, scores, finalScores, recommendation);

    let reasonText = reason;
    if (!reasonText && questions && scores && options) {
      reasonText = ReasonGenerator.generate(
        recommendation, finalScores, scores, questions, options, isTie, tiedOptions
      );
      Store.quiz.reason = reasonText;
    }
    document.getElementById('reason-text').textContent = reasonText || '--';

    renderBarChart('chartResult', options, finalScores, recommendation);

    const btnSave = document.getElementById('btn-save-history');
    const btnRestart = document.getElementById('btn-restart');
    const isFromHistory = Store._viewingFromHistory;

    if (isFromHistory) {
      if (btnSave) btnSave.style.display = 'none';
      if (btnRestart) {
        btnRestart.textContent = '← 返回历史列表';
        btnRestart.className = 'btn btn-ghost btn-sm';
        btnRestart.onclick = function() {
          Store._viewingFromHistory = false;
          Router.navigate('history');
        };
      }
    } else {
      if (btnSave) { btnSave.style.display = ''; btnSave.onclick = saveToHistory; }
      if (btnRestart) {
        btnRestart.textContent = '🔄 重新开始';
        btnRestart.className = 'btn btn-ghost btn-sm';
        btnRestart.onclick = function() {
          Store.resetQuiz();
          const inputEl = document.getElementById('option-input');
          if (inputEl) inputEl.value = '';
          Router.navigate('home');
        };
      }
    }
  }

  function renderScoreDetailTable(options, questions, scores, finalScores, winner) {
    const thead = document.querySelector('#score-detail-table thead');
    const tbody = document.querySelector('#score-detail-table tbody');

    let headHTML = '<tr><th style="text-align:left;">问题（权重）</th>';
    options.forEach(opt => { headHTML += '<th>' + escapeHTML(opt) + '</th>'; });
    headHTML += '</tr>';
    thead.innerHTML = headHTML;

    let bodyHTML = '';
    questions.forEach(q => {
      bodyHTML += '<tr><td style="text-align:left;">' + escapeHTML(q.text) + '（×' + q.weight + '）</td>';
      options.forEach(opt => {
        const s = (scores[q.id] && scores[q.id][opt] !== undefined) ? scores[q.id][opt] : '-';
        bodyHTML += '<td>' + s + '</td>';
      });
      bodyHTML += '</tr>';
    });

    bodyHTML += '<tr style="font-weight:800;"><td style="text-align:left;">加权总分</td>';
    options.forEach(opt => {
      bodyHTML += '<td' + (opt === winner ? ' class="highlight"' : '') + '>' + finalScores[opt] + '</td>';
    });
    bodyHTML += '</tr>';

    tbody.innerHTML = bodyHTML;
  }

  function saveToHistory() {
    const record = {
      id: HistoryService.generateId(),
      timestamp: new Date().toISOString(),
      category: Store.quiz.category,
      options: Store.quiz.options.slice(),
      questions: Store.quiz.questions.map(q => ({ id: q.id, text: q.text, weight: q.weight, category: q.category })),
      scores: JSON.parse(JSON.stringify(Store.quiz.scores)),
      finalScores: Object.assign({}, Store.quiz.finalScores),
      recommendation: Store.quiz.recommendation,
      reason: Store.quiz.reason || ''
    };
    HistoryService.save(record);
    alert('已保存到历史记录');
  }

  // ==================== 历史页逻辑 ====================

  function initHistory(data) {
    const listEl = document.getElementById('history-list');
    if (!listEl) return;

    const records = HistoryService.getAll();

    if (!records || records.length === 0) {
      listEl.innerHTML = '<p style="text-align:center;color:var(--gray-mid);padding:40px;">暂无历史记录</p>';
    } else {
      listEl.innerHTML = records.map(r => {
        const time = new Date(r.timestamp).toLocaleString('zh-CN');
        const catLabel = (CONSTANTS.CATEGORIES[r.category] || CONSTANTS.CATEGORIES.general).label;
        const optionsText = r.options.length > 3
          ? r.options.slice(0, 3).join('、') + '...（共' + r.options.length + '项）'
          : r.options.join('、');
        return '<div class="history-item">' +
          '<div class="history-meta">' +
            '<span class="history-time">' + catLabel + ' · ' + time + '</span>' +
            '<span class="history-options">' + escapeHTML(optionsText) + '</span>' +
          '</div>' +
          '<div class="history-result">' +
            '<span class="crown">🏆</span> ' + escapeHTML(r.recommendation) +
            ' <button class="btn btn-xs btn-ghost" data-history-id="' + r.id + '">查看 →</button>' +
          '</div>' +
        '</div>';
      }).join('');

      listEl.querySelectorAll('[data-history-id]').forEach(btn => {
        btn.onclick = function() {
          const id = this.dataset.historyId;
          const record = HistoryService.getById(id);
          if (record) {
            Store.quiz.options = record.options;
            Store.quiz.questions = record.questions;
            Store.quiz.scores = record.scores;
            Store.quiz.finalScores = record.finalScores;
            Store.quiz.recommendation = record.recommendation;
            Store.quiz.reason = record.reason;
            Store.quiz.category = record.category || 'general';
            Store._viewingFromHistory = true;
            Router.navigate('result', { fromHistory: true, record: record });
          }
        };
      });
    }

    document.getElementById('btn-export-json').onclick = function() {
      ExportService.exportJSON(HistoryService.getAll());
    };
    document.getElementById('btn-export-csv').onclick = function() {
      ExportService.exportCSV(HistoryService.getAll());
    };
    document.getElementById('btn-clear-history').onclick = function() {
      if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
        HistoryService.clearAll();
        initHistory();
      }
    };
  }

  // ==================== 管理页逻辑（无密码） ====================

  let adminFilterCategory = 'all';

  function initAdmin(data) {
    showAdminPanel();
  }

  function showAdminPanel() {
    renderAdminTable();

    document.getElementById('btn-admin-back').onclick = function() {
      Router.navigate('home');
    };

    document.getElementById('btn-admin-save').onclick = function() {
      if (QuestionService.saveQuestions()) {
        alert('已保存修改');
      } else {
        alert('保存失败，请检查浏览器存储空间');
      }
    };

    // 分类筛选
    const filterEl = document.getElementById('admin-category-filter');
    if (filterEl) {
      filterEl.querySelectorAll('.scene-btn').forEach(btn => {
        btn.onclick = function() {
          adminFilterCategory = this.dataset.category;
          filterEl.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          renderAdminTable();
        };
      });
    }

    // 添加问题
    document.getElementById('btn-add-question').onclick = function() {
      const catEl = document.getElementById('new-question-category');
      const textEl = document.getElementById('new-question-text');
      const weightEl = document.getElementById('new-question-weight');
      const category = catEl.value;
      const text = textEl.value.trim();
      const weight = parseInt(weightEl.value) || 2;

      if (!text) { alert('请输入问题文本'); return; }
      if (Store.questions.some(q => q.text === text && q.category === category)) {
        alert('该场景下已存在相同问题');
        return;
      }
      if (weight < CONSTANTS.WEIGHT_MIN || weight > CONSTANTS.WEIGHT_MAX) {
        alert('权重范围为 ' + CONSTANTS.WEIGHT_MIN + '-' + CONSTANTS.WEIGHT_MAX);
        return;
      }

      QuestionService.addQuestion(text, weight, category);
      textEl.value = '';
      weightEl.value = '2';
      renderAdminTable();
    };
  }

  function renderAdminTable() {
    const tbody = document.getElementById('admin-questions-tbody');
    if (!tbody) return;

    let questions = Store.questions;
    if (adminFilterCategory !== 'all') {
      questions = questions.filter(q => q.category === adminFilterCategory);
    }

    const CAT_LABELS = {
      food: '🍽️ 餐饮', shopping: '🛒 购物', travel: '✈️ 旅行', general: '📋 通用'
    };

    tbody.innerHTML = questions.map((q, i) => {
      return '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + (CAT_LABELS[q.category] || q.category) + '</td>' +
        '<td style="font-weight:700;">' + escapeHTML(q.text) + '</td>' +
        '<td><span class="weight-badge weight-' + q.weight + '">×' + q.weight + '</span></td>' +
        '<td><span class="toggle' + (q.enabled ? ' on' : '') + '" data-toggle-id="' + q.id + '"></span></td>' +
        '<td>' +
          '<span class="action-link" data-edit-id="' + q.id + '">编辑</span>' +
          '<span class="action-link danger" data-delete-id="' + q.id + '">删除</span>' +
        '</td>' +
      '</tr>';
    }).join('');

    // toggle
    tbody.querySelectorAll('.toggle').forEach(toggle => {
      toggle.onclick = function() {
        const id = this.dataset.toggleId;
        const q = Store.questions.find(q => q.id === id);
        if (q) { q.enabled = !q.enabled; this.classList.toggle('on', q.enabled); }
      };
    });

    // 编辑
    tbody.querySelectorAll('[data-edit-id]').forEach(link => {
      link.onclick = function() {
        const id = this.dataset.editId;
        const q = Store.questions.find(q => q.id === id);
        if (!q) return;

        const newText = prompt('修改问题文本：', q.text);
        if (newText === null) return;
        const trimmed = newText.trim();
        if (!trimmed) { alert('问题文本不能为空'); return; }

        const newWeightStr = prompt('修改权重（1-3）：', q.weight);
        if (newWeightStr === null) return;
        const newWeight = parseInt(newWeightStr);
        if (isNaN(newWeight) || newWeight < CONSTANTS.WEIGHT_MIN || newWeight > CONSTANTS.WEIGHT_MAX) {
          alert('权重范围为 ' + CONSTANTS.WEIGHT_MIN + '-' + CONSTANTS.WEIGHT_MAX);
          return;
        }

        const catKeys = Object.keys(CONSTANTS.CATEGORIES);
        const catNames = catKeys.map(k => CONSTANTS.CATEGORIES[k].label).join('/');
        const newCat = prompt('修改场景（' + catNames + '）：', q.category);
        if (newCat === null) return;
        const validCat = catKeys.includes(newCat) ? newCat : q.category;

        QuestionService.updateQuestion(id, { text: trimmed, weight: newWeight, category: validCat });
        renderAdminTable();
      };
    });

    // 删除
    tbody.querySelectorAll('[data-delete-id]').forEach(link => {
      link.onclick = function() {
        const id = this.dataset.deleteId;
        const enabledCount = Store.questions.filter(q => q.enabled).length;
        const targetQ = Store.questions.find(q => q.id === id);
        if (targetQ && targetQ.enabled && enabledCount <= 1) {
          alert('至少需要 1 个启用的题目，无法删除');
          return;
        }
        showConfirm('确定要删除该问题吗？', function() {
          QuestionService.deleteQuestion(id);
          renderAdminTable();
        });
      };
    });
  }

  // ==================== 配置加载 ====================

  function loadConfig() {
    fetch('data/config.json')
      .then(resp => resp.json())
      .then(data => { Store.config = data; })
      .catch(() => {
        Store.config = {
          adminPassword: CONSTANTS.DEFAULT_ADMIN_PASSWORD,
          maxHistoryRecords: CONSTANTS.MAX_HISTORY_RECORDS,
          maxOptions: CONSTANTS.OPTION_MAX,
          maxQuestionsPerQuiz: CONSTANTS.MAX_QUESTIONS_PER_QUIZ
        };
      });
  }

  // ==================== 初始化 ====================

  function boot() {
    loadConfig();
    QuestionService.loadQuestions().then(() => {
      document.getElementById('btn-next').onclick = goNext;
      document.getElementById('btn-prev').onclick = goPrev;
      initHome();
    });
  }

  // Router.navigate 拦截 — quiz 跳转时触发起步
  const originalNavigate = Router.navigate;
  Router.navigate = function(page, data) {
    if (page === 'quiz') {
      const inputEl = document.getElementById('option-input');
      if (inputEl) {
        Store.quiz.options = parseOptions(inputEl.value);
      }
      if (Store.quiz.options.length < CONSTANTS.OPTION_MIN) {
        alert('请至少输入 2 个选项');
        return;
      }
    }
    originalNavigate(page, data);
    if (page === 'quiz') {
      startQuiz();
    }
  };

  window.initHome = initHome;
  window.initQuiz = function() {};
  window.initResult = initResult;
  window.initHistory = initHistory;
  window.initAdmin = initAdmin;

  boot();
})();
