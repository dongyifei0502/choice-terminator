const ExportService = {
  /**
   * 导出为 JSON 文件并触发下载
   * 文件名格式：决策历史_2026-06-10.json
   */
  exportJSON(records) {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    this._download(blob, '决策历史_' + this._dateStr() + '.json');
  },

  /**
   * 导出为 CSV 文件并触发下载
   * 列：时间, 选项数, 选项列表, 推荐结果, 推荐得分, 推荐理由
   */
  exportCSV(records) {
    const header = '时间,选项数,选项列表,推荐结果,推荐得分,推荐理由\n';
    const rows = records.map(r => {
      return [
        r.timestamp,
        r.options.length,
        '"' + r.options.join('、') + '"',
        r.recommendation,
        r.finalScores[r.recommendation],
        '"' + (r.reason || '').replace(/"/g, '""') + '"'
      ].join(',');
    }).join('\n');
    // BOM for Excel UTF-8 compatibility
    const blob = new Blob(['﻿' + header + rows], { type: 'text/csv;charset=utf-8' });
    this._download(blob, '决策历史_' + this._dateStr() + '.csv');
  },

  /**
   * 触发浏览器下载
   */
  _download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * 今日日期字符串：2026-06-10
   */
  _dateStr() {
    return new Date().toISOString().slice(0, 10);
  }
};
