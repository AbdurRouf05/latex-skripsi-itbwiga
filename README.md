# Skripsi Abdur Rouf: Dokumen dan Template LaTeX ITB Widya Gama Lumajang

Repositori ini berisi seluruh dokumen penyusunan skripsi Program Studi S1 Teknik Informatika di **Institut Teknologi dan Bisnis Widya Gama Lumajang**: template LaTeX skripsi, draf seminar proposal, anatomi penelitian, catatan presentasi, serta referensi pendukung.

## Pemberitahuan Penggunaan
Template dan repositori ini adalah milik pribadi Abdur Rouf dan dibuat secara spesifik untuk penelitian pada PT Semeru Agung Mandiri. Jika Anda ingin menggunakan atau mengadopsi template ini, ada banyak bagian (identitas, nama instansi, judul, data penelitian, dan konfigurasi) yang perlu Anda ubah dan sesuaikan dengan kebutuhan Anda sendiri.

## Identitas Penulis
- **Nama:** Abdur Rouf
- **NIM:** 223140118
- **Program Studi:** S1 Teknik Informatika
- **Fakultas:** Teknik
- **Institusi:** Institut Teknologi dan Bisnis Widya Gama Lumajang

## Topik Penelitian

### Rancangan terbaru (Anatomi Penelitian)
**"Analisis *Quality of Service* Jaringan Berbasis *Crowdsourcing* pada Aplikasi Presensi *Mobile* Menggunakan *Clustering* K-Means di PT Semeru Agung Mandiri"**

Karyawan PT Semeru Agung Mandiri melakukan presensi dari kantor, posko, dan gudang dengan kualitas jaringan yang berbeda-beda, tetapi perusahaan belum memiliki data objektif tentang kualitas jaringan di tiap lokasi kerja. Penelitian ini menggunakan metode *Research and Development* (R&D) dengan menambahkan modul telemetri pasif pada aplikasi presensi. Modul tersebut mencatat *delay*, *jitter*, tingkat kegagalan pengiriman, *throughput*, dan lama putus koneksi secara anonim setiap kali aplikasi berkomunikasi dengan server. Data dikategorikan menurut standar **TIPHON**, lalu lokasi kerja dikelompokkan dengan **K-Means** (jumlah klaster ditentukan dengan metode *elbow* dan *silhouette*).

**Kata kunci:** *Quality of Service*; *Crowdsourcing*; K-Means; TIPHON; Presensi Mobile

### Draf seminar proposal sebelumnya
**"Rancang Bangun Aplikasi Presensi Karyawan Berbasis Mobile Menggunakan Arsitektur Offline-First dengan Flutter pada PT Semeru Agung Mandiri"**

Draf ini masih tersimpan di `template-skripsi-itbwiga/seminar-proposal.tex` dan menjadi dasar aplikasi presensi (Flutter, penyimpanan lokal, dan sinkronisasi ke server) yang kini digunakan sebagai alat ukur pada rancangan penelitian terbaru.

## Struktur Repositori
| Lokasi | Isi |
| --- | --- |
| `anatomi-penelitian/` | Anatomi penelitian (`anatomi-penelitian.tex`), catatan presentasi, daftar pertanyaan kritis, pedoman Tugas Akhir FTI 2026-2027, dan arsip versi lama (`_arsip/`). |
| `anatomi-penelitian/referensi/` | Jurnal dan standar acuan (QoS TIPHON, K-Means, *crowdsourced measurement*, R&D Borg & Gall, presensi *offline*). |
| `template-skripsi-itbwiga/` | Template LaTeX skripsi ITB WiGa: `seminar-proposal.tex`, `skripsi.tex`, isi bab (`isi-bab/`), daftar pustaka (`referensi/`), gambar, dan kelas dokumen (`pengaturan/skripsi.cls`). |
| `PANDUAN.md` | Panduan lengkap penggunaan dan kustomisasi template LaTeX. |
| `PANDUAN_SKRIPSI_ITB_WIGA.md`, `panduan skripsi.md` | Ringkasan aturan format penulisan skripsi ITB WiGa. |
| `BLUEPRINT_SKRIPSI.md`, `implementation_plan.md` | Cetak biru dan rencana implementasi aplikasi presensi. |
| `*.docx` | Format anatomi penelitian dan panduan skripsi dalam bentuk Word. |

## Cara Kompilasi Dokumen

### Prasyarat
- Distribusi TeX: [MiKTeX](https://miktex.org/download) atau [TeX Live](https://tug.org/texlive/) (aktifkan *install missing packages on the fly*).
- Editor: [Visual Studio Code](https://code.visualstudio.com/) dengan ekstensi **LaTeX Workshop**.
- `biber` untuk daftar pustaka (biasanya sudah ikut terinstal).

### Template skripsi / seminar proposal (pdfLaTeX + Biber)
Dari folder `template-skripsi-itbwiga/`:
```bash
pdflatex seminar-proposal.tex
biber seminar-proposal
pdflatex seminar-proposal.tex
pdflatex seminar-proposal.tex
```
Di VS Code, gunakan *Recipe* **pdflatex -> biber -> pdflatex -> pdflatex**. Di Overleaf, unggah isi folder sebagai `.zip` dan atur *Compiler* ke **pdfLaTeX**.

### Anatomi penelitian dan catatan presentasi (XeLaTeX)
Dokumen di `anatomi-penelitian/` memakai font Calibri melalui `fontspec`, sehingga harus dikompilasi dengan **XeLaTeX** (jalankan dua kali):
```bash
xelatex anatomi-penelitian.tex
xelatex anatomi-penelitian.tex
```

### Cara mengedit
- **Data diri dan judul:** ubah `\fullname{}`, `\idnum{}`, `\titleskripsi{}`, dan data dosen di `seminar-proposal.tex` atau `skripsi.tex`.
- **Isi bab:** tulis di `isi-bab/bab1.tex` sampai `bab5.tex`.
- **Daftar pustaka:** tambahkan entri ke `referensi/daftar-pustaka.bib`, lalu sitasi dengan `\textcite{}` atau `\parencite{}`.
- **Gambar dan logo:** simpan di `gambar/`; ukuran logo sampul diatur di `pengaturan/skripsi.cls`.

Panduan yang lebih rinci tersedia di [PANDUAN.md](PANDUAN.md).

## Catatan
Repositori ini hanya berisi dokumen akademik. *Source code* aplikasi presensi Flutter dikelola di repositori terpisah. File hasil kompilasi LaTeX (`.aux`, `.log`, `.bbl`, dan sejenisnya) sengaja tidak disimpan.

---
*Disusun sebagai syarat memperoleh gelar Sarjana Komputer (S.Kom).*
