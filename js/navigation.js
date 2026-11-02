/**
 * NAVIGATION, SCROLL-SPY & INTERACTION HANDLERS
 * Mengelola navigasi mulus, scroll progress, responsive mobile drawer,
 * scroll-spy indikator aktif, dan flowchart step inspector.
 */
(function() {
  window.MetaOpt = window.MetaOpt || {};

  function initNavigation() {
    const navLinks = document.querySelectorAll('a[data-path]');
    const sections = ['overview', 'ooa-osprey', 'choa-chimp', 'interactive-lab', 'comparison', 'experiment', 'references'];
    const scrollProgressBar = document.getElementById('scrollProgressBar');
    const btnBackToTop = document.getElementById('btnBackToTop');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuCloseBtn = document.getElementById('mobileMenuCloseBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileBackdrop = document.getElementById('mobileBackdrop');

    // 1. Smooth Scroll saat tautan navigasi diklik
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('data-path');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          const headerOffset = 80;
          const elPos = targetEl.getBoundingClientRect().top;
          const offsetPos = elPos + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPos,
            behavior: 'smooth'
          });

          // Tutup mobile drawer jika terbuka
          closeMobileDrawer();
        }
      });
    });

    // 2. Mobile Drawer Toggle
    function openMobileDrawer() {
      if (mobileDrawer && mobileBackdrop) {
        mobileDrawer.classList.remove('translate-x-full');
        mobileBackdrop.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      }
    }

    function closeMobileDrawer() {
      if (mobileDrawer && mobileBackdrop) {
        mobileDrawer.classList.add('translate-x-full');
        mobileBackdrop.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileDrawer);
    if (mobileMenuCloseBtn) mobileMenuCloseBtn.addEventListener('click', closeMobileDrawer);
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileDrawer);

    // Escape key untuk menutup mobile drawer
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileDrawer();
    });

    // 3. Scroll Progress Indicator & Back to Top & Scroll-Spy
    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;

      if (scrollProgressBar) {
        scrollProgressBar.style.width = scrolled + '%';
      }

      // Tombol Back to Top visibility
      if (btnBackToTop) {
        if (winScroll > 400) {
          btnBackToTop.classList.remove('opacity-0', 'pointer-events-none');
          btnBackToTop.classList.add('opacity-100');
        } else {
          btnBackToTop.classList.add('opacity-0', 'pointer-events-none');
          btnBackToTop.classList.remove('opacity-100');
        }
      }

      // Scroll-Spy Deteksi Bagian Aktif
      let currentSection = 'overview';
      const scrollPos = winScroll + 120;

      for (let i = 0; i < sections.length; i++) {
        const secId = sections[i];
        const el = document.getElementById(secId);
        if (el) {
          const top = el.offsetTop;
          const h = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + h) {
            currentSection = secId;
            break;
          }
        }
      }

      // Perbarui style tombol navigasi aktif
      navLinks.forEach(link => {
        const p = link.getAttribute('data-path');
        if (p === currentSection) {
          link.classList.add('bg-primary', 'text-on-primary', 'font-semibold', 'shadow-sm');
          link.classList.remove('text-on-surface-variant', 'hover:bg-surface-container-high', 'hover:text-on-surface');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('bg-primary', 'text-on-primary', 'font-semibold', 'shadow-sm');
          link.classList.add('text-on-surface-variant', 'hover:bg-surface-container-high', 'hover:text-on-surface');
          link.removeAttribute('aria-current');
        }
      });
    }, { passive: true });

    if (btnBackToTop) {
      btnBackToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // --- Interactive Flowchart Step Inspector untuk OOA ---
  window.selectOoaStep = function(stepNum) {
    const descriptions = {
      1: '<strong>Tahap 1 - Identifikasi Posisi Ikan (Candidate Fish Set):</strong> Setiap osprey mengamati kawanan ikan di bawah permukaan air. Titik ikan dimodelkan oleh posisi osprey lain yang memiliki nilai fungsi objektif lebih baik: $$FP_i = \\{X_k \\mid f(X_k) < f(X_i)\\} \\cup \\{X^*\\}$$. Jika tidak ada agen yang lebih baik, solusi terbaik global $X^*$ secara otomatis dijadikan target referensi.',
      2: '<strong>Tahap 2 - Penyelaman dan Serangan (Diving & Hunting):</strong> Osprey menukik tajam ke arah ikan terpilih ($SF_i$) dengan faktor impuls stokastik $I \\in \\{1, 2\\}$: $$X_{i,j}^{P1} = X_{i,j} + r_1 \\cdot (SF_{i,j} - I \\cdot X_{i,j})$$. Nilai $I=2$ memberikan lompatan eksplorasi agresif untuk melompati cekungan jebakan lokal.',
      3: '<strong>Tahap 3 - Seleksi Elitis Pertama (Greedy Replacement):</strong> Posisi hasil selam $X_i^{P1}$ hanya akan menggantikan koordinat lama $X_i$ jika dan hanya jika menghasilkan biaya fungsi objektif yang lebih rendah: $f(X_i^{P1}) < f(X_i)$.',
      4: '<strong>Tahap 4 - Membawa Mangsa ke Pantai / Sarang (Shore Perch Relocation):</strong> Setelah menangkap ikan, osprey terbang menuju daratan untuk memangsa. Ruang pencarian lokal menyusut secara teredam seiring waktu: $$X_{i,j}^{P2} = X_{i,j} + \\frac{lb_j + r_2 \\cdot (ub_j - lb_j)}{t}$$, memusatkan eksploitasi di sekitar koordinat prima.',
      5: '<strong>Tahap 5 - Seleksi Elitis Kedua & Pembaruan Global:</strong> Posisi sarang diterima jika fitness membaik. Solusi terbaik populasi ($X^*$) diperbarui untuk generasi berikutnya.'
    };

    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`ooa-flow-${i}`);
      if (el) {
        if (i === stepNum) {
          el.className = 'cursor-pointer p-space-sm rounded-lg bg-primary-fixed text-on-primary-fixed-variant border-l-4 border-primary transition-all';
        } else {
          el.className = 'cursor-pointer p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-all';
        }
      }
    }
    const box = document.getElementById('ooaStepDetailBox');
    if (box) {
      box.innerHTML = descriptions[stepNum];
      if (window.renderMathInElement) {
        window.renderMathInElement(box, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
          ]
        });
      }
    }
  };

  // --- Interactive Flowchart Step Inspector untuk ChOA ---
  window.selectChoaStep = function(stepNum) {
    const descriptions = {
      1: '<strong>Tahap 1 - Inisialisasi & Pembagian Peran Sosial:</strong> Populasi simpanse diurutkan berdasarkan nilai fitness untuk mengidentifikasi 4 pemimpin: $\\alpha$ (Attacker - Terbaik), $\\beta$ (Barrier - Kedua), $\\gamma$ (Chaser - Ketiga), dan $\\delta$ (Driver - Keempat).',
      2: '<strong>Tahap 2 - Perhitungan Vektor Pengurungan (Encirclement):</strong> Masing-masing agen menghitung perpindahan relatif terhadap 4 pemimpin dengan koefisien dinamis: $d_j = |c \\cdot X_j - m \\cdot X_i|$ dan $X_j\' = X_j - a \\cdot d_j$. Parameter $a$ menurun secara adaptif selama proses.',
      3: '<strong>Tahap 3 - Fusi Sentroid Sosial (Centroid Fusion):</strong> Posisi kandidat baru dihitung dari rata-rata kuadran ke-4 pemimpin: $$X_i(t+1) = \\frac{X_1 + X_2 + X_3 + X_4}{4}$$.',
      4: '<strong>Tahap 4 - Modulasi Chaotic Hunting Drive:</strong> Dengan probabilitas $p \\ge 0.5$, simpanse beralih ke peta deterministik chaos untuk menghasilkan perturbasi non-linear yang membebaskan agen dari titik stasioner prematur.',
      5: '<strong>Tahap 5 - Clamping & Pembaruan Hierarki Kasta:</strong> Batas ruang pencarian $[lb, ub]$ ditegakkan, fungsi objektif dievaluasi, dan ranking kasta sosial (Attacker, Barrier, Chaser, Driver) diperbarui.'
    };

    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`choa-flow-${i}`);
      if (el) {
        if (i === stepNum) {
          el.className = 'cursor-pointer p-space-sm rounded-lg bg-secondary-container text-on-secondary-container border-l-4 border-secondary transition-all';
        } else {
          el.className = 'cursor-pointer p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-all';
        }
      }
    }
    const box = document.getElementById('choaStepDetailBox');
    if (box) {
      box.innerHTML = descriptions[stepNum];
      if (window.renderMathInElement) {
        window.renderMathInElement(box, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
          ]
        });
      }
    }
  };

  // --- Salin Pseudocode ke Clipboard ---
  window.copyCodeToClipboard = function(elementId, buttonId) {
    const el = document.getElementById(elementId);
    const btn = document.getElementById(buttonId);
    if (!el || !btn) return;

    const codeText = el.innerText;
    navigator.clipboard.writeText(codeText).then(() => {
      const origContent = btn.innerHTML;
      btn.innerHTML = `<span class="material-symbols-outlined text-[14px]">check</span><span>Tersalin!</span>`;
      btn.classList.add('bg-green-700/30', 'text-green-300');
      setTimeout(() => {
        btn.innerHTML = origContent;
        btn.classList.remove('bg-green-700/30', 'text-green-300');
      }, 2000);
    }).catch(err => {
      console.error('Gagal menyalin:', err);
    });
  };

  document.addEventListener('DOMContentLoaded', initNavigation);
})();

