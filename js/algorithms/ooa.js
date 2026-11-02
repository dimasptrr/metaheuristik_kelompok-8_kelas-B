/**
 * OSPREY OPTIMIZATION ALGORITHM (OOA)
 * Referensi Ilmiah: Dehghani, M., Trojovský, P., & Trojovská, E. (2023).
 * "Osprey Optimization Algorithm: A new bio-inspired metaheuristic algorithm for solving engineering problems."
 * Scientific Reports, 13, 11281. DOI: 10.1038/s41598-023-38822-7.
 */
(function() {
  window.MetaOpt = window.MetaOpt || {};

  class OspreyOptimizer {
    constructor(config = {}) {
      this.popSize = config.popSize || 30;
      this.dim = config.dim || 2;
      this.domain = config.domain || [-5.12, 5.12];
      this.maxIter = config.maxIter || 50;
      this.evalFn = config.evalFn || ((pos) => 0);
      this.rng = config.rng || Math.random;

      this.currentIter = 0;
      this.nfe = 0; // Number of Function Evaluations
      this.population = [];
      this.bestAgent = { position: new Array(this.dim).fill(0), fitness: Infinity };
      this.convergenceHistory = [];
    }

    // Inisialisasi populasi agen secara acak seragam dalam ruang batas [lb, ub]
    init() {
      const [lb, ub] = this.domain;
      this.population = [];
      this.bestAgent = { position: new Array(this.dim).fill(0), fitness: Infinity };
      this.nfe = 0;
      this.currentIter = 0;
      this.convergenceHistory = [];

      for (let i = 0; i < this.popSize; i++) {
        const pos = [];
        for (let d = 0; d < this.dim; d++) {
          pos.push(lb + this.rng() * (ub - lb));
        }
        const fit = this.evalFn(pos);
        this.nfe++;

        const agent = {
          position: pos,
          fitness: fit,
          x: pos[0],
          y: pos[1] // kemudahan akses visualisasi 2D
        };

        this.population.push(agent);

        if (fit < this.bestAgent.fitness) {
          this.bestAgent = {
            position: [...pos],
            fitness: fit,
            x: pos[0],
            y: pos[1]
          };
        }
      }

      this.convergenceHistory.push(this.bestAgent.fitness);
      return this.getState();
    }

    clamp(val, lb, ub) {
      return Math.max(lb, Math.min(ub, val));
    }

    // Melakukan 1 iterasi (2 fase: Berburu Ikan & Membawa ke Sarang)
    step() {
      if (this.currentIter >= this.maxIter) {
        return this.getState();
      }

      const [lb, ub] = this.domain;
      const t = this.currentIter + 1;

      for (let i = 0; i < this.popSize; i++) {
        const cur = this.population[i];

        // ----------------------------------------------------
        // FASE 1: Position identification & Hunting (Eksplorasi)
        // ----------------------------------------------------
        // Himpunan FP_i: agen dengan fitness lebih baik dari agen i, ditambah X_best
        const betterAgents = this.population.filter(p => p.fitness < cur.fitness);
        let selectedFish = this.bestAgent;
        if (betterAgents.length > 0) {
          const randIdx = Math.floor(this.rng() * betterAgents.length);
          selectedFish = betterAgents[randIdx];
        }

        const newPosP1 = [];
        for (let d = 0; d < this.dim; d++) {
          const r1 = this.rng();
          // Faktor impuls stokastik I in {1, 2}
          const I = Math.round(1 + this.rng());
          const sfVal = selectedFish.position[d];
          const curVal = cur.position[d];
          
          let updatedCoord = curVal + r1 * (sfVal - I * curVal);
          updatedCoord = this.clamp(updatedCoord, lb, ub);
          newPosP1.push(updatedCoord);
        }

        const fitP1 = this.evalFn(newPosP1);
        this.nfe++;

        // Seleksi Elitis (Greedy Selection Tahap 1)
        if (fitP1 < cur.fitness) {
          cur.position = [...newPosP1];
          cur.fitness = fitP1;
          cur.x = newPosP1[0];
          cur.y = newPosP1[1];
        }

        // ----------------------------------------------------
        // FASE 2: Carrying the fish to the perch (Eksploitasi)
        // ----------------------------------------------------
        const newPosP2 = [];
        for (let d = 0; d < this.dim; d++) {
          const r2 = this.rng();
          // Radius menyusut secara proporsional 1/t terhadap iterasi
          let localDisp = (lb + r2 * (ub - lb)) / t;
          let updatedCoord = cur.position[d] + localDisp;
          updatedCoord = this.clamp(updatedCoord, lb, ub);
          newPosP2.push(updatedCoord);
        }

        const fitP2 = this.evalFn(newPosP2);
        this.nfe++;

        // Seleksi Elitis (Greedy Selection Tahap 2)
        if (fitP2 < cur.fitness) {
          cur.position = [...newPosP2];
          cur.fitness = fitP2;
          cur.x = newPosP2[0];
          cur.y = newPosP2[1];
        }

        // Pembaruan Global Best
        if (cur.fitness < this.bestAgent.fitness) {
          this.bestAgent = {
            position: [...cur.position],
            fitness: cur.fitness,
            x: cur.position[0],
            y: cur.position[1]
          };
        }
      }

      this.currentIter++;
      this.convergenceHistory.push(this.bestAgent.fitness);
      return this.getState();
    }

    // Jalankan seluruh iterasi sampai selesai
    runAll() {
      const t0 = performance.now();
      while (this.currentIter < this.maxIter) {
        this.step();
      }
      const t1 = performance.now();
      const state = this.getState();
      state.executionTimeMs = t1 - t0;
      return state;
    }

    getState() {
      const sumFit = this.population.reduce((acc, p) => acc + p.fitness, 0);
      const meanFit = this.population.length ? sumFit / this.population.length : Infinity;
      const allFits = this.population.map(p => p.fitness);
      const worstFit = allFits.length ? Math.max(...allFits) : Infinity;

      // Standar deviasi fitness
      let variance = 0;
      for (let i = 0; i < allFits.length; i++) {
        variance += Math.pow(allFits[i] - meanFit, 2);
      }
      const stdDev = allFits.length > 1 ? Math.sqrt(variance / (allFits.length - 1)) : 0;

      return {
        algorithm: 'OOA',
        iteration: this.currentIter,
        maxIter: this.maxIter,
        nfe: this.nfe,
        population: this.population.map(p => ({
          position: [...p.position],
          fitness: p.fitness,
          x: p.position[0],
          y: p.position[1]
        })),
        bestAgent: {
          position: [...this.bestAgent.position],
          fitness: this.bestAgent.fitness,
          x: this.bestAgent.x,
          y: this.bestAgent.y
        },
        meanFitness: meanFit,
        worstFitness: worstFit,
        stdDev: stdDev,
        convergenceHistory: [...this.convergenceHistory]
      };
    }
  }

  window.MetaOpt.OspreyOptimizer = OspreyOptimizer;
})();

