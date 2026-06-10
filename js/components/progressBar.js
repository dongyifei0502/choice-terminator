/**
 * 更新进度条
 * @param {number} current - 当前题号（1-based）
 * @param {number} total - 总题数
 */
function updateProgress(current, total) {
  const percent = (current / total) * 100;
  const fillEl = document.getElementById('progress-fill');
  const textEl = document.getElementById('progress-text');
  if (fillEl) fillEl.style.width = percent + '%';
  if (textEl) textEl.textContent = '第 ' + current + ' / ' + total + ' 题';
}
