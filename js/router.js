const Router = {
  /**
   * 切换到指定页面
   * @param {string} page - 'home' | 'quiz' | 'result' | 'history' | 'admin'
   * @param {object} data - 传递给目标页面的数据（可选）
   */
  navigate(page, data) {
    Store.currentPage = page;
    // 隐藏所有页面
    document.querySelectorAll('.page-section').forEach(el => el.style.display = 'none');
    // 显示目标页面
    const target = document.getElementById('page-' + page);
    if (target) target.style.display = '';
    // 触发页面初始化
    const initFnName = 'init' + page.charAt(0).toUpperCase() + page.slice(1);
    if (typeof window[initFnName] === 'function') {
      window[initFnName](data);
    }
  }
};
