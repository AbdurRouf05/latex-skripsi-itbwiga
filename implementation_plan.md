# Penyempurnaan Dokumen Seminar Proposal (Sempro) LaTeX

## Konteks & Latar Belakang

Mas Abdur Rouf (NIM 223140118, ITB Widya Gama Lumajang) sedang mempersiapkan Seminar Proposal (Sempro) untuk skripsi berjudul:
> *"Rancang Bangun Aplikasi Presensi Karyawan Berbasis Mobile Menggunakan Arsitektur Offline-First dengan Flutter pada PT Semeru Agung Mandiri"*

**Fakta Kritis:** Aplikasi Flutter (`seagma-presensi`) **sudah selesai dibangun dan berjalan**. Namun, narasi dalam dokumen skripsi harus tetap menggunakan **kalimat akan datang (future tense)** seolah-olah sistem "akan dirancang dan dibangun". Ini adalah **praktik umum dan masuk akal** di skripsi S1 Teknik Informatika.

**Tahun Submit**: Gunakan `\yearsubmit{2026}`. User saat ini masih KKN, sempro/skripsi beberapa bulan lagi dari sekarang (Juli 2026).

**Dosen Pembimbing & Penguji**: Biarkan placeholder, user belum ketemu dosennya.

**S3 Minio**: Dikonfirmasi user bahwa PocketBase di VPS memang menggunakan S3 Minio sebagai storage backend untuk file foto. Sebutkan di Bab 3 bagian Arsitektur Infrastruktur Server.

---

## Hasil Audit Kode Aplikasi Flutter

