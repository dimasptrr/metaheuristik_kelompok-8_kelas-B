/**
 * SIMULATION ENGINE
 * Pengelola status eksekusi, kontrol siklus iterasi (play, pause, step, reset),
 * dan generator bilangan pseudo-acak deterministik (Seeded LCG).
 */
(function() {
  window.MetaOpt = window.MetaOpt || {};

  // Linear Congruential Generator (LCG) IEEE Deterministic Random
  class SeededRNG {
    constructor(seed = 42) {
      this.initialSeed = seed;
      this.state = seed >>> 0;
    }

    setSeed(seed) {
      this.initialSeed = seed;
      this.state = (seed !== undefined ? seed : 42) >>> 0;
    }

    random() {
      // Numerical Recipes LCG parameters
      this.state = (this.state * 1664525 + 1013904223) % 4294967296;
      return this.state / 4294967296;
    }
  }

  class SimulationEngine {
    constructor() {
      this.rng = new SeededRNG(42);
      this.algorithmType = 'ooa'; // 'ooa' atau 'choa'
      this.benchmarkKey = 'sphere';
      this.popSize = 30;
      this.maxIter = 50;
      this.stepDelay = 60; // ms
      this.dim = 2;

      this.optimizer = null;
      this.isRunning = false;
      this.timerId = null;

      // Event Listeners
      this.onStepCallbacks = [];
      this.onResetCallbacks = [];
      this.onCompleteCallbacks = [];
    }

    onStep(cb) { this.onStepCallbacks.push(cb); }
    onReset(cb) { this.onResetCallbacks.push(cb); }
    onComplete(cb) { this.onCompleteCallbacks.push(cb); }

    emit(event, data) {
      if (event === 'step') this.onStepCallbacks.forEach(cb => cb(data));
      if (event === 'reset') this.onResetCallbacks.forEach(cb => cb(data));
      if (event === 'complete') this.onCompleteCallbacks.forEach(cb => cb(data));
    }

    setSeed(seed) {
      this.rng.setSeed(seed);
    }

    configure(options = {}) {
      if (options.algorithmType) this.algorithmType = options.algorithmType;
      if (options.benchmarkKey) this.benchmarkKey = options.benchmarkKey;
      if (options.popSize) this.popSize = parseInt(options.popSize, 10);
      if (options.maxIter) this.maxIter = parseInt(options.maxIter, 10);
      if (options.stepDelay !== undefined) this.stepDelay = parseInt(options.stepDelay, 10);
      if (options.seed !== undefined) this.setSeed(options.seed);
    }

    init() {
      this.pause();
      const bench = window.MetaOpt.BENCHMARKS[this.benchmarkKey];
      const bound = bench ? bench.domain : [-5.12, 5.12];

      const config = {
        popSize: this.popSize,
        dim: this.dim,
        domain: bound,
        maxIter: this.maxIter,
        evalFn: (pos) => {
          return bench ? bench.eval2D(pos[0], pos[1]) : 0;
        },
        rng: () => this.rng.random()
      };

      if (this.algorithmType === 'ooa') {
        this.optimizer = new window.MetaOpt.OspreyOptimizer(config);
      } else {
        this.optimizer = new window.MetaOpt.ChimpOptimizer(config);
      }

      const initialState = this.optimizer.init();
      this.emit('reset', initialState);
      return initialState;
    }

    step() {
      if (!this.optimizer) this.init();
      if (this.optimizer.currentIter >= this.optimizer.maxIter) {
        this.pause();
        this.emit('complete', this.optimizer.getState());
        return this.optimizer.getState();
      }

      const state = this.optimizer.step();
      this.emit('step', state);

      if (this.optimizer.currentIter >= this.optimizer.maxIter) {
        this.pause();
        this.emit('complete', state);
      }

      return state;
    }

    play() {
      if (!this.optimizer) this.init();
      if (this.optimizer.currentIter >= this.optimizer.maxIter) {
        this.init();
      }

      this.isRunning = true;
      const loop = () => {
        if (!this.isRunning) return;
        this.step();
        if (this.optimizer.currentIter < this.optimizer.maxIter && this.isRunning) {
          this.timerId = setTimeout(loop, this.stepDelay);
        } else {
          this.pause();
        }
      };
      loop();
    }

    pause() {
      this.isRunning = false;
      if (this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
    }

    reset() {
      this.pause();
      return this.init();
    }

    getState() {
      return this.optimizer ? this.optimizer.getState() : null;
    }
  }

  window.MetaOpt.SeededRNG = SeededRNG;
  window.MetaOpt.SimulationEngine = SimulationEngine;
})();

