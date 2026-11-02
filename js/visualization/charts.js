/**
 * CHARTS ENGINE
 * Plot Konvergensi Logaritmik (Log-Scale Best-so-Far Fitness vs Iterasi)
 * - Single Convergence Chart (Lab Interaktif)
 * - Dual Synchronous Chart (Perbandingan OOA vs ChOA)
 */
(function() {
  window.MetaOpt = window.MetaOpt || {};

  class ConvergenceChart {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas ? canvas.getContext('2d') : null;
    }

    render(history, maxIter, algoType = 'ooa') {
      if (!this.canvas || !this.ctx) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#1e2022';
      ctx.fillRect(0, 0, w, h);

      // Garis grid horizontal
      ctx.strokeStyle = '#2d3238';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        const y = (h / 5) * i;
        ctx.beginPath();
        ctx.moveTo(42, y); ctx.lineTo(w - 15, y);
        ctx.stroke();
      }

      if (!history || history.length < 1) return;

      // Konversi ke nilai log10 aman (mencegah log(0) atau minus)
      const logVals = history.map(v => Math.log10(Math.max(1e-16, v)));
      const minLog = Math.min(...logVals);
      const maxLog = Math.max(...logVals);
      const span = (maxLog - minLog) || 1;

      const padL = 42;
      const padR = 15;
      const padT = 16;
      const padB = 24;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      // Warna kurva berdasarkan algoritma aktif
      const isOoa = (algoType.toLowerCase() === 'ooa');
      ctx.strokeStyle = isOoa ? '#ab2e16' : '#505f76';
      ctx.lineWidth = 2.2;
      ctx.beginPath();

      const totalPoints = Math.max(maxIter - 1, history.length - 1, 1);
      for (let i = 0; i < history.length; i++) {
        const x = padL + (i / totalPoints) * plotW;
        const normY = (logVals[i] - minLog) / span;
        const y = padT + plotH - normY * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Label batas logaritmik sumbu Y
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Space Grotesk';
      ctx.fillText(maxLog.toFixed(1), 6, padT + 8);
      ctx.fillText(minLog.toFixed(1), 6, h - padB + 2);
    }
  }

  class DualConvergenceChart {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas ? canvas.getContext('2d') : null;
    }

    render(ooaHist, choaHist, maxIter) {
      if (!this.canvas || !this.ctx) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#1e2022';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = '#2d3238';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        const y = (h / 5) * i;
        ctx.beginPath();
        ctx.moveTo(42, y); ctx.lineTo(w - 15, y);
        ctx.stroke();
      }

      if (!ooaHist.length && !choaHist.length) return;

      const combined = [...ooaHist, ...choaHist].map(v => Math.log10(Math.max(1e-16, v)));
      const minLog = Math.min(...combined);
      const maxLog = Math.max(...combined);
      const span = (maxLog - minLog) || 1;

      const padL = 42;
      const padR = 20;
      const padT = 20;
      const padB = 25;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      // 1. Kurva OOA (Terracotta / Orange-red)
      if (ooaHist.length > 0) {
        ctx.strokeStyle = '#ab2e16';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < ooaHist.length; i++) {
          const lVal = Math.log10(Math.max(1e-16, ooaHist[i]));
          const x = padL + (i / (maxIter - 1 || 1)) * plotW;
          const y = padT + plotH - ((lVal - minLog) / span) * plotH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // 2. Kurva ChOA (Slate Navy)
      if (choaHist.length > 0) {
        ctx.strokeStyle = '#505f76';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < choaHist.length; i++) {
          const lVal = Math.log10(Math.max(1e-16, choaHist[i]));
          const x = padL + (i / (maxIter - 1 || 1)) * plotW;
          const y = padT + plotH - ((lVal - minLog) / span) * plotH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Label sumbu Y
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Space Grotesk';
      ctx.fillText(maxLog.toFixed(1), 6, padT + 8);
      ctx.fillText(minLog.toFixed(1), 6, h - padB + 2);
    }
  }

  window.MetaOpt.ConvergenceChart = ConvergenceChart;
  window.MetaOpt.DualConvergenceChart = DualConvergenceChart;
})();