> [!IMPORTANT]
> Informasi di bawah ini diperoleh dari membaca langsung kode sumber di `d:\coding\flutter\presensi\seagma-presensi\`. Agent pelaksana **HARUS** menggunakan data ini untuk memperkaya isi Bab 2 dan Bab 3.

### Tech Stack Sebenarnya (dari [pubspec.yaml](file:///d:/coding/flutter/presensi/seagma-presensi/pubspec.yaml))

| Komponen | Teknologi | Versi | Keterangan untuk Skripsi |
|---|---|---|---|
| Framework | Flutter + Dart | SDK ≥3.2.0 | Cross-platform mobile framework |
| State Management | **GetX** | 4.6.6 | Reactive state management + dependency injection |
| Local Database | **Isar** | ^3.1.0 | NoSQL object database, type-safe, sub-ms query |
| Backend / BaaS | **PocketBase** | ^0.23.3 | Open-source backend (Go-based), REST API + Realtime |
| File Storage | **S3 Minio** | Server-side | Object storage untuk foto presensi (via PocketBase) |
| Background Sync | **WorkManager** | ^0.9.0+3 | Android/iOS background task scheduler |
| Connectivity | **connectivity_plus** | ^6.0.0 | Network state observer |
| GPS | **Geolocator** | 11.0.0 | Geolocation + Geofencing |
| Maps | **flutter_map + LatLong2** | 6.1.0 | OpenStreetMap-based map widget |
| Camera | **camera + image_picker** | ^0.10.5 | Foto selfie bukti presensi |
| Time Sync | **ntp** | 2.0.0 | Validasi waktu dari server NTP (anti manipulasi jam) |
| Security | **flutter_secure_storage** + **safe_device** | — | Penyimpanan token aman + deteksi rooted device |
| Notification | **firebase_messaging** + **flutter_local_notifications** | — | Push notification & local notification |
| Export | **excel** + **pdf** + **csv** | — | Ekspor laporan multi-format |

### Arsitektur Kode (dari struktur `lib/`)

```
lib/
├── app/           → App-level config (routes, bindings)
├── core/          → Constants, errors, utils, widgets
├── data/
│   ├── models/    → 14 Isar collection models
│   ├── repositories/ → Repository pattern (local + remote)
│   ├── providers/    → Auth provider (PocketBase)
│   ├── managers/     → Business logic managers
│   └── mappers/      → Data transformation
├── modules/       → 12 feature modules (auth, attendance, history, admin, dll)
├── services/      → Core services layer
│   ├── isar_service.dart      → Facade pattern untuk 13 Isar collection
│   ├── sync_service.dart      → Orchestrator sinkronisasi (Timer 30s + WorkManager)
│   ├── sync/
│   │   ├── sync_queue_manager.dart    → 655 baris! Antrean sinkronisasi V2
│   │   ├── master_data_sync_manager.dart → Sinkronisasi data master
│   │   └── notification_sync_manager.dart → Sinkronisasi notifikasi
│   ├── location_service.dart  → GPS + Geofencing (Haversine)
│   ├── auth_service.dart      → Autentikasi PocketBase
│   ├── security_service.dart  → Anti-fake GPS, rooted device detection
│   └── wifi_service.dart      → WiFi BSSID verification
└── utils/         → Helper functions
```

### Mekanisme Offline-First yang Sudah Diimplementasikan

Berdasarkan audit [sync_queue_manager.dart](file:///d:/coding/flutter/presensi/seagma-presensi/lib/services/sync/sync_queue_manager.dart) dan [sync_service.dart](file:///d:/coding/flutter/presensi/seagma-presensi/lib/services/sync_service.dart):

1. **SyncQueueItem**: Setiap transaksi offline disimpan di Isar dengan `isSynced = false`, lalu ditambahkan ke antrean `SyncQueueItem`.
2. **SyncQueueManager** (655 baris): Memproses antrean dengan logika retry (max 3x), cascade sync (parent → child), dan deduplifikasi.
3. **SyncService**: Timer periodik 30 detik + WorkManager (background task setiap 20 menit) + auto-sync saat koneksi kembali + auto-sync saat app resume.
4. **Connectivity Observer**: Mendengarkan perubahan status jaringan secara reaktif via `connectivity_plus`.
5. **Dedup Check**: Sebelum create di server, sistem mengecek apakah record sudah ada (mencegah duplikasi).
6. **Cascade Sync**: Ketika parent (Attendance) berhasil sync, children (OvertimeClaim, LatenessReport, GamasRecord) otomatis di-queue.

---

## Inventaris Jurnal Penelitian Terdahulu (SUDAH DIMILIKI USER)

> [!IMPORTANT]
> Semua file PDF dan BibTeX sudah ada di folder [referensi/](file:///d:/coding/flutter/presensi/seagma-presensi/skripsi/template-skripsi-itbwiga/referensi). Nama file sudah direname agar rapi. Agent pelaksana **WAJIB** menggunakan data dari tabel di bawah.

### Jurnal #1: Offline-First Flutter + Firebase (Devina, 2026)

| Field | Nilai |
|---|---|
| **Judul** | Design and Implementation of an Offline-First Mobile Grocery Arisan Information System Using Flutter and Firebase |
| **Penulis** | Devina, Putri Eli Sandra Hasibuan, Dzikra Azzahra, Adetia Anggriani, Gunawan |
| **Penerbit** | NUANSA INFORMATIKA, Universitas Kuningan |
| **Vol/No/Tahun** | Vol. 20, No. 2, Juli 2026 |
| **Halaman** | 133–148 |
| **DOI** | 10.25134/ilkom.v20i2.582 |
| **URL** | https://journal.fkom.uniku.ac.id/ilkom/article/view/582 |
| **PDF Lokal** | `jurnal-devina-2026-offline-first-flutter-firebase.pdf` |
| **BibTeX Lokal** | `bibtex-devina-2026-offline-first-flutter.bib` |
| **Relevansi** | Implementasi arsitektur offline-first berbasis Flutter + Firebase dengan mekanisme sinkronisasi cloud |
| **Perbedaan** | Menggunakan Firebase (cloud), penelitian ini menggunakan PocketBase (self-hosted) + Isar (bukan Firestore) |

### Jurnal #2: Offline Mode + Sinkronisasi Absensi QR Code (Nadya & Lidya, 2025)

| Field | Nilai |
|---|---|
| **Judul** | Pengembangan Mode Offline dan Sinkronisasi Data pada Aplikasi Absensi Berbasis QR Code untuk Karyawan PT. Bintang Energi Pratama |
| **Penulis** | Nadya Kusuma Indah, Lidya Wati |
| **Penerbit** | JUTITI: Jurnal Teknik Informatika dan Teknologi Informasi |
| **Vol/No/Tahun** | Vol. 5, No. 2, Agustus 2025 |
| **Halaman** | 417–427 |
| **DOI** | 10.55606/jutiti.v5i2.5544 |
| **URL** | https://journalshub.org/index.php/jutiti |
| **ISSN** | E: 2827-9387, P: 2827-9379 |
| **PDF Lokal** | `jurnal-jutiti-2025-offline-sinkronisasi-absensi.pdf` |
| **BibTeX Lokal** | ❌ Belum ada, harus dibuat oleh agent |
| **Relevansi** | Sangat kuat! Sama-sama membahas mode offline + sinkronisasi data pada aplikasi absensi karyawan |
| **Perbedaan** | Menggunakan QR Code + metode RAD, penelitian ini menggunakan GPS Geofencing + Agile Scrum + Flutter |

### Jurnal #3: Clean Architecture + SOLID pada Flutter (Sinatria, 2023)

| Field | Nilai |
|---|---|
| **Judul** | Penerapan Clean Architecture dan SOLID Principle dalam Membangun Aplikasi Berbasis Mobile dengan Menggunakan Framework Google Flutter |
| **Penulis** | Mohammad Bijantium Sinatria, Oman Komarudin, Kamal Prihandani |
| **Penerbit** | INFOTECH Journal, Universitas Majalengka |
| **Vol/No/Tahun** | Vol. 9, No. 1, Mei 2023 |
| **Halaman** | 132–146 |
| **DOI** | 10.31949/infotech.v9i1.5237 |
| **URL** | https://ejournal.unma.ac.id/index.php/infotech/article/view/5237 |
| **PDF Lokal** | `jurnal-sinatria-2023-clean-architecture-flutter.pdf` |
| **BibTeX Lokal** | `bibtex-sinatria-2023-clean-architecture.bib` |
| **Relevansi** | Menjelaskan Clean Architecture + SOLID + Agile Scrum pada Flutter |
| **Perbedaan** | Fokus pada arsitektur saja, tidak membahas offline-first atau database lokal Isar |

### Jurnal #4: Clean Architecture Flutter + BLoC (William, 2024)

| Field | Nilai |
|---|---|
| **Judul** | Implementasi Clean Architecture Dalam Membangun Aplikasi Mobile Menggunakan Flutter |
| **Penulis** | William Prapdeson Laksono, Bagas Satria Tri Wicaksana, Abdurrahman Yusuf Wijasena, Yoga Sahria |
| **Penerbit** | Nusantara Journal of Multidisciplinary Science (Intekom) |
| **Vol/No/Tahun** | Vol. 1, No. 6, Januari 2024 |
| **Halaman** | 173–180 |
| **URL** | https://jurnal.intekom.id/index.php/njms/article/view/264 |
| **PDF Lokal** | `jurnal-william-2024-clean-architecture-flutter.pdf` |
| **BibTeX Lokal** | `bibtex-william-2024-clean-architecture.bib` |
| **Relevansi** | Menguji maintainability Clean Architecture pada Flutter dengan BLoC state management |
| **Perbedaan** | Menggunakan BLoC, penelitian ini menggunakan GetX. Tidak membahas offline-first |

### Jurnal #5: Clean Architecture Flutter Al-Quran (Azziqra, 2024)

| Field | Nilai |
|---|---|
| **Judul** | Implementasi Clean Architecture pada Aplikasi Mobile Al-Quran Berbasis Flutter |
| **Penulis** | M. Zihad Azziqra, Ilyas Nuryasin |
| **Penerbit** | JOISIE: Journal Of Information Systems And Informatics Engineering, Universitas Muhammadiyah Malang |
| **Vol/No/Tahun** | Vol. 8, No. 2, Desember 2024 |
| **Halaman** | 369–380 |
| **DOI** | 10.35145/joisie.v8i2.4763 |
| **ISSN** | P: 2503-5304, E: 2527-3116 |
| **PDF Lokal** | `jurnal-ramalia-presensi-flutter.pdf` |
| **BibTeX Lokal** | ❌ Belum ada, harus dibuat oleh agent |
| **Relevansi** | Mengukur maintainability (79% "baik") dari Clean Architecture pada Flutter menggunakan McCall's Quality Model |
| **Perbedaan** | Studi kasus berbeda (Al-Quran), tidak membahas offline-first atau database lokal |

### Jurnal #6: Presensi Mobile dengan Haversine (Ismail, 2023)

| Field | Nilai |
|---|---|
| **Judul** | Rancang Bangun Aplikasi Presensi Berbasis Mobile dengan Metode Haversine |
| **Penulis** | Ismail, Hadi Zakaria |
| **Penerbit** | LOGIC: Jurnal Ilmu Komputer dan Pendidikan |
| **Vol/No/Tahun** | Vol. 1, No. 5, Agustus 2023 |
| **Halaman** | 1355–1369 |
| **ISSN** | 2985-4172 (online) |
| **URL** | https://journal.mediapublikasi.id/index.php/logic |
| **PDF Lokal** | `jurnal-ismail-presensi-qr-offline.pdf` |
| **BibTeX Lokal** | ❌ Belum ada, harus dibuat oleh agent |
| **Relevansi** | Sama-sama membangun aplikasi presensi mobile menggunakan Haversine + Geolocator untuk validasi lokasi |
| **Perbedaan** | Tidak menggunakan Flutter atau arsitektur offline-first |

---

## Tabel Matriks Penelitian Terdahulu (untuk Bab 2)

> [!TIP]
> Agent pelaksana harus memasukkan tabel ini ke dalam `bab2.tex` pada section `\section{Penelitian Terdahulu}`. Format LaTeX `longtable` atau `tabularx` disarankan.

| No | Penulis (Tahun) | Judul | Framework | Database Lokal | Arsitektur | Offline-First | Geofencing |
|---|---|---|---|---|---|---|---|
| 1 | Devina et al. (2026) | Offline-First Mobile Grocery Arisan... | Flutter | Firebase Firestore | - | ✓ | ✗ |
| 2 | Nadya & Lidya (2025) | Pengembangan Mode Offline... Absensi QR Code | - | Local Storage | RAD | ✓ | ✗ |
| 3 | Sinatria et al. (2023) | Penerapan Clean Architecture... Flutter | Flutter | - | Clean Arch + SOLID | ✗ | ✗ |
| 4 | William et al. (2024) | Implementasi Clean Architecture... Flutter | Flutter | Local DB | Clean Arch + BLoC | ✗ | ✗ |
| 5 | Azziqra & Nuryasin (2024) | Clean Architecture Aplikasi Al-Quran | Flutter | - | Clean Arch + McCall | ✗ | ✗ |
| 6 | Ismail & Zakaria (2023) | Presensi Mobile Haversine | Mobile | - | - | ✗ | ✓ (Haversine) |
| **7** | **Penelitian ini (2026)** | **Presensi Karyawan Offline-First Flutter** | **Flutter** | **Isar** | **Clean Arch + GetX** | **✓** | **✓ (Haversine)** |

**Gap/Celah yang diisi oleh penelitian ini:**
- Belum ada penelitian yang menggabungkan **Flutter + Isar Database + Arsitektur Offline-First + GPS Geofencing** dalam satu sistem presensi karyawan.
- Penelitian terdahulu menggunakan Firebase (cloud-managed), sedangkan penelitian ini menggunakan **PocketBase (self-hosted)** + **S3 Minio** yang memberikan kendali penuh atas data perusahaan.
- Mekanisme sinkronisasi pada penelitian ini menggunakan **SyncQueue + Cascade Sync + Exponential Backoff**, yang lebih canggih daripada sinkronisasi sederhana pada penelitian terdahulu.

---

## Analisis GAP: Dokumen Saat Ini vs Standar Minimal Sempro

### Bab 1 - Pendahuluan

| Komponen | Status | Catatan |
|---|---|---|
| Latar Belakang | ✅ Ada | Sudah sangat bagus dan detail |
| Rumusan Masalah | ⚠️ Kurang | Hanya 1 rumusan. Minimal harus 2-3 |
| Batasan Masalah | ❌ TIDAK ADA | **WAJIB ditambahkan** |
| Tujuan Penelitian | ⚠️ Kurang | Hanya 1 tujuan. Harus sejajar dengan rumusan masalah |
| Manfaat Penelitian | ✅ Ada | Sudah cukup |

### Bab 2 - Tinjauan Pustaka

| Komponen | Status | Catatan |
|---|---|---|
| Landasan Teori: Offline-First | ✅ Ada | Teori CAP, CRDTs, Delta Sync |
| Landasan Teori: On-Premise vs Cloud | ✅ Ada | Tabel perbandingan |
| Landasan Teori: Database Lokal | ✅ Ada | Tabel komparasi 4 solusi |
| Landasan Teori: Clean Architecture | ✅ Ada | 3 lapisan |
| Landasan Teori: Flutter & Dart | ❌ TIDAK ADA | **WAJIB** |
| Landasan Teori: PocketBase (BaaS) | ❌ TIDAK ADA | **WAJIB** |
| Landasan Teori: GetX State Management | ❌ TIDAK ADA | **WAJIB** |
| Landasan Teori: Geofencing & GPS | ❌ TIDAK ADA | **WAJIB** (termasuk Haversine) |
| Landasan Teori: Metode Agile Scrum | ❌ TIDAK ADA | **WAJIB** |
| Penelitian Terdahulu | ❌ TIDAK ADA | **KRITIS! 6 jurnal sudah disiapkan** |

### Bab 3 - Metodologi

| Komponen | Status | Catatan |
|---|---|---|
| Kebutuhan Fungsional | ✅ Ada | Tabel F-01 s.d. F-09 |
| Metodologi Scrum + Sprint | ✅ Ada | 5 Sprint |
| Skema Database Isar | ⚠️ Kurang | Perlu potongan kode Dart |
| Algoritma Geofencing (Haversine) | ✅ Ada | Dengan formula LaTeX |
| Mekanisme Sinkronisasi | ✅ Ada | Naratif sudah baik |
| Teknik Pengumpulan Data | ❌ TIDAK ADA | **WAJIB** |
| Kebutuhan Non-Fungsional | ❌ TIDAK ADA | Sebaiknya ditambahkan |
| Arsitektur Infrastruktur | ❌ TIDAK ADA | **WAJIB** (termasuk S3 Minio) |

### Daftar Pustaka (BibTeX)

| Status | Catatan |
|---|---|
| ❌ KRITIS | File `daftar-pustaka.bib` masih berisi referensi FPGA/image processing bawaan template UNHAS. **Seluruh isinya harus diganti.** |

---

## Proposed Changes

### Komponen 1: Bab 1 - Pendahuluan

#### [MODIFY] [bab1.tex](file:///d:/coding/flutter/presensi/seagma-presensi/skripsi/template-skripsi-itbwiga/isi-bab/bab1.tex)

1. **Perbaiki Rumusan Masalah** — Ubah menjadi 3 rumusan (enumerate):
   - Bagaimana merancang arsitektur offline-first pada aplikasi presensi berbasis Flutter dengan database lokal Isar?
   - Bagaimana mekanisme sinkronisasi data presensi yang konsisten dari Isar (lokal) ke PocketBase (server) saat koneksi internet kembali tersedia?
   - Bagaimana memvalidasi lokasi presensi karyawan menggunakan GPS Geofencing (formula Haversine) secara lokal tanpa koneksi internet?

2. **Tambahkan `\section{Batasan Masalah}`** — Setelah Rumusan Masalah:
   - Aplikasi dikembangkan menggunakan framework Flutter untuk platform Android.
   - Database lokal menggunakan Isar Database. Backend menggunakan PocketBase.
   - Fitur utama: presensi masuk/pulang, validasi GPS Geofencing, riwayat kehadiran, sinkronisasi otomatis.
   - Tidak membahas sistem penggajian (payroll) secara mendalam.
   - Pengujian menggunakan metode Black-box Testing.
   - Studi kasus dilakukan pada PT Semeru Agung Mandiri, Lumajang.

3. **Perbaiki Tujuan Penelitian** — Pecah menjadi 3 tujuan sejajar dengan rumusan masalah.

4. **Fix LaTeX syntax**: Ubah `*request*` di line 42 menjadi `\textit{request}`.

5. **Ubah `\yearsubmit{2024}` menjadi `\yearsubmit{2026}`** di `seminar-proposal.tex`.

---

### Komponen 2: Bab 2 - Tinjauan Pustaka

#### [MODIFY] [bab2.tex](file:///d:/coding/flutter/presensi/seagma-presensi/skripsi/template-skripsi-itbwiga/isi-bab/bab2.tex)

Tambahkan section-section baru berikut (setelah section Clean Architecture yang sudah ada):

1. **`\section{Flutter dan Dart}`**:
   - Flutter sebagai framework cross-platform oleh Google (2018).
   - Widget tree, hot reload, kompilasi AOT.
   - Dart: null-safety, async/await, strong typing.
   - Cite: dokumentasi resmi Flutter.

2. **`\section{PocketBase sebagai Backend-as-a-Service}`**:
   - PocketBase: open-source backend berbasis Go, single binary.
   - REST API otomatis, autentikasi built-in, file storage (integrasi S3 Minio).
   - Alasan pemilihan: ringan, self-hosted, cocok untuk tim kecil/perusahaan yang ingin kendali data.

3. **`\section{GetX sebagai State Management}`**:
   - GetX: reactive state management, DI, route management untuk Flutter.
   - Perbandingan singkat: GetX vs Provider vs BLoC.
   - Alasan: boilerplate minimal, `Rx` variables, high performance.

4. **`\section{Sistem Presensi dan Validasi Geofencing}`**:
   - Definisi presensi digital.
   - Teori Geofencing: virtual boundary berdasarkan koordinat GPS.
   - **Pindahkan formula Haversine dari Bab 3 ke sini** (Haversine adalah teori, bukan metodologi).

5. **`\section{Metode Pengembangan Agile Scrum}`**:
   - Definisi Agile dan Scrum.
   - Roles, Artefak, Events.
   - Alasan pemilihan untuk proyek ini.

6. **`\section{Penelitian Terdahulu}`** — **PALING KRITIS**:
   - Masukkan tabel matriks dari 6 jurnal + penelitian ini (lihat tabel di atas).
   - Setiap jurnal harus punya paragraf narasi pendek yang menjelaskan: apa yang diteliti, metode, hasil, dan **perbedaan** dengan penelitian ini.
   - Tutup dengan paragraf yang menjelaskan **gap/celah** yang diisi.
   - **Gunakan data dari inventaris jurnal di atas.**

---

### Komponen 3: Bab 3 - Metodologi

#### [MODIFY] [bab3.tex](file:///d:/coding/flutter/presensi/seagma-presensi/skripsi/template-skripsi-itbwiga/isi-bab/bab3.tex)

1. **Tambahkan `\section{Teknik Pengumpulan Data}`** — Sebelum Spesifikasi Kebutuhan:
   - **Observasi**: Mengamati langsung kendala jaringan dan proses presensi di PT Semeru Agung Mandiri.
   - **Wawancara**: Tanya jawab dengan tim HRD mengenai kebutuhan dan kendala sistem lama.
   - **Studi Pustaka**: Jurnal, buku, dokumentasi resmi Flutter/Isar/PocketBase.

2. **Tambahkan `\section{Kebutuhan Non-Fungsional}`** — Setelah tabel Kebutuhan Fungsional:
   - NF-01: Aplikasi harus responsif (<2 detik waktu muat).
   - NF-02: Data presensi harus tersimpan aman di lokal saat offline.
   - NF-03: Sinkronisasi otomatis saat koneksi kembali.
   - NF-04: Mendukung Android 5.0 (API 21) ke atas.
   - NF-05: Autentikasi aman menggunakan token JWT.

3. **Perbaiki Skema Database Isar** — Tambahkan potongan kode Dart yang disederhanakan dari [attendance_model.dart](file:///d:/coding/flutter/presensi/seagma-presensi/lib/data/models/attendance_model.dart):
   ```dart
   @collection
   class AttendanceLocal {
     Id id = Isar.autoIncrement;
     String? odId;           // Server ID (null jika belum sinkron)
     late String userId;
     late DateTime checkInTime;
     DateTime? checkOutTime;
     double? lat, lng;       // Koordinat GPS
     bool isSynced = false;  // Flag sinkronisasi
     bool isOfflineEntry = false;
     late String deviceId;
   }
   ```

4. **Tambahkan `\section{Arsitektur Infrastruktur Sistem}`**:
   - Diagram 3-tier: Mobile (Flutter + Isar) → Internet → Server (PocketBase + S3 Minio di VPS).
   - Alur data: User check-in → Isar → SyncQueue → PocketBase REST API → File foto → S3 Minio.

5. **Pindahkan formula Haversine ke Bab 2** (ganti dengan referensi silang di Bab 3).

6. **Tambahkan `\section{Perancangan Antarmuka (Wireframe)}`**:
   - Placeholder `\textit{(Gambar wireframe akan dilampirkan oleh peneliti)}`.
   - Minimal: Login, Dashboard Karyawan, Halaman Presensi, Riwayat, Dashboard Admin.

---

### Komponen 4: Daftar Pustaka

#### [MODIFY] [daftar-pustaka.bib](file:///d:/coding/flutter/presensi/seagma-presensi/skripsi/template-skripsi-itbwiga/referensi/daftar-pustaka.bib)

**HAPUS SELURUH ISI LAMA** dan **GANTI** dengan entri BibTeX berikut. Agent pelaksana harus menyalin entri dari file `.bib` yang sudah ada di folder referensi, lalu menambahkan entri baru yang belum ada.

```bibtex
% ======================================================================
% JURNAL PENELITIAN TERDAHULU (6 jurnal)
% ======================================================================

