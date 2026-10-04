# 📘 PANDUAN TEMPLATE SKRIPSI LaTeX — ITB Widya Gama Lumajang

> **Penulis:** Abdur Rouf  
> **Terakhir diperbarui:** September 2026  
> **File utama:** `pengaturan/skripsi.cls`  
> **Template berbasis:** `report` class LaTeX

---

## Daftar Isi Panduan

1. [Struktur Proyek](#1-struktur-proyek)
2. [Watermark / Background Logo](#2-watermark--background-logo)
3. [Margin dan Layout Halaman](#3-margin-dan-layout-halaman)
4. [Font dan Tipografi](#4-font-dan-tipografi)
5. [Cover / Halaman Judul](#5-cover--halaman-judul)
6. [Daftar Isi, Tabel, Gambar](#6-daftar-isi-tabel-gambar)
7. [Bibliografi / Daftar Pustaka](#7-bibliografi--daftar-pustaka)
8. [Tips Kompilasi pdflatex](#8-tips-kompilasi-pdflatex)
9. [Kronologi Error & Solusi](#9-kronologi-error--solusi)
10. [Checklist Cepat untuk File Baru](#10-checklist-cepat-untuk-file-baru)

---

## 1. Struktur Proyek

```
template-skripsi-itbwiga/
├── pengaturan/
│   └── skripsi.cls          ← Class file utama (semua konfigurasi)
├── gambar/
│   └── logo wiga.png        ← Logo institusi (untuk watermark & cover)
├── isi-bab/
│   ├── bab1.tex             ← Konten BAB I
│   ├── bab2.tex             ← Konten BAB II
│   └── bab3.tex             ← Konten BAB III
├── referensi/
│   └── daftar-pustaka.bib   ← File bibliografi BibTeX
├── seminar-proposal.tex     ← Entry point Seminar Proposal
└── skripsi.tex              ← Entry point Skripsi Akhir
```

**Prinsip:** Semua pengaturan layout, font, watermark, margin, dll. ada di `pengaturan/skripsi.cls`. File `.tex` hanya berisi konten.

---

## 2. Watermark / Background Logo

### ✅ Cara yang Berhasil (eso-pic + TikZ)

Logo ITB WIGA ditampilkan di **setiap halaman** menggunakan package `eso-pic` + `tikzpicture`:

```latex
% Di skripsi.cls (baris ~78-79)
\RequirePackage{eso-pic}

% Di skripsi.cls (baris ~241-247)
\AddToShipoutPictureBG{%
  \begin{tikzpicture}[remember picture, overlay]
    \node[opacity=0.2] at (current page.center) {%
      \includegraphics[width=14cm]{gambar/logo wiga}%
    };
  \end{tikzpicture}%
}
```

### Cara Mengatur

| Parameter | Fungsi | Contoh |
|-----------|--------|--------|
| `opacity=0.2` | Transparansi logo (0=transparan, 1=solid) | `opacity=0.3` untuk lebih tebal |
| `width=14cm` | Ukuran logo | `width=10cm` untuk lebih kecil |
| `current page.center` | Posisi logo | Bisa diganti posisi lain |
| `gambar/logo wiga` | Path ke file gambar | Tanpa ekstensi `.png` |

### Cara Mengubah Opacity

Buka `pengaturan/skripsi.cls`, cari baris:
```latex
\node[opacity=0.2] at (current page.center) {%
```
Ubah angka `0.2` ke nilai yang diinginkan:
- `0.1` = sangat tipis (hampir tidak terlihat)
- `0.2` = tipis/samar (default saat ini)
- `0.3` = sedang, cukup jelas
- `0.4` = agak tebal, sangat jelas

### Cara Mengganti Logo

Ganti file `gambar/logo wiga.png` dengan logo baru. Jika nama file berbeda:
```latex
\includegraphics[width=14cm]{gambar/nama-logo-baru}%
```

> **⚠️ PENTING:** Jangan gunakan tanda kutip (`"`) di path gambar dalam TikZ node. Gunakan nama file langsung tanpa ekstensi.

### Cara Menonaktifkan Watermark

Komentari blok `\AddToShipoutPictureBG`:
```latex
% \AddToShipoutPictureBG{%
%   \begin{tikzpicture}[remember picture, overlay]
%     \node[opacity=0.2] at (current page.center) {%
%       \includegraphics[width=14cm]{gambar/logo wiga}%
%     };
%   \end{tikzpicture}%
% }
```

### Cara Menerapkan ke File LaTeX Lain

Jika ingin menambahkan watermark ke file LaTeX **manapun** (bukan hanya template ini):

```latex
\documentclass{article}  % atau report, book, dll.
\usepackage{graphicx}
\usepackage{tikz}
\usepackage{eso-pic}

% === WATERMARK SETUP ===
\AddToShipoutPictureBG{%
  \begin{tikzpicture}[remember picture, overlay]
    \node[opacity=0.2] at (current page.center) {%
      \includegraphics[width=14cm]{path/ke/logo}%
    };
  \end{tikzpicture}%
}
% === END WATERMARK ===

\begin{document}
% Konten Anda di sini...
\end{document}
```

Cukup 3 package: `graphicx`, `tikz`, `eso-pic`. Salin blok watermark di atas ke preamble dokumen Anda.

---

## 3. Margin dan Layout Halaman

### Konfigurasi Saat Ini (skripsi.cls baris 220-232)

```latex
\setlength{\topmargin}{0cm}
\setlength{\headheight}{1cm}
\setlength{\headsep}{0.2cm}
\setlength{\topskip}{1ex}
\setlength{\oddsidemargin}{1.2cm}   % Margin kiri = 1in + 1.2cm ≈ 3.74cm
\setlength{\evensidemargin}{1.2cm}  % Margin kanan
\setlength{\textwidth}{14.3cm}
\setlength{\textheight}{22.7cm}
\setlength{\footskip}{1cm}
\setlength{\parindent}{3em}         % Indent paragraf ≈ 6 karakter
```

### Penjelasan Margin LaTeX

LaTeX menghitung margin dari titik 1 inci (2.54cm) dari tepi kertas:
- **Margin kiri aktual** = 1 inci + `\oddsidemargin` = 2.54cm + 1.2cm = **3.74cm**
- **Margin kanan** = Lebar kertas - margin kiri - `\textwidth` = 21cm - 3.74cm - 14.3cm = **2.96cm**
- **Margin atas** ≈ 1 inci + `\topmargin` + `\headheight` + `\headsep` ≈ **3.74cm**
- **Margin bawah** ≈ Sisa dari `\textheight`

### Cara Mengubah Margin

Untuk margin **4cm kiri, 3cm kanan, 3cm atas, 3cm bawah** (standar skripsi):
```latex
\setlength{\oddsidemargin}{1.46cm}   % 4cm - 2.54cm
\setlength{\textwidth}{14cm}         % 21cm - 4cm - 3cm
```

> **💡 Alternatif Mudah:** Gunakan package `geometry` untuk pengaturan margin yang lebih intuitif. Tapi pastikan tidak konflik dengan pengaturan manual di atas.

---

## 4. Font dan Tipografi

### Font Saat Ini
```latex
\RequirePackage{newtxtext, newtxmath}  % Times New Roman-like
```

Package `newtxtext` memberikan font mirip Times New Roman untuk teks, dan `newtxmath` untuk rumus matematika.

### Spasi Baris
```latex
\RequirePackage{setspace}
\onehalfspacing                        % Spasi 1.5
\renewcommand{\baselinestretch}{1.42}  % Fine-tuning spasi
```

### Cara Mengubah Font

| Font | Package |
|------|---------|
| Times New Roman-like | `\RequirePackage{newtxtext, newtxmath}` (default) |
| Computer Modern | Hapus/komentari baris newtxtext |
| Palatino | `\RequirePackage{mathpazo}` |
| Helvetica/Arial-like | `\RequirePackage{helvet}` + `\renewcommand{\familydefault}{\sfdefault}` |

### Cara Mengubah Spasi

```latex
\singlespacing       % Spasi 1
\onehalfspacing      % Spasi 1.5 (default)
\doublespacing       % Spasi 2
```

---

## 5. Cover / Halaman Judul

### Dua Jenis Cover

| Macro | Fungsi | Digunakan di |
|-------|--------|-------------|
| `\coverproposal` | Cover Seminar Proposal | `seminar-proposal.tex` |
| `\cover` | Cover Skripsi Akhir | `skripsi.tex` |

### Data yang Perlu Diisi (di file .tex utama)

```latex
\titleskripsi{JUDUL SKRIPSI ANDA DI SINI}
\fullname{NAMA LENGKAP}
\idnum{NIM}
\yearsubmit{2026}
\program{S1 Teknik Informatika}
\dept{Teknik Informatika}
\faculty{Fakultas Teknik}
\university{Institut Teknologi dan Bisnis Widya Gama}
\city{Lumajang}
\firstsupervisor{Nama Dosen Pembimbing 1, S.Kom., M.Kom.}
\secondsupervisor{Nama Dosen Pembimbing 2, S.Kom., M.Kom.}
\firstexaminer{Nama Dosen Penguji 1, S.Kom., M.Kom.}
\secondexaminer{Nama Dosen Penguji 2, S.Kom., M.Kom.}
```

### Mengubah Logo di Cover

Di `skripsi.cls`, cari `\coverproposal` atau `\cover` dan ubah:
```latex
\includegraphics[height=7cm]{"gambar/logo wiga.png"}
```

---

## 6. Daftar Isi, Tabel, Gambar

### Cara Menggunakan

```latex
% Daftar Isi
\addcontentsline{toc}{chapter}{DAFTAR ISI}
\tableofcontents
\pagebreak

% Daftar Tabel
\addcontentsline{toc}{chapter}{DAFTAR TABEL}
\listoftables
\pagebreak

% Daftar Gambar
\addcontentsline{toc}{chapter}{DAFTAR GAMBAR}
\listoffigures
\pagebreak
```

### Label Indonesia (Otomatis)

Sudah dikonfigurasi di `skripsi.cls` (baris 258-272):
```latex
\def\contentsname{DAFTAR ISI}
\def\listfigurename{DAFTAR GAMBAR}
\def\listtablename{DAFTAR TABEL}
\def\chaptername{BAB}
\def\figurename{Gambar}
\def\tablename{Tabel}
```

### Cara Mengubah Label

Ubah nilai `\def` di atas sesuai kebutuhan. Misalnya untuk bahasa Inggris:
```latex
\def\contentsname{TABLE OF CONTENTS}
```

---

## 7. Bibliografi / Daftar Pustaka

### Konfigurasi Saat Ini (biblatex + biber)

```latex
\usepackage[
    backend=biber,
    style=authoryear,
    citestyle=authoryear-comp,
    sorting=nty,
    maxbibnames=3
]{biblatex}
\addbibresource{referensi/daftar-pustaka.bib}
```

### Cara Menggunakan Sitasi

```latex
% Cara default: (Penulis Tahun)
\cite{kunci_referensi}

% Contoh di teks:
Menurut \cite{nair2020}, sinkronisasi delta adalah yang paling efisien.
```

### Cara Menambah Referensi

1. Buka `referensi/daftar-pustaka.bib`
2. Tambahkan entry BibTeX:
```bibtex
@article{nair2020,
    author  = {Nair, Vinod and Others},
    title   = {Empirical Evaluation of Synchronization Strategies},
    journal = {Journal of Systems},
    year    = {2020}
}
```

### Urutan Kompilasi (PENTING!)

```bash
pdflatex seminar-proposal.tex   # Pass 1
biber seminar-proposal           # Proses bibliografi
pdflatex seminar-proposal.tex   # Pass 2 (resolve references)
pdflatex seminar-proposal.tex   # Pass 3 (finalize cross-references)
```

> **⚠️ PENTING:** Jika hanya menjalankan `pdflatex` satu kali, referensi dan daftar pustaka **tidak akan muncul**.

---

## 8. Tips Kompilasi pdflatex

### Perintah Dasar

```bash
# Kompilasi sederhana (1 pass)
pdflatex -interaction=nonstopmode namafile.tex

# Kompilasi lengkap dengan bibliografi
pdflatex namafile.tex
biber namafile
pdflatex namafile.tex
pdflatex namafile.tex
```

### Error Umum dan Solusinya

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `File not found` | Path gambar salah | Pastikan gambar ada di folder `gambar/` |
| `Undefined control sequence` | Package belum di-load | Tambahkan `\RequirePackage{nama_package}` di cls |
| `Missing $ inserted` | Karakter khusus tanpa escape | Gunakan `\_` `\%` `\&` `\#` di teks |
| `Label(s) may have changed` | Perlu kompilasi ulang | Jalankan `pdflatex` sekali lagi |
| `I can't write on file` | File PDF terbuka di viewer | Tutup PDF viewer, kompilasi ulang |
| `Package biblatex Error` | biber belum dijalankan | Jalankan `biber namafile` sebelum pdflatex kedua |
| `Overfull \hbox` | Teks terlalu panjang untuk baris | Biasanya warning saja, bukan error fatal |
| `Underfull \hbox` | Teks terlalu pendek dalam justified | Warning biasa, bisa diabaikan |

### Cara Membersihkan File Sementara

```bash
# Windows (PowerShell)
Remove-Item *.aux, *.log, *.out, *.toc, *.lof, *.lot, *.bbl, *.bcf, *.blg, *.run.xml -ErrorAction SilentlyContinue

# Lalu kompilasi ulang dari awal
pdflatex namafile.tex
```

### Nama File dengan Spasi

LaTeX mendukung nama file dengan spasi, tapi ada aturan:
- ✅ Dalam `\includegraphics`: gunakan langsung tanpa kutip
  ```latex
  \includegraphics{gambar/logo wiga}
  ```
- ✅ Dalam `\includegraphics` (cls biasa): boleh pakai kutip
  ```latex
  \includegraphics{"gambar/logo wiga.png"}
  ```
- ❌ Dalam TikZ `\node`: **JANGAN** pakai tanda kutip!
  ```latex
  % SALAH:
  \includegraphics[width=14cm]{"gambar/logo wiga.png"}
  
  % BENAR:
  \includegraphics[width=14cm]{gambar/logo wiga}
  ```

---

## 9. Kronologi Error & Solusi

### Masalah: Watermark Logo Tidak Muncul

#### Percobaan 1 — Package `background` dengan `pages=some`

**Kondisi awal:** Template menggunakan:
```latex
\RequirePackage[pages=some]{background}
\backgroundsetup{
  scale=1, angle=0, opacity=.2, hshift=3mm,
  contents={\includegraphics[width=16cm]{"gambar/logo wiga.png"}}
}
\newcommand\addwatermark{\BgThispage}
```

**Masalah:** Logo hanya muncul di halaman yang secara eksplisit memanggil `\addwatermark` (= `\BgThispage`). Tidak otomatis di semua halaman.

**Percobaan fix:** Ubah `pages=some` menjadi tanpa opsi (`pages=all` default).

**Hasil:** Logo tetap **tidak muncul** di halaman manapun! 😱

#### Percobaan 2 — Package `background` dengan `pages=all` dan teks

**Tes:** Ganti `contents` dari gambar ke teks:
```latex
\backgroundsetup{
  contents={DRAFT WATERMARK TEST}
}
```

**Hasil:** Teks watermark **BERHASIL** muncul di semua halaman! ✅

**Kesimpulan:** Masalahnya bukan di `pages=all`, tapi di cara `background` package me-render **gambar** dalam TikZ node internalnya. Package `background` secara internal menggunakan TikZ, dan ada konflik saat `\includegraphics` digunakan dengan path yang mengandung **spasi** dan **tanda kutip** di dalam TikZ node.

#### Percobaan 3 — Package `eso-pic` + TikZ Manual ✅

**Solusi akhir:** Ganti mekanisme watermark dari package `background` ke `eso-pic` + TikZ manual:
```latex
\RequirePackage{eso-pic}
\AddToShipoutPictureBG{%
  \begin{tikzpicture}[remember picture, overlay]
    \node[opacity=0.2] at (current page.center) {%
      \includegraphics[width=14cm]{gambar/logo wiga}%
    };
  \end{tikzpicture}%
}
```

**Hasil:** Logo **BERHASIL** muncul di semua 24 halaman! ✅✅

### Pelajaran yang Dipetik

1. **Package `background` memiliki bug/limitasi** dengan `\includegraphics` yang memiliki spasi di nama file ketika digunakan dalam TikZ node internalnya.
2. **`eso-pic` + TikZ manual lebih reliable** untuk background image karena kita punya kontrol penuh atas TikZ node.
3. **Jangan gunakan tanda kutip** (`"..."`) di path gambar dalam TikZ — gunakan nama file langsung.
4. **Hapus ekstensi `.png`** dari path gambar — LaTeX akan otomatis mencari file dengan ekstensi yang didukung.
5. **Selalu tes dengan teks dulu** jika gambar watermark tidak muncul — ini membantu mengisolasi apakah masalahnya di mekanisme watermark atau di gambar.

### Berapa Lama dan Kenapa Lama?

| Langkah | Waktu | Alasan |
|---------|-------|--------|
| Analisis file `skripsi.cls` | ~5 menit | Perlu memahami 785 baris kode |
| Percobaan 1 (ubah `pages=some`) | ~5 menit | Fix sederhana, tapi gagal |
| Debugging kenapa gambar tidak muncul | ~10 menit | Perlu tes terpisah, render, dan inspeksi |
| Percobaan 2 (tes teks vs gambar) | ~5 menit | Menemukan bahwa teks berhasil, gambar tidak |
| Riset dan implementasi eso-pic | ~5 menit | Menulis solusi dan verifikasi |
| Kompilasi & verifikasi akhir | ~5 menit | 3x kompilasi + render preview |
| **Total** | **~35 menit** | |

**Penyebab utama lamanya:**
1. Package `background` secara internal menggunakan TikZ tapi tidak mendokumentasikan batasan dengan nama file berspasi
2. Perlu beberapa kali trial-and-error untuk mengisolasi masalah (gambar vs teks, kutip vs tanpa kutip)
3. Setiap percobaan memerlukan kompilasi + render preview untuk verifikasi visual

---

## 10. Checklist Cepat untuk File Baru

### Membuat Dokumen Baru dengan Template Ini

- [ ] Salin folder `template-skripsi-itbwiga/`
- [ ] Edit data peneliti di file `.tex` utama (`\titleskripsi`, `\fullname`, dll.)
- [ ] Ganti logo di `gambar/logo wiga.png` (jika perlu)
- [ ] Edit konten BAB di `isi-bab/`
- [ ] Edit referensi di `referensi/daftar-pustaka.bib`
- [ ] Kompilasi: `pdflatex` → `biber` → `pdflatex` → `pdflatex`

### Menambahkan Watermark ke File LaTeX Manapun

- [ ] Tambahkan `\usepackage{graphicx}` (jika belum ada)
- [ ] Tambahkan `\usepackage{tikz}`
- [ ] Tambahkan `\usepackage{eso-pic}`
- [ ] Salin blok `\AddToShipoutPictureBG{...}` ke preamble
- [ ] Sesuaikan path gambar, opacity, dan ukuran
- [ ] Kompilasi dan verifikasi

### Troubleshooting Cepat

```
Logo tidak muncul?
  ├── Cek path file gambar (harus relative dari folder .tex utama)
  ├── Cek apakah file gambar ada (format .png, .jpg, atau .pdf)
  ├── Jangan pakai tanda kutip di path dalam TikZ
  ├── Coba naikkan opacity ke 0.5 untuk tes
  └── Cek log kompilasi: ada baris "<use gambar/logo.png>"?

Watermark terlalu tebal/tipis?
  └── Ubah nilai opacity (0.1-0.4)

Watermark hanya muncul di beberapa halaman?
  ├── Pastikan pakai eso-pic, BUKAN background package
  └── Pastikan \AddToShipoutPictureBG ada di preamble (sebelum \begin{document})

Kompilasi error "File not found"?
  ├── Cek ejaan nama file
  ├── Cek folder gambar/ ada di lokasi yang benar
  └── Pastikan working directory saat kompilasi = folder utama template
```

---

## Catatan Penutup

Template ini dirancang khusus untuk ITB Widya Gama Lumajang. Jika ingin mengadaptasi untuk institusi lain:

1. Ganti logo di `gambar/`
2. Ubah nama institusi di `\coverproposal` dan `\cover` (dalam `skripsi.cls`)
3. Sesuaikan margin sesuai pedoman penulisan institusi Anda
4. Sesuaikan format bibliografi (`style=authoryear` bisa diganti ke `style=numeric`, dll.)

**Semoga panduan ini membantu! 🎓**
