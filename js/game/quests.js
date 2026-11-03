/**
 * PULAU MISI — STAGE QUEST CHECKLISTS & MINI-QUIZ CHALLENGES
 * Membaca event pada tombol eksisting secara non-invasif (tanpa mengubah engine/algoritma)
 * dan merender kuis evaluasi akhir per stage beserta opsi Skip untuk kelancaran presentasi.
 */
(function() {
  window.MetaOpt = window.MetaOpt || {};

  const STAGE_QUESTS = {
    2: [
      { id: 'q_ooa_fish', xp: 25, label: 'Tambah kawanan ikan di simulator laut OOA' },
      { id: 'q_ooa_flow', xp: 25, label: 'Klik salah satu langkah pada Flowchart OOA' }
    ],
    3: [
      { id: 'q_choa_pulse', xp: 25, label: 'Picu denyut peran acak pada simulator ChOA' },
      { id: 'q_choa_flow',  xp: 25, label: 'Klik salah satu langkah pada Flowchart ChOA' }
    ],
    4: [
      { id: 'q_lab_run',  xp: 30, label: 'Jalankan atau langkahkan simulasi di Lab' },
      { id: 'q_lab_func', xp: 35, label: 'Uji minimal 2 fungsi benchmark berbeda' },
      { id: 'q_lab_seed', xp: 35, label: 'Ganti atau acak nilai RNG Seed' }
    ],
    5: [
      { id: 'q_cmp_duel', xp: 40, label: 'Klik "Jalankan Komparasi Sinkron" OOA vs ChOA' }
    ],
    6: [
      { id: 'q_exp_batch', xp: 40, label: 'Eksekusi "Jalankan Batch Uji" Monte Carlo' },
      { id: 'q_exp_csv',   xp: 25, label: 'Pilih 10/30 replikasi atau unduh hasil CSV' }
    ]
  };

  const STAGE_QUIZZES = {
    1: [
      {
        q: 'Apa tujuan utama dari fase Exploration (eksplorasi) pada algoritma metaheuristik berbasis populasi?',
        options: [
          'Menjelajahi ruang pencarian secara luas agar agen tidak terjebak di minimum lokal',
          'Menghitung turunan parsial kedua (Hessian) dari fungsi objektif',
          'Menghentikan iterasi sebelum mencapai batas maksimum T'
        ],
        answer: 0,
        explain: 'Benar! Eksplorasi menyebarkan agen ke berbagai wilayah domain Ω untuk mencegah jebakan local optima.'
      },
      {
        q: 'Apa fungsi dari tahapan Clamping dalam pipa alur kerja optimasi?',
        options: [
          'Mengurutkan kasta sosial agen dari terbaik ke terburuk',
          'Memproyeksikan kembali koordinat agen yang keluar batas agar tetap berada di dalam [lb, ub]',
          'Mengubah skala grafik konvergensi menjadi logaritmik'
        ],
        answer: 1,
        explain: 'Tepat! Clamping menjaga setiap komponen koordinat tetap valid di dalam batas bawah lb dan batas atas ub.'
      }
    ],
    2: [
      {
        q: 'Pada Fase 1 OOA, bagaimana himpunan posisi kandidat ikan (FP_i) bagi osprey ke-i dibentuk?',
        options: [
          'Seluruh agen populasi dipilih tanpa syarat nilai fungsi biaya',
          'Himpunan semua agen dengan nilai fitness lebih baik f(X_k) < f(X_i) digabung dengan solusi terbaik global X*',
          'Rata-rata aritmatika dari 4 pemimpin kawanan terbaik'
        ],
        answer: 1,
        explain: 'Benar! OOA mengumpulkan solusi yang lebih unggul dari agen saat ini ditambah X* sebagai target penyelaman acak.'
      },
      {
        q: 'Mengapa persamaan Fase 2 OOA membagi pergeseran lokal dengan indeks iterasi t?',
        options: [
          'Agar radius pencarian lokal menyusut seiring bertambahnya iterasi untuk penajaman eksploitasi',
          'Untuk memperbesar lompatan acak di akhir iterasi',
          'Untuk menggandakan ukuran populasi N di setiap generasi'
        ],
        answer: 0,
        explain: 'Tepat! Faktor 1/t mengecilkan rentang perpindahan lokal secara bertahap menuju konvergensi presisi tinggi.'
      }
    ],
    3: [
      {
        q: 'Berapa jumlah pemimpin elit dalam hierarki sosial Chimp Optimization Algorithm (ChOA) dan apa urutannya?',
        options: [
          '2 pemimpin: Alpha dan Beta',
          '4 pemimpin: Alpha (Attacker), Beta (Barrier), Gamma (Chaser), dan Delta (Driver)',
          '1 pemimpin tunggal yaitu Global Best X*'
        ],
        answer: 1,
        explain: 'Benar! ChOA menggunakan fusi rata-rata posisi dari 4 kasta sosial: (X1 + X2 + X3 + X4) / 4.'
      },
      {
        q: 'Apa peran komponen Chaotic Map pada ChOA ketika probabilitas strategi acak μ ≥ 0.5?',
        options: [
          'Menghasilkan perturbasi non-linear untuk membebaskan agen dari stagnasi minimum lokal',
          'Menghapus setengah populasi dengan nilai fitness terburuk',
          'Mengunci semua agen pada koordinat (0, 0)'
        ],
        answer: 0,
        explain: 'Tepat! Peta chaos memberikan variasi deterministik non-linear untuk menjaga keragaman pencarian.'
      }
    ],
    4: [
      {
        q: 'Di antara 4 fungsi benchmark di laboratorium, manakah fungsi yang memiliki minimum global di koordinat (1, 1) pada lembah parabolik sempit?',
        options: [
          'Sphere Function',
          'Rastrigin Function',
          'Rosenbrock Valley Function'
        ],
        answer: 2,
        explain: 'Benar! Rosenbrock memiliki minimum global f(1, 1) = 0 di sepanjang dasar lembah melengkung yang sempit.'
      },
      {
        q: 'Mengapa laboratorium menggunakan Seeded RNG (Linear Congruential Generator) pada input Seed?',
        options: [
          'Agar urutan bilangan acak bersifat deterministik sehingga eksperimen dapat direplikasi dengan hasil persis sama',
          'Agar simulasi membutuhkan koneksi ke server database eksternal',
          'Untuk membatasi jumlah iterasi maksimum menjadi 10'
        ],
        answer: 0,
        explain: 'Tepat! Seed yang sama menghasilkan lintasan pencarian yang 100% dapat direproduksi secara ilmiah.'
      }
    ],
    5: [
      {
        q: 'Mengapa pada jumlah populasi N dan iterasi T yang sama, Total Evaluasi Fungsi (NFE) milik OOA lebih besar daripada ChOA?',
        options: [
          'Karena OOA mengevaluasi fungsi objektif di dua fase (Fase 1 & Fase 2) per agen tiap iterasi, sedangkan ChOA satu kali per agen tiap iterasi',
          'Karena ChOA tidak pernah mengevaluasi fungsi pada saat inisialisasi',
          'Karena OOA menggunakan 4 pemimpin sekaligus'
        ],
        answer: 0,
        explain: 'Benar! OOA melakukan seleksi elitis di Fase 1 dan Fase 2 (NFE = N + 2NT), sedangkan ChOA mengevaluasi 1 posisi gabungan per iterasi (NFE = N + NT).'
      }
    ],
    6: [
      {
        q: 'Mengapa pengujian algoritma metaheuristik perlu diulang lintas banyak seed independen (replikasi Monte Carlo)?',
        options: [
          'Karena algoritma mengandung variabel stokastik (acak), sehingga kinerja harus dinilai dari distribusi statistik (Mean, Best, Std Dev), bukan satu percobaan tunggal',
          'Karena browser hanya mengizinkan ekspor CSV jika tabel memiliki lebih dari 100 baris',
          'Untuk mengubah fungsi unimodal menjadi multimodal'
        ],
        answer: 0,
        explain: 'Benar! Replikasi multi-seed membuktikan keandalan dan konsistensi konvergensi secara objektif.'
      }
    ],
    7: [
      {
        q: 'Dalam konteks arsitektur Cloud Computing, mengapa platform laboratorium ini memiliki biaya komputasi server backend sebesar $0?',
        options: [
          'Karena seluruh kalkulasi FP64, plotting kontur 2D, dan uji Monte Carlo dieksekusi 100% di sisi klien (browser) sebagai aplikasi web statis',
          'Karena perhitungan algoritma dilakukan secara manual tanpa JavaScript',
          'Karena aplikasi hanya dapat dibuka satu kali sehari'
        ],
        answer: 0,
        explain: 'Tepat sekali! Arsitektur Client-Side Static Web memungkinkan deployment langsung ke CDN/GitHub Pages tanpa server backend.'
      }
    ]
  };

  // Menyimpan jawaban benar per stage selama sesi
  const answeredCorrectly = {};

  function renderStageDecorations() {
    const Game = window.MetaOpt.Game;
    if (!Game) return;

    Game.stages.forEach((st) => {
      const dlg = document.getElementById(`stage-dialog-${st.num}`);
      if (!dlg) return;
      const body = dlg.querySelector('.stage-modal-body');
      const sectionEl = dlg.querySelector(`section#${st.id}`);
      if (!body || !sectionEl) return;

      // 1. Banner Narasi Pemandu (di atas section asli)
      let bannerWrap = body.querySelector('.stage-story-banner');
      if (!bannerWrap) {
        bannerWrap = document.createElement('div');
        bannerWrap.className = 'stage-story-banner';
        body.insertBefore(bannerWrap, sectionEl);
      }
      renderNarrativeBanner(bannerWrap, st);

      // 2. Quest Checklist Strip (khusus stage interaktif 2..6)
      const quests = STAGE_QUESTS[st.num];
      if (quests && quests.length > 0) {
        let questWrap = body.querySelector('.stage-quest-strip');
        if (!questWrap) {
          questWrap = document.createElement('div');
          questWrap.className = 'stage-quest-strip';
          body.insertBefore(questWrap, sectionEl);
        }
        renderQuestStrip(questWrap, st.num, quests);
      }

      // 3. Kartu Mini-Quiz & Penyelesaian Stage (di bawah section asli)
      let challengeWrap = body.querySelector('.stage-challenge-wrap');
      if (!challengeWrap) {
        challengeWrap = document.createElement('div');
        challengeWrap.className = 'stage-challenge-wrap';
        body.appendChild(challengeWrap);
      }
      renderQuizChallenge(challengeWrap, st);
    });
  }

  function renderNarrativeBanner(container, st) {
    const Game = window.MetaOpt.Game;
    if (Game.narrativeHidden) {
      container.innerHTML = `
        <div class="flex justify-end">
          <button type="button" class="text-xs font-code-sm text-primary hover:underline py-1 px-2" data-toggle-narrative="true">
            + Tampilkan Narasi Cerita Pemandu
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="stage-story-card">
          <div class="stage-story-left">
            <span class="stage-story-emoji" aria-hidden="true">${st.guideIcon}</span>
            <div>
              <div class="stage-story-speaker">${st.guideSpeaker}</div>
              <p class="stage-story-text">${st.narrative}</p>
            </div>
          </div>
          <button type="button" class="text-xs font-code-sm text-tertiary hover:text-on-surface shrink-0 px-2 py-1 rounded hover:bg-black/5" data-toggle-narrative="true" title="Sembunyikan kotak narasi">
            Sembunyikan
          </button>
        </div>
      `;
    }
    const btn = container.querySelector('[data-toggle-narrative]');
    if (btn) {
      btn.addEventListener('click', () => Game.toggleNarrative());
    }
  }

  function renderQuestStrip(container, stageNum, quests) {
    const Game = window.MetaOpt.Game;
    const pillsHtml = quests.map((q) => {
      const done = Game.questsDone.includes(q.id);
      return `
        <span class="quest-pill" data-done="${done ? 'true' : 'false'}" id="quest-pill-${q.id}">
          <span aria-hidden="true">${done ? '✓' : '○'}</span>
          <span>${q.label}</span>
          <strong class="text-amber-300">+${q.xp} XP</strong>
        </span>
      `;
    }).join('');

    container.innerHTML = `
      <div class="stage-quest-box">
        <div class="stage-quest-heading">
          <span aria-hidden="true">🎯</span>
          <span>MISI PRAKTIK STAGE ${stageNum}</span>
        </div>
        <div class="stage-quest-items">${pillsHtml}</div>
      </div>
    `;
  }

  function renderQuizChallenge(container, st) {
    const Game = window.MetaOpt.Game;
    const questions = STAGE_QUIZZES[st.num] || [];
    const completed = Game.isCompleted(st.num);
    if (!answeredCorrectly[st.num]) answeredCorrectly[st.num] = new Set();

    const nextStage = st.num < 7 ? Game.getStage(st.num + 1) : null;

    let questionsHtml = '';
    questions.forEach((item, qIdx) => {
      const isSolved = completed || answeredCorrectly[st.num].has(qIdx);
      const optsHtml = item.options.map((optText, optIdx) => {
        const stateAttr = (isSolved && optIdx === item.answer) ? ' data-state="correct"' : '';
        return `
          <button type="button" class="quiz-opt-btn" data-qidx="${qIdx}" data-opt="${optIdx}"${stateAttr} ${isSolved ? 'disabled' : ''}>
            ${optText}
          </button>
        `;
      }).join('');

      questionsHtml += `
        <div class="quiz-question-block" data-qblock="${qIdx}">
          <div class="font-title-md text-sm font-bold text-on-surface">
            Soal ${qIdx + 1}: ${item.q}
          </div>
          <div class="quiz-options-grid">${optsHtml}</div>
          <div class="quiz-feedback ${isSolved ? '' : 'hidden'}" data-ok="true" id="quiz-fb-${st.num}-${qIdx}">
            ${isSolved ? '✓ ' + item.explain : ''}
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="stage-challenge-card">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/30">
          <div>
            <span class="font-code-sm text-xs uppercase tracking-wider text-primary font-bold">
              ${completed ? '✓ MISI STAGE TUNTAS' : `CHECKPOINT STAGE 0${st.num}`}
            </span>
            <h3 class="font-headline-sm text-xl font-bold text-on-surface">
              ${completed
                ? `Badge "${st.badge.name}" ${st.badge.icon} Telah Diklaim!`
                : `Kuis Singkat Pembuka Jalur (+${st.xp} XP & Badge "${st.badge.name}")`}
            </h3>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            ${!completed ? `
              <button type="button" class="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-xs font-semibold transition-colors border border-outline-variant/40" data-action="skip-stage">
                Lewati Kuis (Skip) →
              </button>
            ` : ''}
            ${nextStage ? `
              <button type="button" class="px-4 py-2 rounded-lg font-label-md text-xs font-bold transition-all shadow-sm ${completed ? 'bg-primary text-on-primary hover:bg-primary-container' : 'bg-surface-container text-tertiary cursor-not-allowed'}" data-action="next-stage" ${completed || Game.presentationMode ? '' : 'disabled'}>
                Lanjut ke Stage ${nextStage.num}: ${nextStage.shortLabel} →
              </button>
            ` : `
              <button type="button" class="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-xs font-bold hover:bg-primary-container transition-all shadow-sm" data-action="return-map">
                Kembali ke Peta Pulau 🗺️
              </button>
            `}
          </div>
        </div>

        ${questionsHtml}
      </div>
    `;

    // Pasang event jawaban kuis
    container.querySelectorAll('.quiz-opt-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const qIdx = Number(btn.getAttribute('data-qidx'));
        const optIdx = Number(btn.getAttribute('data-opt'));
        const qObj = questions[qIdx];
        const fb = container.querySelector(`#quiz-fb-${st.num}-${qIdx}`);
        const block = btn.closest('.quiz-question-block');

        if (optIdx === qObj.answer) {
          Game.playSfx('quest');
          btn.setAttribute('data-state', 'correct');
          block.querySelectorAll('.quiz-opt-btn').forEach((b) => { b.disabled = true; });
          if (fb) {
            fb.classList.remove('hidden');
            fb.setAttribute('data-ok', 'true');
            fb.textContent = '✓ ' + qObj.explain;
          }
          answeredCorrectly[st.num].add(qIdx);
          if (answeredCorrectly[st.num].size >= questions.length) {
            Game.completeStage(st.num);
            renderQuizChallenge(container, st);
          }
        } else {
          Game.playSfx('locked');
          btn.setAttribute('data-state', 'wrong');
          if (fb) {
            fb.classList.remove('hidden');
            fb.setAttribute('data-ok', 'false');
            fb.textContent = 'Kurang tepat — coba pilih opsi lainnya atau tinjau materi di atas.';
          }
        }
      });
    });

    // Tombol Skip
    const skipBtn = container.querySelector('[data-action="skip-stage"]');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        Game.completeStage(st.num);
        renderQuizChallenge(container, st);
      });
    }

    // Tombol Lanjut Stage Berikutnya
    const nextBtn = container.querySelector('[data-action="next-stage"]');
    if (nextBtn && nextStage) {
      nextBtn.addEventListener('click', () => {
        if (window.MetaOpt.GameMap) {
          window.MetaOpt.GameMap.openStage(nextStage.num);
        }
      });
    }

    // Tombol Kembali ke Peta
    const retBtn = container.querySelector('[data-action="return-map"]');
    if (retBtn) {
      retBtn.addEventListener('click', () => {
        if (window.MetaOpt.GameMap) {
          window.MetaOpt.GameMap.closeActiveStage();
        }
      });
    }
  }

  function refreshQuestPills() {
    const Game = window.MetaOpt.Game;
    Object.keys(STAGE_QUESTS).forEach((sNum) => {
      const dlg = document.getElementById(`stage-dialog-${sNum}`);
      if (!dlg) return;
      const questWrap = dlg.querySelector('.stage-quest-strip');
      if (questWrap) renderQuestStrip(questWrap, Number(sNum), STAGE_QUESTS[sNum]);
    });
    // Perbarui banner narasi dan challenge card bila state berubah
    Game.stages.forEach((st) => {
      const dlg = document.getElementById(`stage-dialog-${st.num}`);
      if (!dlg) return;
      const bannerWrap = dlg.querySelector('.stage-story-banner');
      if (bannerWrap) renderNarrativeBanner(bannerWrap, st);
      const challengeWrap = dlg.querySelector('.stage-challenge-wrap');
      if (challengeWrap) renderQuizChallenge(challengeWrap, st);
    });
  }

  // Pasang pendengar pasif pada tombol-tombol eksisting
  function bindNonInvasiveQuestListeners() {
    const Game = window.MetaOpt.Game;
    if (!Game) return;

    // Stage 2: OOA
    const btnSpawnFish = document.getElementById('btnSpawnFish');
    const ooaCanvas = document.getElementById('ooaHuntingCanvas');
    if (btnSpawnFish) {
      btnSpawnFish.addEventListener('click', () => {
        Game.completeQuest('q_ooa_fish', 25, 'Menambah kawanan ikan di Danau Osprey');
      });
    }
    if (ooaCanvas) {
      ooaCanvas.addEventListener('click', () => {
        Game.completeQuest('q_ooa_fish', 25, 'Menambah ikan langsung di Danau Osprey');
      });
    }
    for (let i = 1; i <= 5; i++) {
      const flowEl = document.getElementById(`ooa-flow-${i}`);
      if (flowEl) {
        flowEl.addEventListener('click', () => {
          Game.completeQuest('q_ooa_flow', 25, 'Menginspeksi langkah Flowchart OOA');
        });
      }
    }

    // Stage 3: ChOA
    const btnPulse = document.getElementById('btnPulseChoaRoles');
    if (btnPulse) {
      btnPulse.addEventListener('click', () => {
        Game.completeQuest('q_choa_pulse', 25, 'Memicu denyut formasi 4 peran Simpanse');
      });
    }
    for (let i = 1; i <= 5; i++) {
      const flowEl = document.getElementById(`choa-flow-${i}`);
      if (flowEl) {
        flowEl.addEventListener('click', () => {
          Game.completeQuest('q_choa_flow', 25, 'Menginspeksi langkah Flowchart ChOA');
        });
      }
    }

    // Stage 4: Interactive Lab
    const btnPlay = document.getElementById('btnPlay');
    const btnStep = document.getElementById('btnStep');
    const selFunction = document.getElementById('selFunction');
    const inpSeed = document.getElementById('inpSeed');
    const btnRandomSeed = document.getElementById('btnRandomSeed');

    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        Game.completeQuest('q_lab_run', 30, 'Menjalankan simulasi di Laboratorium Pulau');
      });
    }
    if (btnStep) {
      btnStep.addEventListener('click', () => {
        Game.completeQuest('q_lab_run', 30, 'Mengeksekusi langkah tunggal di Laboratorium');
      });
    }

    const triedFuncs = new Set([selFunction ? selFunction.value : 'sphere']);
    if (selFunction) {
      selFunction.addEventListener('change', () => {
        triedFuncs.add(selFunction.value);
        if (triedFuncs.size >= 2) {
          Game.completeQuest('q_lab_func', 35, 'Menguji 2 lanskap fungsi benchmark berbeda');
        }
      });
    }

    if (inpSeed) {
      inpSeed.addEventListener('change', () => {
        Game.completeQuest('q_lab_seed', 35, 'Mengubah parameter deterministik RNG Seed');
      });
    }
    if (btnRandomSeed) {
      btnRandomSeed.addEventListener('click', () => {
        Game.completeQuest('q_lab_seed', 35, 'Mengacak nilai RNG Seed laboratorium');
      });
    }

    // Stage 5: Comparison
    const btnRunCmp = document.getElementById('btnRunComparison');
    if (btnRunCmp) {
      btnRunCmp.addEventListener('click', () => {
        Game.completeQuest('q_cmp_duel', 40, 'Menjalankan komparasi sinkron OOA vs ChOA');
      });
    }

    // Stage 6: Experiment
    const btnRunBatch = document.getElementById('btnRunBatch');
    if (btnRunBatch) {
      btnRunBatch.addEventListener('click', () => {
        Game.completeQuest('q_exp_batch', 40, 'Menjalankan replikasi statistik Monte Carlo');
      });
    }
    ['btnTrial10', 'btnTrial30', 'btnExportCsv'].forEach((id) => {
      const b = document.getElementById(id);
      if (b) {
        b.addEventListener('click', () => {
          Game.completeQuest('q_exp_csv', 25, 'Mengonfigurasi replikasi lanjut / ekspor CSV');
        });
      }
    });

    Game.onChange((reason) => {
      if (reason === 'questComplete' || reason === 'stageComplete' || reason === 'presentationMode' || reason === 'narrative' || reason === 'reset') {
        refreshQuestPills();
      }
    });
  }

  function initQuests() {
    renderStageDecorations();
    bindNonInvasiveQuestListeners();
  }

  window.MetaOpt.GameQuests = {
    init: initQuests,
    refresh: refreshQuestPills
  };
})();

