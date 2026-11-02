/**
 * MAIN APPLICATION CONTROLLER
 * Menghubungkan seluruh subsistem: Lab Interaktif, Komparasi Sinkron,
 * Eksperimen Monte Carlo, dan Visualisasi Canvas.
 */
(function() {
  window.MetaOpt = window.MetaOpt || {};

  // Instance Global
  let simEngine = null;
  let contourRenderer = null;
  let convChart = null;
  let dualChart = null;
  let ooaWidget = null;
  let choaWidget = null;
  let expRunner = null;

  // Status Eksperimen
  let selectedTrialCount = 5;

  function initApp() {
    // 1. Inisialisasi Engine & Renderers
    simEngine = new window.MetaOpt.SimulationEngine();
    expRunner = new window.MetaOpt.ExperimentRunner();

    const contourCanvas = document.getElementById('contourCanvas');
    if (contourCanvas) {
      contourRenderer = new window.MetaOpt.ContourRenderer(contourCanvas);
    }

    const convCanvas = document.getElementById('convergenceCanvas');
    if (convCanvas) {
      convChart = new window.MetaOpt.ConvergenceChart(convCanvas);
    }

    const dualCanvas = document.getElementById('dualConvergenceCanvas');
    if (dualCanvas) {
      dualChart = new window.MetaOpt.DualConvergenceChart(dualCanvas);
    }

    // 2. Inisialisasi Biological Widgets
    const ooaCanvas = document.getElementById('ooaHuntingCanvas');
    const ooaBadge = document.getElementById('ooaSimulationStateText');
    if (ooaCanvas) {
      ooaWidget = new window.MetaOpt.OoaHuntingWidget(ooaCanvas, ooaBadge);
      ooaWidget.init();
      const btnSpawn = document.getElementById('btnSpawnFish');
      if (btnSpawn) {
        btnSpawn.addEventListener('click', () => ooaWidget.spawnPrey(4));
      }
    }

    const choaCanvas = document.getElementById('choaRoleCanvas');
    if (choaCanvas) {
      choaWidget = new window.MetaOpt.ChoaRoleWidget(choaCanvas);
      choaWidget.init();
      const btnPulse = document.getElementById('btnPulseChoaRoles');
      if (btnPulse) {
        btnPulse.addEventListener('click', () => choaWidget.pulsePositions());
      }
    }

    // 3. Daftarkan Callback Event Engine Lab
    simEngine.onStep((state) => {
      updateTelemetryUI(state);
      if (contourRenderer) contourRenderer.render(state, simEngine.benchmarkKey);
      if (convChart) convChart.render(state.convergenceHistory, simEngine.maxIter, simEngine.algorithmType);
    });

    simEngine.onReset((state) => {
      updateTelemetryUI(state);
      if (contourRenderer) contourRenderer.render(state, simEngine.benchmarkKey);
      if (convChart) convChart.render(state.convergenceHistory, simEngine.maxIter, simEngine.algorithmType);
      updatePlayButtonUI(false);
      setLedStatus('ready', 'Engine Siap');
    });

    simEngine.onComplete((state) => {
      updateTelemetryUI(state);
      updatePlayButtonUI(false);
      setLedStatus('completed', 'Optimasi Konvergen (T Maksimum)');
    });

    // 4. Konfigurasi Kontrol Lab Interaktif
    setupLabControls();

    // 5. Setup Tombol Perbandingan Sinkron
    const btnRunCmp = document.getElementById('btnRunComparison');
    if (btnRunCmp) {
      btnRunCmp.addEventListener('click', runSynchronousBenchmark);
    }

    // 6. Setup Tombol Eksperimen Monte Carlo
    setupExperimentControls();

    // 7. Muat status awal
    onBenchmarkChange(false);
    resetSimulationLab();
    runSynchronousBenchmark();

    // 8. KaTeX Auto-Render Math In Page
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  }

  // --- Kontrol Lab Interaktif ---
  function setupLabControls() {
    const selAlgoOoa = document.getElementById('tabChooseOoa');
    const selAlgoChoa = document.getElementById('tabChooseChoa');
    const selFunction = document.getElementById('selFunction');
    const rngPop = document.getElementById('rngPopSize');
    const rngIter = document.getElementById('rngMaxIter');
    const rngSpeed = document.getElementById('rngSpeed');
    const inpSeed = document.getElementById('inpSeed');
    const btnRandomSeed = document.getElementById('btnRandomSeed');
    const btnPlay = document.getElementById('btnPlay');
    const btnStep = document.getElementById('btnStep');
    const btnReset = document.getElementById('btnReset');

    if (selAlgoOoa) {
      selAlgoOoa.addEventListener('click', () => setAlgorithm('ooa'));
    }
    if (selAlgoChoa) {
      selAlgoChoa.addEventListener('click', () => setAlgorithm('choa'));
    }

    if (selFunction) {
      selFunction.addEventListener('change', () => onBenchmarkChange(true));
    }

    if (rngPop) {
      rngPop.addEventListener('input', () => {
        document.getElementById('lblPopSize').textContent = rngPop.value;
        simEngine.configure({ popSize: rngPop.value });
        resetSimulationLab();
      });
    }

    if (rngIter) {
      rngIter.addEventListener('input', () => {
        document.getElementById('lblMaxIter').textContent = rngIter.value;
        simEngine.configure({ maxIter: rngIter.value });
        resetSimulationLab();
      });
    }

    if (rngSpeed) {
      rngSpeed.addEventListener('input', () => {
        document.getElementById('lblSpeed').textContent = rngSpeed.value + 'ms';
        simEngine.configure({ stepDelay: rngSpeed.value });
      });
    }

    if (inpSeed) {
      inpSeed.addEventListener('change', () => {
        const s = parseInt(inpSeed.value, 10) || 42;
        simEngine.setSeed(s);
        resetSimulationLab();
      });
    }

    if (btnRandomSeed) {
      btnRandomSeed.addEventListener('click', () => {
        const randS = Math.floor(Math.random() * 999999);
        inpSeed.value = randS;
        simEngine.setSeed(randS);
        resetSimulationLab();
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', togglePlaySimulation);
    }

    if (btnStep) {
      btnStep.addEventListener('click', () => {
        setLedStatus('active', 'Langkah Tunggal...');
        simEngine.step();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', resetSimulationLab);
    }
  }

  function setAlgorithm(algo) {
    simEngine.configure({ algorithmType: algo });
    const btnOoa = document.getElementById('tabChooseOoa');
    const btnChoa = document.getElementById('tabChooseChoa');
    const algoBadge = document.getElementById('activeAlgoBadge');
    const agentLegend = document.getElementById('agentLegendColor');

    if (algo === 'ooa') {
      btnOoa.className = 'px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md transition-all shadow-sm';
      btnChoa.className = 'px-space-md py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all';
      algoBadge.className = 'text-primary font-semibold';
      algoBadge.textContent = 'AKTIF: OOA (Osprey)';
      if (agentLegend) agentLegend.className = 'w-2.5 h-2.5 rounded-full bg-primary inline-block';
    } else {
      btnChoa.className = 'px-space-md py-1.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md transition-all shadow-sm';
      btnOoa.className = 'px-space-md py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all';
      algoBadge.className = 'text-secondary font-semibold';
      algoBadge.textContent = 'AKTIF: ChOA (Chimp)';
      if (agentLegend) agentLegend.className = 'w-2.5 h-2.5 rounded-full bg-secondary inline-block';
    }

    resetSimulationLab();
  }

  function onBenchmarkChange(doReset = true) {
    const sel = document.getElementById('selFunction');
    const key = sel ? sel.value : 'sphere';
    simEngine.configure({ benchmarkKey: key });

    const bench = window.MetaOpt.BENCHMARKS[key];
    if (bench) {
      const domLabel = document.getElementById('landscapeDomainLabel');
      const formulaDisplay = document.getElementById('funcFormulaDisplay');
      const optDisplay = document.getElementById('funcOptimumDisplay');

      if (domLabel) domLabel.textContent = `Domain: [${bench.domain[0]}, ${bench.domain[1]}]²`;
      if (formulaDisplay) formulaDisplay.textContent = bench.formulaText;
      if (optDisplay) optDisplay.textContent = `Global Min: f(${bench.optimumCoord.join(', ')}) = ${bench.optimumVal.toFixed(1)}`;

      if (contourRenderer) contourRenderer.precompute(key);
    }

    if (doReset) resetSimulationLab();
  }

  function resetSimulationLab() {
    const inpSeed = document.getElementById('inpSeed');
    const s = inpSeed ? parseInt(inpSeed.value, 10) || 42 : 42;
    simEngine.setSeed(s);
    simEngine.reset();
  }

  function togglePlaySimulation() {
    if (simEngine.isRunning) {
      simEngine.pause();
      updatePlayButtonUI(false);
      setLedStatus('paused', 'Dijeda (Paused)');
    } else {
      simEngine.play();
      updatePlayButtonUI(true);
      setLedStatus('active', 'Simulasi Berjalan...');
    }
  }

  function updatePlayButtonUI(isPlaying) {
    const playIcon = document.getElementById('playIcon');
    const playText = document.getElementById('playText');
    if (playIcon) playIcon.textContent = isPlaying ? 'pause' : 'play_arrow';
    if (playText) playText.textContent = isPlaying ? 'Jeda Simulasi' : 'Jalankan Simulasi';
  }

  function setLedStatus(type, msg) {
    const led = document.getElementById('statusLed');
    const statusMsg = document.getElementById('statusMessage');
    if (statusMsg) statusMsg.textContent = msg;

    if (led) {
      if (type === 'active') {
        led.className = 'w-2 h-2 rounded-full bg-primary animate-pulse';
      } else if (type === 'completed') {
        led.className = 'w-2 h-2 rounded-full bg-green-600';
      } else {
        led.className = 'w-2 h-2 rounded-full bg-tertiary';
      }
    }
  }

  function updateTelemetryUI(state) {
    if (!state) return;
    const overlayIter = document.getElementById('overlayIterCount');
    const progPct = document.getElementById('telemetryProgressPct');
    const progBar = document.getElementById('telemetryProgressBar');
    const telBest = document.getElementById('telBestFitness');
    const telMean = document.getElementById('telMeanFitness');
    const telNfe = document.getElementById('telNfe');
    const telCoord = document.getElementById('telBestCoord');

    const pct = Math.min(100, Math.round((state.iteration / state.maxIter) * 100));
    if (overlayIter) overlayIter.textContent = `Iterasi: ${state.iteration} / ${state.maxIter}`;
    if (progPct) progPct.textContent = pct + '%';
    if (progBar) progBar.style.width = pct + '%';

    if (telBest) telBest.textContent = formatSci(state.bestAgent.fitness);
    if (telMean) telMean.textContent = formatSci(state.meanFitness);
    if (telNfe) telNfe.textContent = state.nfe;
    if (telCoord) {
      telCoord.textContent = `(${state.bestAgent.x.toFixed(4)}, ${state.bestAgent.y.toFixed(4)})`;
    }
  }

  function formatSci(val) {
    if (val === undefined || isNaN(val)) return '--';
    if (Math.abs(val) < 0.001 || Math.abs(val) >= 10000) {
      return val.toExponential(4);
    }
    return val.toFixed(5);
  }

  // --- Perbandingan Sinkron OOA vs ChOA (Section 5) ---
  function runSynchronousBenchmark() {
    const benchKey = simEngine.benchmarkKey;
    const bench = window.MetaOpt.BENCHMARKS[benchKey];
    if (!bench) return;

    const inpSeed = document.getElementById('inpSeed');
    const seedVal = inpSeed ? parseInt(inpSeed.value, 10) || 42 : 42;
    const popSize = simEngine.popSize;
    const maxIter = simEngine.maxIter;
    const bound = bench.domain;

    // 1. Eksekusi OOA
    const rngOoa = new window.MetaOpt.SeededRNG(seedVal);
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

    // 2. Eksekusi ChOA
    const rngChoa = new window.MetaOpt.SeededRNG(seedVal);
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

    // 3. Tampilkan Metrik ke Tabel
    const setT = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setT('cmpOoaBest', formatSci(ooaState.bestAgent.fitness));
    setT('cmpChoaBest', formatSci(choaState.bestAgent.fitness));
    setT('cmpOoaMean', formatSci(ooaState.meanFitness));
    setT('cmpChoaMean', formatSci(choaState.meanFitness));
    setT('cmpOoaWorst', formatSci(ooaState.worstFitness));
    setT('cmpChoaWorst', formatSci(choaState.worstFitness));
    setT('cmpOoaStd', formatSci(ooaState.stdDev));
    setT('cmpChoaStd', formatSci(choaState.stdDev));
    setT('cmpOoaNfe', ooaState.nfe);
    setT('cmpChoaNfe', choaState.nfe);
    setT('cmpOoaTime', ooaState.executionTimeMs.toFixed(2));
    setT('cmpChoaTime', choaState.executionTimeMs.toFixed(2));

    const alertBox = document.getElementById('cmpSummaryAlert');
    if (alertBox) {
      let winText = '';
      if (ooaState.bestAgent.fitness < choaState.bestAgent.fitness - 1e-12) {
        winText = '<span class="font-semibold text-primary">OOA (Osprey)</span> menunjukkan konvergensi lebih presisi.';
      } else if (choaState.bestAgent.fitness < ooaState.bestAgent.fitness - 1e-12) {
        winText = '<span class="font-semibold text-secondary">ChOA (Chimp)</span> menunjukkan konvergensi lebih presisi.';
      } else {
        winText = 'Kedua algoritma mencapai akurasi optimal seimbang.';
      }
      alertBox.innerHTML = `Hasil komparasi sinkron pada <strong>${bench.name}</strong>: ${winText}`;
    }

    // 4. Render Dual Canvas Plot
    if (dualChart) {
      dualChart.render(ooaState.convergenceHistory, choaState.convergenceHistory, maxIter);
    }
  }

  // --- Eksperimen Batch Monte Carlo (Section 6) ---
  function setupExperimentControls() {
    [5, 10, 30].forEach(n => {
      const btn = document.getElementById(`btnTrial${n}`);
      if (btn) {
        btn.addEventListener('click', () => {
          selectedTrialCount = n;
          [5, 10, 30].forEach(k => {
            const b = document.getElementById(`btnTrial${k}`);
            if (b) {
              if (k === n) {
                b.className = 'px-space-sm py-1 rounded bg-primary text-on-primary font-semibold';
              } else {
                b.className = 'px-space-sm py-1 rounded text-on-surface-variant hover:text-on-surface';
              }
            }
          });
        });
      }
    });

    const btnRunBatch = document.getElementById('btnRunBatch');
    if (btnRunBatch) {
      btnRunBatch.addEventListener('click', runBatchExperiment);
    }

    const btnExport = document.getElementById('btnExportCsv');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        try {
          expRunner.exportCsv('metaopt_experimental_trials');
        } catch (err) {
          alert(err.message);
        }
      });
    }
  }

  function runBatchExperiment() {
    const statusTag = document.getElementById('experimentStatusTag');
    if (statusTag) statusTag.textContent = 'Menjalankan Uji Replikasi...';

    const results = expRunner.runBatch({
      benchKey: simEngine.benchmarkKey,
      popSize: simEngine.popSize,
      maxIter: simEngine.maxIter,
      trialsCount: selectedTrialCount,
      baseSeed: 1000
    });

    const tbody = document.getElementById('trialTableBody');
    if (tbody) {
      tbody.innerHTML = '';
      results.forEach(r => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-surface-container-low transition-colors';
        const winBadgeClass = r.winner === 'OOA'
          ? 'bg-primary-fixed text-on-primary-fixed-variant'
          : (r.winner === 'ChOA' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface');

        tr.innerHTML = `
          <td class="py-2.5 px-4 font-semibold text-on-surface">#${r.trial}</td>
          <td class="py-2.5 px-4 text-tertiary font-code-sm">${r.seed}</td>
          <td class="py-2.5 px-4 font-body-sm">${r.functionName}</td>
          <td class="py-2.5 px-4 font-semibold text-primary font-code-sm">${formatSci(r.ooaBest)}</td>
          <td class="py-2.5 px-4 font-semibold text-secondary font-code-sm">${formatSci(r.choaBest)}</td>
          <td class="py-2.5 px-4 text-on-surface-variant font-code-sm">${formatSci(r.delta)}</td>
          <td class="py-2.5 px-4"><span class="px-space-xs py-0.5 rounded text-label-md font-semibold ${winBadgeClass}">${r.winner}</span></td>
        `;
        tbody.appendChild(tr);
      });
    }

    const summary = expRunner.getSummaryStats();
    if (statusTag && summary) {
      statusTag.textContent = `Selesai: ${summary.totalTrials} Replikasi (OOA Menang: ${summary.ooaWins}, ChOA Menang: ${summary.choaWins}, Seri: ${summary.ties})`;
    }
  }

  // Ekspor fungsi global untuk inline onclick bila diperlukan
  window.MetaOpt.setAlgorithm = setAlgorithm;
  window.MetaOpt.runSynchronousBenchmark = runSynchronousBenchmark;
  window.MetaOpt.runBatchExperiment = runBatchExperiment;

  document.addEventListener('DOMContentLoaded', initApp);
})();

