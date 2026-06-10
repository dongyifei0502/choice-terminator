const ReasonGenerator = {
  generate(winner, finalScores, scores, questions, options, isTie, tiedOptions) {
    const winnerScore = finalScores[winner];
    const sorted = [...options].sort((a, b) => finalScores[b] - finalScores[a]);

    // 平局特殊处理
    if (isTie && tiedOptions && tiedOptions.length > 1) {
      const others = tiedOptions.filter(o => o !== winner).map(o => '【' + o + '】').join('、');
      return '在 ' + options.length + ' 个选项中，各选项得分完全相同（均为 ' + winnerScore + ' 分）。' +
        '🎲 随机推荐了【' + winner + '】。' +
        (others ? '同分的还有 ' + others + '，你可以点击下方「🎲 换一个」试试。' : '');
    }

    const runnerUp = sorted.length > 1 && sorted[0] === winner ? sorted[1] : sorted[0];
    const runnerUpScore = finalScores[runnerUp];
    const gap = winnerScore - runnerUpScore;
    const gapPercent = winnerScore > 0 ? gap / winnerScore : 0;

    let reason = '';

    // 句子1: 结论
    reason += '在 ' + options.length + ' 个选项中，【' + winner + '】综合得分最高（' + winnerScore + ' 分）';

    // 句子2: 优势维度
    const bestDim = this.findBestDimension(winner, scores, questions);
    if (bestDim) {
      const bestScore = scores[bestDim.id] && scores[bestDim.id][winner];
      if (bestScore === 5) {
        reason += '，尤其在「' + bestDim.text + '」方面表现突出（5分）';
      } else if (bestScore === 4) {
        reason += '，在「' + bestDim.text + '」方面表现较好（4分）';
      }
    }

    // 句子3: 与第二名对比
    if (runnerUp && runnerUp !== winner) {
      if (gapPercent >= 0.1) {
        reason += '。相比第二名【' + runnerUp + '】有明显优势（领先 ' + gap + ' 分）';
      } else {
        reason += '。与第二名【' + runnerUp + '】差距不大（仅差 ' + gap + ' 分），可凭直觉微调';
      }
    }

    // 句子4: winner 在最高权重题目上也排名第一
    if (questions && questions.length > 0) {
      const topWeightQ = [...questions].sort((a, b) => b.weight - a.weight)[0];
      if (topWeightQ && scores[topWeightQ.id]) {
        const topScores = scores[topWeightQ.id];
        const winnerTopScore = topScores[winner];
        const allScores = options.map(o => topScores[o] || 0);
        const maxScore = Math.max.apply(null, allScores);
        if (winnerTopScore === maxScore && maxScore > 0) {
          reason += '。且在你最看重的「' + topWeightQ.text + '」维度上也排名第一';
        }
      }
    }

    return reason;
  },

  findBestDimension(winner, scores, questions) {
    if (!questions || questions.length === 0) return null;

    let best = null;

    for (const q of questions) {
      const qScores = scores[q.id];
      if (qScores && qScores[winner] === 5) {
        if (!best || q.weight > best.weight) {
          best = q;
        }
      }
    }
    if (best) return best;

    for (const q of questions) {
      const qScores = scores[q.id];
      if (qScores && qScores[winner] === 4) {
        if (!best || q.weight > best.weight) {
          best = q;
        }
      }
    }

    return best;
  }
};
