/**
 * EXPERIMENT & MONTE CARLO RUNNER
 * Eksekusi uji statistik multivariat independen dan ekspor data CSV
 */
(function() {
  window.MetaOpt = window.MetaOpt || {};

  class ExperimentRunner {
    constructor() {
      this.trialResults = [];
    }

    runBatch({ benchKey, popSize, maxIter, trialsCount, baseSeed = 1000 }) {
      const bench = window.MetaOpt.BENCHMARKS[benchKey];
      if (!bench) return [];

      const bound = bench.domain;
      this.trialResults = [];

      for (let t = 1; t <= trialsCount; t++) {
        const trialSeed = baseSeed + t * 83;

        // 1. Jalankan OOA pada Seed Uji
        const rngOoa = new window.MetaOpt.SeededRNG(trialSeed);
        const ooa = new window.MetaOpt.OspreyOptimizer({
          popSize: popSize,
          dim: 2,
          domain: bound,
          maxIter: maxIter,
          evalFn: (pos) => bench.eval2D(pos[0], pos[1]),
          rng: () => rngOoa.random()
        });
        ooa.init();
        const ooaState = ooa.runAll();

        // 2. Jalankan ChOA pada Seed Uji yang Sama Persis
        const rngChoa = new window.MetaOpt.SeededRNG(trialSeed);
        const choa = new window.MetaOpt.ChimpOptimizer({
          popSize: popSize,
          dim: 2,
          domain: bound,
          maxIter: maxIter,
          evalFn: (pos) => bench.eval2D(pos[0], pos[1]),
          rng: () => rngChoa.random()
        });
        choa.init();
        const choaState = choa.runAll();

        const oBest = ooaState.bestAgent.fitness;
        const cBest = choaState.bestAgent.fitness;
        const delta = oBest - cBest;

        let winner = 'Imbang (Tie)';
        if (oBest < cBest - 1e-12) winner = 'OOA';
        else if (cBest < oBest - 1e-12) winner = 'ChOA';

        this.trialResults.push({
          trial: t,
          seed: trialSeed,
          functionKey: benchKey,
          functionName: bench.name,
          popSize: popSize,
          maxIter: maxIter,
          ooaBest: oBest,
          choaBest: cBest,
          ooaNfe: ooaState.nfe,
          choaNfe: choaState.nfe,
          ooaTimeMs: ooaState.executionTimeMs,
          choaTimeMs: choaState.executionTimeMs,
          delta: delta,
          winner: winner
        });
      }

      return this.trialResults;
    }

    getSummaryStats() {
      if (this.trialResults.length === 0) return null;

      const oFits = this.trialResults.map(r => r.ooaBest);
      const cFits = this.trialResults.map(r => r.choaBest);

      const calc = (arr) => {
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        const min = Math.min(...arr);
        const max = Math.max(...arr);
        const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
        return {
          mean: mean,
          min: min,
          max: max,
          std: Math.sqrt(variance)
        };
      };

      const oStats = calc(oFits);
      const cStats = calc(cFits);

      let ooaWins = 0, choaWins = 0, ties = 0;
      this.trialResults.forEach(r => {
        if (r.winner === 'OOA') ooaWins++;
        else if (r.winner === 'ChOA') choaWins++;
        else ties++;
      });

      return {
        ooa: oStats,
        choa: cStats,
        ooaWins,
        choaWins,
        ties,
        totalTrials: this.trialResults.length
      };
    }

    exportCsv(filenamePrefix = 'metaopt_experiment_trials') {
      if (this.trialResults.length === 0) {
        throw new Error('Tidak ada data eksperimen untuk diekspor. Jalankan eksperimen terlebih dahulu.');
      }

      const headers = [
        'Trial',
        'Seed',
        'Benchmark_Function',
        'Pop_Size',
        'Max_Iter',
        'OOA_Best_Fitness',
        'ChOA_Best_Fitness',
        'Delta_Fitness',
        'Winner',
        'OOA_NFE',
        'ChOA_NFE',
        'OOA_Time_ms',
        'ChOA_Time_ms'
      ];

      const rows = this.trialResults.map(r => [
        r.trial,
        r.seed,
        `"${r.functionName}"`,
        r.popSize,
        r.maxIter,
        r.ooaBest,
        r.choaBest,
        r.delta,
        `"${r.winner}"`,
        r.ooaNfe,
        r.choaNfe,
        r.ooaTimeMs.toFixed(2),
        r.choaTimeMs.toFixed(2)
      ]);

      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filenamePrefix}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  window.MetaOpt.ExperimentRunner = ExperimentRunner;
})();

