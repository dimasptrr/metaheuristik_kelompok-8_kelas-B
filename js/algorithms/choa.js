/**
 * CHIMP OPTIMIZATION ALGORITHM (ChOA)
 * Referensi Ilmiah: Khishe, M., & Mosavi, M. R. (2020).
 * "Chimp Optimization Algorithm: A New Nature-Inspired Approach for High-Dimensional Optimization."
 * Expert Systems with Applications, 149, 113338. DOI: 10.1016/j.eswa.2020.113338.
 */
(function() {
  window.MetaOpt = window.MetaOpt || {};

  class ChimpOptimizer {
    constructor(config = {}) {
      this.popSize = config.popSize || 30;
      this.dim = config.dim || 2;
      this.domain = config.domain || [-5.12, 5.12];
      this.maxIter = config.maxIter || 50;
      this.evalFn = config.evalFn || ((pos) => 0);
      this.rng = config.rng || Math.random;

      this.currentIter = 0;
      this.nfe = 0;
      this.population = [];
      this.alpha = null; // Attacker (Best)
      this.beta = null;  // Barrier (2nd Best)
      this.gamma = null; // Chaser (3rd Best)
      this.delta = null; // Driver (4th Best)
      this.convergenceHistory = [];
    }

    init() {
      const [lb, ub] = this.domain;
      this.population = [];
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

        this.population.push({
          position: pos,
          fitness: fit,
          x: pos[0],
          y: pos[1],
          role: 'chimp'
        });
      }

      this.updateRoles();
      this.convergenceHistory.push(this.alpha.fitness);
      return this.getState();
    }

    clamp(val, lb, ub) {
      return Math.max(lb, Math.min(ub, val));
    }

    // Urutkan populasi untuk menetapkan 4 kasta sosial: Alpha, Beta, Gamma, Delta
    updateRoles() {
      const sorted = [...this.population].sort((a, b) => a.fitness - b.fitness);
      
      this.alpha = {
        position: [...sorted[0].position],
        fitness: sorted[0].fitness,
        x: sorted[0].position[0],
        y: sorted[0].position[1]
      };

      this.beta = sorted[1] ? {
        position: [...sorted[1].position],
        fitness: sorted[1].fitness,
        x: sorted[1].position[0],
        y: sorted[1].position[1]
      } : { ...this.alpha };

      this.gamma = sorted[2] ? {
        position: [...sorted[2].position],
        fitness: sorted[2].fitness,
        x: sorted[2].position[0],
        y: sorted[2].position[1]
      } : { ...this.beta };

      this.delta = sorted[3] ? {
        position: [...sorted[3].position],
        fitness: sorted[3].fitness,
        x: sorted[3].position[0],
        y: sorted[3].position[1]
      } : { ...this.gamma };

      // Tandai role pada objek populasi untuk visualisasi
      sorted.forEach((agent, idx) => {
        if (idx === 0) agent.role = 'alpha';
        else if (idx === 1) agent.role = 'beta';
        else if (idx === 2) agent.role = 'gamma';
        else if (idx === 3) agent.role = 'delta';
        else agent.role = 'chimp';
      });
    }

    // Menghasilkan nilai chaos map (Sinusoidal Map)
    getChaoticValue() {
      const r = this.rng();
      return Math.sin(Math.PI * r);
    }

    step() {
      if (this.currentIter >= this.maxIter) {
        return this.getState();
      }

      const [lb, ub] = this.domain;
      const t = this.currentIter + 1;
      
      // Faktor peluruhan dinamis f berkurang secara bertahap dari 2.5 menuju 0
      const f = 2.5 - (2.0 * t / this.maxIter);

      for (let i = 0; i < this.popSize; i++) {
        const cur = this.population[i];
        const nextPos = [];

        // Probabilitas strategi: Kooperatif 4-Peran vs Chaotic Drive
        const strategyProbe = this.rng();

        if (strategyProbe < 0.5) {
          // ----------------------------------------------------
          // KOOPERASI SOSIAL (Attacker, Barrier, Chaser, Driver)
          // ----------------------------------------------------
          for (let d = 0; d < this.dim; d++) {
            // Kontribusi Alpha
            const r1_a = this.rng(), r2_a = this.rng();
            const a1 = 2 * f * r1_a - f;
            const c1 = 2 * r2_a;
            const m1 = this.rng() > 0.5 ? 1 : 0.5;
            const d_alpha = Math.abs(c1 * this.alpha.position[d] - m1 * cur.position[d]);
            const x1 = this.alpha.position[d] - a1 * d_alpha;

            // Kontribusi Beta
            const r1_b = this.rng(), r2_b = this.rng();
            const a2 = 2 * f * r1_b - f;
            const c2 = 2 * r2_b;
            const m2 = this.rng() > 0.5 ? 1 : 0.5;
            const d_beta = Math.abs(c2 * this.beta.position[d] - m2 * cur.position[d]);
            const x2 = this.beta.position[d] - a2 * d_beta;

            // Kontribusi Gamma
            const r1_g = this.rng(), r2_g = this.rng();
            const a3 = 2 * f * r1_g - f;
            const c3 = 2 * r2_g;
            const m3 = this.rng() > 0.5 ? 1 : 0.5;
            const d_gamma = Math.abs(c3 * this.gamma.position[d] - m3 * cur.position[d]);
            const x3 = this.gamma.position[d] - a3 * d_gamma;

            // Kontribusi Delta
            const r1_d = this.rng(), r2_d = this.rng();
            const a4 = 2 * f * r1_d - f;
            const c4 = 2 * r2_d;
            const m4 = this.rng() > 0.5 ? 1 : 0.5;
            const d_delta = Math.abs(c4 * this.delta.position[d] - m4 * cur.position[d]);
            const x4 = this.delta.position[d] - a4 * d_delta;

            // Rata-rata bobot 4 vektor sentroid
            let fusedCoord = (x1 + x2 + x3 + x4) / 4;
            fusedCoord = this.clamp(fusedCoord, lb, ub);
            nextPos.push(fusedCoord);
          }
        } else {
          // ----------------------------------------------------
          // CHAOTIC HUNTING DRIVE (Penyelamatan Jebakan Lokal)
          // ----------------------------------------------------
          for (let d = 0; d < this.dim; d++) {
            const chaosVal = this.getChaoticValue();
            let chaoticCoord = lb + Math.abs(chaosVal) * (ub - lb);
            chaoticCoord = this.clamp(chaoticCoord, lb, ub);
            nextPos.push(chaoticCoord);
          }
        }

        const newFit = this.evalFn(nextPos);
        this.nfe++;

        // Pembaruan posisi agen
        cur.position = [...nextPos];
        cur.fitness = newFit;
        cur.x = nextPos[0];
        cur.y = nextPos[1];
      }

      // Pembaruan struktur kasta sosial setelah seluruh agen bergerak
      this.updateRoles();

      this.currentIter++;
      this.convergenceHistory.push(this.alpha.fitness);
      return this.getState();
    }

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

      let variance = 0;
      for (let i = 0; i < allFits.length; i++) {
        variance += Math.pow(allFits[i] - meanFit, 2);
      }
      const stdDev = allFits.length > 1 ? Math.sqrt(variance / (allFits.length - 1)) : 0;

      return {
        algorithm: 'ChOA',
        iteration: this.currentIter,
        maxIter: this.maxIter,
        nfe: this.nfe,
        population: this.population.map(p => ({
          position: [...p.position],
          fitness: p.fitness,
          x: p.position[0],
          y: p.position[1],
          role: p.role
        })),
        bestAgent: {
          position: [...this.alpha.position],
          fitness: this.alpha.fitness,
          x: this.alpha.x,
          y: this.alpha.y
        },
        roles: {
          alpha: { ...this.alpha },
          beta: { ...this.beta },
          gamma: { ...this.gamma },
          delta: { ...this.delta }
        },
        meanFitness: meanFit,
        worstFitness: worstFit,
        stdDev: stdDev,
        convergenceHistory: [...this.convergenceHistory]
      };
    }
  }

  window.MetaOpt.ChimpOptimizer = ChimpOptimizer;
})();

