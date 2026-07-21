# Blueprint Skripsi: Aplikasi Presensi Karyawan (Offline-First)

**Judul Terpilih:**
> *Rancang Bangun Aplikasi Presensi Karyawan Berbasis Mobile dengan Pendekatan Offline-First menggunakan Metode Agile Scrum di PT Semeru Agung Mandiri*

Dokumen ini berisi panduan, ide, dan pemetaan (mapping) antara teori akademis dan implementasi teknis pada kode aplikasi `seagma-presensi`. Dokumen ini dapat dibaca oleh Anda atau AI lain di masa depan untuk membantu menyusun setiap Bab pada Skripsi.

---

## 1. Apa yang Biasanya Ada di Skripsi? (Struktur Umum)

Skripsi bidang *Software Engineering* umumnya terdiri dari 5 Bab. Berikut adalah rinciannya dan apa yang harus Anda isi:

### BAB 1: Pendahuluan
*   **Latar Belakang:** Mengapa PT Semeru Agung Mandiri butuh aplikasi ini? Misalnya: proses presensi masih manual atau sistem yang ada sering gagal saat koneksi internet buruk (blank spot). Oleh karena itu, diusulkan solusi *Offline-First*.
*   **Rumusan Masalah:** Bagaimana merancang dan membangun aplikasi presensi *offline-first* menggunakan Flutter dan metode Agile Scrum?
*   **Batasan Masalah:** Aplikasi hanya berjalan di Android/iOS, fitur sebatas presensi (check-in/out) dengan geolocation/foto, menggunakan database lokal Isar.
*   **Tujuan & Manfaat:** Memudahkan karyawan absen di mana saja meski tanpa kuota/sinyal, dan memudahkan HRD merekap data.

### BAB 2: Tinjauan Pustaka & Landasan Teori
*   *Bagian ini murni teori dari buku/jurnal. AI bisa dengan mudah membuatkan ini nanti.*
*   **Teori yang harus dimasukkan:** Presensi, HRIS, *Offline-First Synchronization*, Flutter & Dart, *Clean Architecture*, *GetX* (State Management), Database *Isar*, *Metode Agile Scrum*.

### BAB 3: Metodologi Penelitian & Perancangan Sistem
*   **Metodologi Agile Scrum:** Jelaskan tahapan *Sprint* yang Anda lakukan (mulai dari *Product Backlog* hingga *Sprint Review*).
*   **Perancangan Sistem (UML):**
    *   *Use Case Diagram:* Interaksi Karyawan dan Admin/HRD.
    *   *Activity Diagram:* Alur saat karyawan tekan tombol "Absen", sistem mengecek GPS, mengecek koneksi, jika *offline* simpan di Isar, jika *online* kirim ke server.
*   **Perancangan Arsitektur:** Diagram *Clean Architecture* (Data, Domain, Presentation).
*   **Perancangan Database:** Skema koleksi database Isar Anda.

### BAB 4: Implementasi dan Pengujian
*   **Implementasi Antarmuka (UI):** Screenshot halaman login, halaman presensi, riwayat absen.
*   **Implementasi Kode (Bagian Paling Penting):** Penjelasan potongan kode (snippet) yang menunjukkan *Offline-First* dan *Clean Architecture*. (Lihat bagian 2 di bawah).
*   **Pengujian:** 
    *   *Black-box Testing*: Menguji tombol dan input berfungsi atau tidak.
    *   *UAT (User Acceptance Test)*: Bukti bahwa karyawan PT Semeru Agung Mandiri menerima aplikasi ini (biasanya pakai kuesioner).

### BAB 5: Kesimpulan dan Saran
*   Kesimpulan bahwa aplikasi berhasil dibangun dengan *offline-first* dan mempercepat proses presensi.

---

## 2. Apa yang Bisa Dijadikan Bahan Skripsi dari Kode Aplikasi Ini?

Nilai jual utama (Selling Point) aplikasi Anda di mata dosen penguji terletak pada teknik *coding* yang Anda gunakan. Saat menyusun **BAB 3 dan BAB 4**, fokuslah membahas bagian kode ini:

### A. Pola *Offline-First* (Sangat Penting)
Jangan sekadar bilang "bisa dipakai offline". Tunjukkan algoritmanya:
1.  **Cek Koneksi:** Kode di mana aplikasi mendeteksi apakah HP sedang terhubung internet atau tidak.
2.  **Save to Local (Isar):** Tunjukkan *repository code* di mana jika internet mati, data absensi (jam, titik GPS) di-insert ke dalam Isar Database secara lokal.
3.  **Background Sync / Auto-Sync:** Tunjukkan kode di mana saat HP kembali terkoneksi internet, aplikasi secara otomatis mengunggah data absen yang tersimpan di Isar ke server (API).

### B. Clean Architecture
Skripsi Anda akan sangat berbobot jika Anda menampilkan bahwa kode Anda terstruktur dengan standar industri, bukan sekadar *spaghetti code*.
*   Bahas pemisahan direktori: `lib/domain` (berisi *entities* & *use cases*), `lib/data` (berisi *models* & *repositories* untuk API/Isar), dan `lib/presentation` (berisi UI/Screen & GetX Controllers).
*   Jelaskan mengapa ini dilakukan: Agar jika suatu saat database (Isar) atau state management (GetX) diganti, logika bisnis (Domain) tidak perlu dirombak ulang.

### C. State Management (GetX)
*   Jelaskan bagaimana GetX membuat UI menjadi reaktif. Misalnya: Saat status koneksi berubah dari *Offline* ke *Online*, UI langsung mengupdate tulisan "Data Belum Tersinkron" menjadi "Tersinkronisasi" tanpa perlu me-reload halaman.

---

## 3. Saran & Cara Mengembangkan Dokumen Ini ke Depannya

1.  **Jadikan Folder `skripsi` sebagai Brain (Otak):** Saya telah menaruh dokumen ini di `skripsi/BLUEPRINT_SKRIPSI.md`. Anda bisa menambahkan file baru nantinya, misalnya `BAB_1_DRAFT.md`, `BAB_2_TEORI.md`, dst.
2.  **Minta Bantuan AI Tahap Demi Tahap:** Jangan meminta AI membuat 1 skripsi full sekaligus. Lakukan secara spesifik, contohnya (Prompt yang bisa Anda berikan nanti):
    *   *"Tolong buatkan draf Latar Belakang untuk Bab 1 berdasarkan Blueprint kita."*
    *   *"Tolong buatkan teks penjelasan untuk Bab 4 tentang bagaimana file `attendance_repository.dart` di kode saya menangani proses offline-first."*
3.  **Siapkan UML:** AI berbasis teks sulit menggambar UML dengan sempurna. Anda sebaiknya menggambar *Use Case* dan *Activity Diagram* di draw.io atau diagram.net, lalu simpan di folder `skripsi/images/` agar dokumentasinya rapi.

Dokumen ini akan menjadi jangkar (anchor) agar AI manapun yang membaca repository Anda akan langsung paham konteks skripsi yang sedang dibangun.