% Jurnal #1: Devina et al. (2026) - Offline-First Flutter + Firebase
% SALIN DARI: bibtex-devina-2026-offline-first-flutter.bib
% Key yang digunakan: devina2026offlinefirst

% Jurnal #2: Nadya & Lidya (2025) - Offline Absensi QR Code
% BUAT BARU dengan data:
@article{nadya2025offlineabsensi,
  author  = {Nadya Kusuma Indah and Lidya Wati},
  title   = {Pengembangan Mode Offline dan Sinkronisasi Data pada Aplikasi Absensi Berbasis QR Code untuk Karyawan PT. Bintang Energi Pratama},
  journal = {JUTITI: Jurnal Teknik Informatika dan Teknologi Informasi},
  volume  = {5},
  number  = {2},
  pages   = {417--427},
  year    = {2025},
  month   = {Aug},
  doi     = {10.55606/jutiti.v5i2.5544},
  issn    = {2827-9387},
}

% Jurnal #3: Sinatria et al. (2023) - Clean Architecture + SOLID Flutter
% SALIN DARI: bibtex-sinatria-2023-clean-architecture.bib
% Key: sinatria2023cleanarchitecture

% Jurnal #4: William et al. (2024) - Clean Architecture + BLoC Flutter
% SALIN DARI: bibtex-william-2024-clean-architecture.bib
% Key: william2024cleanarchitecture

