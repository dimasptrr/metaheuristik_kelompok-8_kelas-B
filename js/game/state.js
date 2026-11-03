/**
 * PULAU MISI — GAME STATE, STAGE REGISTRY, PERSISTENCE & PROCEDURAL SFX
 * Mengelola XP, level, pembukaan stage berurutan, badge, mode presentasi,
 * serta penyimpanan progres pada localStorage (Pure Vanilla JS).
 */
(function() {
  window.MetaOpt = window.MetaOpt || {};

  const STORAGE_KEY = 'metaopt_pulau_misi_state_v1';

  const STAGES = [
    {
      num: 1,
      id: 'overview',
      title: 'Base Camp: Memahami Medan',
      shortLabel: 'Base Camp',
      xp: 100,
      badge: {
        id: 'pemula',
        name: 'Pemula',
        icon: '🧭',
        desc: 'Menguasai 5 pilar optimasi kontinu dan alur kerja 6 langkah metaheuristik.'
      },
      guideIcon: '🎓',
      guideSpeaker: 'Kapten Optimizer — Base Camp',
      briefing: 'Pelajari struktur ruang pencarian berdimensi D, fungsi objektif tanpa gradien, serta keseimbangan eksplorasi dan eksploitasi sebelum memasuki zona algoritma.',
      narrative: 'Selamat datang di Pulau Metaheuristik, Optimizer! Misi utama ekspedisi ini adalah menemukan koordinat titik terendah global f(X*) tanpa bantuan turunan kalkulus. Pelajari 5 pilar fondasi dan alur kerja 6 langkah di bawah ini untuk membuka jalur menuju Danau Osprey.',
      // Posisi persentase/SVG (viewBox 1200 x 640)
      x: 245,
      y: 430
    },
    {
      num: 2,
      id: 'ooa-osprey',
      title: 'Danau Osprey',
      shortLabel: 'Danau Osprey',
      xp: 150,
      badge: {
        id: 'pemburu-ikan',
        name: 'Pemburu Ikan',
        icon: '🦅',
        desc: 'Menuntaskan formulasi 2 fase Osprey Optimization Algorithm (eksplorasi air & eksploitasi sarang).'
      },
      guideIcon: '🦅',
      guideSpeaker: 'Pemandu OOA — Pesisir Danau',
      briefing: 'Amati bagaimana burung elang tiram (Osprey) memburu target berfitness lebih baik (Fase 1) lalu mempersempit radius pencarian sebesar 1/t (Fase 2).',
      narrative: 'Kita tiba di Danau Osprey! Perhatikan simulator penyelaman 2D dan persamaan dua tahap OOA: Fase 1 melompat ke kandidat berbiaya lebih rendah menggunakan impuls stokastik I ∈ {1, 2}, sedangkan Fase 2 menyusutkan radius lokal berbanding terbalik terhadap iterasi t.',
      x: 385,
      y: 325
    },
    {
      num: 3,
      id: 'choa-chimp',
      title: 'Hutan Simpanse',
      shortLabel: 'Hutan Simpanse',
      xp: 150,
      badge: {
        id: 'pemimpin-kawanan',
        name: 'Pemimpin Kawanan',
        icon: '🐒',
        desc: 'Memahami koordinasi sentroid 4 kasta sosial (α, β, γ, δ) dan modulasi Chaotic Map pada ChOA.'
      },
      guideIcon: '🐒',
      guideSpeaker: 'Pemandu ChOA — Kanopi Hutan',
      briefing: 'Pelajari pembagian 4 peran elit simpanse (Attacker, Barrier, Chaser, Driver), vektor fusi sentroid (X1+X2+X3+X4)/4, dan peta chaos.',
      narrative: 'Di Hutan Simpanse, pencarian tidak dipimpin satu agen tunggal, melainkan rata-rata kuadran 4 pemimpin terbaik: α (Attacker), β (Barrier), γ (Chaser), dan δ (Driver), ditambah dorongan Chaotic Map agar kawanan tidak terjebak di cekungan lokal.',
      x: 545,
      y: 235
    },
    {
      num: 4,
      id: 'interactive-lab',
      title: 'Lab Pulau (Boss Level 1)',
      shortLabel: 'Lab Pulau',
      xp: 200,
      badge: {
        id: 'ilmuwan',
        name: 'Ilmuwan',
        icon: '🔬',
        desc: 'Mengoperasikan kernel simulasi 2D pada fungsi benchmark dengan kontrol populasi, iterasi, dan seed deterministik.'
      },
      guideIcon: '🔬',
      guideSpeaker: 'Kernel AI — Laboratorium Pusat',
      briefing: 'Uji langsung OOA dan ChOA pada peta kontur Sphere, Rastrigin, Rosenbrock, dan Ackley. Amati pergerakan agen menuju titik bintang emas X*.',
      narrative: 'Inilah Boss Level 1: Laboratorium Simulasi Pulau! Ubah fungsi uji, ukuran populasi N, iterasi maksimum T, dan RNG Seed. Jalankan simulasi untuk melihat secara langsung bagaimana agen menuruni kontur topologi dan menekan kurva log10(f(X*)).',
      x: 685,
      y: 345
    },
    {
      num: 5,
      id: 'comparison',
      title: 'Arena Duel OOA vs ChOA',
      shortLabel: 'Arena Duel',
      xp: 200,
      badge: {
        id: 'juri',
        name: 'Juri',
        icon: '⚖️',
        desc: 'Mengevaluasi kurva peluruhan logaritmik ganda dan tabel kinerja sinkron antara OOA dan ChOA.'
      },
      guideIcon: '⚖️',
      guideSpeaker: 'Arbiter Komparasi — Jembatan Kembar',
      briefing: 'Pertandingkan OOA dan ChOA secara paralel menggunakan seed acak, batas domain, populasi, dan jumlah iterasi yang identik.',
      narrative: 'Di Arena Duel, kedua algoritma diuji pada titik keberangkatan acak (seed) yang 100% sama persis. Bandingkan ketajaman kurva konvergensi, nilai Fitness Terbaik, Standar Deviasi, serta jumlah evaluasi fungsi (NFE) masing-masing.',
      x: 825,
      y: 445
    },
    {
      num: 6,
      id: 'experiment',
      title: 'Ruang Statistik Monte Carlo',
      shortLabel: 'Monte Carlo',
      xp: 200,
      badge: {
        id: 'analis',
        name: 'Analis',
        icon: '📊',
        desc: 'Menjalankan uji replikasi multi-seed Monte Carlo dan mengekspor laporan CSV standar RFC 4180.'
      },
      guideIcon: '📊',
      guideSpeaker: 'Direktur Data — Menara Statistik',
      briefing: 'Satu kali percobaan belum cukup untuk membuktikan stabilitas stokastik. Jalankan 5, 10, atau 30 replikasi independen dan unduh CSV.',
      narrative: 'Karena metaheuristik menggunakan komponen acak, pengujian ilmiah wajib diulang lintas banyak seed (Monte Carlo). Eksekusi batch replikasi di menara ini untuk melihat pemenang statistik sejati dan unduh tabel datanya dalam format CSV.',
      x: 960,
      y: 335
    },
    {
      num: 7,
      id: 'references',
      title: 'Perpustakaan Pulau',
      shortLabel: 'Pustaka',
      xp: 50,
      badge: {
        id: 'kolektor',
        name: 'Kolektor',
        icon: '🏛️',
        desc: 'Menyelesaikan seluruh ekspedisi Pulau Metaheuristik dan memverifikasi rujukan jurnal primer.'
      },
      guideIcon: '🏛️',
      guideSpeaker: 'Arsiparis Monograf — Puncak Pulau',
      briefing: 'Tinjau literatur primer peer-reviewed Nature Scientific Reports (2023) dan Elsevier Expert Systems with Applications (2020).',
      narrative: 'Selamat mencapai puncak ekspedisi, Optimizer! Di Perpustakaan Pulau tersimpan dokumen sitasi BibTeX dan DOI jurnal primer tempat OOA dan ChOA pertama kali dirumuskan. Selesaikan tahap terakhir ini untuk melengkapi seluruh koleksi badge!',
      x: 845,
      y: 205
    }
  ];

  const RANKS = [
    { minXp: 0,    level: 1, title: 'Kadet Eksplorasi',      nextXp: 150 },
    { minXp: 150,  level: 2, title: 'Navigator Topologi',    nextXp: 400 },
    { minXp: 400,  level: 3, title: 'Pemburu Heuristik',     nextXp: 700 },
    { minXp: 700,  level: 4, title: 'Arsitek Konvergensi',   nextXp: 1000 },
    { minXp: 1000, level: 5, title: 'Grandmaster Optimasi',  nextXp: 1315 }
  ];

  const Game = {
    stages: STAGES,
    xp: 0,
    completed: [],      // nomor stage [1..7]
    questsDone: [],     // id quest string
    badges: [],         // id badge string
    current: 1,         // stage yang sedang dipilih di peta [1..7]
    openStageNum: null, // stage yang sedang dibuka di modal (null bila di peta)
    presentationMode: false,
    soundEnabled: false,
    musicEnabled: false,
    narrativeHidden: false,
    listeners: [],
    audioCtx: null,

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.xp = Number(parsed.xp) || 0;
          this.completed = Array.isArray(parsed.completed) ? parsed.completed : [];
          this.questsDone = Array.isArray(parsed.questsDone) ? parsed.questsDone : [];
          this.badges = Array.isArray(parsed.badges) ? parsed.badges : [];
          this.current = Math.min(7, Math.max(1, Number(parsed.current) || 1));
          this.presentationMode = Boolean(parsed.presentationMode);
          this.soundEnabled = Boolean(parsed.soundEnabled);
          this.musicEnabled = Boolean(parsed.musicEnabled);
          this.narrativeHidden = Boolean(parsed.narrativeHidden);
        }
      } catch (err) {
        console.warn('Gagal memuat state lokal:', err);
      }
    },

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          xp: this.xp,
          completed: this.completed,
          questsDone: this.questsDone,
          badges: this.badges,
          current: this.current,
          presentationMode: this.presentationMode,
          soundEnabled: this.soundEnabled,
          musicEnabled: this.musicEnabled,
          narrativeHidden: this.narrativeHidden
        }));
      } catch (err) {
        console.warn('Gagal menyimpan state lokal:', err);
      }
    },

    onChange(fn) {
      this.listeners.push(fn);
    },

    notify(reason, payload) {
      this.listeners.forEach(fn => {
        try { fn(reason, payload); } catch (e) { console.error(e); }
      });
    },

    getStage(num) {
      return STAGES.find(s => s.num === Number(num)) || STAGES[0];
    },

    getStageByKey(key) {
      return STAGES.find(s => s.id === key) || null;
    },

    isUnlocked(stageNum) {
      if (this.presentationMode) return true;
      if (stageNum <= 1) return true;
      return this.completed.includes(stageNum - 1) || this.completed.includes(stageNum);
    },

    isCompleted(stageNum) {
      return this.completed.includes(Number(stageNum));
    },

    getRankInfo() {
      let currentRank = RANKS[0];
      for (const r of RANKS) {
        if (this.xp >= r.minXp) currentRank = r;
      }
      const span = Math.max(1, currentRank.nextXp - currentRank.minXp);
      const pct = Math.min(100, Math.round(((this.xp - currentRank.minXp) / span) * 100));
      return {
        level: currentRank.level,
        title: currentRank.title,
        xp: this.xp,
        nextXp: currentRank.nextXp,
        pct: this.xp >= 1000 ? Math.min(100, Math.round((this.xp / 1315) * 100)) : pct
      };
    },

    selectStage(stageNum) {
      const n = Number(stageNum);
      if (n < 1 || n > 7) return false;
      this.current = n;
      this.save();
      this.notify('select', { stageNum: n });
      return true;
    },

    addXp(amount, label) {
      if (!amount || amount <= 0) return;
      const beforeLvl = this.getRankInfo().level;
      this.xp += amount;
      const afterInfo = this.getRankInfo();
      this.save();
      this.playSfx('xp');
      this.notify('xp', { amount, label, levelUp: afterInfo.level > beforeLvl, rank: afterInfo });
    },

    completeStage(stageNum) {
      const st = this.getStage(stageNum);
      if (!st) return false;
      const already = this.isCompleted(st.num);
      if (!already) {
        this.completed.push(st.num);
        this.xp += st.xp;
        if (st.badge && !this.badges.includes(st.badge.id)) {
          this.badges.push(st.badge.id);
        }
        if (st.num < 7) {
          this.current = st.num + 1;
        }
        this.save();
        this.playSfx('badge');
        this.notify('stageComplete', { stage: st, firstTime: true });
        return true;
      } else {
        if (st.num < 7) {
          this.current = st.num + 1;
          this.save();
        }
        this.notify('stageComplete', { stage: st, firstTime: false });
        return false;
      }
    },

    completeQuest(questId, xpReward, title) {
      if (this.questsDone.includes(questId)) return false;
      this.questsDone.push(questId);
      this.xp += xpReward;
      this.save();
      this.playSfx('xp');
      this.notify('questComplete', { questId, xpReward, title });
      return true;
    },

    togglePresentationMode(forceVal) {
      this.presentationMode = typeof forceVal === 'boolean' ? forceVal : !this.presentationMode;
      this.save();
      this.playSfx('click');
      this.notify('presentationMode', { enabled: this.presentationMode });
    },

    toggleSound(forceVal) {
      this.soundEnabled = typeof forceVal === 'boolean' ? forceVal : !this.soundEnabled;
      this.save();
      if (this.soundEnabled) this.playSfx('open');
      this.notify('sound', { enabled: this.soundEnabled });
    },

    toggleMusic(forceVal) {
      this.musicEnabled = typeof forceVal === 'boolean' ? forceVal : !this.musicEnabled;
      this.save();
      const Audio = window.MetaOpt.Audio;
      if (Audio) {
        if (this.musicEnabled) {
          Audio.startMusic();
        } else {
          Audio.stopMusic();
        }
      }
      this.notify('music', { enabled: this.musicEnabled });
    },

    toggleNarrative() {
      this.narrativeHidden = !this.narrativeHidden;
      this.save();
      this.notify('narrative', { hidden: this.narrativeHidden });
    },

    resetProgress() {
      this.xp = 0;
      this.completed = [];
      this.questsDone = [];
      this.badges = [];
      this.current = 1;
      this.presentationMode = false;
      this.save();
      this.notify('reset', {});
    },

    // Audio Engine Hand-off & Fallback Synthesizer
    playSfx(type, payload = {}) {
      if (!this.soundEnabled) return;
      const Audio = window.MetaOpt.Audio;
      if (Audio && typeof Audio.playSfx === 'function') {
        Audio.playSfx(type, payload);
        return;
      }
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      try {
        if (!this.audioCtx) this.audioCtx = new AudioCtx();
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        const tone = (freq, startOffset, duration, gainVal = 0.06) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + startOffset);
          gain.gain.setValueAtTime(gainVal, now + startOffset);
          gain.gain.exponentialRampToValueAtTime(0.0008, now + startOffset + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + startOffset);
          osc.stop(now + startOffset + duration);
        };

        if (type === 'click') {
          tone(520, 0, 0.07, 0.045);
        } else if (type === 'open') {
          tone(440, 0, 0.09, 0.05);
          tone(659.25, 0.06, 0.14, 0.05);
        } else if (type === 'xp') {
          tone(587.33, 0, 0.09, 0.055);
          tone(880, 0.07, 0.16, 0.055);
        } else if (type === 'badge') {
          tone(523.25, 0, 0.1, 0.06);
          tone(659.25, 0.08, 0.1, 0.06);
          tone(783.99, 0.16, 0.12, 0.06);
          tone(1046.5, 0.25, 0.26, 0.07);
        } else if (type === 'locked') {
          tone(210, 0, 0.12, 0.05);
        }
      } catch (_) {
        // Fallback catch
      }
    }
  };

  window.MetaOpt.Game = Game;
})();

