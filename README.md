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

## Cara Kompilasi (LaTeX)
Dokumen skripsi ini disusun menggunakan LaTeX. Untuk menghasilkan file PDF:

### Opsi 1: Menggunakan Overleaf (Cloud - Direkomendasikan)
1. Kompres seluruh isi folder `template-skripsi-itbwiga/` menjadi file `.zip`.
2. Buat proyek baru di [Overleaf](https://www.overleaf.com) lalu unggah file zip tersebut (Upload Project).
3. Buka file `seminar-proposal.tex` (untuk proposal) atau `skripsi.tex` (untuk hasil akhir) dan klik tombol **Recompile**.
4. *(Pastikan compiler diatur ke pdfLaTeX pada menu Menu > Compiler)*

### Opsi 2: Menggunakan VS Code (Lokal)
1. Pastikan Anda telah menginstal distribusi LaTeX (seperti **MiKTeX** atau **TeX Live**) di OS Windows Anda.
2. Instal ekstensi **LaTeX Workshop** di Visual Studio Code.
3. Buka file `template-skripsi-itbwiga/seminar-proposal.tex`.
4. Kompilasi dapat dilakukan dengan resep standar (biasanya `pdflatex -> biber -> pdflatex -> pdflatex`).
5. Atau kompilasi secara manual lewat terminal:
   ```bash
   cd template-skripsi-itbwiga
   pdflatex seminar-proposal.tex
   biber seminar-proposal
   pdflatex seminar-proposal.tex
   ```

## Catatan
Repository ini difokuskan pada manajemen dokumen penulisan akademik (draf skripsi). _Source code_ dari aplikasi Flutter dikelola secara terpisah atau pada folder utama aplikasi.

---
*Disusun sebagai syarat memperoleh gelar Sarjana Komputer (S.Kom) pada Tahun Ajaran 2025/2026.*
