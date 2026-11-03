# PENCERDASAN TEKNIS: LABORATORIUM OPTIMASI METAHEURISTIK (OOA & ChOA)

Dokumen ini disusun sebagai materi pembelajaran komprehensif tanpa perumpamaan atau analogi. Seluruh penjelasan disajikan secara langsung, teknis, dan berbasis logika matematika serta arsitektur komputasi perangkat lunak.

---

## DAFTAR ISI
1. [Fondasi Konsep: Optimasi dan Metaheuristik](#1-fondasi-konsep-optimasi-dan-metaheuristik)
2. [Fungsi Uji Matematika (Benchmark Functions)](#2-fungsi-uji-matematika-benchmark-functions)
3. [Algoritma 1: Osprey Optimization Algorithm (OOA)](#3-algoritma-1-osprey-optimization-algorithm-ooa)
4. [Algoritma 2: Chimp Optimization Algorithm (ChOA)](#4-algoritma-2-chimp-optimization-algorithm-choa)
5. [Alur Kerja (Flow) Sistem dari Awal hingga Akhir](#5-alur-kerja-flow-sistem-dari-awal-hingga-akhir)
6. [Struktur dan Isi Kode Proyek Secara Lengkap](#6-struktur-dan-isi-kode-proyek-secara-lengkap)
7. [Relevansi Proyek dengan Mata Kuliah Cloud Computing](#7-relevansi-proyek-dengan-mata-kuliah-cloud-computing)
8. [Panduan Operasional dan Cara Membaca Output Sistem](#8-panduan-operasional-dan-cara-membaca-output-sistem)

---

## 1. FONDASI KONSEP: OPTIMASI DAN METAHEURISTIK

### 1.1 Definisi Masalah Optimasi Numerik
Optimasi numerik adalah proses matematis untuk mencari nilai-nilai variabel input:
$$\mathbf{x} = [x_1, x_2, \dots, x_D]$$
dalam ruang pencarian berdimensi $D$ yang dibatasi oleh batas bawah ($lb$) dan batas atas ($ub$):
$$x_d \in [lb_d, ub_d], \quad \forall d \in \{1, 2, \dots, D\}$$
sehingga menghasilkan nilai minimum dari suatu fungsi objektif $f(\mathbf{x})$:
$$\min_{\mathbf{x}} f(\mathbf{x})$$

Nilai $f(\mathbf{x})$ disebut sebagai **nilai fitness** (nilai evaluasi). Dalam masalah minimasi:
- Semakin kecil nilai $f(\mathbf{x})$, semakin baik kualitas solusi tersebut.
- Solusi terbaik global dilambangkan dengan $\mathbf{x}^*$ dengan nilai fitness $f(\mathbf{x}^*)$.

### 1.2 Mengapa Menggunakan Algoritma Metaheuristik?
Metode optimasi deterministik klasik (seperti *Gradient Descent* atau *Newton-Raphson*) bergantung pada turunan parsial pertama dan kedua ($\nabla f(\mathbf{x})$). Metode klasik memiliki batasan berikut:
1. Memerlukan fungsi yang terdiferensiasi (memiliki turunan matematis yang kontinu).
2. Rentan berhenti pada **minimum lokal** (*local minimum*) ketika fungsi memiliki banyak puncak dan lembah, sehingga gagal menemukan **minimum global** (*global minimum*).

Metaheuristik adalah metode pencarian berbasis populasi dan peluang stokastik (acak) yang tidak membutuhkan gradien atau turunan fungsi. Algoritma ini mengevaluasi nilai fungsi objektif secara langsung (*black-box optimization*).

### 1.3 Dua Prinsip Utama Pencarian Metaheuristik
Setiap algoritma metaheuristik membagi pergerakan partikelnya ke dalam dua mekanisme:
1. **Eksplorasi (Diversifikasi)**: Kemampuan algoritma untuk menjelajahi area-area baru yang berjauhan di seluruh domain ruang pencarian $[lb, ub]$. Tujuannya adalah mendeteksi wilayah-wilayah potensial dan menghindari jebakan minimum lokal.
2. **Eksploitasi (Intensifikasi)**: Kemampuan algoritma untuk mempersempit pencarian di sekitar area solusi terbaik yang sudah ditemukan. Tujuannya adalah menyempurnakan presisi solusi mendekati titik optimal.

---

## 2. FUNGSI UJI MATEMATIKA (BENCHMARK FUNCTIONS)

Proyek ini menyediakan 4 fungsi uji matematika standar yang diimplementasikan pada berkas `js/benchmarks/functions.js`. Keempat fungsi ini digunakan untuk menguji performa eksplorasi dan eksploitasi algoritma:

| Nama Fungsi | Karakteristik Matematis | Batas Domain ($[lb, ub]$) | Titik Minimum Global ($\mathbf{x}^*$) | Nilai Minimum Global ($f(\mathbf{x}^*)$) |
| :--- | :--- | :--- | :--- | :--- |
| **Sphere** | Unimodal (Satu lembah tunggal) | $[-5.12, 5.12]$ | $(0, 0)$ | $0.0$ |
| **Rastrigin** | Multimodal (Banyak lembah lokal reguler) | $[-5.12, 5.12]$ | $(0, 0)$ | $0.0$ |
| **Rosenbrock** | Lembah parabolik sempit non-linear | $[-2.048, 2.048]$ | $(1, 1)$ | $0.0$ |
| **Ackley** | Multimodal dengan pusat curam | $[-5.0, 5.0]$ | $(0, 0)$ | $0.0$ |

### Penjelasan Teknis Masing-Masing Fungsi:

1. **Sphere Function**:
   $$f(\mathbf{x}) = \sum_{i=1}^{D} x_i^2$$
   - Bentuk permukaan: Mangkuk cembung simetris.
   - Fungsi ini hanya memiliki 1 titik minimum global dan tidak memiliki minimum lokal.
   - **Tujuan pengujian**: Menguji kecepatan konvergensi eksploitasi algoritma saat tidak ada hambatan minimum lokal.

2. **Rastrigin Function**:
   $$f(\mathbf{x}) = 10D + \sum_{i=1}^{D} \left[ x_i^2 - 10\cos(2\pi x_i) \right]$$
   - Bentuk permukaan: Datar secara global namun bergelombang secara periodik karena fungsi kosinus. Memiliki puluhan hingga ratusan titik minimum lokal di sekitarnya.
   - **Tujuan pengujian**: Menguji kemampuan eksplorasi global algoritma agar partikel tidak terperangkap pada lembah lokal buatan gelombang kosinus.

3. **Rosenbrock Function (Rosenbrock's Valley)**:
   $$f(\mathbf{x}) = \sum_{i=1}^{D-1} \left[ 100(x_{i+1} - x_i^2)^2 + (1 - x_i)^2 \right]$$
   - Bentuk permukaan: Memiliki lembah parabolik panjang dan melengkung dengan dinding curam dan dasar lembah yang hampir rata.
   - Menemukan lembah relatif mudah, namun bergerak di sepanjang dasar lembah menuju titik minimum $(1, 1)$ membutuhkan penyesuaian langkah yang sangat kecil.
   - **Tujuan pengujian**: Menguji adaptabilitas ukuran langkah partikel pada kontur yang tidak seimbang (*ill-conditioned*).

4. **Ackley Function**:
   $$f(\mathbf{x}) = -20\exp\left(-0.2\sqrt{\frac{1}{D}\sum_{i=1}^D x_i^2}\right) - \exp\left(\frac{1}{D}\sum_{i=1}^D \cos(2\pi x_i)\right) + 20 + e$$
   - Bentuk permukaan: Area luar berupa bidang bergelombang frekuensi tinggi yang hampir datar, kemudian di bagian tengah $(0, 0)$ terdapat kawah yang menurun secara eksponensial.
   - **Tujuan pengujian**: Menguji transisi algoritma dari fase pencarian global di area luar menuju eksploitasi cepat di dalam lubang kawah.

---

## 3. ALGORITMA 1: OSPREY OPTIMIZATION ALGORITHM (OOA)

Algoritma OOA dipublikasikan oleh Mohammad Dehghani, Pavel Trojovský, dan Eva Trojovská pada tahun 2023 di jurnal *Scientific Reports* (Nature Publishing Group).

### 3.1 Representasi Agen
Populasi terdiri dari $N$ agen, di mana setiap agen $i$ ($i = 1, 2, \dots, N$) memiliki posisi vektor koordinat dalam ruang berdimensi $D$:
$$X_i = [x_{i,1}, x_{i,2}, \dots, x_{i,D}]$$
Setiap posisi memiliki nilai evaluasi $fit_i = f(X_i)$. Posisi dengan nilai fitness terkecil disimpan sebagai $X_{best}$.

### 3.2 Tahapan Matematis OOA Per Iterasi

Pada setiap iterasi $t$ (dari $t = 1$ hingga $T_{max}$), setiap agen $i$ mengalami dua fase pembaruan:

#### Fase 1: Eksplorasi Global (Position Identification & Hunting)
1. Dibuat himpunan posisi kandidat $FP_i$ yang berisi agen-agen yang memiliki nilai fitness lebih baik daripada agen $i$, ditambah solusi terbaik saat ini ($X_{best}$):
   $$FP_i = \{X_k \mid fit_k < fit_i\} \cup \{X_{best}\}$$
2. Dipilih satu kandidat target $SF_i$ secara acak seragam dari himpunan $FP_i$.
3. Koordinat baru dimensi ke-$d$ dihitung dengan rumus:
   $$x_{i,d}^{P1} = x_{i,d} + r_{1} \cdot (SF_{i,d} - I \cdot x_{i,d})$$
   di mana:
   - $r_1$ adalah bilangan acak riil seragam: $r_1 \in [0, 1]$.
   - $I$ adalah faktor impuls stokastik bilangan bulat yang bernilai 1 atau 2: $I = \text{round}(1 + r_2)$, dengan $r_2 \in [0, 1]$.
   - $SF_{i,d}$ adalah koordinat dimensi ke-$d$ dari target yang dipilih.
4. Nilai dibatasi ke batas domain:
   $$x_{i,d}^{P1} = \max(lb_d, \min(ub_d, x_{i,d}^{P1}))$$
5. **Seleksi Elitis (Greedy Selection Tahap 1)**:
   Hitung $fit_i^{P1} = f(X_i^{P1})$.
   $$\text{Jika } fit_i^{P1} < fit_i, \quad \text{maka } X_i = X_i^{P1} \text{ dan } fit_i = fit_i^{P1}$$

#### Fase 2: Eksploitasi Lokal (Carrying to the Perch)
1. Menghitung posisi baru di sekitar koordinat saat ini dengan radius pencarian yang mengecil secara linier terhadap iterasi $t$:
   $$x_{i,d}^{P2} = x_{i,d} + \frac{lb_d + r_3 \cdot (ub_d - lb_d)}{t}$$
   di mana $r_3 \in [0, 1]$ dan $t$ adalah indeks iterasi saat ini ($1, 2, \dots, T_{max}$).
   Pembagi $t$ memastikan bahwa pada iterasi awal ($t$ kecil), pergeseran koordinat lebih besar, dan pada iterasi akhir ($t$ besar), pergeseran koordinat mengecil untuk penyempurnaan lokal.
2. Nilai dibatasi ke batas domain:
   $$x_{i,d}^{P2} = \max(lb_d, \min(ub_d, x_{i,d}^{P2}))$$
3. **Seleksi Elitis (Greedy Selection Tahap 2)**:
   Hitung $fit_i^{P2} = f(X_i^{P2})$.
   $$\text{Jika } fit_i^{P2} < fit_i, \quad \text{maka } X_i = X_i^{P2} \text{ dan } fit_i = fit_i^{P2}$$

---

## 4. ALGORITMA 2: CHIMP OPTIMIZATION ALGORITHM (ChOA)

Algoritma ChOA dipublikasikan oleh M. Khishe dan M. R. Mosavi pada tahun 2020 di jurnal *Expert Systems with Applications* (Elsevier).

### 4.1 Struktur Hierarki Sosial 4 Agen Terbaik
Pada setiap iterasi, seluruh populasi diurutkan berdasarkan nilai fitness terendah. Empat agen terbaik dialokasikan sebagai pemandu posisi:
1. $X_\alpha$ (Alpha): Agen peringkat 1 (solusi terbaik saat ini).
2. $X_\beta$ (Beta): Agen peringkat 2.
3. $X_\gamma$ (Gamma): Agen peringkat 3.
4. $X_\delta$ (Delta): Agen peringkat 4.

### 4.2 Tahapan Matematis ChOA Per Iterasi

Pada setiap iterasi $t$, faktor peluruhan dinamis $f$ diturunkan secara linier dari 2.5 ke 0:
$$f = 2.5 - \left( 2.0 \times \frac{t}{T_{max}} \right)$$

Untuk setiap agen $i$, sistem mengevaluasi probabilitas strategi acak $\mu \in [0, 1]$:

#### Kondisi A: $\mu < 0.5$ (Kooperasi 4 Agen Pemimpin)
Setiap dimensi $d$ dari agen $i$ menghitung jarak dan koordinat proyeksi terhadap 4 agen pemimpin:

1. **Pengaruh Alpha**:
   $$a_1 = 2f \cdot r_{1a} - f, \quad c_1 = 2 \cdot r_{2a}, \quad m_1 \in \{0.5, 1.0\}$$
   $$D_\alpha = |c_1 \cdot x_{\alpha, d} - m_1 \cdot x_{i,d}|$$
   $$X_{1,d} = x_{\alpha, d} - a_1 \cdot D_\alpha$$

2. **Pengaruh Beta**:
   $$a_2 = 2f \cdot r_{1b} - f, \quad c_2 = 2 \cdot r_{2b}, \quad m_2 \in \{0.5, 1.0\}$$
   $$D_\beta = |c_2 \cdot x_{\beta, d} - m_2 \cdot x_{i,d}|$$
   $$X_{2,d} = x_{\beta, d} - a_2 \cdot D_\beta$$

3. **Pengaruh Gamma**:
   $$a_3 = 2f \cdot r_{1g} - f, \quad c_3 = 2 \cdot r_{2g}, \quad m_3 \in \{0.5, 1.0\}$$
   $$D_\gamma = |c_3 \cdot x_{\gamma, d} - m_3 \cdot x_{i,d}|$$
   $$X_{3,d} = x_{\gamma, d} - a_3 \cdot D_\gamma$$

4. **Pengaruh Delta**:
   $$a_4 = 2f \cdot r_{1d} - f, \quad c_4 = 2 \cdot r_{2d}, \quad m_4 \in \{0.5, 1.0\}$$
   $$D_\delta = |c_4 \cdot x_{\delta, d} - m_4 \cdot x_{i,d}|$$
   $$X_{4,d} = x_{\delta, d} - a_4 \cdot D_\delta$$

Posisi akhir agen $i$ adalah rata-rata sentroid dari keempat proyeksi tersebut:
$$x_{i,d}^{baru} = \frac{X_{1,d} + X_{2,d} + X_{3,d} + X_{4,d}}{4}$$

#### Kondisi B: $\mu \ge 0.5$ (Perturbasi Chaotic Drive)
Jika nilai probabilitas $\ge 0.5$, koordinat dihitung menggunakan fungsi peta kekacauan (*Chaotic Sinusoidal Map*) untuk mencegah stagnasi konvergensi:
$$c_{map} = \sin(\pi \cdot r_{chaos})$$
$$x_{i,d}^{baru} = lb_d + |c_{map}| \cdot (ub_d - lb_d)$$

Seluruh koordinat kemudian dibatasi (*clamping*) ke domain $[lb_d, ub_d]$, dan nilai fitness dihitung ulang. Pada akhir iterasi, status 4 agen pemimpin ($X_\alpha, X_\beta, X_\gamma, X_\delta$) diperbarui berdasarkan fitness terbaru.

---

## 5. ALUR KERJA (FLOW) SISTEM DARI AWAL HINGGA AKHIR

Berikut adalah diagram alir matematis dan komputasi yang dijalankan oleh mesin simulasi:

```
[Pengguna Menentukan Parameter]
(PopSize N, MaxIter T, Fungsi Benchmark, Seed Acak, Kecepatan)
                     │
                     ▼
[Inisialisasi Pembangkit Acak Deterministik (LCG)]
                     │
                     ▼
[Inisialisasi Populasi Agen Awal]
X[i][d] = lb[d] + rand() * (ub[d] - lb[d])
                     │
                     ▼
[Evaluasi Nilai Fitness Awal]
Hitung f(X[i]) untuk seluruh i = 1..N
Tetapkan Solusi Terbaik Global (X_best, f_best)
                     │
                     ▼
┌───────────────> [Loop Iterasi: t = 1 sampai T]
│                    │
│                    ▼
│         [Apakah Algoritma == OOA?]
│         ├── YA:
│         │   1. Fase 1: Pilih target dari himpunan FP_i.
│         │      Update koordinat X_P1, clamp ke domain.
│         │      Evaluasi f(X_P1), terapkan Greedy Selection.
│         │   2. Fase 2: Hitung radius penyusutan lokal (1/t).
│         │      Update koordinat X_P2, clamp ke domain.
│         │      Evaluasi f(X_P2), terapkan Greedy Selection.
│         │
│         └── TIDAK (ChOA):
│             1. Urutkan populasi, ambil 4 agen terbaik (Alpha, Beta, Gamma, Delta).
│             2. Hitung faktor peluruhan f = 2.5 - (2 * t / T).
│             3. Untuk setiap agen, jika rand() < 0.5:
│                Hitung sentroid 4 pemimpin: (X1 + X2 + X3 + X4) / 4.
│                Jika rand() >= 0.5:
│                Hitung koordinat menggunakan chaotic map sin(pi * r).
│             4. Evaluasi f(X_baru) dan perbarui koordinat.
│                    │
│                    ▼
│         [Pembaruan Status Solusi Global]
│         Jika ada agen dengan f(X) < f_best:
│             f_best = f(X)
│             X_best = X
│         Simpan f_best ke array ConvergenceHistory
│                    │
│                    ▼
│         [Rendering Antarmuka Web (60 FPS)]
│         1. Gambar kontur 2D fungsi dan posisi titik agen di Canvas.
│         2. Gambar garis kurva konvergensi log10(f_best) di Canvas Grafik.
│         3. Perbarui teks telemetri: Iterasi, Best Fitness, NFE, Mean, StdDev.
│                    │
│                    ▼
│         [Cek Batas Iterasi]
└──────── t < T ? Lanjut ke t = t + 1
                     │
                     ▼ (t == T)
         [Simulasi Selesai]
         Tampilkan status konvergensi final
```

---

## 6. STRUKTUR DAN ISI KODE PROYEK SECARA LENGKAP

Berikut adalah penjelasan fungsional dari setiap berkas kode yang ada di repositori:

### 6.1 `index.html`
Berkas markup HTML5 yang menyusun antarmuka visual. Terdiri dari 7 seksi utama:
1. `#overview`: Penjelasan latar belakang optimasi metaheuristik dan parameter dasar.
2. `#ooa-osprey`: Landasan teori OOA, persamaan matematika, pseudocode, dan simulasi visual perilaku perburuan elang.
3. `#choa-chimp`: Landasan teori ChOA, persamaan matematika hierarki 4 kasta, pseudocode, dan simulasi visual dinamika sentroid simpanse.
4. `#interactive-lab`: Panel kontrol laboratorium (dropdown fungsi uji, slider populasi, slider iterasi, input seed, tombol Play/Pause/Step/Reset), canvas peta kontur 2D, canvas kurva konvergensi logaritmik, dan kartu telemetri data real-time.
5. `#comparison`: Panel komparasi berdampingan untuk mengeksekusi OOA dan ChOA secara bersamaan pada seed dan kondisi yang identik, dilengkapi canvas grafik kurva konvergensi ganda dan tabel perbandingan metrik.
6. `#experiment`: Laboratorium pengujian Monte Carlo batch (5, 10, atau 30 replikasi independen) dengan kalkulasi statistik otomatis dan tombol ekspor hasil ke format CSV.
7. `#references`: Daftar pustaka rujukan jurnal akademik resmi (Nature Scientific Reports dan Elsevier).

### 6.2 `css/styles.css`
Menyediakan modifikasi visual pelengkap:
- Styling scrollbar browser agar selaras dengan tema monograf.
- Penyesuaian tata letak persamaan matematika KaTeX agar responsif pada layar kecil.
- Efek transisi tombol dan bayangan kontainer visualisasi.

### 6.3 `js/benchmarks/functions.js`
Mendefinisikan objek `BENCHMARKS` yang berisi 4 fungsi uji matematika:
- Setiap fungsi memiliki properti: `id`, `name`, `type`, `domain` ($[lb, ub]$), `formulaLatex`, `optimumCoord`, dan `optimumVal`.
- Menyediakan metode perhitungan:
  - `eval2D(x, y)`: Menghitung nilai fungsi pada koordinat 2 dimensi untuk plotting kontur cepat.
  - `evalND(vec)`: Menghitung nilai fungsi pada vektor berdimensi $D$ arbitrer.

### 6.4 `js/algorithms/ooa.js`
Berisi kelas `OspreyOptimizer`:
- `constructor(config)`: Menyimpan konfigurasi $N$, $D$, domain, $T_{max}$, fungsi evaluasi, dan fungsi RNG.
- `init()`: Menginisialisasi $N$ agen pada koordinat acak seragam dan menghitung fitness awal.
- `step()`: Menjalankan 1 iterasi algoritma OOA (Fase 1 Eksplorasi Global + Fase 2 Eksploitasi Lokal + Seleksi Elitis).
- `runAll()`: Menjalankan seluruh iterasi dari awal hingga selesai tanpa jeda waktu untuk keperluan komparasi batch cepat.
- `getState()`: Mengembalikan snapshot data saat ini (posisi seluruh agen, posisi terbaik, rata-rata fitness, nilai terburuk, standar deviasi, NFE, dan riwayat konvergensi).

### 6.5 `js/algorithms/choa.js`
Berisi kelas `ChimpOptimizer`:
- `constructor(config)`: Menyimpan konfigurasi dan status referensi untuk 4 agen kasta: `alpha`, `beta`, `gamma`, dan `delta`.
- `init()`: Menginisialisasi agen dan menetapkan 4 kasta pertama melalui metode `updateRoles()`.
- `updateRoles()`: Mengurutkan array populasi berdasarkan fitness dan menetapkan agen indeks 0 sebagai $\alpha$, indeks 1 sebagai $\beta$, indeks 2 sebagai $\gamma$, dan indeks 3 sebagai $\delta$.
- `getChaoticValue()`: Menghasilkan nilai acak berbasis peta kekacauan $\sin(\pi r)$.
- `step()`: Menghitung faktor peluruhan $f$, memproses pergerakan agen berdasarkan sentroid 4 pemimpin atau chaotic drive, serta memperbarui kasta.
- `runAll()` dan `getState()`: Menyediakan fungsi eksekusi penuh dan pengambilan status data.

### 6.6 `js/simulation/engine.js`
Berisi dua kelas:
1. `SeededRNG`:
   - Algoritma pembangkit bilangan acak semu deterministik berbasis *Linear Congruential Generator* (LCG):
     $$X_{n+1} = (a \cdot X_n + c) \pmod m$$
     dengan parameter $a = 1664525$, $c = 1013904223$, dan $m = 2^{32}$.
   - Memastikan bahwa jika pengguna memasukkan angka seed yang sama (misalnya 42), urutan bilangan acak yang dihasilkan akan 100% identik sehingga eksperimen dapat direplikasi secara ilmiah.
2. `SimulationEngine`:
   - Mengatur status eksekusi (`isRunning`, `play()`, `pause()`, `step()`, `reset()`).
   - Mengatur interval pewaktu (`setInterval`) berdasarkan slider kecepatan (milidetik per iterasi).
   - Mengirimkan event callback (`onStep`, `onReset`, `onComplete`) ke antarmuka pengguna.

### 6.7 `js/visualization/canvas.js`
Berisi modul rendering visual berbasis HTML5 Canvas 2D API:
- `ContourRenderer`:
  - Menghitung nilai fungsi $f(x, y)$ pada grid piksel canvas dan merender peta elevasi warna (skala abu-abu/warna kontur).
  - Menggambar garis kontur isoline berjarak konstan.
  - Menggambar lingkaran posisi agen partikel secara real-time pada setiap iterasi.
  - Menandai titik solusi terbaik global ($X^*$) dengan lingkaran penanda khusus.
- `OoaHuntingWidget` & `ChoaConvergenceWidget`:
  - Menampilkan visualisasi dinamis 2D dari perilaku pergerakan partikel untuk seksi teori OOA dan ChOA.

### 6.8 `js/visualization/charts.js`
Berisi modul grafik konvergensi:
- `ConvergenceChart`:
  - Menggambar sistem sumbu koordinat kartesius 2D.
  - Sumbu X: Iterasi ($0$ hingga $T_{max}$).
  - Sumbu Y: Skala logaritmik dari nilai fitness terbaik:
    $$y_{plot} = \log_{10}(f(X^*))$$
    Transformasi logaritmik digunakan karena nilai fitness sering kali mengecil dari orde ribuan ($10^3$) menuju orde desimal kecil ($10^{-10}$), yang tidak dapat terlihat jelas pada skala linier biasa.
- `DualConvergenceChart`:
  - Menggambar dua kurva konvergensi sekaligus dalam satu bidang koordinat (garis merah untuk OOA dan garis biru untuk ChOA) untuk analisis komparasi langsung.

### 6.9 `js/experiments/runner.js`
Berisi kelas `ExperimentRunner`:
- `runBatch({ benchKey, popSize, maxIter, trialsCount, baseSeed })`:
  - Menjalankan pengujian berulang (*multi-trial*) sebanyak 5, 10, atau 30 kali secara independen tanpa jeda render canvas.
  - Pada setiap trial $t$, seed dihitung secara deterministik: $\text{trialSeed} = \text{baseSeed} + t \times 83$.
  - OOA dan ChOA dijalankan pada seed yang sama persis untuk menjaga keadilan evaluasi.
  - Menghitung selisih performa: $\Delta = \text{Best}_{OOA} - \text{Best}_{ChOA}$.
  - Menentukan pemenang trial: Algoritma dengan nilai fitness akhir terkecil dinyatakan menang.
- `getSummaryStats()`:
  - Menghitung metrik agregat: Nilai Terendah (*Min*), Nilai Rata-rata (*Mean*), Nilai Tertinggi (*Max*), dan Standar Deviasi (*Standard Deviation*) dari kumpulan trial.
- `exportToCSV()`:
  - Mengonversi data tabel hasil pengujian ke teks berformat CSV (*Comma-Separated Values*) sesuai standar RFC 4180.
  - Membuka unduhan berkas CSV langsung di browser pengguna.

### 6.10 `js/app.js`
Modul utama yang menghubungkan elemen DOM antarmuka dengan seluruh modul JavaScript:
- Mengaitkan event klik tombol antarmuka (`#btnRun`, `#btnPause`, `#btnStep`, `#btnReset`).
- Mengaitkan perubahan slider (`#popSizeInput`, `#maxIterInput`, `#speedInput`, `#seedInput`).
- Memperbarui label metrik pada kartu telemetri:
  - Iterasi saat ini ($t / T$).
  - Nilai fitness terbaik ($f(X^*)$).
  - Koordinat solusi terbaik ($x_1^*, x_2^*$).
  - Evaluasi fungsi kumulatif (NFE).
  - Standar deviasi posisi populasi.

### 6.11 `js/navigation.js`
Mengatur perilaku antarmuka:
- Memantau posisi gulir jendela browser untuk mengaktifkan tautan navbar yang sesuai (*scroll-spy*).
- Menghitung persentase posisi halaman untuk memperbarui panjang bilah `#scrollProgressBar` di bagian atas layar.
- Mengatur pembukaan dan penutupan drawer menu pada layar ponsel pintar.
- Menangani klik tombol salin (*copy button*) pada blok kode pseudocode.

---

## 7. RELEVANSI PROYEK DENGAN MATA KULIAH CLOUD COMPUTING

Meskipun isi aplikasi ini adalah algoritma optimasi metaheuristik, arsitektur perangkat lunaknya merepresentasikan pilar-pilar penting dalam rekayasa sistem Cloud Computing modern:

### 7.1 Pola Arsitektur Client-Side Compute (Jamstack / SPA)
1. **Pemisahan Antara Distribusi dan Komputasi**:
   - Dalam arsitektur web tradisional berbiaya tinggi, kalkulasi matematika berat dikirimkan ke server backend (misalnya server komputasi Python atau C++).
   - Proyek ini menggunakan paradigma **Client-Side Heavy Computing**, di mana server cloud hanya bertindak sebagai penyedia berkas statis (HTML, CSS, JS). Seluruh beban instruksi CPU/GPU dialihkan ke browser klien.
2. **Efisiensi Biaya Operasional Cloud ($0 Server Compute Cost)**:
   - Karena server tidak memproses eksekusi algoritma, biaya komputasi server cloud adalah nol. Server tidak membutuhkan instans virtual machine (seperti AWS EC2) yang menyala secara berkelanjutan.

### 7.2 Model Distribusi Cloud: Static Web Hosting & Edge CDN
Aplikasi ini dirancang untuk di-deploy ke infrastruktur cloud modern berbasis penyimpanan objek (*Object Storage*) dan jaringan pengiriman konten (*Content Delivery Network / CDN*):
- **Contoh Layanan Cloud**: GitHub Pages, AWS S3 + CloudFront, Cloudflare Pages, Firebase Hosting, atau Google Cloud Storage.
- **Mekanisme Kerja**: Berkas statis di-cache pada ratusan server tepi (*Edge Server*) di seluruh dunia. Ketika pengguna mengakses alamat website, aset dikirimkan dari lokasi server terdekat dengan latensi minimal.

### 7.3 Potensi Eskalasi Menuju Arsitektur Cloud Terdistribusi
Dalam skenario komputasi skala industri (misalnya optimasi penjadwalan jaringan cloud dengan dimensi $D = 1000$ dan populasi $N = 100.000$):
- Modul `runner.js` pada proyek ini dapat ditransformasikan menjadi fungsi serverless di cloud:
  - **Function-as-a-Service (FaaS)**: Setiap trial Monte Carlo dijalankan secara paralel di instans terpisah menggunakan AWS Lambda atau Google Cloud Run.
  - **Message Queue**: Pekerjaan didistribusikan melalui antrean pesan seperti AWS SQS atau Google Cloud Pub/Sub.
  - **Penyimpanan Hasil**: Data hasil eksekusi batch otomatis disimpan ke cloud database (seperti DynamoDB atau Firestore) atau cloud storage dalam bentuk berkas CSV/Parquet.

---

## 8. PANDUAN OPERASIONAL DAN CARA MEMBACA OUTPUT SISTEM

### 8.1 Cara Mengoperasikan Laboratorium Interaktif
1. Buka website di browser.
2. Gulir ke bagian **"Interactive Lab"**.
3. **Pilih Fungsi Uji**: Pilih salah satu dari dropdown (`Sphere`, `Rastrigin`, `Rosenbrock`, atau `Ackley`). Peta kontur 2D akan langsung diperbarui.
4. **Pilih Algoritma**: Klik tombol pilihan `OOA (Osprey)` atau `ChOA (Chimp)`.
5. **Atur Parameter**:
   - *Ukuran Populasi ($N$)*: Jumlah partikel agen pencari (misal: 30 agen).
   - *Iterasi Maksimum ($T$)*: Batas langkah pengulangan pencarian (misal: 50 iterasi).
   - *Seed Acak*: Angka dasar untuk pembangkit bilangan acak (misal: 42).
6. **Jalankan Simulasi**:
   - Klik **"Jalankan (Run)"** untuk memulai simulasi otomatis.
   - Klik **"Jeda (Pause)"** untuk menghentikan sementara.
   - Klik **"Langkah Tunggal (Step)"** untuk mengeksekusi 1 iterasi saja guna mengamati perpindahan agen secara mendetail.
   - Klik **"Reset"** untuk mengembalikan populasi ke posisi acak awal.

### 8.2 Cara Membaca Panel Telemetri dan Grafik
Saat simulasi berjalan, perhatikan indikator berikut:
- **Best Fitness $f(X^*)$**:
  Nilai fungsi terkecil yang berhasil ditemukan sejauh ini. Nilai ideal untuk seluruh fungsi uji pada proyek ini adalah mendekati `0.00000000`. Semakin mendekati nol, semakin optimal solusinya.
- **Koordinat Solusi $(x_1^*, x_2^*)$**:
  Lokasi koordinat dari agen terbaik saat ini. Pada fungsi Sphere, Rastrigin, dan Ackley, koordinat target adalah $(0, 0)$. Pada fungsi Rosenbrock, koordinat target adalah $(1, 1)$.
- **NFE (Number of Function Evaluations)**:
  Total berapa kali fungsi uji dipanggil oleh sistem:
  - Pada OOA: $NFE = N + 2 \times N \times t$ (karena OOA mengevaluasi fungsi dua kali per agen per iterasi pada Fase 1 dan Fase 2).
  - Pada ChOA: $NFE = N + N \times t$ (karena ChOA mengevaluasi fungsi satu kali per agen per iterasi).
  NFE menunjukkan biaya komputasi yang dihabiskan algoritma untuk mencapai solusi tersebut.
- **Kurva Konvergensi**:
  - Garis grafik yang menurun menandakan algoritma berhasil menemukan solusi yang lebih baik seiring bertambahnya iterasi.
  - Garis grafik yang mendatar sebelum mencapai nilai nol menandakan algoritma mengalami stagnasi (terjebak pada minimum lokal atau kehabisan daya eksplorasi).

### 8.3 Cara Menjalankan Eksperimen Komparasi Monte Carlo
1. Gulir ke bagian **"Eksperimen Monte Carlo"**.
2. Pilih jumlah replikasi pengujian: **5 Replikasi**, **10 Replikasi**, atau **30 Replikasi**.
3. Klik tombol **"Jalankan Batch Eksperimen"**.
4. Sistem akan mengeksekusi pengujian secara instan pada latar belakang tanpa animasi canvas.
5. Tabel akan menampilkan metrik dari masing-masing trial untuk OOA vs ChOA.
6. Kolom **Pemenang** menunjukkan algoritma mana yang memperoleh fitness akhir lebih kecil pada trial tersebut.
7. Klik tombol **"Ekspor Hasil ke CSV"** untuk mengunduh berkas tabel data yang dapat dibuka menggunakan Microsoft Excel, Python Pandas, atau Google Sheets.

