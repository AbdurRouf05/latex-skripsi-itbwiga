# Panduan Template Skripsi LaTeX untuk ITB Widya Gama Lumajang

Selamat! Template skripsi ini telah dirapikan dan disesuaikan secara khusus agar memudahkan Anda dalam menyusun **Seminar Proposal (Sempro)** di ITB Widya Gama Lumajang, Fakultas Teknik, Program Studi S1 Teknik Informatika.

Struktur *template* ini sangat modular, layaknya struktur proyek *software/coding* (seperti memisahkan `lib/` dan `assets/`), sehingga Anda tidak akan kebingungan saat dokumen sudah membesar dan berhalaman-halaman.

---

## 📂 Memahami Struktur Folder

Semua pekerjaan Anda ada di dalam folder `skripsi/template-skripsi-itbwiga`. Berikut adalah penjelasan foldernya:

- **`seminar-proposal.tex`** 🌟 *(Fokus Anda saat ini!)*
  Ini adalah file utama (main file) untuk keperluan Sempro Anda. File ini yang akan Anda "Compile" menjadi PDF. **Di sinilah Anda mengubah Judul, Nama, NIM, dan Nama Dosen Pembimbing**.
- **`skripsi.tex`**
  Ini adalah file utama yang nanti Anda gunakan **setelah Sempro selesai** dan Anda lanjut menulis keseluruhan bab Skripsi.
- **`isi-bab/`**
  Folder ini berisi **isi dari bab-bab skripsi Anda**. Anda cukup mengetik isi tulisan di sini.
  - `bab1.tex` (Pendahuluan)
  - `bab2.tex` (Tinjauan Pustaka)
  - `bab3.tex` (Metodologi Penelitian)
  - `bab4.tex` (Hasil dan Pembahasan - *tidak dipakai saat Sempro*)
  - `bab5.tex` (Kesimpulan - *tidak dipakai saat Sempro*)
- **`gambar/`**
  Letakkan semua gambar/screenshot (misalnya diagram alir sistem presensi Anda) ke dalam folder ini.
- **`referensi/`**
  Folder ini berisi daftar pustaka. File utamanya adalah `daftar-pustaka.bib`. Anda tidak perlu mengetik daftar pustaka secara manual, cukup masukkan format BibTeX dari Google Scholar.

---

## 🚀 Alur Kerja (Workflow) untuk Sempro

Karena Anda belum Sempro, alurnya akan sangat sederhana dan menyenangkan:

### 1. Ubah Data Diri di Cover
Buka file `seminar-proposal.tex`. Cari baris ke-8 hingga ke-23. Ubah bagian-bagian berikut sesuai dengan data diri Anda:
```latex
\titleskripsi{JUDUL PROPOSAL SKRIPSI ANDA (UBAH DI SINI)}
\fullname{NAMA ANDA}
\idnum{NIM ANDA}
...
\firstsupervisor{Nama Dosen Pembimbing 1, S.Kom., M.Kom.}
```

### 2. Mulai Menulis Bab 1 (Pendahuluan)
Buka folder `isi-bab/`, lalu buka file `bab1.tex`.
Hapus isi *dummy text* (`\blindtext`) dan mulai tulis Latar Belakang proyek Presensi Anda.
*Tips: Untuk membuat sub-bab baru, ketik `\section{Latar Belakang}` atau `\subsection{Rumusan Masalah}`.*

### 3. Tulis Bab 2 dan Bab 3
Lakukan hal yang sama untuk file `bab2.tex` dan `bab3.tex`. Semuanya terpisah dengan rapi!

### 4. Menambahkan Referensi
Jika Anda mengutip jurnal atau paper:
1. Cari paper-nya di Google Scholar.
2. Klik tombol **Kutip (Cite)**, lalu pilih **BibTeX**.
3. *Copy* kode tersebut dan *paste* ke dalam file `referensi/daftar-pustaka.bib`.
4. Untuk memanggil kutipan di dalam teks bab, ketikkan perintah `\cite{ID_PENULIS}`.

---

## 🛠️ Cara Mengubah (Compile) menjadi PDF
Karena saat ini kita menggunakan editor kode, untuk menghasilkan file PDF Anda memerlukan ekstensi atau *compiler* LaTeX.

1. **Cara Paling Mudah (Overleaf):**
   Jika Anda belum menginstall *tools* LaTeX di Windows, cara termudah adalah **meng-zip seluruh folder `template-skripsi-itbwiga`**, lalu *upload* (New Project -> Upload Project) ke web **Overleaf.com**. Di sana, Anda bisa mengedit dan melihat hasil PDF secara bersamaan tanpa *install* apapun!
2. **Cara Lokal (VS Code):**
   Jika Anda ingin mengerjakannya secara *offline* di VS Code, Anda harus meng-*install* ekstensi **LaTeX Workshop** dan meng-*install* TeX Live (atau MiKTeX) di Windows Anda terlebih dahulu.

Jika nanti kampus Anda (ITB WiGa) mengeluarkan buku pedoman resmi (misalnya harus ganti ukuran margin, font, atau letak logo di cover), kita cukup mengedit kode di file **`pengaturan/skripsi.cls`**. Sisanya (isi tulisan Bab 1,2,3 Anda) akan aman 100% dan tata letaknya akan menyesuaikan otomatis secara ajaib!
