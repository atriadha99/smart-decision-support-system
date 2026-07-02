<div align="center">

# ⚡ Smart Decision Support System (SDSS)

### Sistem Pendukung Keputusan Universal Berbasis Web

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**SDSS** adalah aplikasi Sistem Pendukung Keputusan (SPK) universal berbasis web yang mendukung **7 metode analisis multi-kriteria** untuk studi kasus yang dinamis — mulai dari pemilihan laptop, karyawan terbaik, penerima beasiswa, hingga skenario apapun yang Anda butuhkan.

[Mulai Sekarang](#-quick-start) · [Fitur](#-fitur-utama) · [Screenshot](#-screenshot) · [Metode SPK](#-metode-spk) · [Arsitektur](#-arsitektur)

</div>

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Screenshot](#-screenshot)
- [Quick Start](#-quick-start)
- [Metode SPK](#-metode-spk)
- [Arsitektur](#-arsitektur)
- [Struktur Proyek](#-struktur-proyek)
- [Koneksi Database Cloud](#-koneksi-ke-neon-postgresql)
- [Rumus Teknis](#-rumus-teknis)
- [Tech Stack](#-tech-stack)
- [Informasi Pengembang](#-informasi-pengembang)

---

## ✨ Fitur Utama

<table>
<tr>
<td width="50%">

### 📊 Dashboard Analitik
Visualisasi lengkap studi kasus aktif:
- **Pie Chart** — Distribusi bobot kriteria
- **Radar Chart** — Profil performa alternatif
- **Bar Chart** — Perbandingan ranking keseluruhan
- Statistik ringkasan (jumlah studi, kriteria, alternatif, perhitungan)

</td>
<td width="50%">

### 🧮 7 Metode Perhitungan SPK
Visualisasi **step-by-step** matriks intermediat:
- **SAW** — Simple Additive Weighting
- **WP** — Weighted Product
- **TOPSIS** — Ideal Solution Similarity
- **SMART** — Multi-Attribute Rating Technique
- **Profile Matching** — GAP & Core/Secondary Factor
- **AHP** — Analytic Hierarchy Process
- **MOORA** — Multi-Objective Ratio Analysis

</td>
</tr>
<tr>
<td width="50%">

### 🗂️ Manajemen Studi Kasus Universal
- CRUD lengkap untuk studi kasus yang bersifat **dinamis**
- Satu sistem untuk **semua skenario keputusan**
- Search, pagination, dan status tracking
- Auto-seed data sample untuk demo instan

</td>
<td width="50%">

### ⚖️ Kriteria & AHP Weights Modeler
- CRUD kriteria dengan tipe **Benefit/Cost**
- Validasi otomatis total bobot (∑W = 1.0)
- Tombol **"Normalkan Bobot"** untuk normalisasi instan
- **Matriks perbandingan berpasangan AHP** interaktif
- Pengecekan **Consistency Ratio (CR < 0.1)** real-time

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Autentikasi Admin
- Route guard untuk operasi CRUD
- Halaman login dengan validasi form
- Mode baca publik (Dashboard & Perhitungan)
- **Default:** `admin@sdss.com` / `admin`

</td>
<td width="50%">

### 📤 Ekspor Laporan
- **Cetak PDF** langsung dari browser
- **Ekspor CSV** kompatibel Excel
- **Simpan log** perhitungan ke histori database
- Print-ready styles untuk output profesional

</td>
</tr>
</table>

### 🎨 Premium UI/UX

> Layout responsif **mobile-first**, dark mode, gradient banner, transisi halus, custom scrollbar, dan desain modern dengan font **Outfit** dari Google Fonts.

---

## 📸 Screenshot

### Halaman Dashboard

Dashboard utama menampilkan hero banner, statistik ringkasan, dan visualisasi chart untuk studi kasus aktif.

<div align="center">
<img src="docs/screenshots/dashboard.png" alt="Dashboard SDSS" width="90%"/>
</div>

### Halaman Login Admin

Form login admin dengan validasi, eye-toggle password, dan kredensial default untuk kemudahan demo.

<div align="center">
<img src="docs/screenshots/login.png" alt="Login Admin" width="70%"/>
</div>

### Manajemen Studi Kasus

Interface CRUD untuk mengelola studi kasus SPK dengan tabel, search, dan aksi (Edit/Hapus).

<div align="center">
<img src="docs/screenshots/case-management.png" alt="Manajemen Studi Kasus" width="90%"/>
</div>

### Manajemen Kriteria

Definisi kriteria penilaian dengan bobot, tipe benefit/cost, target value, dan core/secondary factor.

<div align="center">
<img src="docs/screenshots/criteria.png" alt="Manajemen Kriteria" width="90%"/>
</div>

### Manajemen Alternatif

Pengelolaan alternatif keputusan dengan nama, deskripsi, dan kategori.

<div align="center">
<img src="docs/screenshots/alternatives.png" alt="Manajemen Alternatif" width="90%"/>
</div>

### Input Penilaian (Scoring Matrix)

Grid interface untuk mengisi nilai evaluasi setiap alternatif terhadap semua kriteria.

<div align="center">
<img src="docs/screenshots/scoring.png" alt="Scoring Matrix" width="90%"/>
</div>

### Perhitungan & Hasil

Jalankan perhitungan SPK, pilih metode, dan lihat hasil ranking beserta langkah intermediat.

<div align="center">
<img src="docs/screenshots/calculation.png" alt="Perhitungan & Hasil" width="90%"/>
</div>

---

## 🚀 Quick Start

### Prasyarat

- [**Node.js**](https://nodejs.org/) v18 atau lebih baru
- **NPM** (sudah termasuk dalam Node.js)

### Instalasi & Jalankan

```bash
# 1. Clone repository
git clone https://github.com/username/smart-decision-support-system.git
cd smart-decision-support-system

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev
```

🌐 Buka browser ke **http://localhost:5173**

> **💡 Catatan:** Aplikasi langsung berjalan dalam **mode Local Storage** dan otomatis menyediakan data sample (Pemilihan Laptop & Pemilihan Karyawan Terbaik) sehingga fungsional tanpa konfigurasi tambahan.

### 🔑 Kredensial Admin

| Field | Value |
|---|---|
| **Email** | `admin@sdss.com` |
| **Password** | `admin` |

---

## 🧮 Metode SPK

SDSS mendukung **7 metode perhitungan** Sistem Pendukung Keputusan, lengkap dengan visualisasi step-by-step:

| # | Metode | Singkatan | Pendekatan |
|---|---|---|---|
| 1 | Simple Additive Weighting | **SAW** | Normalisasi linear + penjumlahan berbobot |
| 2 | Weighted Product | **WP** | Perkalian berpangkat bobot |
| 3 | Technique for Order Preference by Similarity to Ideal Solution | **TOPSIS** | Jarak ke solusi ideal positif & negatif |
| 4 | Simple Multi-Attribute Rating Technique | **SMART** | Utility range-scaling + bobot |
| 5 | Profile Matching | **PM** | GAP analysis + Core/Secondary Factor |
| 6 | Analytic Hierarchy Process | **AHP** | Perbandingan berpasangan + konsistensi |
| 7 | Multi-Objective Optimization on the basis of Ratio Analysis | **MOORA** | Optimasi rasio multi-objektif |

Setiap metode menampilkan:
- ✅ Matriks keputusan awal
- ✅ Matriks normalisasi
- ✅ Matriks berbobot
- ✅ Perhitungan intermediat (jarak, utility, GAP, dll.)
- ✅ Tabel ranking akhir

---

## 🏗️ Arsitektur

### Dual-Adapter Database

SDSS menggunakan arsitektur **Dual-Adapter Database** yang memungkinkan aplikasi berjalan dalam dua mode tanpa perubahan kode:

```
┌─────────────────────────────────────────────────────┐
│                    SDSS Frontend                     │
│              (React + Vite + Tailwind)               │
└───────────────────────┬─────────────────────────────┘
                        │
                   ┌────▼────┐
                   │ client  │  ← Auto-detects env var
                   │  .js    │
                   └────┬────┘
                        │
            ┌───────────┼───────────┐
            │                       │
   ┌────────▼────────┐    ┌────────▼────────┐
   │  Local Storage  │    │ Neon PostgreSQL  │
   │    Adapter      │    │    Adapter       │
   │  (Default)      │    │  (Cloud Mode)    │
   └────────┬────────┘    └────────┬────────┘
            │                       │
   ┌────────▼────────┐    ┌────────▼────────┐
   │ Browser Storage │    │ Neon Serverless  │
   │  (Instant Use)  │    │   PostgreSQL     │
   └─────────────────┘    └─────────────────┘
```

**Cara kerja:**
- Jika `VITE_NEON_DATABASE_URL` **tidak ada** atau berisi `placeholder` → **Local Storage mode** (default)
- Jika `VITE_NEON_DATABASE_URL` **aktif** → **Neon PostgreSQL mode** (cloud)

### Routing & Guard

```
/              → Dashboard (Public)
/calculate     → Perhitungan & Hasil (Public)
/login         → Halaman Login (Standalone)
/studies       → Manajemen Studi Kasus (Admin Only)
/criteria      → Manajemen Kriteria (Admin Only)
/alternatives  → Manajemen Alternatif (Admin Only)
/scores        → Input Penilaian (Admin Only)
```

---

## 📁 Struktur Proyek

```
smart-decision-support-system/
│
├── 📂 public/
│   └── favicon.ico
│
├── 📂 src/
│   ├── 📂 components/                  # Komponen UI Bersama
│   │   ├── Layout.jsx                  #   Layout utama (Sidebar + Content)
│   │   ├── Modal.jsx                   #   Komponen dialog modal
│   │   └── ThemeToggle.jsx             #   Toggle dark/light mode
│   │
│   ├── 📂 context/                     # React Context Providers
│   │   ├── AuthContext.jsx             #   State & logic autentikasi
│   │   ├── DatabaseContext.jsx         #   State database & studi aktif
│   │   └── ThemeContext.jsx            #   State tema (dark/light)
│   │
│   ├── 📂 db/                          # Database Layer
│   │   ├── client.js                   #   ⭐ Dual-adapter manager
│   │   ├── neonClient.js              #   Koneksi Neon PostgreSQL
│   │   ├── schema.sql                  #   Schema SQL & indexes
│   │   ├── seed.sql                    #   Data seed PostgreSQL
│   │   └── supabaseClient.js           #   Koneksi Supabase (opsional)
│   │
│   ├── 📂 pages/                       # Halaman Aplikasi
│   │   ├── Dashboard.jsx               #   Dashboard & analitik
│   │   ├── CaseManagement.jsx          #   CRUD studi kasus
│   │   ├── CriteriaManagement.jsx      #   CRUD kriteria + AHP Modeler
│   │   ├── AlternativeManagement.jsx   #   CRUD alternatif
│   │   ├── ScoringMatrix.jsx           #   Input matriks penilaian
│   │   ├── CalculationPage.jsx         #   Perhitungan & hasil SPK
│   │   └── LoginPage.jsx               #   Login admin
│   │
│   ├── 📂 utils/                       # Algoritma Inti SPK
│   │   ├── saw.js                      #   Simple Additive Weighting
│   │   ├── wp.js                       #   Weighted Product
│   │   ├── topsis.js                   #   TOPSIS
│   │   ├── smart.js                    #   SMART
│   │   ├── pm.js                       #   Profile Matching
│   │   ├── ahp.js                      #   Analytic Hierarchy Process
│   │   └── moora.js                    #   MOORA
│   │
│   ├── App.jsx                         # Route declarations & admin guards
│   ├── App.css                         # Custom styles
│   ├── index.css                       # Tailwind base & print CSS
│   └── main.jsx                        # DOM mounting
│
├── .env                                # Environment variables
├── capacitor.config.json               # Capacitor mobile config
├── package.json                        # Dependencies & scripts
├── tailwind.config.js                  # Custom theme & Outfit font
├── postcss.config.js                   # PostCSS config
├── vite.config.js                      # Vite config
└── README.md                           # Dokumentasi ini
```

---

## ☁️ Koneksi ke Neon PostgreSQL

Untuk menjalankan aplikasi dengan database cloud **Neon Serverless PostgreSQL**:

### 1️⃣ Jalankan SQL Migration

Buka **Neon Console** > **SQL Editor**, lalu jalankan:

```sql
-- File: src/db/schema.sql
-- Membuat 5 tabel: studies, criteria, alternatives, scores, calculations
-- Beserta indexes untuk performa query
```

Opsional, jalankan `src/db/seed.sql` untuk data sample.

### 2️⃣ Konfigurasi Environment Variable

Edit file `.env` di root proyek:

```env
VITE_NEON_DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### 3️⃣ Restart Dev Server

```bash
# Ctrl+C untuk stop, lalu
npm run dev
```

Aplikasi otomatis mendeteksi environment variable dan beralih ke mode database cloud. Cek console browser untuk konfirmasi:

```
[SDSS DB ADAPTER] Active database mode: "NEON"
```

---

## 📐 Rumus Teknis

<details>
<summary><b>SAW — Simple Additive Weighting</b></summary>

**Normalisasi (R):**
- Benefit: `R_ij = x_ij / max(x_kj)`
- Cost: `R_ij = min(x_kj) / x_ij`

**Skor Preferensi:**
- `V_i = Σ(w_j × R_ij)`

</details>

<details>
<summary><b>WP — Weighted Product</b></summary>

**Vektor S:**
- `S_i = Π(x_ij ^ w'_j)` — dimana `w'_j` negatif untuk kriteria cost

**Vektor V:**
- `V_i = S_i / Σ(S_k)`

</details>

<details>
<summary><b>TOPSIS — Ideal Solution Similarity</b></summary>

**Normalisasi:**
- `R_ij = x_ij / √(Σ x_kj²)`

**Solusi Ideal:**
- `A⁺` = max (benefit), min (cost)
- `A⁻` = min (benefit), max (cost)

**Jarak & Preferensi:**
- `D⁺_i = √(Σ(V_ij - A⁺_j)²)`
- `D⁻_i = √(Σ(V_ij - A⁻_j)²)`
- `C_i = D⁻_i / (D⁺_i + D⁻_i)`

</details>

<details>
<summary><b>SMART — Multi-Attribute Rating Technique</b></summary>

**Utility:**
- Benefit: `U_ij = 100 × (x_ij - min) / (max - min)`
- Cost: `U_ij = 100 × (max - x_ij) / (max - min)`

**Nilai Akhir:**
- `V_i = Σ(w_j × U_ij)`

</details>

<details>
<summary><b>Profile Matching — GAP Analysis</b></summary>

**GAP:**
- `GAP_ij = x_ij - Target_j`

**Mapping GAP → Bobot:**
- 0 → 5.0, ±1 → 4.5/4.0, ±2 → 3.5/3.0, dst.

**Total Skor:**
- `Total_i = 0.6 × CF_i + 0.4 × SF_i`

</details>

<details>
<summary><b>AHP — Analytic Hierarchy Process</b></summary>

**Bobot Eigenvector:**
- Priority vector = rata-rata baris matriks ternormalisasi

**Konsistensi:**
- `CI = (λ_max - n) / (n - 1)`
- `CR = CI / RI` — Konsisten jika `CR < 0.1`

**Tabel Random Index (RI):**
| n | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|
| RI | 0.58 | 0.90 | 1.12 | 1.24 | 1.32 | 1.41 | 1.45 | 1.49 |

</details>

<details>
<summary><b>MOORA — Multi-Objective Ratio Analysis</b></summary>

**Normalisasi:**
- `R_ij = x_ij / √(Σ x_kj²)`

**Nilai Optimasi:**
- `y_i = Σ V_ij(benefit) - Σ V_ij(cost)`
- dimana `V_ij = R_ij × w_j`

</details>

---

## 🛠️ Tech Stack

| Kategori | Teknologi | Fungsi |
|---|---|---|
| ⚛️ Frontend | **React 19** | UI library |
| ⚡ Build Tool | **Vite 8** | Bundler & dev server |
| 🎨 Styling | **Tailwind CSS 3** | Utility-first CSS |
| 🧭 Routing | **React Router 7** | Client-side navigation |
| 📊 Charts | **Recharts 3** | Pie, Bar, Radar charts |
| 📝 Forms | **React Hook Form 7** | Form management |
| ✅ Validation | **Zod 4** | Schema validation |
| 🎯 Icons | **Lucide React** | Modern icon library |
| 🐘 Database | **Neon PostgreSQL** | Serverless cloud DB |
| 💾 Fallback DB | **Local Storage** | Browser-based storage |
| 📱 Mobile | **Capacitor 8** | Cross-platform build |

---

## 👨‍💻 Informasi Pengembang

| | |
|---|---|
| **Nama** | Andika Agung Triadha |
| **NIM** | 231011400165 |

---

<div align="center">

**⭐ Star repository ini jika bermanfaat!**

Dibuat dengan ❤️ menggunakan React + Vite + Tailwind CSS

</div>
