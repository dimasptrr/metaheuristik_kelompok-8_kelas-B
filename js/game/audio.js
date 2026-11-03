/**
 * PULAU MISI — PROCEDURAL AUDIO SYSTEM
 * 1. Mellow Adventure Theme Song (Procedural Web Audio BGM)
 * 2. Professional Tactile & Rewarding SFX
 */
(function() {
  window.MetaOpt = window.MetaOpt || {};

  class AudioManager {
    constructor() {
      this.ctx = null;
      this.musicGain = null;
      this.sfxGain = null;
      this.masterGain = null;
      this.isMusicPlaying = false;
      this.bgmTimer = null;
      this.currentChordIndex = 0;
      this.initialized = false;
      this.musicVolume = 0.38;
      this.sfxVolume = 0.55;
    }

    init() {
      if (this.initialized && this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Create a gentle spatial delay node for BGM & rich SFX
      this.delayNode = this.ctx.createDelay();
      this.delayNode.delayTime.setValueAtTime(0.38, this.ctx.currentTime); // ~79 BPM dotted 8th note
      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.setValueAtTime(0.28, this.ctx.currentTime);
      this.delayFilter = this.ctx.createBiquadFilter();
      this.delayFilter.type = 'lowpass';
      this.delayFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      this.delayNode.connect(this.delayFilter);
      this.delayFilter.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      this.delayFilter.connect(this.musicGain);

      this.initialized = true;
    }

    ensureContext() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    safeTime(t) {
      if (!this.ctx) return 0;
      const cur = this.ctx.currentTime || 0;
      const num = Number(t);
      if (isNaN(num) || num < cur) return cur + 0.005;
      return num;
    }

    // =========================================================================
    // MELLOW ADVENTURE BGM GENERATOR (Zelda / Monument Valley inspired)
    // =========================================================================
    // 8-Bar Chord Progression (Nostalgic, warm, exploratory):
    // 1. Fmaj7    (F2, A3, C4, E4, G4)
    // 2. Cmaj7/E  (E2, G3, B3, C4, E4)
    // 3. Dm9      (D2, F3, A3, C4, E4)
    // 4. Am9      (A2, E3, G3, B3, C4)
    // 5. Fmaj7#11 (F2, A3, B3, E4, G4 - dreamy adventure lift)
    // 6. Em7      (E2, G3, B3, D4)
    // 7. Dm7      (D2, F3, A3, C4)
    // 8. G7sus4   (G2, D3, F3, C4, D4) -> resolving softly back to Fmaj7

    startMusic() {
      this.ensureContext();
      if (!this.ctx || this.isMusicPlaying) return;

      this.isMusicPlaying = true;
      const now = this.safeTime(this.ctx.currentTime);
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
      this.musicGain.gain.linearRampToValueAtTime(this.musicVolume, now + 1.6);

      this.currentChordIndex = 0;
      this.scheduleNextBar();
    }

    stopMusic() {
      if (!this.isMusicPlaying) return;
      this.isMusicPlaying = false;
      if (this.bgmTimer) {
        clearTimeout(this.bgmTimer);
        this.bgmTimer = null;
      }
      if (this.ctx && this.musicGain) {
        const now = this.safeTime(this.ctx.currentTime);
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
        this.musicGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
      }
    }

    scheduleNextBar() {
      if (!this.isMusicPlaying || !this.ctx) return;

      const chords = [
        // Bar 1: Fmaj7 (warm, exploratory)
        { bass: 87.31, pad: [220.00, 261.63, 329.63, 392.00], melody: [523.25, 659.25, 783.99, 659.25, 523.25, 392.00] },
        // Bar 2: Cmaj7/E (peaceful sanctuary)
        { bass: 82.41, pad: [196.00, 246.94, 261.63, 329.63], melody: [659.25, 783.99, 987.77, 783.99, 523.25, 493.88] },
        // Bar 3: Dm9 (reflective wandering)
        { bass: 73.42, pad: [174.61, 220.00, 261.63, 329.63], melody: [587.33, 659.25, 783.99, 523.25, 440.00, 392.00] },
        // Bar 4: Am9 -> Gsus (gentle motion)
        { bass: 110.00, pad: [164.81, 196.00, 246.94, 261.63], melody: [440.00, 523.25, 659.25, 587.33, 493.88, 392.00] },
        // Bar 5: Fmaj7#11 (dreamy Lydian lift)
        { bass: 87.31, pad: [220.00, 246.94, 329.63, 392.00], melody: [493.88, 659.25, 783.99, 987.77, 783.99, 659.25] },
        // Bar 6: Em7 (restful breeze)
        { bass: 82.41, pad: [196.00, 246.94, 293.66, 329.63], melody: [659.25, 587.33, 493.88, 392.00, 493.88, 587.33] },
        // Bar 7: Dm7 (calm horizon)
        { bass: 73.42, pad: [174.61, 220.00, 261.63, 349.23], melody: [523.25, 440.00, 392.00, 349.23, 440.00, 523.25] },
        // Bar 8: G7sus4 (gentle resolution)
        { bass: 98.00, pad: [174.61, 261.63, 293.66, 392.00], melody: [587.33, 523.25, 493.88, 392.00, 523.25, 659.25] }
      ];

      const barDuration = 3.6; // ~67 BPM peaceful walking pace
      const chord = chords[this.currentChordIndex];
      const now = this.safeTime(this.ctx.currentTime);

      // 1. Play Warm Pad Chord
      this.playWarmPad(chord.pad, now, barDuration * 1.15);

      // 2. Play Sub-Bass Drone
      this.playSubBass(chord.bass, now, barDuration * 0.95);

      // 3. Play Mellow Acoustic Kalimba / Harp Pluck Arpeggio
      const noteCount = chord.melody.length;
      const stepTime = barDuration / noteCount;
      chord.melody.forEach((freq, i) => {
        // Skip occasional notes or soften for organic ambient feel
        const offset = Math.max(0.015, i * stepTime + (i === 0 ? 0.01 : (Math.random() - 0.5) * 0.03));
        const vel = 0.5 + Math.sin((i / noteCount) * Math.PI) * 0.45;
        this.playKalimbaPluck(freq, now + offset, vel);
      });

      // 4. Subtle ambient wind shimmer on alternate bars
      if (this.currentChordIndex % 2 === 0) {
        this.playWindShimmer(now, barDuration);
      }

      this.currentChordIndex = (this.currentChordIndex + 1) % chords.length;

      // Schedule next bar with setTimeout before current ends
      const msUntilNext = (barDuration - 0.08) * 1000;
      this.bgmTimer = setTimeout(() => {
        this.scheduleNextBar();
      }, msUntilNext);
    }

    playWarmPad(frequencies, startTime, duration) {
      if (!this.ctx) return;
      const t = this.safeTime(startTime);
      frequencies.forEach((freq) => {
        // Dual detuned oscillators for lush chorus
        [-2.5, 2.5].forEach((detune) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          osc.detune.setValueAtTime(detune, t);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, t);
          filter.frequency.linearRampToValueAtTime(850, t + duration * 0.5);
          filter.frequency.linearRampToValueAtTime(550, t + duration);

          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.linearRampToValueAtTime(0.022, t + 1.1);
          gain.gain.setValueAtTime(0.022, t + duration - 0.9);
          gain.gain.linearRampToValueAtTime(0.0001, t + duration);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain);

          osc.start(t);
          osc.stop(t + duration + 0.1);
        });
      });
    }

    playSubBass(freq, startTime, duration) {
      if (!this.ctx) return;
      const t = this.safeTime(startTime);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.065, t + 0.4);
      gain.gain.setValueAtTime(0.065, t + duration - 0.6);
      gain.gain.linearRampToValueAtTime(0.0001, t + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + duration + 0.1);
    }

    playKalimbaPluck(freq, startTime, velocity = 0.8) {
      if (!this.ctx) return;
      const t = this.safeTime(startTime);
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, t); // 1 octave overtone

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, t);
      filter.frequency.exponentialRampToValueAtTime(450, t + 0.8);

      const peakGain = 0.055 * velocity;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(peakGain, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.25);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      // Send a portion to stereo delay for dreamy spacious echo
      if (this.delayNode) {
        const sendGain = this.ctx.createGain();
        sendGain.gain.setValueAtTime(0.35, t);
        gain.connect(sendGain);
        sendGain.connect(this.delayNode);
      }

      osc.start(t);
      osc2.start(t);
      osc.stop(t + 1.3);
      osc2.stop(t + 1.3);
    }

    playWindShimmer(startTime, duration) {
      if (!this.ctx) return;
      const t = this.safeTime(startTime);
      // Synthesize pink-like noise via random buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.08;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.8, t);
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.linearRampToValueAtTime(750, t + duration * 0.5);
      filter.frequency.linearRampToValueAtTime(350, t + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.014, t + 1.2);
      gain.gain.linearRampToValueAtTime(0.0001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      noise.start(t);
      noise.stop(t + duration + 0.2);
    }

    // =========================================================================
    // PROFESSIONAL SFX SUITE (Synthesized, high-definition, responsive)
    // =========================================================================
    playSfx(type, payload = {}) {
      const Game = window.MetaOpt.Game;
      if (Game && !Game.soundEnabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.safeTime(this.ctx.currentTime);

      switch (type) {
        case 'click':
          this.sfxTactileClick(now);
          break;
        case 'hover':
          this.sfxHoverTick(now);
          break;
        case 'nodeSelect':
          this.sfxStageHop(now, payload.stageNum || 1);
          break;
        case 'open':
          this.sfxStageOpen(now);
          break;
        case 'close':
          this.sfxStageClose(now);
          break;
        case 'xp':
          this.sfxXpChime(now);
          break;
        case 'quest':
        case 'questComplete':
          this.sfxQuestFanfare(now);
          break;
        case 'badge':
        case 'stageComplete':
          this.sfxBadgeTrophy(now);
          break;
        case 'locked':
          this.sfxLockedKnock(now);
          break;
        default:
          this.sfxTactileClick(now);
      }
    }

    // Crisp wooden/ceramic UI tap
    sfxTactileClick(now) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1350, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.045);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2800, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.06);
    }

    // Ultra subtle glass bead hover
    sfxHoverTick(now) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.03);
    }

    // Harmonic kalimba hop note corresponding to stage pitch
    sfxStageHop(now, stageNum = 1) {
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33]; // C D E G A C D
      const freq = scale[Math.min(scale.length - 1, Math.max(0, stageNum - 1))];

      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + 0.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.4);
      osc2.stop(now + 0.4);
    }

    // Airy stage entry whoosh + major chord harp sweep
    sfxStageOpen(now) {
      // 1. Air whoosh
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const nFilter = this.ctx.createBiquadFilter();
      nFilter.type = 'bandpass';
      nFilter.Q.setValueAtTime(2.2, now);
      nFilter.frequency.setValueAtTime(280, now);
      nFilter.frequency.exponentialRampToValueAtTime(1400, now + 0.28);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.001, now);
      nGain.gain.linearRampToValueAtTime(0.08, now + 0.12);
      nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      noise.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + 0.38);

      // 2. Ascending harp sweep: C4 -> E4 -> G4 -> C5
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        const t = now + 0.06 + idx * 0.055;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.07, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);

        osc.connect(g);
        g.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.45);
      });
    }

    // Soft descending acoustic release
    sfxStageClose(now) {
      const notes = [440.00, 349.23, 261.63];
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.05;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.06, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);

        osc.connect(g);
        g.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.35);
      });
    }

    // Crystal XP shimmer
    sfxXpChime(now) {
      const notes = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.045;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.075, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

        osc.connect(g);
        g.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.38);
      });
    }

    // Rewarding quest chime (A5 -> D6)
    sfxQuestFanfare(now) {
      const notes = [
        { f: 880.00, t: 0 },
        { f: 1174.66, t: 0.08 },
        { f: 1760.00, t: 0.16 }
      ];
      notes.forEach((n) => {
        const t = now + n.t;
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, t);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(n.f * 2, t);

        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.09, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);

        osc.connect(g);
        osc2.connect(g);
        g.connect(this.sfxGain);

        osc.start(t);
        osc2.start(t);
        osc.stop(t + 0.6);
        osc2.stop(t + 0.6);
      });
    }

    // Triumphant mellow fanfare chord for Badge unlock
    sfxBadgeTrophy(now) {
      // Warm brass chord: C4, G4, C5, E5, G5
      const chord = [261.63, 392.00, 523.25, 659.25, 783.99];
      chord.forEach((freq, idx) => {
        const t = now + idx * 0.035;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, t);
        filter.frequency.linearRampToValueAtTime(3200, t + 0.3);

        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.08, t + 0.06);
        g.gain.setValueAtTime(0.08, t + 0.45);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.25);

        osc.connect(filter);
        filter.connect(g);
        g.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 1.3);
      });

      // Shimmering high bells at top
      [1046.50, 1318.51, 1567.98].forEach((freq, idx) => {
        const t = now + 0.22 + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.07, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);

        osc.connect(g);
        g.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.7);
      });
    }

    // Soft double wooden thud for locked stage
    sfxLockedKnock(now) {
      [0, 0.085].forEach((offset, idx) => {
        const t = now + offset;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 180 : 130, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.07);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, t);

        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.12, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

        osc.connect(filter);
        filter.connect(g);
        g.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.09);
      });
    }
  }

  window.MetaOpt.Audio = new AudioManager();
})();
