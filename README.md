# LaTeX Skripsi ITB Widya Gama Lumajang

Template LaTeX untuk skripsi, ujian proposal, seminar hasil, dan artikel jurnal, beserta **contoh nyata yang sudah terisi** dari skripsi Abd. Rouf (S1 Informatika, Institut Teknologi dan Bisnis Widya Gama Lumajang).

Repositori ini terbuka untuk siapa saja. Pakai templatnya untuk mulai menulis, atau lihat folder `karya-abd-rouf/` sebagai acuan hasil jadi.

## Isi repositori

| Folder | Isi | Untuk siapa |
| --- | --- | --- |
| [`templat/skripsi-itbwiga/`](templat/skripsi-itbwiga/) | Template LaTeX: `ujian-proposal.tex`, `skripsi.tex`, isi bab, kelas dokumen `skripsi.cls`, contoh tabel dan grafik. Di `dokumen-lain/` ada templat seminar hasil dan artikel jurnal (Indonesia dan Inggris). | Siapa saja yang mau mulai menulis |
| [`templat/anatomi-penelitian/`](templat/anatomi-penelitian/) | Format Word anatomi penelitian (RSc). | Mahasiswa yang menyiapkan anatomi penelitian |
| [`karya-abd-rouf/`](karya-abd-rouf/) | Contoh nyata: dokumen ujian proposal (Word dan LaTeX), anatomi penelitian, catatan presentasi, daftar pertanyaan kritis, bahan belajar Bab I sampai III, dan kartu belajar. | Acuan hasil jadi |
| [`dokumentasi/`](dokumentasi/) | Panduan lengkap penggunaan template dan ringkasan aturan format ITB WiGa. | Semua pengguna |
| [`alat/`](alat/) | Skrip bantu, misalnya konversi LaTeX ke Word (`tex-ke-docx`). | Pengguna tingkat lanjut |

## Mulai cepat

1. Pasang TeX Live atau MiKTeX, atau pakai [Overleaf](https://www.overleaf.com/) (zip folder `templat/skripsi-itbwiga/`, lalu unggah).
2. Salin folder `templat/skripsi-itbwiga/`.
3. Ubah data diri dan judul di `ujian-proposal.tex` (`\fullname{}`, `\idnum{}`, `\titleskripsi{}`, data pembimbing dan penguji).
4. Tulis isi bab di `isi-bab/` dan daftar pustaka di `referensi/daftar-pustaka.bib`.
5. Kompilasi:

```bash
latexmk -pdf ujian-proposal.tex
# atau manual:
pdflatex ujian-proposal.tex
biber ujian-proposal
pdflatex ujian-proposal.tex
pdflatex ujian-proposal.tex
```

Untuk skripsi lengkap, ganti `ujian-proposal` dengan `skripsi`. Panduan lengkap ada di [`dokumentasi/panduan-template.md`](dokumentasi/panduan-template.md).

## Contoh karya: Abd. Rouf

**Judul ujian proposal:** Analisis QoS Jaringan Berbasis *Crowdsourcing* pada Aplikasi Presensi Menggunakan K-Means

| Lokasi | Isi |
| --- | --- |
| `karya-abd-rouf/ujian-proposal/` | **Dokumen ujian proposal terbaru** (`Proposal_Skripsi_ABD_ROUF.docx`) dan skrip pembuatnya di `sumber-docx/` (`npm install && npm run build`). |
| `karya-abd-rouf/ujian-proposal-latex/` | Versi LaTeX dokumen ujian proposal. |
| `karya-abd-rouf/anatomi-penelitian/` | Anatomi penelitian, catatan presentasi, dan pertanyaan kritis beserta jawabannya. |
| `karya-abd-rouf/bahan-belajar/` | Ringkasan belajar Bab I, II, dan III untuk persiapan ujian proposal. |
| `karya-abd-rouf/kartu-belajar/` | Kartu belajar tanya-jawab (HTML dan PDF). |
| `karya-abd-rouf/catatan-perencanaan/` | Catatan perencanaan dan draf topik sebelumnya (aplikasi presensi *offline-first*). |

PDF jurnal yang dikutip tidak disertakan karena hak ciptanya milik penulis atau penerbit. Data pustakanya tersedia di berkas `.bib` masing-masing dokumen.

## Kontribusi

Perbaikan template, format kampus lain, atau contoh karya baru sangat diterima. Buka *issue* atau kirim *pull request*.

## Lisensi

[BSD 3-Clause](LICENSE). Template ini diadaptasi dari [dirsulaiman/Skripsi](https://github.com/dirsulaiman/Skripsi) (Universitas Hasanuddin). Logo ITB Widya Gama Lumajang adalah milik institusi tersebut.
