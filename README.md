# Skripsi: Aplikasi Presensi Karyawan Mobile (Offline-First)

Repositori ini berisi draf dokumen dan _source code_ LaTeX untuk penyusunan Proposal Skripsi (dan nantinya Skripsi akhir) Program Studi S1 Teknik Informatika di **Institut Teknologi dan Bisnis Widya Gama Lumajang**.

## Pemberitahuan Penggunaan
Template dan repositori ini adalah milik pribadi Abdur Rouf dan dibuat secara spesifik untuk kebutuhan penulisan skripsi aplikasi presensi PT Semeru Agung Mandiri. Jika Anda ingin menggunakan atau mengadopsi template dan isi repositori ini, ada banyak bagian (termasuk identitas, nama instansi, data aplikasi, dan konfigurasi) yang perlu Anda ubah dan sesuaikan dengan kebutuhan Anda sendiri.

## Judul Penelitian
**"RANCANG BANGUN APLIKASI PRESENSI KARYAWAN BERBASIS MOBILE MENGGUNAKAN ARSITEKTUR OFFLINE-FIRST DENGAN FLUTTER PADA PT SEMERU AGUNG MANDIRI"**

## Identitas Penulis
- **Nama:** Abdur Rouf
- **NIM:** 223140118
- **Program Studi:** S1 Teknik Informatika
- **Fakultas:** Teknik
- **Institusi:** Institut Teknologi dan Bisnis Widya Gama Lumajang
- **Tahun:** 2025/2026

## Latar Belakang dan Tujuan
Penelitian ini bertujuan untuk mengatasi masalah gagal absensi akibat _blank spot_ jaringan internet di lapangan atau gudang PT Semeru Agung Mandiri. Aplikasi dibangun menggunakan framework **Flutter** dengan pendekatan arsitektur **Offline-First**, memanfaatkan database lokal (Isar) untuk menyimpan data presensi secara luring, lalu melakukan sinkronisasi otomatis ke server (PocketBase) saat koneksi internet kembali stabil.

## Struktur Repositori
- `template-skripsi-itbwiga/` : Berisi template LaTeX resmi dan seluruh file `.tex` untuk Bab 1, 2, 3, dan daftar pustaka.
- `BLUEPRINT_SKRIPSI.md` : Rencana dan cetak biru pengembangan aplikasi skripsi.
- `PANDUAN_SKRIPSI_ITB_WIGA.md` : Panduan format penulisan skripsi ITB WiGa.
- `implementation_plan.md` : Rencana implementasi teknis.

## Panduan Setup dan Penggunaan LaTeX
Dokumen skripsi ini disusun menggunakan LaTeX untuk memastikan format dokumen yang rapi dan standar. Berikut adalah panduan setup dan cara penggunaannya:

