/**
 * PULAU MISI — ISOMETRIC ISLAND MAP CONTROLLER & STAGE MODAL ROUTER
 * Mengatur posisi karakter Optimizer, tombol PLAY melayang, node peta SVG/HTML,
 * pembukaan/penutupan <dialog> stage, serta navigasi keyboard & presentasi.
 */
(function() {
  window.MetaOpt = window.MetaOpt || {};

  const SVG_W = 1200;
  const SVG_H = 640;

  function pctX(x) {
    return ((x / SVG_W) * 100).toFixed(3) + '%';
  }

  function pctY(y) {
    return ((y / SVG_H) * 100).toFixed(3) + '%';
  }

  function buildMapOverlayNodes() {
    const Game = window.MetaOpt.Game;
    const overlay = document.getElementById('islandNodesOverlay');
    if (!Game || !overlay) return;

    overlay.innerHTML = '';

    // 1. Render 7 tombol node interaktif
    Game.stages.forEach((st) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'island-node-btn';
      btn.id = `island-node-${st.num}`;
      btn.style.left = pctX(st.x);
      btn.style.top = pctY(st.y);
      btn.dataset.stageNum = String(st.num);

      btn.innerHTML = `
        <span class="node-pad" aria-hidden="true">
          <span class="node-ring"></span>
          <span class="node-pad-base"></span>
          <span class="node-pad-diamond"></span>
          <span class="node-num-badge" id="node-badge-${st.num}">${st.num}</span>
        </span>
        <span class="node-label-chip">${st.num}. ${st.shortLabel}</span>
      `;

      btn.addEventListener('mouseenter', () => {
        if (Game.isUnlocked(st.num)) {
          Game.playSfx('hover');
        }
      });
      btn.addEventListener('click', () => onNodeClicked(st.num));
      overlay.appendChild(btn);
    });

    // 2. Render Karakter Penjelajah "Optimizer" (SVG inline bergaya isometrik)
    const avatar = document.createElement('div');
    avatar.className = 'explorer-avatar';
    avatar.id = 'explorerAvatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.innerHTML = `
      <svg viewBox="0 0 64 88" width="58" height="78" aria-hidden="true">
        <!-- Bayangan pijakan -->
        <ellipse cx="32" cy="80" rx="14" ry="6" fill="rgba(15,23,42,0.28)"/>
        <!-- Kristal Plumbob putih di atas kepala -->
        <polygon points="32,2 38,11 32,20 26,11" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <polygon points="32,2 38,11 32,11" fill="#e2e8f0"/>
        <!-- Kaki / Celana abu -->
        <rect x="26" y="54" width="5" height="22" rx="2.5" fill="#475569"/>
        <rect x="33" y="54" width="5" height="22" rx="2.5" fill="#334155"/>
        <!-- Sepatu -->
        <ellipse cx="28" cy="77" rx="4.5" ry="2.5" fill="#1e293b"/>
        <ellipse cx="36" cy="77" rx="4.5" ry="2.5" fill="#0f172a"/>
        <!-- Ransel belakang -->
        <rect x="21" y="36" width="8" height="16" rx="3" fill="#1e293b"/>
        <!-- Jaket Merah Eksplorasi -->
        <path d="M24 34 C24 31, 40 31, 40 34 L42 56 L22 56 Z" fill="#dc2626"/>
        <path d="M32 33 L40 34 L41 56 L32 56 Z" fill="#b91c1c"/>
        <!-- Kepala -->
        <circle cx="32" cy="27" r="6.5" fill="#fde68a"/>
        <!-- Topi Akademik / Penjelajah Isometrik -->
        <polygon points="32,18 46,23 32,28 18,23" fill="#0f172a"/>
        <rect x="26" y="22" width="12" height="4" rx="1.5" fill="#1e293b"/>
        <!-- Tanda tanya eksplorasi merah di samping -->
        <text x="47" y="52" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="22" fill="#b91c1c">?</text>
      </svg>
    `;
    overlay.appendChild(avatar);

    // 3. Render Billboard Hitam Melayang dengan Tombol Merah [PLAY] (Ikonik sesuai referensi!)
    const billboard = document.createElement('div');
    billboard.className = 'floating-play-billboard';
    billboard.id = 'floatingPlayBillboard';
    billboard.innerHTML = `
      <span class="billboard-stage-tag" id="billboardStageTag">STAGE 01 • BASE CAMP</span>
      <button type="button" class="billboard-play-btn" id="btnBillboardPlay">
        <span>PLAY</span>
      </button>
    `;
    overlay.appendChild(billboard);

    const playBtn = billboard.querySelector('#btnBillboardPlay');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        openStage(Game.current);
      });
    }
  }

  function buildStageChips() {
    const Game = window.MetaOpt.Game;
    const strip = document.getElementById('stageChipsStrip');
    if (!Game || !strip) return;

    strip.innerHTML = '';
    Game.stages.forEach((st) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'stage-chip-btn';
      chip.id = `stage-chip-${st.num}`;
      chip.addEventListener('click', () => onNodeClicked(st.num, true));
      strip.appendChild(chip);
    });
  }

  function updateMapVisualState() {
    const Game = window.MetaOpt.Game;
    if (!Game) return;

    const curStage = Game.getStage(Game.current);

    // Update 7 node pulau & chip bawah
    Game.stages.forEach((st) => {
      const unlocked = Game.isUnlocked(st.num);
      const completed = Game.isCompleted(st.num);
      const isActive = st.num === Game.current;
      const status = completed ? 'completed' : (unlocked ? 'unlocked' : 'locked');

      const nodeBtn = document.getElementById(`island-node-${st.num}`);
      const badgeEl = document.getElementById(`node-badge-${st.num}`);
      if (nodeBtn) {
        nodeBtn.setAttribute('data-status', status);
        nodeBtn.setAttribute('data-active', isActive ? 'true' : 'false');
        nodeBtn.setAttribute('aria-disabled', unlocked ? 'false' : 'true');
        const stateWord = completed ? 'Selesai' : (unlocked ? 'Terbuka' : 'Terkunci');
        nodeBtn.setAttribute('aria-label', `${st.num}. ${st.shortLabel} (${st.title}) — ${stateWord}`);
      }
      if (badgeEl) {
        badgeEl.textContent = completed ? '✓' : (unlocked ? String(st.num) : '🔒');
      }

      const chipBtn = document.getElementById(`stage-chip-${st.num}`);
      if (chipBtn) {
        chipBtn.setAttribute('data-status', status);
        chipBtn.setAttribute('data-active', isActive ? 'true' : 'false');
        const icon = completed ? '✓' : (unlocked ? `${st.num}.` : '🔒');
        chipBtn.textContent = `${icon} ${st.shortLabel}`;
      }

      // Garis jalur SVG antar stage
      const pathSeg = document.getElementById(`iso-route-${st.num}`);
      if (pathSeg) {
        pathSeg.setAttribute('stroke', unlocked ? '#ef233c' : '#94a3b8');
        pathSeg.setAttribute('stroke-opacity', unlocked ? '0.85' : '0.4');
      }
    });

    // Pindahkan Karakter Optimizer & Billboard PLAY ke koordinat stage aktif
    const avatar = document.getElementById('explorerAvatar');
    const billboard = document.getElementById('floatingPlayBillboard');
    const bTag = document.getElementById('billboardStageTag');
    const bBtn = document.getElementById('btnBillboardPlay');

    if (avatar && curStage) {
      avatar.style.left = pctX(curStage.x);
      avatar.style.top = pctY(curStage.y);
    }
    if (billboard && curStage) {
      billboard.style.left = pctX(curStage.x);
      billboard.style.top = pctY(curStage.y);
    }
    if (bTag && curStage) {
      bTag.textContent = `STAGE 0${curStage.num} • ${curStage.shortLabel.toUpperCase()}`;
    }
    if (bBtn && curStage) {
      bBtn.innerHTML = `<span>${Game.isCompleted(curStage.num) ? 'MAIN LAGI' : 'PLAY'}</span>`;
      bBtn.setAttribute('aria-label', `${Game.isCompleted(curStage.num) ? 'Main lagi' : 'Play'} Stage ${curStage.num}: ${curStage.title}`);
    }

    // Update Briefing Dock Bawah
    const brIcon = document.getElementById('briefingIcon');
    const brStagePill = document.getElementById('briefingStagePill');
    const brRewardPill = document.getElementById('briefingRewardPill');
    const brTitle = document.getElementById('briefingTitle');
    const brDesc = document.getElementById('briefingDesc');
    const brPlayBtn = document.getElementById('btnBriefingPlay');
    const brPrevBtn = document.getElementById('btnBriefingPrev');
    const brNextBtn = document.getElementById('btnBriefingNext');

    if (curStage) {
      const done = Game.isCompleted(curStage.num);
      if (brIcon) brIcon.textContent = curStage.guideIcon;
      if (brStagePill) brStagePill.textContent = `STAGE 0${curStage.num} / 07`;
      if (brRewardPill) {
        brRewardPill.textContent = done
          ? `✓ Badge "${curStage.badge.name}" Diraih`
          : `Hadiah: +${curStage.xp} XP • Badge "${curStage.badge.name}"`;
      }
      if (brTitle) brTitle.textContent = curStage.title;
      if (brDesc) brDesc.textContent = curStage.briefing;
      if (brPlayBtn) {
        brPlayBtn.innerHTML = `
          <span aria-hidden="true">▶</span>
          <span>PLAY STAGE ${curStage.num}</span>
        `;
      }
      if (brPrevBtn) brPrevBtn.disabled = curStage.num <= 1;
      if (brNextBtn) brNextBtn.disabled = curStage.num >= 7 || !Game.isUnlocked(curStage.num + 1);
    }

    // Sinkronkan highlight link navigasi a[data-path]
    if (window.MetaOpt.syncActiveNavLink) {
      const activeId = Game.openStageNum ? Game.getStage(Game.openStageNum).id : curStage.id;
      window.MetaOpt.syncActiveNavLink(activeId);
    }
  }

  function showLockedNotice(targetStageNum) {
    const Game = window.MetaOpt.Game;
    const GameUI = window.MetaOpt.GameUI;
    Game.playSfx('locked');
    if (GameUI) {
      GameUI.showToast({
        icon: '🔒',
        title: `Stage ${targetStageNum} Masih Terkunci`,
        subtitle: `Tuntaskan Stage ${targetStageNum - 1} terlebih dahulu, atau aktifkan Mode Presentasi.`,
        actionLabel: 'Buka Semua',
        onAction: () => {
          Game.togglePresentationMode(true);
          openStage(targetStageNum);
        },
        duration: 4500
      });
    }
  }

  function onNodeClicked(stageNum, openImmediatelyIfUnlocked = false) {
    const Game = window.MetaOpt.Game;
    if (!Game.isUnlocked(stageNum)) {
      showLockedNotice(stageNum);
      return;
    }

    if (Game.current === stageNum || openImmediatelyIfUnlocked) {
      Game.selectStage(stageNum);
      openStage(stageNum);
    } else {
      Game.playSfx('nodeSelect', { stageNum });
      Game.selectStage(stageNum);
    }
  }

  async function closeActiveStage() {
    const Game = window.MetaOpt.Game;
    const GameUI = window.MetaOpt.GameUI;
    if (!Game.openStageNum) return;

    Game.playSfx('close');
    const openDlg = document.getElementById(`stage-dialog-${Game.openStageNum}`);
    // Bila Stage 4 ditutup saat simulasi masih berputar, jeda secara bersih
    if (Game.openStageNum === 4) {
      const playIcon = document.getElementById('playIcon');
      const btnPlay = document.getElementById('btnPlay');
      if (playIcon && playIcon.textContent === 'pause' && btnPlay) {
        btnPlay.click();
      }
    }

    if (openDlg && openDlg.open && GameUI) {
      await GameUI.closeTopLayer(openDlg, false);
    }
    Game.openStageNum = null;
    if (GameUI) {
      GameUI.syncOverlayHostToModal(null);
      GameUI.updateHudUI();
    }
    document.title = 'Pulau Misi — Laboratorium Optimasi Metaheuristik: OOA & ChOA';
    updateMapVisualState();
  }

  async function openStage(stageNum) {
    const Game = window.MetaOpt.Game;
    const GameUI = window.MetaOpt.GameUI;

    if (!Game.isUnlocked(stageNum)) {
      showLockedNotice(stageNum);
      return;
    }

    const targetDlg = document.getElementById(`stage-dialog-${stageNum}`);
    if (!targetDlg) return;

    // Jika sedang ada stage lain terbuka, tutup langsung sebelum membuka stage baru
    if (Game.openStageNum && Game.openStageNum !== stageNum) {
      const prevDlg = document.getElementById(`stage-dialog-${Game.openStageNum}`);
      if (prevDlg && prevDlg.open) {
        prevDlg.close();
      }
    }

    Game.selectStage(stageNum);
    Game.openStageNum = stageNum;
    Game.playSfx('open');

    const st = Game.getStage(stageNum);
    document.title = `Stage ${st.num}: ${st.title} | Pulau Misi META::OPT`;

    if (!targetDlg.open) {
      targetDlg.showModal();
    }

    if (GameUI) {
      GameUI.syncOverlayHostToModal(targetDlg);
    }

    // Reset posisi scroll dalam panel ke paling atas
    const scrollBody = targetDlg.querySelector('.stage-modal-body');
    if (scrollBody) {
      scrollBody.scrollTop = 0;
    }

    // Perbarui status tombol Prev/Next di topbar modal
    updateStageModalTopbars();
    updateMapVisualState();

    // Render KaTeX pada konten dinamis bila tersedia
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(targetDlg, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      } catch (_) {}
    }

    // Pastikan grafik komparasi ter-render rapi saat membuka Stage 5
    if (stageNum === 5 && window.MetaOpt.runSynchronousBenchmark) {
      window.MetaOpt.runSynchronousBenchmark();
    }
  }

  function tryOpenStageByKey(sectionId) {
    const Game = window.MetaOpt.Game;
    const st = Game.getStageByKey(sectionId);
    if (!st) return;
    openStage(st.num);
  }

  function updateStageModalTopbars() {
    const Game = window.MetaOpt.Game;
    Game.stages.forEach((st) => {
      const dlg = document.getElementById(`stage-dialog-${st.num}`);
      if (!dlg) return;
      const prevBtn = dlg.querySelector('[data-modal-prev]');
      const nextBtn = dlg.querySelector('[data-modal-next]');
      const statusBadge = dlg.querySelector('[data-modal-reward]');

      if (prevBtn) prevBtn.disabled = st.num <= 1;
      if (nextBtn) nextBtn.disabled = st.num >= 7 || !Game.isUnlocked(st.num + 1);
      if (statusBadge) {
        statusBadge.textContent = Game.isCompleted(st.num)
          ? `✓ ${st.badge.icon} ${st.badge.name}`
          : `+${st.xp} XP`;
      }
    });
  }

  function wireStageDialogs() {
    const Game = window.MetaOpt.Game;
    const GameUI = window.MetaOpt.GameUI;
    const topProgressBar = document.getElementById('scrollProgressBar');

    Game.stages.forEach((st) => {
      const dlg = document.getElementById(`stage-dialog-${st.num}`);
      if (!dlg) return;

      if (GameUI) {
        GameUI.wireDialogLifecycle(dlg, () => {
          if (Game.openStageNum === st.num) {
            if (st.num === 4) {
              const playIcon = document.getElementById('playIcon');
              const btnPlay = document.getElementById('btnPlay');
              if (playIcon && playIcon.textContent === 'pause' && btnPlay) {
                btnPlay.click();
              }
            }
            Game.openStageNum = null;
            GameUI.syncOverlayHostToModal(null);
            GameUI.updateHudUI();
            document.title = 'Pulau Misi — Laboratorium Optimasi Metaheuristik: OOA & ChOA';
            updateMapVisualState();
          }
        });
      }

      const backBtn = dlg.querySelector('[data-modal-close]');
      const prevBtn = dlg.querySelector('[data-modal-prev]');
      const nextBtn = dlg.querySelector('[data-modal-next]');
      const scrollBody = dlg.querySelector('.stage-modal-body');

      if (backBtn) backBtn.addEventListener('click', () => closeActiveStage());
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (st.num > 1) openStage(st.num - 1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (st.num < 7) openStage(st.num + 1);
        });
      }

      if (scrollBody && topProgressBar) {
        scrollBody.addEventListener('scroll', () => {
          if (Game.openStageNum !== st.num) return;
          const maxScroll = scrollBody.scrollHeight - scrollBody.clientHeight;
          const pct = maxScroll > 0 ? Math.round((scrollBody.scrollTop / maxScroll) * 100) : 100;
          topProgressBar.style.width = `${pct}%`;
        }, { passive: true });
      }
    });

    // Intersep tautan hash internal di dalam kartu materi (misal #ooa-osprey, #interactive-lab)
    document.querySelectorAll('a[href^="#"]:not([data-path])').forEach((anchor) => {
      const rawHash = anchor.getAttribute('href');
      if (!rawHash || rawHash.length < 2) return;
      const key = rawHash.slice(1);
      const targetStage = Game.getStageByKey(key);
      if (targetStage) {
        anchor.addEventListener('click', (e) => {
          e.preventDefault();
          openStage(targetStage.num);
        });
      }
    });
  }

  function wireDockAndKeyboard() {
    const Game = window.MetaOpt.Game;
    const brPlayBtn = document.getElementById('btnBriefingPlay');
    const brPrevBtn = document.getElementById('btnBriefingPrev');
    const brNextBtn = document.getElementById('btnBriefingNext');

    if (brPlayBtn) {
      brPlayBtn.addEventListener('click', () => openStage(Game.current));
    }
    if (brPrevBtn) {
      brPrevBtn.addEventListener('click', () => {
        if (Game.current > 1) {
          Game.playSfx('click');
          Game.selectStage(Game.current - 1);
        }
      });
    }
    if (brNextBtn) {
      brNextBtn.addEventListener('click', () => {
        if (Game.current < 7 && Game.isUnlocked(Game.current + 1)) {
          Game.playSfx('click');
          Game.selectStage(Game.current + 1);
        } else if (Game.current < 7) {
          showLockedNotice(Game.current + 1);
        }
      });
    }

    // Navigasi Keyboard:
    // - Di peta: ← / → untuk memilih stage, Enter untuk PLAY bila fokus tidak sedang pada kontrol lain
    // - Di dalam modal stage: Alt + ← / Alt + → untuk berpindah stage presentasi cepat
    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;

      if (!Game.openStageNum) {
        const badgesDlg = document.getElementById('badgesDialog');
        if (badgesDlg && badgesDlg.open) return;

        if (e.key === 'ArrowRight') {
          if (Game.current < 7 && Game.isUnlocked(Game.current + 1)) {
            e.preventDefault();
            Game.playSfx('click');
            Game.selectStage(Game.current + 1);
          }
        } else if (e.key === 'ArrowLeft') {
          if (Game.current > 1) {
            e.preventDefault();
            Game.playSfx('click');
            Game.selectStage(Game.current - 1);
          }
        }
      } else if (e.altKey) {
        if (e.key === 'ArrowRight' && Game.openStageNum < 7) {
          e.preventDefault();
          openStage(Game.openStageNum + 1);
        } else if (e.key === 'ArrowLeft' && Game.openStageNum > 1) {
          e.preventDefault();
          openStage(Game.openStageNum - 1);
        }
      }
    });
  }

  // 3D Parallax Tilt Effect saat kursor digerakkan di atas Pulau Misi
  function init3dParallax() {
    const viewport = document.querySelector('.island-viewport');
    const canvas = document.getElementById('islandStageCanvas');
    if (!viewport || !canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    function handlePointer(clientX, clientY) {
      const rect = viewport.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const normX = (clientX - rect.left) / rect.width - 0.5;
      const normY = (clientY - rect.top) / rect.height - 0.5;

      // Sudut rotasi 3D dinamis dan halus (maks ±6 derajat)
      targetY = normX * 7.5;
      targetX = -normY * 5.5;
    }

    viewport.addEventListener('mousemove', (e) => {
      handlePointer(e.clientX, e.clientY);
    }, { passive: true });

    viewport.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        handlePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    viewport.addEventListener('touchend', () => {
      targetX = 0;
      targetY = 0;
    }, { passive: true });

    function tick() {
      // Lerp interpolasi matematis untuk redaman inersia 3D lembut
      curX += (targetX - curX) * 0.085;
      curY += (targetY - curY) * 0.085;

      // Jangan manipulasi transform jika dialog modal sedang terbuka
      const anyModalOpen = Boolean(document.querySelector('dialog[open]'));
      if (!anyModalOpen) {
        canvas.style.transform = `perspective(1200px) rotateX(${curX.toFixed(3)}deg) rotateY(${curY.toFixed(3)}deg)`;
      } else {
        canvas.style.transform = '';
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initMap() {
    const Game = window.MetaOpt.Game;
    if (!Game) return;

    buildMapOverlayNodes();
    buildStageChips();
    wireStageDialogs();
    wireDockAndKeyboard();
    init3dParallax();

    Game.onChange(() => {
      updateStageModalTopbars();
      updateMapVisualState();
    });

    updateStageModalTopbars();
    updateMapVisualState();
  }

  window.MetaOpt.GameMap = {
    init: initMap,
    openStage,
    closeActiveStage,
    tryOpenStageByKey,
    updateMapVisualState
  };

  // Bootstrap seluruh subsistem Pulau Misi saat DOM siap
  document.addEventListener('DOMContentLoaded', () => {
    const Game = window.MetaOpt.Game;
    Game.load();
    if (window.MetaOpt.GameUI) window.MetaOpt.GameUI.init();
    if (window.MetaOpt.GameQuests) window.MetaOpt.GameQuests.init();
    initMap();
  });
})();
