/**
 * 解析用户输入的选项字符串，返回去重去空的选项数组
 * @param {string} raw - 用户输入，如 "火锅, 烧烤, 日料"
 * @returns {string[]} - 如 ["火锅", "烧烤", "日料"]
 *
 * 规则：
 * 1. 按逗号（中英文）和空格切分
 * 2. 连续分隔符不产生空项
 * 3. 首尾空格 trim
 * 4. 去重（完全相同的选项只保留一个）
 * 5. 最多返回 OPTION_MAX 个
 */
function parseOptions(raw) {
  if (!raw || typeof raw !== 'string') return [];

  // 按中英文逗号切分
  const parts = raw.split(/[,，]/);
  const result = [];

  for (let part of parts) {
    // trim 首尾空格
    part = part.trim();
    // 跳过空字符串
    if (!part) continue;
    // 去重
    if (result.includes(part)) continue;
    result.push(part);
    // 最多 OPTION_MAX 个
    if (result.length >= CONSTANTS.OPTION_MAX) break;
  }

  return result;
}
