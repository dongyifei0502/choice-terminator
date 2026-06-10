const ScoreEngine = {
  /**
   * 计算所有选项的加权总分
   * 公式：选项X得分 = Σ(问题i.weight × scores[问题i.id][选项X])
   */
  calculateFinalScores(options, questions, scores) {
    const finalScores = {};
    for (const opt of options) {
      finalScores[opt] = 0;
    }

    for (const q of questions) {
      const qScores = scores[q.id];
      if (!qScores) continue;
      for (const opt of options) {
        const score = qScores[opt];
        if (typeof score === 'number') {
          finalScores[opt] += q.weight * score;
        }
      }
    }

    return finalScores;
  },

  /**
   * 选出推荐选项（最高分）
   * 平局时：在所有同分选项中随机选一个
   * @returns {{ winner, runnerUp, gap, gapPercent, isTie, tiedOptions }}
   */
  selectWinner(options, finalScores) {
    if (!options || options.length === 0) {
      return { winner: '', runnerUp: '', gap: 0, gapPercent: 0, isTie: false, tiedOptions: [] };
    }

    // 按分数降序排列
    const sorted = [...options].sort((a, b) => finalScores[b] - finalScores[a]);

    const topScore = finalScores[sorted[0]];

    // 找出所有同分的并列第一名
    const tiedOptions = sorted.filter(o => finalScores[o] === topScore);

    // 平局时随机选一个
    let winner;
    let isTie = false;
    if (tiedOptions.length > 1) {
      isTie = true;
      winner = tiedOptions[Math.floor(Math.random() * tiedOptions.length)];
    } else {
      winner = sorted[0];
    }

    const runnerUp = tiedOptions.length > 1
      ? (tiedOptions.length < options.length ? sorted[tiedOptions.length] : winner)
      : (sorted.length > 1 ? sorted[1] : winner);

    const winnerScore = finalScores[winner];
    const runnerUpScore = finalScores[runnerUp];
    const gap = winnerScore - runnerUpScore;
    const gapPercent = winnerScore > 0 ? gap / winnerScore : 0;

    return { winner, runnerUp, gap, gapPercent, isTie, tiedOptions };
  },

  /**
   * 从平局选项中随机重选（排除当前 winner）
   */
  reroll(currentWinner, tiedOptions, finalScores) {
    const candidates = tiedOptions.filter(o => o !== currentWinner);
    if (candidates.length === 0) return currentWinner;
    return candidates[Math.floor(Math.random() * candidates.length)];
  },

  /**
   * 主入口
   */
  run(options, questions, scores) {
    const finalScores = this.calculateFinalScores(options, questions, scores);
    const selection = this.selectWinner(options, finalScores);
    return { finalScores, ...selection };
  }
};
