/**
 * PULAU MISI — HUD, TOP-LAYER ANIMATION HELPERS, TOASTS, BADGES MODAL & CONFETTI
 * Mengelola HUD progres, notifikasi achievement (popover="manual"), efek konfeti,
 * serta helper transisi keluar elemen Top Layer (<dialog> & [popover]).
 */
(function() {
  window.MetaOpt = window.MetaOpt || {};

  // --- Deteksi dukungan transisi diskrit display (mengantisipasi Firefox bug 1882408) ---
  let supportsDisplayTransition;
  function canTransitionDisplay() {
    if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
    if (!window.CSS || !window.CSS.supports || !window.CSS.supports('transition-behavior', 'allow-discrete') || !document.body) {
      return false;
    }
    const probe = document.createElement('div');
    probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = 'none';
    supportsDisplayTransition = getComputedStyle(probe).display === 'block';
    probe.remove();
    return supportsDisplayTransition;
  }

  function supportsTopLayerExit() {
    return Boolean(window.CSS && window.CSS.supports && window.CSS.supports('overlay', 'auto') && canTransitionDisplay());
  }

  async function closeTopLayer(element, isPopover = false) {
    if (!element) return;
    if (!supportsTopLayerExit()) {
      element.setAttribute('data-closing', '');
      const animations = element.getAnimations ? element.getAnimations({ subtree: true }) : [];
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((r) => setTimeout(r, 400))
        ]);
      }
      if (!element.hasAttribute('data-closing')) return;
      element.removeAttribute('data-closing');
    }

    if (isPopover) {
      if (typeof element.hidePopover === 'function') {
        try { element.hidePopover(); } catch (_) {}
      } else {
        element.classList.remove('is-toast-open');
      }
    } else if (element.open) {
      element.close();
    }
  }

  // Fallback klik di luar dialog untuk closedby="any" pada browser yang belum mendukungnya
  function installClosedByFallback() {
    if ('closedBy' in HTMLDialogElement.prototype) return;
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    document.querySelectorAll('dialog[closedby="any"]').forEach((dialog) => {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => { pressedOutside = outside(e, dialog); });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e, dialog)) closeTopLayer(dialog, false);
      });
    });
  }

  // Pasang cancel (Esc) & close reset pada semua dialog
  function wireDialogLifecycle(dialog, onAfterClose) {
    if (!dialog || dialog.dataset.lifecycleWired === 'true') return;
    dialog.dataset.lifecycleWired = 'true';

    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      closeTopLayer(dialog, false);
    });

    dialog.addEventListener('close', () => {
      dialog.returnValue = '';
      if (typeof onAfterClose === 'function') onAfterClose();
    });
  }

  // --- Toast Stack Manager (popover="manual") ---
  const activeToasts = [];

  function restackToasts() {
    let offsetBottom = 20;
    activeToasts.forEach((el) => {
      el.style.bottom = offsetBottom + 'px';
      offsetBottom += (el.offsetHeight || 58) + 10;
    });
  }

  function announcePolite(message) {
    const live = document.getElementById('srLivePolite');
    if (!live) return;
    live.textContent = '';
    setTimeout(() => { live.textContent = message; }, 40);
  }

  function showToast({ icon = '✨', title = '', subtitle = '', actionLabel = '', onAction = null, duration = 3800 }) {
    const host = document.getElementById('gameToastHost') || document.body;
    const toast = document.createElement('div');
    toast.className = 'game-toast-item';
    toast.setAttribute('popover', 'manual');

    const iconSpan = document.createElement('span');
    iconSpan.style.fontSize = '1.35rem';
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.textContent = icon;

    const textWrap = document.createElement('div');
    textWrap.style.minWidth = '0';
    const titleEl = document.createElement('div');
    titleEl.style.cssText = "font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:0.8rem;color:#fef08a;";
    titleEl.textContent = title;
    textWrap.appendChild(titleEl);

    if (subtitle) {
      const subEl = document.createElement('div');
      subEl.style.cssText = 'font-size:0.74rem;color:#cbd5e1;margin-top:1px;';
      subEl.textContent = subtitle;
      textWrap.appendChild(subEl);
    }

    toast.appendChild(iconSpan);
    toast.appendChild(textWrap);

    if (actionLabel && typeof onAction === 'function') {
      const actBtn = document.createElement('button');
      actBtn.type = 'button';
      actBtn.style.cssText = "padding:0.28rem 0.6rem;border-radius:7px;background:#d91e18;color:#fff;border:none;font-family:'Space Grotesk',sans-serif;font-size:0.72rem;font-weight:700;cursor:pointer;white-space:nowrap;";
      actBtn.textContent = actionLabel;
      actBtn.addEventListener('click', () => {
        onAction();
        dismiss();
      });
      toast.appendChild(actBtn);
    }

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'toast-close-btn';
    closeBtn.setAttribute('aria-label', 'Tutup notifikasi');
    closeBtn.textContent = '✕';

    let dismissed = false;
    const dismiss = async () => {
      if (dismissed) return;
      dismissed = true;
      const idx = activeToasts.indexOf(toast);
      if (idx !== -1) activeToasts.splice(idx, 1);
      restackToasts();
      await closeTopLayer(toast, true);
      toast.remove();
    };

    closeBtn.addEventListener('click', dismiss);
    toast.appendChild(closeBtn);
    host.appendChild(toast);

    if ('popover' in HTMLElement.prototype && typeof toast.showPopover === 'function') {
      try { toast.showPopover(); } catch (_) { toast.classList.add('is-toast-open'); }
    } else {
      toast.classList.add('is-toast-open');
    }

    activeToasts.push(toast);
    requestAnimationFrame(restackToasts);
    announcePolite(`${title}${subtitle ? ': ' + subtitle : ''}`);

    if (duration > 0) {
      setTimeout(dismiss, duration);
    }
  }

  // Reparent overlay utilities ke dalam modal aktif agar tidak terkena inert
  function syncOverlayHostToModal(activeDialog) {
    const fallbackRoot = document.getElementById('gameShell') || document.body;
    const targetParent = activeDialog || fallbackRoot;
    ['gameToastHost', 'gameConfettiCanvas', 'srLivePolite'].forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.parentElement !== targetParent) {
        if (typeof targetParent.moveBefore === 'function' && el.parentElement) {
          try { targetParent.appendChild(el); } catch (_) { targetParent.appendChild(el); }
        } else {
          targetParent.appendChild(el);
        }
      }
    });
    // Tampilkan ulang toast yang sedang terbuka bila berpindah parent
    activeToasts.forEach((t) => {
      if ('popover' in HTMLElement.prototype && typeof t.showPopover === 'function') {
        try { t.showPopover(); } catch (_) {}
      }
    });
  }

  // --- Efek Konfeti Ringan (Canvas 2D) ---
  let confettiAnim = null;
  function launchConfetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.getElementById('gameConfettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#ef233c', '#f59e0b', '#10b981', '#38bdf8', '#fbbf24', '#ffffff'];
    const particles = [];
    for (let i = 0; i < 65; i++) {
      particles.push({
        x: canvas.width * 0.5 + (Math.random() - 0.5) * 220,
        y: canvas.height * 0.35 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 11,
        vy: -5 - Math.random() * 7,
        size: 5 + Math.random() * 5,
        color: colors[i % colors.length],
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.22,
        life: 1
      });
    }

    if (confettiAnim) cancelAnimationFrame(confettiAnim);

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.26;
        p.rot += p.vrot;
        p.life -= 0.015;
        if (p.life > 0 && p.y < canvas.height + 20) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
          ctx.restore();
        }
      });
      if (alive) {
        confettiAnim = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    frame();
  }

  // --- Render HUD & Badges Modal ---
  function updateHudUI() {
    const Game = window.MetaOpt.Game;
    if (!Game) return;

    const rank = Game.getRankInfo();
    const lvlEl = document.getElementById('hudLevelBadge');
    const rankTitleEl = document.getElementById('hudRankTitle');
    const xpValEl = document.getElementById('hudXpText');
    const xpFillEl = document.getElementById('hudXpFill');
    const badgeCountEl = document.getElementById('hudBadgeCount');
    const btnPres = document.getElementById('btnTogglePresentation');
    const btnMusic = document.getElementById('btnToggleMusic');
    const btnSfx = document.getElementById('btnToggleSound');
    const topProgressBar = document.getElementById('scrollProgressBar');

    if (lvlEl) lvlEl.textContent = `LV.${rank.level}`;
    if (rankTitleEl) rankTitleEl.textContent = rank.title;
    if (xpValEl) xpValEl.textContent = `${rank.xp} XP`;
    if (xpFillEl) xpFillEl.style.width = `${rank.pct}%`;
    if (badgeCountEl) badgeCountEl.textContent = `${Game.badges.length}/${Game.stages.length} Badge`;

    if (btnPres) {
      btnPres.setAttribute('aria-pressed', Game.presentationMode ? 'true' : 'false');
      btnPres.setAttribute('title', Game.presentationMode ? 'Mode Presentasi Aktif (Semua Stage Terbuka)' : 'Mode Presentasi (Buka Kunci Semua Stage)');
      const lbl = btnPres.querySelector('.pres-label');
      if (lbl) lbl.textContent = Game.presentationMode ? 'Semua Terbuka' : 'Mode Presentasi';
    }

    if (btnMusic) {
      btnMusic.setAttribute('aria-pressed', Game.musicEnabled ? 'true' : 'false');
      btnMusic.setAttribute('title', Game.musicEnabled ? 'Matikan Musik Petualang (BGM)' : 'Putar Musik Petualang Mellow (BGM)');
      const icon = document.getElementById('hudMusicIcon');
      const label = document.getElementById('hudMusicLabel');
      if (icon) icon.textContent = Game.musicEnabled ? '🎶' : '🎵';
      if (label) label.textContent = Game.musicEnabled ? 'Musik: On' : 'Musik: Off';
    }

    if (btnSfx) {
      btnSfx.setAttribute('aria-pressed', Game.soundEnabled ? 'true' : 'false');
      btnSfx.setAttribute('title', Game.soundEnabled ? 'Matikan Efek Suara Taktil (SFX)' : 'Aktifkan Efek Suara Taktil (SFX)');
      const icon = document.getElementById('hudSoundIcon');
      if (icon) icon.textContent = Game.soundEnabled ? '🔊' : '🔇';
    }

    if (topProgressBar && !Game.openStageNum) {
      const pct = Math.round((Game.completed.length / Game.stages.length) * 100);
      topProgressBar.style.width = `${pct}%`;
    }
  }

  function renderBadgesModalContent() {
    const Game = window.MetaOpt.Game;
    const grid = document.getElementById('badgesModalGrid');
    const summary = document.getElementById('badgesModalSummary');
    if (!Game || !grid) return;

    const rank = Game.getRankInfo();
    if (summary) {
      summary.textContent = `Level ${rank.level} (${rank.title}) • ${Game.xp} XP Terkumpul • ${Game.completed.length}/7 Stage Tuntas`;
    }

    grid.innerHTML = '';
    Game.stages.forEach((st) => {
      const earned = Game.badges.includes(st.badge.id);
      const card = document.createElement('div');
      card.className = 'p-3.5 rounded-xl border flex items-start gap-3 transition-colors ' +
        (earned ? 'bg-amber-50/80 border-amber-300' : 'bg-surface-container-low border-outline-variant/30 opacity-65');

      card.innerHTML = `
        <div class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 ${earned ? 'bg-amber-200/70' : 'bg-surface-container'}">
          <span aria-hidden="true">${earned ? st.badge.icon : '🔒'}</span>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <span class="font-title-md text-sm font-bold text-on-surface">${st.badge.name}</span>
            <span class="font-code-sm text-[11px] px-2 py-0.5 rounded ${earned ? 'bg-green-100 text-green-800 font-semibold' : 'bg-surface-container text-tertiary'}">
              ${earned ? 'TERBUKA' : `Stage ${st.num}`}
            </span>
          </div>
          <p class="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">${st.badge.desc}</p>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function openBadgesModal() {
    const dlg = document.getElementById('badgesDialog');
    if (!dlg) return;
    renderBadgesModalContent();
    wireDialogLifecycle(dlg, () => syncOverlayHostToModal(null));
    if (!dlg.open) {
      dlg.showModal();
      syncOverlayHostToModal(dlg);
    }
  }

  function initGameUI() {
    const Game = window.MetaOpt.Game;
    if (!Game) return;

    const btnBadges = document.getElementById('btnOpenBadges');
    const btnCloseBadges = document.getElementById('btnCloseBadgesDialog');
    const badgesDlg = document.getElementById('badgesDialog');
    const btnPres = document.getElementById('btnTogglePresentation');
    const btnMusic = document.getElementById('btnToggleMusic');
    const btnSfx = document.getElementById('btnToggleSound');
    const btnResetProg = document.getElementById('btnResetGameProgress');

    if (badgesDlg) wireDialogLifecycle(badgesDlg, () => syncOverlayHostToModal(null));
    installClosedByFallback();

    // Browser Audio Policy: Buka kunci Web Audio API pada interaksi pengguna pertama
    const unlockAudio = () => {
      const Audio = window.MetaOpt.Audio;
      if (Audio) {
        Audio.ensureContext();
        if (Game.musicEnabled && !Audio.isMusicPlaying) {
          Audio.startMusic();
        }
      }
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    if (btnBadges) btnBadges.addEventListener('click', openBadgesModal);
    if (btnCloseBadges && badgesDlg) {
      btnCloseBadges.addEventListener('click', () => closeTopLayer(badgesDlg, false));
    }

    if (btnPres) {
      btnPres.addEventListener('click', () => {
        Game.togglePresentationMode();
        showToast({
          icon: Game.presentationMode ? '🔓' : '🗺️',
          title: Game.presentationMode ? 'Mode Presentasi Aktif' : 'Mode Cerita Berurutan Aktif',
          subtitle: Game.presentationMode
            ? 'Seluruh 7 stage kini dapat dibuka bebas untuk demonstrasi.'
            : 'Stage kembali mengikuti progres penyelesaian berurutan.'
        });
      });
    }

    if (btnMusic) {
      btnMusic.addEventListener('click', () => {
        Game.toggleMusic();
        showToast({
          icon: Game.musicEnabled ? '🎶' : '🎵',
          title: Game.musicEnabled ? 'Musik Petualang Diputar' : 'Musik Dimatikan',
          subtitle: Game.musicEnabled
            ? 'Petikan kalimba lembut dan pad ambient bernada Zelda / Monument Valley diputar.'
            : 'Audio musik petualang dinonaktifkan.',
          duration: 3200
        });
      });
    }

    if (btnSfx) {
      btnSfx.addEventListener('click', () => {
        Game.toggleSound();
        showToast({
          icon: Game.soundEnabled ? '🔊' : '🔇',
          title: Game.soundEnabled ? 'Efek Suara Diaktifkan' : 'Efek Suara Dinonaktifkan',
          subtitle: Game.soundEnabled ? 'Efek suara taktil game dinyalakan.' : 'Efek suara dinonaktifkan.',
          duration: 2200
        });
      });
    }

    if (btnResetProg) {
      btnResetProg.addEventListener('click', () => {
        if (window.confirm('Reset seluruh progres XP, stage selesai, dan koleksi badge ke awal?')) {
          Game.resetProgress();
          showToast({
            icon: '↺',
            title: 'Progres Direset',
            subtitle: 'Kembali ke Stage 1: Base Camp.',
            duration: 2800
          });
        }
      });
    }

    // Dengarkan event state game untuk umpan balik visual otomatis
    Game.onChange((reason, payload) => {
      updateHudUI();
      if (reason === 'stageComplete' && payload && payload.firstTime) {
        const st = payload.stage;
        launchConfetti();
        showToast({
          icon: st.badge.icon,
          title: `Badge Diraih: "${st.badge.name}" (+${st.xp} XP)`,
          subtitle: st.num < 7 ? `Stage ${st.num + 1} kini terbuka di Peta Pulau!` : 'Seluruh 7 Stage Pulau Metaheuristik telah ditaklukkan!',
          duration: 4800
        });
      } else if (reason === 'questComplete' && payload) {
        showToast({
          icon: '⚡',
          title: `Quest Selesai! +${payload.xpReward} XP`,
          subtitle: payload.title,
          duration: 3400
        });
      }
    });

    updateHudUI();
  }

  window.MetaOpt.GameUI = {
    init: initGameUI,
    updateHudUI,
    showToast,
    launchConfetti,
    closeTopLayer,
    wireDialogLifecycle,
    syncOverlayHostToModal,
    openBadgesModal
  };
})();
