/**
 * CANVAS VISUALIZATION ENGINE
 * - Render Kontur Topologi 2D dengan buffer berkinerja tinggi
 * - Visualisasi partikel agen pencari & solusi terbaik
 * - Widget interaktif biologi: Osprey Hunting & Chimp Social Roles
 */
(function() {
  window.MetaOpt = window.MetaOpt || {};

  class ContourRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas ? canvas.getContext('2d') : null;
      this.bufferCanvas = document.createElement('canvas');
      this.currentBenchKey = null;
    }

    // Precompute contour buffer grid agar per-frame rendering 60fps tanpa lag
    precompute(benchKey) {
      if (!this.canvas) return;
      this.currentBenchKey = benchKey;
      const bench = window.MetaOpt.BENCHMARKS[benchKey];
      if (!bench) return;

      const [lb, ub] = bench.domain;
      const w = 320;
      const h = 260;

      this.bufferCanvas.width = w;
      this.bufferCanvas.height = h;
      const ctx = this.bufferCanvas.getContext('2d');
      const imgData = ctx.createImageData(w, h);
      const data = imgData.data;

      // Hitung grid nilai fitness
      let minF = Infinity;
      let maxF = -Infinity;
      const grid = new Float32Array(w * h);

      let idx = 0;
      for (let py = 0; py < h; py++) {
        const y = ub - (py / h) * (ub - lb);
        for (let px = 0; px < w; px++) {
          const x = lb + (px / w) * (ub - lb);
          const f = bench.eval2D(x, y);
          grid[idx] = f;
          if (f < minF) minF = f;
          if (f > maxF) maxF = f;
          idx++;
        }
      }

      // Palet warna akademis: cream/sandstone ke slate/terracotta
      idx = 0;
      const logSpan = Math.log10(1 + Math.max(1, maxF - minF));
      for (let i = 0; i < grid.length; i++) {
        const val = grid[i];
        const norm = Math.log10(1 + Math.max(0, val - minF)) / logSpan;

        // Base gradient: terang di lembah/minimum, gelap di puncak
        const r = Math.floor(251 - norm * 155);
        const g = Math.floor(249 - norm * 165);
        const bCol = Math.floor(245 - norm * 170);

        // Garis kontur isotermal (isoline rings)
        const isoLevel = norm * 26;
        const isIso = Math.floor(isoLevel) % 2 === 0 && (isoLevel - Math.floor(isoLevel) < 0.14);

        if (isIso) {
          data[idx] = 180;
          data[idx + 1] = 160;
          data[idx + 2] = 150;
          data[idx + 3] = 255;
        } else {
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = bCol;
          data[idx + 3] = 255;
        }
        idx += 4;
      }

      ctx.putImageData(imgData, 0, 0);
    }

    render(state, benchKey) {
      if (!this.canvas || !this.ctx) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const bench = window.MetaOpt.BENCHMARKS[benchKey];
      if (!bench) return;

      const [lb, ub] = bench.domain;

      ctx.clearRect(0, 0, w, h);

      // 1. Gambar peta kontur precomputed
      if (this.bufferCanvas.width > 0) {
        ctx.drawImage(this.bufferCanvas, 0, 0, w, h);
      }

      // Helper konversi koordinat dunia ke pixel canvas
      const toX = (x) => ((x - lb) / (ub - lb)) * w;
      const toY = (y) => h - ((y - lb) / (ub - lb)) * h;

      // 2. Garis sumbu silang halus di (0, 0)
      const ox = toX(0);
      const oy = toY(0);
      ctx.strokeStyle = 'rgba(120, 110, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ox, 0); ctx.lineTo(ox, h);
      ctx.moveTo(0, oy); ctx.lineTo(w, oy);
      ctx.stroke();

      // 3. Optimum teoritis (Target minimum)
      if (bench.optimumCoord) {
        const tx = toX(bench.optimumCoord[0]);
        const ty = toY(bench.optimumCoord[1]);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(tx, ty, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (!state || !state.population) return;

      // 4. Gambar agen pencari
      const isOoa = (state.algorithm === 'OOA');

      state.population.forEach(agent => {
        const cx = toX(agent.x);
        const cy = toY(agent.y);

        let fillCol = isOoa ? '#ab2e16' : '#505f76';
        let radius = 4;

        if (!isOoa && agent.role) {
          if (agent.role === 'alpha') { fillCol = '#ab2e16'; radius = 6; }
          else if (agent.role === 'beta') { fillCol = '#ce462c'; radius = 5; }
          else if (agent.role === 'gamma') { fillCol = '#505f76'; radius = 4.5; }
          else if (agent.role === 'delta') { fillCol = '#727578'; radius = 4; }
        }

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = fillCol;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      });

      // 5. Soroti Solusi Terbaik Global (Global Best X*)
      if (state.bestAgent && isFinite(state.bestAgent.fitness)) {
        const bx = toX(state.bestAgent.x);
        const by = toY(state.bestAgent.y);

        // Lingkaran halo berdenyut
        ctx.beginPath();
        ctx.arc(bx, by, 12, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Ikon Bintang Emas
        this.drawStar(ctx, bx, by, 5, 8, 4, '#d97706');
      }
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  // --- Widget Biologis Interaktif 1: Model Berburu Osprey (OOA) ---
  class OoaHuntingWidget {
    constructor(canvas, countBadge) {
      this.canvas = canvas;
      this.ctx = canvas ? canvas.getContext('2d') : null;
      this.countBadge = countBadge;
      this.preyList = [];
      this.ospreys = [];
      this.animReq = null;
    }

    init() {
      if (!this.canvas || !this.ctx) return;
      const w = this.canvas.width;
      const h = this.canvas.height;

      this.preyList = [
        { x: 120, y: 220, vx: 0.6, vy: 0.2 },
        { x: 260, y: 250, vx: -0.5, vy: 0.3 },
        { x: 410, y: 240, vx: 0.4, vy: -0.2 },
        { x: 320, y: 210, vx: -0.3, vy: -0.3 },
        { x: 490, y: 230, vx: 0.5, vy: 0.2 }
      ];

      this.ospreys = [];
      for (let i = 0; i < 8; i++) {
        this.ospreys.push({
          x: 40 + i * 65,
          y: 50 + Math.random() * 40,
          targetPrey: null,
          diving: false
        });
      }

      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        if (my > 150) {
          this.preyList.push({
            x: mx,
            y: my,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.5
          });
          this.updateBadge();
        }
      });

      this.updateBadge();
      this.animate();
    }

    spawnPrey(n = 4) {
      const w = this.canvas.width;
      for (let i = 0; i < n; i++) {
        this.preyList.push({
          x: 60 + Math.random() * (w - 120),
          y: 170 + Math.random() * 110,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.4
        });
      }
      this.updateBadge();
    }

    updateBadge() {
      if (this.countBadge) {
        this.countBadge.textContent = `Ikan Aktif: ${this.preyList.length} | Elang Osprey: ${this.ospreys.length}`;
      }
    }

    animate() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Udara & Laut
      ctx.fillStyle = '#1e2022';
      ctx.fillRect(0, 0, w, 150);
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 150, w, h - 150);

      // Garis permukaan laut putus-putus
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, 150); ctx.lineTo(w, 150);
      ctx.stroke();
      ctx.setLineDash([]);

      // Update & render ikan
      this.preyList.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 15 || p.x > w - 15) p.vx *= -1;
        if (p.y < 160 || p.y > h - 15) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      });

      // Update & render osprey
      this.ospreys.forEach((osp, idx) => {
        if (!osp.targetPrey && this.preyList.length > 0 && Math.random() < 0.03) {
          osp.targetPrey = this.preyList[Math.floor(Math.random() * this.preyList.length)];
        }

        if (osp.targetPrey) {
          // Trajektori penyelaman (diving vector)
          ctx.strokeStyle = 'rgba(206, 70, 44, 0.45)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(osp.x, osp.y);
          ctx.lineTo(osp.targetPrey.x, osp.targetPrey.y);
          ctx.stroke();

          osp.x += (osp.targetPrey.x - osp.x) * 0.025;
          osp.y += (osp.targetPrey.y - osp.y) * 0.025;

          if (Math.hypot(osp.targetPrey.x - osp.x, osp.targetPrey.y - osp.y) < 12) {
            osp.targetPrey = null;
            osp.y = 45 + Math.random() * 35; // Terbang kembali ke sarang/pantai
          }
        } else {
          osp.x += Math.sin(Date.now() * 0.002 + idx) * 0.8;
        }

        ctx.beginPath();
        ctx.arc(osp.x, osp.y, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ab2e16';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      });

      this.animReq = requestAnimationFrame(() => this.animate());
    }
  }

  // --- Widget Biologis Interaktif 2: Model 4-Peran Simpanse (ChOA) ---
  class ChoaRoleWidget {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas ? canvas.getContext('2d') : null;
      this.roles = {
        alpha: { x: 300, y: 90, label: 'α (Attacker)', color: '#ab2e16' },
        beta:  { x: 170, y: 210, label: 'β (Barrier)',  color: '#ce462c' },
        gamma: { x: 430, y: 200, label: 'γ (Chaser)',   color: '#505f76' },
        delta: { x: 290, y: 260, label: 'δ (Driver)',   color: '#727578' }
      };
      this.chimps = [];
      this.animReq = null;
    }

    init() {
      if (!this.canvas || !this.ctx) return;
      const w = this.canvas.width;
      const h = this.canvas.height;

      this.chimps = [];
      for (let i = 0; i < 16; i++) {
        this.chimps.push({
          x: 90 + Math.random() * (w - 180),
          y: 70 + Math.random() * (h - 130)
        });
      }

      this.animate();
    }

    pulsePositions() {
      this.roles.alpha.x = 220 + Math.random() * 160;
      this.roles.alpha.y = 70 + Math.random() * 80;
      this.roles.beta.x = 110 + Math.random() * 140;
      this.roles.beta.y = 150 + Math.random() * 100;
      this.roles.gamma.x = 360 + Math.random() * 140;
      this.roles.gamma.y = 150 + Math.random() * 100;
      this.roles.delta.x = 210 + Math.random() * 180;
      this.roles.delta.y = 220 + Math.random() * 60;
    }

    animate() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#1e2022';
      ctx.fillRect(0, 0, w, h);

      const centroidX = (this.roles.alpha.x + this.roles.beta.x + this.roles.gamma.x + this.roles.delta.x) / 4;
      const centroidY = (this.roles.alpha.y + this.roles.beta.y + this.roles.gamma.y + this.roles.delta.y) / 4;

      // Hubungkan kuadran 4 peran dengan poligon kawat
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.roles.alpha.x, this.roles.alpha.y);
      ctx.lineTo(this.roles.beta.x, this.roles.beta.y);
      ctx.lineTo(this.roles.delta.x, this.roles.delta.y);
      ctx.lineTo(this.roles.gamma.x, this.roles.gamma.y);
      ctx.closePath();
      ctx.stroke();

      // Titik Sentroid target konvergensi
      ctx.beginPath();
      ctx.arc(centroidX, centroidY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      // Simpanse bergerak menuju sentroid dengan perturbasi acak
      this.chimps.forEach(c => {
        c.x += (centroidX - c.x) * 0.02 + (Math.random() - 0.5) * 1.5;
        c.y += (centroidY - c.y) * 0.02 + (Math.random() - 0.5) * 1.5;

        ctx.beginPath();
        ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
      });

      // Render 4 Simpanse Elit
      Object.values(this.roles).forEach(r => {
        ctx.beginPath();
        ctx.arc(r.x, r.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px Space Grotesk';
        ctx.fillText(r.label, r.x + 12, r.y + 4);
      });

      this.animReq = requestAnimationFrame(() => this.animate());
    }
  }

  window.MetaOpt.ContourRenderer = ContourRenderer;
  window.MetaOpt.OoaHuntingWidget = OoaHuntingWidget;
  window.MetaOpt.ChoaRoleWidget = ChoaRoleWidget;
})();