% Jurnal #5: Azziqra & Nuryasin (2024) - Clean Architecture Al-Quran
% BUAT BARU:
@article{azziqra2024cleanarchitecture,
  author  = {M. Zihad Azziqra and Ilyas Nuryasin},
  title   = {Implementasi Clean Architecture pada Aplikasi Mobile Al-Quran Berbasis Flutter},
  journal = {JOISIE: Journal Of Information Systems And Informatics Engineering},
  volume  = {8},
  number  = {2},
  pages   = {369--380},
  year    = {2024},
  month   = {Dec},
  doi     = {10.35145/joisie.v8i2.4763},
  issn    = {2527-3116},
}

% Jurnal #6: Ismail & Zakaria (2023) - Presensi Mobile + Haversine
% BUAT BARU:
@article{ismail2023presensihaversine,
  author  = {Ismail and Hadi Zakaria},
  title   = {Rancang Bangun Aplikasi Presensi Berbasis Mobile dengan Metode Haversine},
  journal = {LOGIC: Jurnal Ilmu Komputer dan Pendidikan},
  volume  = {1},
  number  = {5},
  pages   = {1355--1369},
  year    = {2023},
  month   = {Aug},
  issn    = {2985-4172},
  url     = {https://journal.mediapublikasi.id/index.php/logic},
}

% ======================================================================
% REFERENSI WEB / DOKUMENTASI (untuk \cite{} di Bab 1 & 2)
% ======================================================================

% Agent pelaksana harus mencari URL asli untuk referensi yang sudah
% di-cite di bab1.tex (mekari2024, hashmicro2024, stackademic2024,
% smarttechdevs2024, nair2020offline, researchgate2024_offline, polbeng2024).
% Gunakan search_web untuk memverifikasi dan menulis entri @misc yang benar.
% JANGAN MENGARANG URL FIKTIF.

% Contoh format:
% @misc{mekari2024,
%   author = {...},
%   title  = {...},
%   url    = {...},
%   year   = {2024},
%   note   = {Diakses pada 20 Juli 2026},
% }

% Tambahkan juga:
% @misc{flutter_docs, ...}    → https://docs.flutter.dev
% @misc{isar_docs, ...}       → https://isar.dev
% @misc{pocketbase_docs, ...} → https://pocketbase.io/docs
% @misc{getx_docs, ...}       → https://pub.dev/packages/get
```

> [!CAUTION]
> Agent pelaksana HARUS:
> 1. Menyalin isi dari 3 file `.bib` yang sudah ada (devina, sinatria, william) dan **membersihkan** HTML entities (`&amp;lt;`, `&amp;gt;`, dll.) dari field `abstractNote`.
> 2. Membuat entri baru untuk 3 jurnal yang belum ada BibTeX-nya (nadya, azziqra, ismail).
> 3. Mencari dan memverifikasi URL asli untuk 7 referensi web yang sudah di-cite di Bab 1 (`mekari2024`, `hashmicro2024`, dll.) menggunakan `search_web`.
> 4. **JANGAN MENGARANG referensi fiktif.** Jika tidak menemukan URL asli, buat `@misc` dengan URL yang paling mendekati.

---

### Komponen 5: Perbaikan Template

#### [MODIFY] [seminar-proposal.tex](file:///d:/coding/flutter/presensi/seagma-presensi/skripsi/template-skripsi-itbwiga/seminar-proposal.tex)

1. Ubah `\yearsubmit{2024}` → `\yearsubmit{2026}`.
2. Tambahkan `\usepackage{listings}` dan konfigurasi `lstset` untuk syntax highlighting Dart.
3. Tambahkan `\usepackage{longtable}` jika belum ada (untuk tabel Penelitian Terdahulu).

---

## Verification Plan

### Automated Tests
```bash
cd d:\coding\flutter\presensi\seagma-presensi\skripsi\template-skripsi-itbwiga
pdflatex -interaction=nonstopmode seminar-proposal.tex
biber seminar-proposal
pdflatex -interaction=nonstopmode seminar-proposal.tex
pdflatex -interaction=nonstopmode seminar-proposal.tex
```
- Compile harus sukses tanpa error fatal.
- Semua `\cite{...}` harus ter-resolve (tidak ada `[?]` di PDF).
- Daftar Pustaka harus terisi dengan benar.

### Manual Verification
- User membuka `seminar-proposal.pdf` dan memverifikasi:
  - Cover page menampilkan nama, NIM, judul, dan institusi yang benar.
  - Daftar Isi menampilkan semua bab dan section.
  - Semua tabel terformat dengan rapi.
  - Tabel Penelitian Terdahulu menampilkan 6 jurnal + penelitian ini.
  - Daftar Pustaka terisi dan nomor kutipan muncul di dalam teks.

### Git Push
```bash
cd d:\coding\flutter\presensi\seagma-presensi\skripsi
git add .
git commit -m "feat: Sempro lengkap - Bab 1-3 + Penelitian Terdahulu + Daftar Pustaka"
git push
```
