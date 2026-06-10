/**
 * 显示确认弹窗
 * @param {string} message - 提示文字
 * @param {function} onConfirm - 确认回调
 */
function showConfirm(message, onConfirm) {
  if (confirm(message)) onConfirm();
}

/**
 * 显示提示弹窗
 */
function showAlert(message) {
  alert(message);
}
