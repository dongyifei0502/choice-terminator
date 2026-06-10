/**
 * 为当前题目渲染所有选项的滑块
 * @param {object} question - 当前问题对象
 * @param {string[]} options - 选项列表
 * @param {object} savedScores - 已保存的分数 { option: score }
 * @returns {string} HTML 字符串
 */
function renderSlidersHTML(question, options, savedScores) {
  return options.map(opt => {
    const score = (savedScores && savedScores[opt] !== undefined)
      ? savedScores[opt]
      : CONSTANTS.SCORE_DEFAULT;
    const highClass = score >= 4 ? ' high' : '';
    return '<div class="slider-item">' +
      '<span class="slider-label">' + escapeHTML(opt) + '</span>' +
      '<input type="range" min="' + CONSTANTS.SCORE_MIN + '" max="' + CONSTANTS.SCORE_MAX +
        '" value="' + score + '" data-option="' + escapeHTML(opt) + '">' +
      '<span class="slider-score' + highClass + '">' + score + '</span>' +
    '</div>';
  }).join('');
}

/**
 * 绑定滑块事件（input 事件实时更新分数显示）
 * 使用事件委托绑定在 #quiz-sliders-container 上
 */
function bindSliderEvents() {
  const container = document.getElementById('quiz-sliders-container');
  if (!container) return;

  // 移除旧监听器的方式：克隆替换（简单有效）
  const listeners = container._sliderListeners;
  if (listeners) {
    container.removeEventListener('input', listeners.input);
  }

  const onInput = function(e) {
    if (e.target.type === 'range') {
      const val = parseInt(e.target.value);
      const scoreEl = e.target.nextElementSibling;
      if (scoreEl) {
        scoreEl.textContent = val;
        scoreEl.className = 'slider-score' + (val >= 4 ? ' high' : '');
      }
    }
  };

  container.addEventListener('input', onInput);
  container._sliderListeners = { input: onInput };
}

/**
 * 收集当前题目所有选项的分数
 * @returns {object} { option: score }
 */
function collectScores() {
  const container = document.getElementById('quiz-sliders-container');
  if (!container) return {};
  const scores = {};
  const sliders = container.querySelectorAll('input[type="range"]');
  sliders.forEach(slider => {
    const option = slider.dataset.option;
    const score = parseInt(slider.value);
    scores[option] = score;
  });
  return scores;
}
