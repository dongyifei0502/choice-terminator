(function() {
  'use strict';

  console.log('🎯 选择困难终结 — 初始化完成');

  let currentCategory = 'general';

  // ==================== 首页逻辑 ====================

  function initHome() {
    const inputEl = document.getElementById('option-input');
    const tagsEl = document.getElementById('tags-container');
    const btnStart = document.getElementById('btn-start');
    const sceneSelector = document.getElementById('scene-selector');
    const TAG_COLORS = ['yellow', 'pink', 'mint', 'peach'];

    updateUserBar();
    updateAdminButton();

    if (Store.quiz.category) {
      currentCategory = Store.quiz.category;
      updateSceneButtons(sceneSelector, currentCategory);
      updatePlaceholder(currentCategory);
    }

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
      var info = CONSTANTS.CATEGORIES[cat];
      inputEl.placeholder = info ? info.placeholder : CONSTANTS.CATEGORIES.general.placeholder;
    }

    function updateSceneButtons(container, activeCat) {
      container.querySelectorAll('.scene-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.category === activeCat);
      });
    }

    function renderTags(options) {
      if (!options || options.length === 0) {
        tagsEl.innerHTML = '<span class="tags-empty">输入选项后将在此显示标签</span>';
        btnStart.classList.add('btn-disabled');
        return;
      }
      tagsEl.innerHTML = options.map(function(opt, i) {
        return '<span class="tag ' + TAG_COLORS[i % TAG_COLORS.length] + '">' +
          escapeHTML(opt) + ' <span class="tag-close" data-index="' + i + '">✕</span></span>';
      }).join('');
      btnStart.classList.toggle('btn-disabled', options.length < CONSTANTS.OPTION_MIN);
    }

    inputEl.oninput = function() {
      var opts = parseOptions(this.value);
      renderTags(opts);
      Store.quiz.options = opts;
    };

    tagsEl.onclick = function(e) {
      if (e.target.classList.contains('tag-close')) {
        var idx = parseInt(e.target.dataset.index);
        Store.quiz.options.splice(idx, 1);
        inputEl.value = Store.quiz.options.join(', ');
        renderTags(Store.quiz.options);
      }
    };

    btnStart.onclick = function() {
      if (this.classList.contains('btn-disabled')) return;
      if (Store.quiz.options.length < CONSTANTS.OPTION_MIN) {
        alert('请至少输入 2 个选项'); return;
      }
      if (Store.quiz.options.length > CONSTANTS.OPTION_MAX) {
        alert('最多支持 ' + CONSTANTS.OPTION_MAX + ' 个选项'); return;
      }
      Store.quiz.category = currentCategory;
      var pool = Store.questions.filter(function(q) { return q.enabled && q.category === currentCategory; });
      if (pool.length === 0) {
        pool = Store.questions.filter(function(q) { return q.enabled; });
      }
      if (pool.length === 0) {
        alert('暂无可用问题，请在管理页中启用至少 1 道题'); return;
      }
      Router.navigate('quiz');
    };

    document.getElementById('btn-goto-history').onclick = function() { Router.navigate('history'); };
    document.getElementById('btn-goto-admin').onclick = function() { Router.navigate('admin'); };
    document.getElementById('btn-goto-auth').onclick = function() { Router.navigate('auth'); };

    if (Store.quiz.options.length > 0) {
      inputEl.value = Store.quiz.options.join(', ');
      renderTags(Store.quiz.options);
    }
  }

  function updateUserBar() {
    var bar = document.getElementById('user-status');
    if (Store.user.isLoggedIn) {
      bar.innerHTML = '<span style="font-weight:700;">👤 ' + escapeHTML(Store.user.username) +
        '</span> <span class="badge" style="margin-left:6px;">' +
        (Store.user.role === 'admin' ? '管理员' : '用户') + '</span>' +
        ' <button id="btn-logout" class="btn btn-ghost btn-xs">退出</button>';
      var logoutBtn = document.getElementById('btn-logout');
      if (logoutBtn) logoutBtn.onclick = function() { Store.logout(); updateUserBar(); updateAdminButton(); };
    } else {
      bar.innerHTML = '<button id="btn-goto-auth" class="btn btn-ghost btn-xs">👤 登录</button>';
      var authBtn = document.getElementById('btn-goto-auth');
      if (authBtn) authBtn.onclick = function() { Router.navigate('auth'); };
    }
  }

  function updateAdminButton() {
    var btn = document.getElementById('btn-goto-admin');
    if (btn) btn.style.display = Store.user.isLoggedIn ? '' : 'none';
  }

  // ==================== 登录/注册页 ====================

  function initAuth() {
    var loginForm = document.getElementById('auth-form-login');
    var regForm = document.getElementById('auth-form-register');
    var tabs = document.querySelectorAll('.auth-tab');

    tabs.forEach(function(tab) {
      tab.onclick = function() {
        tabs.forEach(function(t) { t.classList.remove('active'); });
        this.classList.add('active');
        var isLogin = this.dataset.tab === 'login';
        loginForm.style.display = isLogin ? '' : 'none';
        regForm.style.display = isLogin ? 'none' : '';
        document.getElementById('login-error').style.display = 'none';
        document.getElementById('reg-error').style.display = 'none';
      };
    });

    document.getElementById('btn-login').onclick = function() {
      var username = document.getElementById('login-username').value.trim();
      var password = document.getElementById('login-password').value;
      var errEl = document.getElementById('login-error');

      if (!username || !password) { errEl.textContent = '请填写用户名和密码'; errEl.style.display = ''; return; }

      ApiService.login(username, password).then(function(data) {
        Store.setUser(data.token, data.user.username, data.user.role);
        updateUserBar();
        updateAdminButton();
        Router.navigate('home');
      }).catch(function(e) {
        errEl.textContent = e.message; errEl.style.display = '';
      });
    };

    document.getElementById('btn-register').onclick = function() {
      var username = document.getElementById('reg-username').value.trim();
      var password = document.getElementById('reg-password').value;
      var errEl = document.getElementById('reg-error');

      if (!username || !password) { errEl.textContent = '请填写用户名和密码'; errEl.style.display = ''; return; }
      if (username.length < 2) { errEl.textContent = '用户名至少 2 个字符'; errEl.style.display = ''; return; }
      if (password.length < 6) { errEl.textContent = '密码至少 6 位'; errEl.style.display = ''; return; }

      ApiService.register(username, password).then(function(data) {
        Store.setUser(data.token, data.user.username, data.user.role);
        updateUserBar();
        updateAdminButton();
        Router.navigate('home');
      }).catch(function(e) {
        errEl.textContent = e.message; errEl.style.display = '';
      });
    };

    document.getElementById('btn-auth-back').onclick = function() { Router.navigate('home'); };
    document.getElementById('login-password').onkeydown = function(e) { if (e.key === 'Enter') document.getElementById('btn-login').click(); };
    document.getElementById('reg-password').onkeydown = function(e) { if (e.key === 'Enter') document.getElementById('btn-register').click(); };
  }

  // ==================== 问答页 ====================

  function initQuiz() {}

  function startQuiz() {
    Store.quiz.questions = QuestionService.selectQuestions(Store.quiz.category);
    if (!Store.quiz.questions || Store.quiz.questions.length === 0) {
      alert('暂无可用问题，请在管理页中启用至少 1 道题');
      Router.navigate('home'); return;
    }
    Store.quiz.currentIndex = 0;
    Store.quiz.scores = {};
    Store.quiz.tiedOptions = [];
    renderCurrentQuestion();
  }

  function renderCurrentQuestion() {
    if (!Store.quiz.questions || Store.quiz.questions.length === 0) {
      alert('暂无可用问题'); Router.navigate('home'); return;
    }
    var q = Store.quiz.questions[Store.quiz.currentIndex];
    var idx = Store.quiz.currentIndex;
    var total = Store.quiz.questions.length;

    updateProgress(idx + 1, total);
    document.getElementById('quiz-weight-badge').textContent = '权重 ×' + q.weight;
    document.getElementById('quiz-question-text').textContent = q.text;

    var saved = Store.quiz.scores[q.id] || {};
    document.getElementById('quiz-sliders-container').innerHTML = renderSlidersHTML(q, Store.quiz.options, saved);
    bindSliderEvents();

    document.getElementById('btn-prev').style.visibility = idx === 0 ? 'hidden' : 'visible';
    var isLast = idx === total - 1;
    var btnNext = document.getElementById('btn-next');
    btnNext.textContent = isLast ? '✨ 查看结果' : '下一题 →';
    btnNext.className = isLast ? 'btn btn-pink' : 'btn btn-primary';
  }

  function goNext() {
    var q = Store.quiz.questions[Store.quiz.currentIndex];
    Store.quiz.scores[q.id] = collectScores();
    if (Store.quiz.currentIndex >= Store.quiz.questions.length - 1) { Router.navigate('result'); return; }
    Store.quiz.currentIndex++;
    renderCurrentQuestion();
  }

  function goPrev() {
    if (Store.quiz.currentIndex <= 0) return;
    var q = Store.quiz.questions[Store.quiz.currentIndex];
    Store.quiz.scores[q.id] = collectScores();
    Store.quiz.currentIndex--;
    renderCurrentQuestion();
  }

  // ==================== 结果页 ====================

  function initResult(data) {
    if (data && data.fromHistory) { renderResultPage(data.record); return; }

    var result = ScoreEngine.run(Store.quiz.options, Store.quiz.questions, Store.quiz.scores);
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
      reason: '',
      isTie: result.isTie,
      tiedOptions: result.tiedOptions || []
    });

    var btnSave = document.getElementById('btn-save-history');
    if (btnSave) { btnSave.style.display = ''; btnSave.onclick = saveToHistory; }
  }

  function renderResultPage(record) {
    var options = record.options, questions = record.questions, scores = record.scores;
    var finalScores = record.finalScores, recommendation = record.recommendation;
    var reason = record.reason, isTie = record.isTie, tiedOptions = record.tiedOptions;

    document.getElementById('result-winner').textContent = '🏆 ' + recommendation;
    document.getElementById('result-score').textContent = '加权总分 · ' + finalScores[recommendation] + ' 分';

    var tieBadge = document.getElementById('result-tie-badge');
    var tieActions = document.getElementById('result-tie-actions');
    if (isTie && tiedOptions && tiedOptions.length > 1) {
      tieBadge.style.display = '';
      tieActions.style.display = '';
      document.getElementById('btn-reroll').onclick = function() {
        Store.quiz.recommendation = ScoreEngine.reroll(Store.quiz.recommendation, tiedOptions, finalScores);
        var newReason = ReasonGenerator.generate(Store.quiz.recommendation, finalScores, scores, questions, options, true, tiedOptions);
        Store.quiz.reason = newReason;
        document.getElementById('result-winner').textContent = '🏆 ' + Store.quiz.recommendation;
        document.getElementById('result-score').textContent = '加权总分 · ' + finalScores[Store.quiz.recommendation] + ' 分';
        document.getElementById('reason-text').textContent = newReason;
        renderBarChart('chartResult', options, finalScores, Store.quiz.recommendation);
      };
    } else {
      tieBadge.style.display = 'none';
      tieActions.style.display = 'none';
    }

    renderScoreDetailTable(options, questions, scores, finalScores, recommendation);

    var reasonText = reason;
    if (!reasonText && questions && scores && options) {
      reasonText = ReasonGenerator.generate(recommendation, finalScores, scores, questions, options, isTie, tiedOptions);
      Store.quiz.reason = reasonText;
    }
    document.getElementById('reason-text').textContent = reasonText || '--';

    renderBarChart('chartResult', options, finalScores, recommendation);

    var btnSave = document.getElementById('btn-save-history');
    var btnRestart = document.getElementById('btn-restart');
    var isFromHistory = Store._viewingFromHistory;

    if (isFromHistory) {
      if (btnSave) btnSave.style.display = 'none';
      if (btnRestart) {
        btnRestart.textContent = '← 返回历史列表';
        btnRestart.className = 'btn btn-ghost btn-sm';
        btnRestart.onclick = function() { Store._viewingFromHistory = false; Router.navigate('history'); };
      }
    } else {
      if (btnSave) { btnSave.style.display = ''; btnSave.onclick = saveToHistory; }
      if (btnRestart) {
        btnRestart.textContent = '🔄 重新开始';
        btnRestart.className = 'btn btn-ghost btn-sm';
        btnRestart.onclick = function() { Store.resetQuiz(); var el = document.getElementById('option-input'); if (el) el.value = ''; Router.navigate('home'); };
      }
    }
  }

  function renderScoreDetailTable(options, questions, scores, finalScores, winner) {
    var thead = document.querySelector('#score-detail-table thead');
    var tbody = document.querySelector('#score-detail-table tbody');

    var headHTML = '<tr><th style="text-align:left;">问题（权重）</th>';
    options.forEach(function(o) { headHTML += '<th>' + escapeHTML(o) + '</th>'; });
    headHTML += '</tr>';
    thead.innerHTML = headHTML;

    var bodyHTML = '';
    questions.forEach(function(q) {
      bodyHTML += '<tr><td style="text-align:left;">' + escapeHTML(q.text) + '（×' + q.weight + '）</td>';
      options.forEach(function(o) {
        var s = (scores[q.id] && scores[q.id][o] !== undefined) ? scores[q.id][o] : '-';
        bodyHTML += '<td>' + s + '</td>';
      });
      bodyHTML += '</tr>';
    });

    bodyHTML += '<tr style="font-weight:800;"><td style="text-align:left;">加权总分</td>';
    options.forEach(function(o) {
      bodyHTML += '<td' + (o === winner ? ' class="highlight"' : '') + '>' + finalScores[o] + '</td>';
    });
    bodyHTML += '</tr>';
    tbody.innerHTML = bodyHTML;
  }

  function saveToHistory() {
    var record = {
      id: HistoryService.generateId(),
      timestamp: new Date().toISOString(),
      category: Store.quiz.category,
      options: Store.quiz.options.slice(),
      questions: Store.quiz.questions.map(function(q) { return { id: q.id, text: q.text, weight: q.weight, category: q.category }; }),
      scores: JSON.parse(JSON.stringify(Store.quiz.scores)),
      finalScores: Object.assign({}, Store.quiz.finalScores),
      recommendation: Store.quiz.recommendation,
      reason: Store.quiz.reason || ''
    };

    // 本地保存
    HistoryService.save(record);

    // 云端同步
    if (Store.user.isLoggedIn) {
      ApiService.saveHistory(record).then(function() {
        alert('已保存到云端历史');
      }).catch(function() {
        alert('已保存到本地（云端同步失败）');
      });
    } else {
      alert('已保存到本地历史');
    }
  }

  // ==================== 历史页 ====================

  function initHistory() {
    renderHistoryPage();
  }

  function renderHistoryPage() {
    var listEl = document.getElementById('history-list');
    if (!listEl) return;

    // 返回首页
    document.getElementById('btn-history-back').onclick = function() { Router.navigate('home'); };

    // 优先从云端加载
    function renderList(records) {
      if (!records || records.length === 0) {
        listEl.innerHTML = '<p style="text-align:center;color:var(--gray-mid);padding:40px;">暂无历史记录</p>';
      } else {
        listEl.innerHTML = records.map(function(r) {
          var time = new Date(r.created_at || r.timestamp).toLocaleString('zh-CN');
          var catLabel = (CONSTANTS.CATEGORIES[r.category] || CONSTANTS.CATEGORIES.general).label;
          var opts = r.options || [];
          var optionsText = opts.length > 3 ? opts.slice(0, 3).join('、') + '...（共' + opts.length + '项）' : opts.join('、');
          return '<div class="history-item">' +
            '<div class="history-meta">' +
              '<span class="history-time">' + catLabel + ' · ' + time + '</span>' +
              '<span class="history-options">' + escapeHTML(optionsText) + '</span>' +
            '</div>' +
            '<div class="history-result">' +
              '<span class="crown">🏆</span> ' + escapeHTML(r.recommendation || '') +
              ' <button class="btn btn-xs btn-ghost" data-history-id="' + r.id + '">查看</button>' +
              ' <button class="btn btn-xs btn-ghost delete-btn" data-delete-id="' + r.id + '" style="color:#D94A3A;margin-left:4px;">🗑</button>' +
            '</div>' +
          '</div>';
        }).join('');

        // 查看详情
        listEl.querySelectorAll('[data-history-id]').forEach(function(btn) {
          btn.onclick = function() {
            var id = this.dataset.historyId;
            var record = records.find(function(r) { return r.id === id; });
            if (record) {
              var scores = record.scores || {};
              var finalScores = record.final_scores || record.finalScores || {};
              var questions = record.questions || [];
              var options = record.options || [];
              Store.quiz.options = options;
              Store.quiz.questions = questions;
              Store.quiz.scores = scores;
              Store.quiz.finalScores = finalScores;
              Store.quiz.recommendation = record.recommendation;
              Store.quiz.reason = record.reason || '';
              Store.quiz.category = record.category || 'general';
              Store._viewingFromHistory = true;
              Router.navigate('result', {
                fromHistory: true,
                record: { options: options, questions: questions, scores: scores, finalScores: finalScores, recommendation: record.recommendation, reason: record.reason }
              });
            }
          };
        });

        // 单条删除
        listEl.querySelectorAll('.delete-btn').forEach(function(btn) {
          btn.onclick = function(e) {
            e.stopPropagation();
            var id = this.dataset.deleteId;
            if (!confirm('确定删除这条记录吗？')) return;
            if (Store.user.isLoggedIn) {
              ApiService.deleteHistory(id).then(function() { loadHistoryData(); }).catch(function() { HistoryService._deleteById(id); renderList(HistoryService.getAll()); });
            } else {
              HistoryService._deleteById(id);
              renderList(HistoryService.getAll());
            }
          };
        });
      }
    }

    function loadHistoryData() {
      if (Store.user.isLoggedIn) {
        ApiService.getHistory().then(function(data) {
          renderList(data.records || []);
        }).catch(function() {
          renderList(HistoryService.getAll());
        });
      } else {
        renderList(HistoryService.getAll());
      }
    }

    loadHistoryData();

    // 导出
    document.getElementById('btn-export-json').onclick = function() {
      if (Store.user.isLoggedIn) {
        ApiService.getHistory().then(function(data) {
          ExportService.exportJSON(data.records || []);
        }).catch(function() { ExportService.exportJSON(HistoryService.getAll()); });
      } else {
        ExportService.exportJSON(HistoryService.getAll());
      }
    };
    document.getElementById('btn-export-csv').onclick = function() {
      if (Store.user.isLoggedIn) {
        ApiService.getHistory().then(function(data) {
          ExportService.exportCSV(data.records || []);
        }).catch(function() { ExportService.exportCSV(HistoryService.getAll()); });
      } else {
        ExportService.exportCSV(HistoryService.getAll());
      }
    };

    // 清空
    document.getElementById('btn-clear-history').onclick = function() {
      if (!confirm('确定要清空所有历史记录吗？此操作不可恢复。')) return;
      if (Store.user.isLoggedIn) {
        ApiService.clearHistory().then(function() { HistoryService.clearAll(); renderList([]); }).catch(function() { HistoryService.clearAll(); renderList([]); });
      } else {
        HistoryService.clearAll();
        renderList([]);
      }
    };
  }

  // 补充 HistoryService 单条删除
  HistoryService._deleteById = function(id) {
    var records = this.getAll().filter(function(r) { return r.id !== id; });
    this._persist(records);
    Store.history = records;
  };

  // ==================== 管理页（登录用户可管问题库，管理员额外管用户） ====================

  var adminFilterCategory = 'all';
  var adminTab = 'questions';

  function initAdmin() {
    if (!Store.user.isLoggedIn) {
      alert('请先登录');
      Router.navigate('auth'); return;
    }

    // 管理员可见用户管理 tab
    var usersTab = document.getElementById('tab-users');
    if (usersTab) usersTab.style.display = Store.user.role === 'admin' ? '' : 'none';

    // Tab 切换
    document.querySelectorAll('.admin-tab').forEach(function(t) {
      t.onclick = function() {
        adminTab = this.dataset.tab;
        document.querySelectorAll('.admin-tab').forEach(function(x) { x.classList.remove('active'); });
        this.classList.add('active');
        document.getElementById('admin-panel-questions').style.display = adminTab === 'questions' ? '' : 'none';
        document.getElementById('admin-panel-users').style.display = adminTab === 'users' ? '' : 'none';
        document.getElementById('btn-admin-save').style.display = adminTab === 'questions' ? '' : 'none';
        if (adminTab === 'users') renderUserTable();
        if (adminTab === 'questions') renderAdminTable();
      };
    });

    showAdminPanel();
  }

  function showAdminPanel() {
    adminTab = 'questions';
    document.querySelectorAll('.admin-tab').forEach(function(t) { t.classList.toggle('active', t.dataset.tab === 'questions'); });
    document.getElementById('admin-panel-questions').style.display = '';
    document.getElementById('admin-panel-users').style.display = 'none';
    document.getElementById('btn-admin-save').style.display = '';
    renderAdminTable();

    document.getElementById('btn-admin-back').onclick = function() { Router.navigate('home'); };

    document.getElementById('btn-admin-save').onclick = function() {
      if (Store.user.isLoggedIn) {
        ApiService.saveQuestions(Store.questions.filter(function(q) { return !q.user_id; })).then(function() {
          QuestionService.saveQuestions();
          alert('已保存修改（已同步到云端）');
        }).catch(function() {
          QuestionService.saveQuestions();
          alert('已保存到本地（云端同步失败）');
        });
      } else {
        QuestionService.saveQuestions();
        alert('已保存修改');
      }
    };

    // 分类筛选
    var filterEl = document.getElementById('admin-category-filter');
    if (filterEl) {
      filterEl.querySelectorAll('.scene-btn').forEach(function(btn) {
        btn.onclick = function() {
          adminFilterCategory = this.dataset.category;
          filterEl.querySelectorAll('.scene-btn').forEach(function(b) { b.classList.remove('active'); });
          this.classList.add('active');
          renderAdminTable();
        };
      });
    }

    // 添加问题
    document.getElementById('btn-add-question').onclick = function() {
      var catEl = document.getElementById('new-question-category');
      var textEl = document.getElementById('new-question-text');
      var weightEl = document.getElementById('new-question-weight');
      var category = catEl.value;
      var text = textEl.value.trim();
      var weight = parseInt(weightEl.value) || 2;

      if (!text) { alert('请输入问题文本'); return; }
      if (Store.questions.some(function(q) { return q.text === text && q.category === category; })) {
        alert('该场景下已存在相同问题'); return;
      }
      if (weight < 1 || weight > 3) { alert('权重范围为 1-3'); return; }

      // 云端添加
      if (Store.user.isLoggedIn) {
        ApiService._fetch('POST', '/api/questions', { category: category, text: text, weight: weight }).then(function(data) {
          Store.questions.push({ id: data.id, category: category, text: text, weight: weight, enabled: true, createdAt: new Date().toISOString(), user_id: Store.user.id || -1 });
          QuestionService.saveQuestions();
          textEl.value = '';
          weightEl.value = '2';
          renderAdminTable();
        }).catch(function(e) {
          QuestionService.addQuestion(text, weight, category);
          QuestionService.saveQuestions();
          textEl.value = '';
          weightEl.value = '2';
          renderAdminTable();
        });
      } else {
        QuestionService.addQuestion(text, weight, category);
        QuestionService.saveQuestions();
        textEl.value = '';
        weightEl.value = '2';
        renderAdminTable();
      }
    };
  }

  function renderAdminTable() {
    var tbody = document.getElementById('admin-questions-tbody');
    if (!tbody) return;

    var questions = Store.questions;
    if (adminFilterCategory !== 'all') {
      questions = questions.filter(function(q) { return q.category === adminFilterCategory; });
    }

    var CAT_LABELS = { food: '🍽️ 餐饮', shopping: '🛒 购物', travel: '✈️ 旅行', general: '📋 通用' };
    var isAdmin = Store.user.role === 'admin';

    tbody.innerHTML = questions.map(function(q, i) {
      var source = q.user_id ? '自定义' : '系统';
      var sourceColor = q.user_id ? 'color:#7A7A7A;' : 'color:#1A1A1A;';
      var canEdit = isAdmin || q.user_id;
      var canDelete = isAdmin || q.user_id;
      return '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td style="font-size:0.74rem;' + sourceColor + '">' + source + '</td>' +
        '<td>' + (CAT_LABELS[q.category] || q.category) + '</td>' +
        '<td style="font-weight:700;">' + escapeHTML(q.text) + '</td>' +
        '<td><span class="weight-badge weight-' + q.weight + '">×' + q.weight + '</span></td>' +
        '<td><span class="toggle' + (q.enabled ? ' on' : '') + '" data-toggle-id="' + q.id + '"></span></td>' +
        '<td>' + (canEdit ? '<span class="action-link" data-edit-id="' + q.id + '">编辑</span>' : '') +
          (canDelete ? '<span class="action-link danger" data-delete-id="' + q.id + '">删除</span>' : '') +
        '</td>' +
      '</tr>';
    }).join('');

    tbody.querySelectorAll('.toggle').forEach(function(toggle) {
      toggle.onclick = function() {
        var id = this.dataset.toggleId;
        var q = Store.questions.find(function(q) { return q.id === id; });
        if (!q) return;
        if (!isAdmin && !q.user_id) { alert('系统题目不可修改'); return; }
        q.enabled = !q.enabled;
        this.classList.toggle('on', q.enabled);
        if (Store.user.isLoggedIn) {
          ApiService._fetch('PUT', '/api/questions/' + id, { enabled: q.enabled, text: q.text, weight: q.weight, category: q.category }).catch(function(){});
        }
      };
    });

    tbody.querySelectorAll('[data-edit-id]').forEach(function(link) {
      link.onclick = function() {
        var id = this.dataset.editId;
        var q = Store.questions.find(function(q) { return q.id === id; });
        if (!q) return;
        if (!isAdmin && !q.user_id) { alert('系统题目不可修改'); return; }

        var newText = prompt('修改问题文本：', q.text);
        if (newText === null) return;
        var trimmed = newText.trim();
        if (!trimmed) { alert('问题文本不能为空'); return; }

        var newWeightStr = prompt('修改权重（1-3）：', q.weight);
        if (newWeightStr === null) return;
        var newWeight = parseInt(newWeightStr);
        if (isNaN(newWeight) || newWeight < 1 || newWeight > 3) { alert('权重范围为 1-3'); return; }

        var catKeys = Object.keys(CONSTANTS.CATEGORIES);
        var catNames = catKeys.map(function(k) { return CONSTANTS.CATEGORIES[k].label; }).join('/');
        var newCat = prompt('修改场景（' + catNames + '）：', q.category);
        if (newCat === null) return;
        var validCat = catKeys.indexOf(newCat) !== -1 ? newCat : q.category;

        QuestionService.updateQuestion(id, { text: trimmed, weight: newWeight, category: validCat });
        if (Store.user.isLoggedIn) {
          ApiService._fetch('PUT', '/api/questions/' + id, { text: trimmed, weight: newWeight, category: validCat, enabled: q.enabled }).catch(function(){});
        }
        renderAdminTable();
      };
    });

    tbody.querySelectorAll('[data-delete-id]').forEach(function(link) {
      link.onclick = function() {
        var id = this.dataset.deleteId;
        var q = Store.questions.find(function(q) { return q.id === id; });
        if (!q) return;
        if (!isAdmin && !q.user_id) { alert('系统题目不可删除'); return; }
        var enabledCount = Store.questions.filter(function(x) { return x.enabled; }).length;
        if (q.enabled && enabledCount <= 1) { alert('至少需要 1 个启用的题目，无法删除'); return; }

        showConfirm('确定要删除该问题吗？', function() {
          QuestionService.deleteQuestion(id);
          if (Store.user.isLoggedIn) {
            ApiService._fetch('DELETE', '/api/questions/' + id).catch(function(){});
          }
          renderAdminTable();
        });
      };
    });
  }

  // ── 用户管理 ──
  function renderUserTable() {
    var tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;

    ApiService._fetch('GET', '/api/auth/admin/users').then(function(data) {
      var users = data.users || [];
      tbody.innerHTML = users.map(function(u) {
        var isBanned = u.banned === 1;
        var statusHtml = isBanned
          ? '<span class="status-badge banned">已封禁</span>'
          : '<span class="status-badge active">正常</span>';
        var actionHtml = '';
        if (u.role !== 'admin') {
          actionHtml = isBanned
            ? '<span class="action-link" data-unban-id="' + u.id + '">解封</span>'
            : '<span class="action-link danger" data-ban-id="' + u.id + '">封禁</span>';
        }
        return '<tr>' +
          '<td>' + u.id + '</td>' +
          '<td style="font-weight:700;">' + escapeHTML(u.username) + '</td>' +
          '<td>' + (u.role === 'admin' ? '管理员' : '用户') + '</td>' +
          '<td>' + statusHtml + '</td>' +
          '<td>' + (u.created_at || '') + '</td>' +
          '<td>' + actionHtml + '</td>' +
        '</tr>';
      }).join('');

      // 封禁
      tbody.querySelectorAll('[data-ban-id]').forEach(function(btn) {
        btn.onclick = function() {
          var uid = this.dataset.banId;
          if (!confirm('确定封禁该用户吗？')) return;
          ApiService._fetch('PUT', '/api/auth/admin/users/' + uid + '/ban').then(function() {
            renderUserTable();
          }).catch(function(e) { alert(e.message); });
        };
      });

      // 解封
      tbody.querySelectorAll('[data-unban-id]').forEach(function(btn) {
        btn.onclick = function() {
          var uid = this.dataset.unbanId;
          ApiService._fetch('PUT', '/api/auth/admin/users/' + uid + '/unban').then(function() {
            renderUserTable();
          });
        };
      });
    }).catch(function(e) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#D94A3A;">加载失败: ' + escapeHTML(e.message) + '</td></tr>';
    });
  }

  // ==================== 初始化 ====================

  function boot() {
    var qsPromise = Store.user.isLoggedIn
      ? ApiService.getQuestions().then(function(data) {
          Store.questions = (data.questions || []).map(function(q) { return { id: q.id, category: q.category, text: q.text, weight: q.weight, enabled: !!q.enabled, createdAt: q.created_at }; });
          QuestionService.saveQuestions();
        }).catch(function() { return QuestionService.loadQuestions(); })
      : QuestionService.loadQuestions();

    qsPromise.then(function() {
      document.getElementById('btn-next').onclick = goNext;
      document.getElementById('btn-prev').onclick = goPrev;
      initHome();
    });
  }

  var originalNavigate = Router.navigate;
  Router.navigate = function(page, data) {
    if (page === 'quiz') {
      var inputEl = document.getElementById('option-input');
      if (inputEl) Store.quiz.options = parseOptions(inputEl.value);
      if (Store.quiz.options.length < CONSTANTS.OPTION_MIN) { alert('请至少输入 2 个选项'); return; }
    }
    if (page === 'admin') {
      if (!Store.user.isLoggedIn) {
        alert('请先登录后再访问管理页');
        Router.navigate('auth'); return;
      }
    }
    originalNavigate(page, data);
    if (page === 'quiz') startQuiz();
  };

  window.initHome = initHome;
  window.initQuiz = function() {};
  window.initResult = initResult;
  window.initHistory = initHistory;
  window.initAdmin = initAdmin;
  window.initAuth = initAuth;

  boot();
})();
