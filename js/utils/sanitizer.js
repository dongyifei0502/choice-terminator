/**
 * 转义 HTML 特殊字符，防止 XSS
 * @param {string} str - 用户输入的字符串
 * @returns {string} 转义后的字符串
 */
function escapeHTML(str) {
  if (!str || typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