### 1. Setup Lingkungan Kerja (Lokal)
Jika Anda ingin mengedit dan mengkompilasi dokumen di komputer Anda sendiri (seperti menggunakan VS Code):
- **Langkah 1: Instal TeX Distribution**
  - Untuk pengguna Windows, unduh dan instal [MiKTeX](https://miktex.org/download) atau [TeX Live](https://tug.org/texlive/).
  - Pastikan Anda memilih opsi instalasi _"Install missing packages on the fly = Yes"_ agar MiKTeX mengunduh package yang kurang secara otomatis.
- **Langkah 2: Instal Text Editor (VS Code)**
  - Unduh dan instal [Visual Studio Code](https://code.visualstudio.com/).
- **Langkah 3: Instal Ekstensi LaTeX Workshop**
  - Di VS Code, buka menu Extensions, cari **LaTeX Workshop** (oleh James Yu), lalu instal.
- **Langkah 4: Konfigurasi Biber (Untuk Daftar Pustaka)**
  - Karena template ini menggunakan Biber untuk manajemen pustaka (bukan BibTeX lama), pastikan `biber` sudah terinstal (biasanya sudah otomatis disertakan di instalasi MiKTeX/TeX Live).

### 2. Cara Penulisan dan Pengeditan Dokumen
- **Data Diri dan Judul**: Semua pengaturan nama, judul skripsi, nama dosen pembimbing, penguji, fakultas, dsb., diatur di dalam file utama, yaitu `seminar-proposal.tex` atau `skripsi.tex`. Silakan buka file tersebut dan ubah variabel seperti `\fullname{}`, `\titleskripsi{}`, dll.
- **Isi Bab (Bab 1, 2, 3, dst)**: Teks utama skripsi Anda ditulis di dalam folder `isi-bab/` (misalnya `isi-bab/bab1.tex`, `isi-bab/bab2.tex`). Template utama akan memanggil file-file ini secara otomatis menggunakan sintaks `\input{isi-bab/bab1.tex}`.
- **Daftar Pustaka**: Tambahkan referensi jurnal/buku Anda ke dalam file `referensi/daftar-pustaka.bib` dengan format BibTeX. Untuk memanggil sitasi di dalam teks, gunakan sintaks `\textcite{id-referensi}` atau `\parencite{id-referensi}`.
- **Logo dan Gambar**: Masukkan semua gambar ke folder `gambar/`. Template sampul akan otomatis mencari logo di lokasi ini (contoh: `gambar/logo wiga.png`). Jika ukuran logo perlu diubah, Anda bisa mengaturnya di file `pengaturan/skripsi.cls`.

### 3. Cara Kompilasi (Build) Dokumen menjadi PDF
Setelah Anda selesai mengedit teks, Anda harus mengkompilasinya menjadi file `.pdf`.

#### Opsi A: Menggunakan VS Code (Lokal - Disarankan)
1. Buka file `seminar-proposal.tex` (atau `skripsi.tex`) di VS Code.
2. Simpan file (`Ctrl+S`). LaTeX Workshop biasanya akan otomatis mulai mengkompilasi file tersebut.
3. Jika daftar pustaka tidak muncul, Anda perlu menjalankan _Recipe_ secara penuh: Klik ikon *LaTeX Workshop* di bilah samping kiri -> Pilih **Build LaTeX project** -> Klik **Recipe: pdflatex -> biber -> pdflatex -> pdflatex**.
4. Untuk melihat hasil PDF di sebelah kanan teks editor, klik tombol *View LaTeX PDF* (ikon kaca pembesar) di pojok kanan atas.

#### Opsi B: Melalui Terminal (Lokal - Manual)
Buka terminal (Command Prompt / PowerShell), arahkan ke folder `template-skripsi-itbwiga`, lalu jalankan urutan perintah ini:
```bash
pdflatex seminar-proposal.tex
biber seminar-proposal
pdflatex seminar-proposal.tex
pdflatex seminar-proposal.tex
```

#### Opsi C: Menggunakan Overleaf (Cloud - Tanpa Instalasi)
Jika Anda tidak ingin repot menginstal aplikasi dan plugin LaTeX di komputer:
1. Kompres seluruh isi folder `template-skripsi-itbwiga/` menjadi file `.zip`.
2. Buat proyek baru di [Overleaf](https://www.overleaf.com) dan unggah file `.zip` tersebut.
3. Buka file `seminar-proposal.tex`, lalu tekan tombol hijau **Recompile** di atas layar. Hasil PDF akan langsung muncul. Pastikan pengaturan *Compiler* diatur ke **pdfLaTeX** (lewat menu kiri atas).

## Catatan
Repository ini difokuskan pada manajemen dokumen penulisan akademik (draf skripsi). _Source code_ dari aplikasi Flutter dikelola secara terpisah atau pada folder utama aplikasi.

---
*Disusun sebagai syarat memperoleh gelar Sarjana Komputer (S.Kom) pada Tahun Ajaran 2025/2026.*
