# Laboratorium Interaktif Optimasi Metaheuristik: OOA & ChOA
> **Interactive Educational Platform & Scientific Playground for Bio-Inspired Metaheuristics: Osprey Optimization Algorithm (OOA) & Chimp Optimization Algorithm (ChOA)**

[![GitHub Pages Deployment](https://img.shields.io/badge/Deploy-GitHub%20Pages-brightgreen?logo=github)](https://pages.github.com/)
[![License: Academic Open Source](https://img.shields.io/badge/License-Academic%20MIT-blue.svg)](LICENSE)
[![Standards: IEEE-754 FP64](https://img.shields.io/badge/Precision-FP64%20IEEE--754-orange.svg)]()
[![Platform: Web Standard](https://img.shields.io/badge/Platform-HTML5%20%7C%20CSS3%20%7C%20ES6+-informational.svg)]()

---

## 1. Deskripsi Proyek

Situs web edukasi interaktif ini dirancang untuk mahasiswa, peneliti, dan praktisi kecerdasan komputasional (*computational intelligence*) yang ingin mempelajari algoritma optimasi metaheuristik modern berbasis populasi:

1. **Osprey Optimization Algorithm (OOA)** — Dehghani et al., 2023 (*Scientific Reports, Nature Publishing Group*).
2. **Chimp Optimization Algorithm (ChOA)** — Khishe & Mosavi, 2020 (*Expert Systems with Applications, Elsevier*).

Platform ini memadukan estetika presentasi akademik minimalis bergaya Canva monograf dengan fungsionalitas laboratorium simulasi numerik berbasis peramban (*client-side*). Seluruh proses perhitungan, plotting lanskap kontur 2D, animasi pencarian partikel, dan pengujian Monte Carlo berjalan 100% lokal tanpa dependensi backend atau API server.

---

## 2. Fitur Utama

- **Penjelasan Ilmiah Berbahasa Indonesia & LaTeX Formulasi Ketat**:
  - Formulasi persamaan matematis lengkap dirender menggunakan KaTeX.
  - Dokumentasi tiap tahapan algoritma: inisialisasi, evaluasi biaya, eksplorasi global, eksploitasi lokal, clamping batas, dan seleksi elitis.
- **Simulator Interaktif Biologi (2D Canvas Widgets)**:
  - *OOA Marine Pursuit Simulator*: Visualisasi perburuan ikan laut di bawah permukaan air dengan penyelaman trajektori elang tiram.
  - *ChOA 4-Role Convergence Model*: Visualisasi dinamika kuadran sosial $(\alpha, \beta, \gamma, \delta)$ dan konvergensi sentroid dengan perturbasi chaotic map.
- **Laboratorium Optimasi Interaktif (Interactive Lab)**:
  - Selector 4 fungsi uji standar (*Sphere, Rastrigin, Rosenbrock, Ackley*).
  - Peta topologi kontur 2D dengan isoline berbasis buffer canvas 60 FPS.
  - Kontrol interaktif: Ukuran Populasi ($N$), Iterasi Maksimum ($T$), Kecepatan Eksekusi, dan Seed Acak Deterministik (LCG).
  - Tombol simulasi lengkap: *Run / Pause, Step (Langkah Tunggal), Reset*.
  - Telemetri real-time: Fitness terbaik $f(X^*)$, rata-rata populasi, koordinat solusi terbaik, dan jumlah evaluasi fungsi (NFE).
  - Kurva konvergensi logaritmik real-time ($\log_{10}(f(X^*))$ vs Iterasi).
- **Protokol Komparasi Sinkron Berdampingan**:
  - Menjalankan OOA dan ChOA secara paralel di bawah kondisi acak (*seed*), batas pencarian, dan anggaran evaluasi yang sama persis.
  - Grafik konvergensi ganda dan tabel perbandingan metrik statistika (*Best, Mean, Worst, Std Dev, Total NFE, Runtime ms*).
- **Laboratorium Replikasi Monte Carlo & Ekspor CSV**:
  - Menjalankan multi-trial batch (5, 10, atau 30 replikasi independen).
  - Menghitung statistik selisih $(\Delta)$ dan penentuan pemenang uji secara objektif.
  - Ekspor hasil eksperimen ke format berkas CSV standar RFC 4180 untuk analisis lanjutan di Excel, SPSS, atau Python/R.
- **Desain Responsif & Navigasi Mulus**:
  - Scroll-spy dengan indikator bagian aktif di navigasi atas.
  - Scroll progress bar di puncak halaman.
  - Drawer navigasi mobile yang ramah sentuhan.
  - Tombol melayang *Back to Top*.
  - Flowchart interaktif dengan inspeksi detail per langkah dan tombol salin pseudocode satu klik.

---

## 3. Tumpukan Teknologi (Tech Stack)

- **Frontend Core**: HTML5 Semantik, CSS3 Modern, Vanilla JavaScript (ES6+ modular).
- **Styling & Tata Letak**: Tailwind CSS CDN dengan kustomisasi tema monograf akademik (warna *sandstone/cream* `#fbf9f5`, aksen *terracotta* `#ab2e16`, dan panel *charcoal* `#1e2022`).
- **Tipografi**:
  - `Newsreader`: Judul display & heading serif bergaya akademik.
  - `Inter`: Teks isi laporan & penjelasan.
  - `Space Grotesk`: Label kode, formula monospaced, dan telemetri data.
- **Rendering Persamaan Matematika**: KaTeX (Fast math typesetting).
- **Visualisasi Grafis**: HTML5 Canvas API (Buffered contour landscape, particle system, & dynamic charts).
- **Ikonografi**: Google Material Symbols Outlined.

---

## 4. Struktur Direktori Proyek

```
/
├── index.html                     # Halaman utama aplikasi web interaktif
├── README.md                      # Dokumentasi komprehensif proyek & panduan deployment
├── css/
│   └── styles.css                 # Gaya khusus, scrollbar, KaTeX tweaking, & animasi
└── js/
    ├── benchmarks/
    │   └── functions.js           # Definisi fungsi uji (Sphere, Rastrigin, Rosenbrock, Ackley)
    ├── algorithms/
    │   ├── ooa.js                 # Implementasi murni Osprey Optimization Algorithm (OOA)
    │   └── choa.js                # Implementasi murni Chimp Optimization Algorithm (ChOA)
    ├── simulation/
    │   └── engine.js              # Siklus hidup simulasi, kontrol play/pause, & Seeded LCG
    ├── visualization/
    │   ├── canvas.js              # Peta kontur 2D, agen partikel, & widget biologi
    │   └── charts.js              # Plot kurva konvergensi logaritmik (tunggal & komparatif)
    ├── experiments/
    │   └── runner.js              # Runner batch Monte Carlo & generator ekspor CSV
    ├── navigation.js              # Scroll-spy, mobile drawer, flowchart click, & copy code
    └── app.js                     # Main application orchestrator & telemetry updates
```

---

## 5. Panduan Menjalankan Proyek Secara Lokal

Tidak diperlukan instalasi runtime backend seperti Node.js, Python, ataupun database eksternal.

### Opsi A: Membuka Langsung di Peramban
Cukup klik ganda (*double click*) berkas `index.html` pada File Explorer / Finder untuk membukanya di peramban web modern (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

### Opsi B: Menggunakan Local Web Server (Direkomendasikan)
Jika Anda memiliki Python atau VS Code:

**Menggunakan Python:**
```bash
# Masuk ke direktori proyek
cd "path/ke/proyek"

# Jalankan server lokal pada port 8000
python -m http.server 8000
```
Buka peramban dan navigasikan ke `http://localhost:8000`.

**Menggunakan VS Code:**
Pasang ekstensi **Live Server**, klik kanan berkas `index.html`, lalu pilih **"Open with Live Server"**.

---

## 6. Panduan Deployment ke GitHub Pages

Proyek ini telah dikonfigurasi secara statis dengan jalur relatif sehingga siap langsung di-deploy ke GitHub Pages tanpa build step atau pipeline CI/CD tambahan:

1. Buat repositori baru di GitHub (misalnya: `metaheuristic-opt-lab`).
2. Unggah seluruh berkas proyek ke repositori tersebut:
   ```bash
   git init
   git add .
   git commit -m "feat: initial release of interactive metaheuristic lab"
   git branch -M main
   git remote add origin https://github.com/dimasptrr/metaheuristik_kelompok-8_kelas-B.git
   git push -u origin main
   ```
3. Di halaman repositori GitHub Anda:
   - Masuk ke tab **Settings**.
   - Pada panel navigasi sebelah kiri, klik menu **Pages**.
   - Pada bagian **Build and deployment** > **Source**, pilih opsi **"Deploy from a branch"**.
   - Pada dropdown **Branch**, pilih branch `main` dan folder `/ (root)`, lalu klik tombol **Save**.
4. Tunggu sekitar 1-2 menit hingga proses publikasi selesai. Situs web Anda akan aktif secara publik di:
   `https://dimasptrr.github.io/metaheuristik_kelompok-8_kelas-B/`

---

## 7. Referensi Literatur Primer

1. **Osprey Optimization Algorithm (OOA)**:
   > Dehghani, M., Trojovský, P., & Trojovská, E. (2023).  
   > *Osprey Optimization Algorithm: A new bio-inspired metaheuristic algorithm for solving engineering problems.*  
   > **Scientific Reports**, 13, 11281.  
   > DOI: [10.1038/s41598-023-38822-7](https://doi.org/10.1038/s41598-023-38822-7)

2. **Chimp Optimization Algorithm (ChOA)**:
   > Khishe, M., & Mosavi, M. R. (2020).  
   > *Chimp Optimization Algorithm: A New Nature-Inspired Approach for High-Dimensional Optimization.*  
   > **Expert Systems with Applications**, 149, 113338.  
   > DOI: [10.1016/j.eswa.2020.113338](https://doi.org/10.1016/j.eswa.2020.113338)

---

## 8. Catatan Batasan & Karakteristik Ilmiah

- **Visualisasi Topologi Kontur**: Menampilkan proyeksi ruang pencarian kontinu 2-Dimensi $(x_1, x_2)$ agar dapat diamati secara visual oleh mahasiswa dan peneliti secara intuitif. Engine algoritma internal mendukung evaluasi hingga dimensi $D$ arbitrer.
- **Sifat Stokastik**: Algoritma metaheuristik bersifat stokastik. Penggunaan seed acak yang berbeda akan menghasilkan lintasan pencarian yang bervariasi. Oleh karena itu, fitur Monte Carlo Multi-Trial disediakan untuk membuktikan signifikansi performa secara empiris.

---
*Dikembangkan untuk Symposium & Praktikum Mata Kuliah Optimasi / Algoritma Metaheuristik.*

