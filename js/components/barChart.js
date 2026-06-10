/**
 * 渲染柱状图
 * @param {string} canvasId - canvas 元素 ID
 * @param {string[]} options - 选项名称数组
 * @param {object} finalScores - { option: score }
 * @param {string} winner - 推荐选项名
 */
function renderBarChart(canvasId, options, finalScores, winner) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  // 如果已有实例，先销毁
  if (ctx._chartInstance) ctx._chartInstance.destroy();

  const scores = options.map(o => finalScores[o] || 0);
  const bgColors = options.map(o =>
    o === winner ? '#FFEDB3' : '#FFF6D5'
  );

  ctx._chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: options,
      datasets: [{
        data: scores,
        backgroundColor: bgColors,
        borderColor: '#1A1A1A',
        borderWidth: 3,
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.55,
        categoryPercentage: 0.7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#FFFBF5',
          titleColor: '#1A1A1A',
          bodyColor: '#3A3A3A',
          borderColor: '#1A1A1A',
          borderWidth: 3,
          padding: 14,
          displayColors: false,
          titleFont: { weight: 'bold', size: 13 },
          bodyFont: { weight: 'bold', size: 13 },
          callbacks: {
            label: function(ctx) { return ' 得分：' + ctx.raw + ' 分'; }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#3A3A3A', font: { size: 14, weight: 'bold' } },
          grid: { display: false },
          border: { color: '#1A1A1A', width: 2.5 }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#7A7A7A',
            font: { size: 12, weight: 'bold' },
            callback: function(v) { return v + ' 分'; }
          },
          grid: { color: 'rgba(0,0,0,0.05)' },
          border: { color: '#1A1A1A', width: 2.5 }
        }
      },
      animation: { duration: 800, easing: 'easeOutBounce' }
    }
  });
}
