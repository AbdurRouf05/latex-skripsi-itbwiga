const fs = require("fs");
const path = require("path");
const d = require("docx");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, HeadingLevel, Header, Footer, PageNumber, NumberFormat, TableOfContents, StyleLevel,
  LevelFormat, ShadingType, VerticalAlign, TableLayoutType, HighlightColor,
  Math: OMath, MathRun, MathFraction, MathSum, MathRadical, MathSubScript, MathSuperScript, MathSubSuperScript, MathFunction,
} = d;

const OUT = path.join(__dirname, "..", "Proposal_Skripsi_ABD_ROUF.docx");
const FIG = path.join(__dirname, "fig");
const LOGO = path.join(__dirname, "fig", "logo-wiga.png");
const TW = 7937;

// ---------- inline markup ----------
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[\[[^\]]+\]\]|\^\{[^}]+\}|_\{[^}]+\})/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const t = m[0];
    if (t.startsWith("***")) out.push(new TextRun({ text: t.slice(3, -3), ...base, bold: true, italics: true }));
    else if (t.startsWith("**")) out.push(...runs(t.slice(2, -2), { ...base, bold: true }));
    else if (t.startsWith("*")) out.push(new TextRun({ text: t.slice(1, -1), ...base, italics: true }));
    else if (t.startsWith("`")) out.push(new TextRun({ text: t.slice(1, -1), ...base, font: "Courier New", size: base.size ? base.size - 2 : 22 }));
    else if (t.startsWith("[[")) out.push(new TextRun({ text: t.slice(2, -2), ...base, highlight: "yellow" }));
    else if (t.startsWith("^")) out.push(new TextRun({ text: t.slice(2, -1), ...base, superScript: true }));
    else out.push(new TextRun({ text: t.slice(2, -1), ...base, subScript: true }));
    last = m.index + t.length;
  }
  if (last < text.length) out.push(new TextRun({ text: text.slice(last), ...base }));
  return out;
}

// ---------- block helpers ----------
const P = (t, o = {}) => new Paragraph({ children: runs(t), ...o });
const PN = (t, o = {}) => new Paragraph({ children: runs(t), indent: { firstLine: 0 }, ...o });
let firstH1InSection = true;
function H1(a, b) {
  const ch = [new TextRun({ text: a })];
  if (b) ch.push(new TextRun({ text: b, break: 1 }));
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: ch });
}
function H1pb(a) { return new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun(a)] }); }
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: runs(t) });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: runs(t) });
let listInst = 0;
function L(items, ref = "angka") {
  const inst = ++listInst;
  const out = [];
  for (const it of items) {
    if (Array.isArray(it)) {
      const sub = ++listInst;
      for (const s of it) out.push(new Paragraph({ children: runs(s), numbering: { reference: "huruf", level: 0, instance: sub }, indent: { left: 1080, hanging: 360 } }));
    } else out.push(new Paragraph({ children: runs(it), numbering: { reference: ref, level: 0, instance: inst } }));
  }
  return out;
}
const capT = (t) => new Paragraph({ style: "JudulTabel", children: runs(t) });
const capG = (t) => new Paragraph({ style: "JudulGambar", children: runs(t) });
const src = (t) => new Paragraph({ style: "Sumber", children: runs(t) });

const B1 = { style: BorderStyle.SINGLE, size: 12, color: "000000" };
const B0 = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const BG = { style: BorderStyle.SINGLE, size: 2, color: "999999" };
function cellP(t, o = {}) {
  return String(t).split("\n").map((line) => new Paragraph({ style: "IsiTabel", keepNext: !!o.keep, alignment: o.align || AlignmentType.LEFT, children: runs(line, o.bold ? { bold: true } : {}) }));
}
function tbl(widths, header, rows, o = {}) {
  const al = o.align || widths.map(() => AlignmentType.LEFT);
  const hdr = new TableRow({
    tableHeader: true, cantSplit: true,
    children: header.map((h, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
      borders: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000" } },
      children: cellP(h, { bold: true, align: AlignmentType.CENTER }),
    })),
  });
  const body = rows.map((r) => new TableRow({
    cantSplit: !!o.cantSplit,
    children: r.map((c, i) => new TableCell({ width: { size: widths[i], type: WidthType.DXA }, children: cellP(c, { align: al[i], keep: !!o.cantSplit && o.keep !== false }) })),
  }));
  return new Table({
    width: { size: TW, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED,
    borders: { top: B1, bottom: B1, left: B0, right: B0, insideHorizontal: BG, insideVertical: B0 },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    rows: [hdr, ...body],
  });
}
const C = AlignmentType.CENTER, Lf = AlignmentType.LEFT, R = AlignmentType.RIGHT;
const gap = () => new Paragraph({ children: [], spacing: { after: 120 } });

// ---------- math ----------
const v = (t) => new MathRun(t);
const tx = (t) => new MathRun({ text: t, style: "plain" });
const sub = (b, s) => new MathSubScript({ children: Array.isArray(b) ? b : [v(b)], subScript: Array.isArray(s) ? s : [v(s)] });
const subT = (b, s) => new MathSubScript({ children: [v(b)], subScript: [tx(s)] });
const frac = (n, dd) => new MathFraction({ numerator: n, denominator: dd });
const sum = (lo, hi, ch) => new MathSum({ children: ch, subScript: lo, superScript: hi });
const NB = { top: B0, bottom: B0, left: B0, right: B0 };
function eq(children, num) {
  const mk = (w, ch, al) => new TableCell({ width: { size: w, type: WidthType.DXA }, borders: NB, verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ style: "Persamaan", alignment: al, children: ch })] });
  return new Table({
    width: { size: TW, type: WidthType.DXA }, columnWidths: [850, 6237, 850], layout: TableLayoutType.FIXED,
    borders: { top: B0, bottom: B0, left: B0, right: B0, insideHorizontal: B0, insideVertical: B0 },
    rows: [new TableRow({ cantSplit: true, children: [mk(850, [], C), mk(6237, [new OMath({ children })], C), mk(850, [new TextRun(num)], R)] })],
  });
}
const eqU = (children) => new Paragraph({ style: "Persamaan", children: [new OMath({ children })] });

function fig(file, w, h) {
  return new Paragraph({ alignment: C, indent: { firstLine: 0 }, keepNext: true, spacing: { before: 120, after: 60 },
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(FIG, file)), transformation: { width: w, height: h } })] });
}

// ---------- header / footer ----------
const pnum = (al, extra = {}) => new Paragraph({ alignment: al, indent: { firstLine: 0, ...extra }, spacing: { line: 240 }, children: [new TextRun({ children: [PageNumber.CURRENT] })] });
const empty = () => new Paragraph({ indent: { firstLine: 0 }, spacing: { line: 240 }, children: [] });
const PAGE = { size: { width: 11906, height: 16838 }, margin: { top: 2268, left: 2268, right: 1701, bottom: 1701, header: 850, footer: 567 } };
function chapterSection(children, start) {
  const page = { ...PAGE };
  if (start) page.pageNumbers = { start, formatType: NumberFormat.DECIMAL };
  return {
    properties: { titlePage: true, page },
    headers: { default: new Header({ children: [pnum(R, { right: -850 })] }), first: new Header({ children: [empty()] }) },
    footers: { default: new Footer({ children: [empty()] }), first: new Footer({ children: [pnum(C)] }) },
    children,
  };
}

// =====================================================================
// COVER
// =====================================================================
const cb = (t, size = 24, after = 0) => new Paragraph({ alignment: C, indent: { firstLine: 0 }, spacing: { line: 276, after }, children: [new TextRun({ text: t, bold: true, size })] });
const cover = [
  cb("ANALISIS QOS JARINGAN BERBASIS CROWDSOURCING PADA APLIKASI PRESENSI MENGGUNAKAN K-MEANS", 28, 600),
  cb("PROPOSAL SKRIPSI", 24, 900),
  new Paragraph({ alignment: C, indent: { firstLine: 0 }, spacing: { after: 900 }, children: [new ImageRun({ type: "png", data: fs.readFileSync(LOGO), transformation: { width: 227, height: 227 } })] }),
  cb("OLEH:", 24, 120), cb("ABD. ROUF"), cb("NIM. 223140118", 24, 1400),
  cb("PROGRAM STUDI INFORMATIKA"), cb("FAKULTAS TEKNIK DAN INFORMATIKA"), cb("INSTITUT TEKNOLOGI DAN BISNIS WIDYA GAMA"), cb("LUMAJANG"), cb("2026"),
];

// =====================================================================
// FRONT MATTER
// =====================================================================
const front = [
  H1("KATA PENGANTAR"),
  P("Puji syukur penulis panjatkan ke hadirat Tuhan Yang Maha Esa karena atas rahmat-Nya penulis dapat menyelesaikan proposal skripsi yang berjudul “Analisis QoS Jaringan Berbasis *Crowdsourcing* pada Aplikasi Presensi Menggunakan K-Means”. Proposal ini disusun sebagai salah satu syarat untuk mengikuti ujian proposal skripsi pada Program Studi Informatika, Fakultas Teknik dan Informatika, Institut Teknologi dan Bisnis Widya Gama Lumajang."),
  P("Penulis mengucapkan terima kasih kepada:"),
  ...L([
    "[[Nama Rektor]], selaku Rektor Institut Teknologi dan Bisnis Widya Gama Lumajang.",
    "[[Nama Dekan]], selaku Dekan Fakultas Teknik dan Informatika.",
    "[[Nama Ketua Program Studi]], selaku Ketua Program Studi Informatika.",
    "[[Nama Dosen Pembimbing]], selaku Dosen Pembimbing.",
    "PT Semeru Agung Mandiri yang telah memberikan izin penelitian.",
    "Orang tua dan keluarga penulis.",
  ]),
  P("Penulis menyadari bahwa proposal ini masih memiliki kekurangan. Oleh karena itu, kritik dan saran yang membangun sangat penulis harapkan."),
  new Paragraph({ alignment: R, indent: { firstLine: 0 }, spacing: { before: 480 }, children: runs("Lumajang, [[tanggal]] 2026") }),
  new Paragraph({ alignment: R, indent: { firstLine: 0 }, spacing: { before: 960 }, children: runs("Penulis") }),
  H1pb("DAFTAR ISI"),
  new TableOfContents("Daftar Isi", { hyperlink: true, headingStyleRange: "1-3" }),
  H1pb("DAFTAR TABEL"),
  new TableOfContents("Daftar Tabel", { hyperlink: true, stylesWithLevels: [new StyleLevel("JudulTabel", 1)] }),
  H1pb("DAFTAR GAMBAR"),
  new TableOfContents("Daftar Gambar", { hyperlink: true, stylesWithLevels: [new StyleLevel("JudulGambar", 1)] }),
];

// =====================================================================
// BAB I
// =====================================================================
const bab1 = [
  H1("BAB I", "PENDAHULUAN"),
  H2("1.1 Latar Belakang Masalah"),
  P("Aplikasi presensi *mobile* mengirim data presensi, foto, dan lokasi ke server melalui Wi-Fi atau jaringan seluler, sehingga keberhasilannya bergantung pada kualitas jaringan di tempat karyawan berada (Ismail & Zakaria, 2023). Karena koneksi di lapangan sering tidak stabil, beberapa penelitian menambahkan mode *offline* yang menyimpan data di perangkat lalu mengirimkannya ketika koneksi kembali (Indah & Wati, 2025; Rokhman dkk., 2026)."),
  P("PT Semeru Agung Mandiri menghadapi kondisi yang sama. Karyawannya melakukan presensi melalui aplikasi Android dari kantor, posko, dan gudang. Aplikasi yang dibangun penulis dengan Flutter dan PocketBase dirancang *offline-first* karena muncul keluhan presensi lambat atau gagal terkirim di lokasi tertentu. Arsitektur ini mencegah presensi hilang, tetapi hanya mengatasi gejalanya. Penyebabnya, yaitu kualitas jaringan di lokasi kerja, tidak pernah diukur."),
  P("Untuk memastikan permasalahan tersebut, penulis melakukan studi pendahuluan terhadap data presensi agregat periode 20 April sampai 27 Mei 2026 (38 hari). Pada periode tersebut tercatat 1.911 catatan presensi dari 88 pengguna di 14 dari 16 lokasi kerja yang terdaftar. Sebanyak 91,2% presensi masuk dilakukan pada pukul 07.00–08.59, hanya 4,3% presensi dilakukan melalui Wi-Fi kantor, dan 282 catatan (14,8%) berasal dari mode tugas luar (GAMAS). Temuan dan dampaknya dirangkum pada Tabel 1.1."),
  capT("Tabel 1.1. Temuan Studi Pendahuluan dan Dampaknya"),
  tbl([567, 3685, 3685], ["No.", "Temuan", "Dampak"], [
    ["1.", "Keluhan presensi lambat atau gagal terkirim", "Rekap penggajian terlambat; HRD memeriksa manual"],
    ["2.", "Hanya 4,3% presensi melalui Wi-Fi kantor", "Kualitas jaringan ikut ditentukan operator seluler"],
    ["3.", "91,2% presensi masuk terjadi pada pukul 07.00–08.59", "Gangguan pada jam itu berdampak pada banyak karyawan"],
    ["4.", "Tidak ada data jaringan; penanda *offline* bernilai 0 pada semua catatan", "Keluhan tidak terbukti; lokasi bermasalah tidak diketahui"],
    ["5.", "6 dari 14 lokasi < 30 catatan; 4 lokasi terbesar = 68,9%", "Data tidak seimbang; lokasi kecil perlu perlakuan khusus"],
    ["6.", "Pengukuran manual ke setiap lokasi mahal", "Pengukuran sesaat di satu titik tidak mewakili 16 lokasi"],
  ], { align: [C, Lf, Lf], cantSplit: true, keep: false }),
  src("Sumber: data presensi 20 April–27 Mei 2026 (agregat) dan pengamatan penulis, 2026"),
  P("Berdasarkan Tabel 1.1 dapat dinyatakan bahwa inti permasalahannya adalah **perusahaan belum memiliki data objektif tentang kualitas jaringan pada saat presensi dilakukan**, yaitu di lokasi mana jaringan buruk, melalui operator apa, dan seberapa buruk. Karena sebagian besar karyawan memakai data seluler, kualitas jaringan di suatu lokasi ditentukan oleh infrastruktur fisik di sekitarnya, yaitu menara pemancar (BTS) operator seluler dan titik akses (*access point*) Wi-Fi kantor."),
  P("Kualitas jaringan dapat diukur secara objektif dengan parameter *Quality of Service* (QoS), yaitu *delay*, *jitter*, *packet loss*, dan *throughput*, yang hasilnya dikategorikan menurut standar TIPHON (European Telecommunications Standards Institute [ETSI], 1999; Rosid dkk., 2023). Namun, penelitian QoS di Indonesia umumnya mengukur satu jaringan di satu lokasi dengan Wireshark (Rosid dkk., 2023; Fiqria & Purnama, 2024; Basmar & Yusuf, 2026) atau dengan aplikasi pengukur seperti nPerf (Ainina & Ridwan, 2024). Cara ini dilakukan manual pada titik dan waktu tertentu, padahal kualitas jaringan berubah menurut waktu. Basmar dan Yusuf (2026) menemukan bahwa pada jam sibuk *packet loss* mencapai 26,5% dan *delay* 485 ms, keduanya termasuk kategori buruk. Aplikasi pengukur kecepatan juga mengukur ke servernya sendiri, bukan ke server perusahaan yang dipakai untuk presensi."),
  P("Perbedaan antarlokasi atau antaroperator juga tidak cukup ditunjukkan dengan rata-rata, karena data jaringan sering tidak berdistribusi normal. Makarim (2026) membandingkan tiga penyedia internet dengan uji Kruskal-Wallis dan menemukan perbedaan *ping* yang signifikan, sedangkan perbedaan kecepatan unggah tidak signifikan; artinya, selisih angka belum tentu perbedaan yang nyata."),
  P("Keterbatasan pengukuran manual dapat diatasi dengan pengukuran berbasis *crowdsourcing*, yaitu pengukuran yang dijalankan langsung di perangkat banyak pengguna sehingga mencerminkan kondisi yang benar-benar mereka alami (Wamser dkk., 2021). Pengukuran dapat berjalan otomatis tanpa tindakan pengguna, seperti dibuktikan Wu dkk. (2017) melalui lebih dari lima juta pengukuran dari 2.351 ponsel. Data sebanyak itu perlu dikelompokkan agar mudah ditindaklanjuti. K-Means telah digunakan untuk mengelompokkan kualitas internet seluler 17 kabupaten/kota (Irwansyah dkk., 2025) dan pemakaian *bandwidth* 32 organisasi perangkat daerah (Mubarak dkk., 2023). Pengelompokan ini diperlukan karena indeks TIPHON adalah rata-rata beberapa parameter, sehingga koneksi yang lambat tetapi stabil dapat memperoleh indeks yang sama dengan koneksi yang cepat tetapi sering gagal. K-Means memisahkan pola-pola tersebut berdasarkan kemiripan nilai seluruh parameter sekaligus."),
  P("Meskipun demikian, terdapat tiga celah penelitian. Pertama, penelitian QoS yang ada mengukur secara manual di satu titik pada waktu tertentu (Rosid dkk., 2023; Fiqria & Purnama, 2024). Kedua, penelitian K-Means kualitas jaringan memakai data pihak ketiga atau data perangkat pemantau jaringan, bukan data dari aplikasi yang dipakai sehari-hari (Irwansyah dkk., 2025; Mubarak dkk., 2023). Ketiga, penelitian aplikasi presensi menangani koneksi buruk dengan mode *offline* tanpa mengukur jaringannya (Indah & Wati, 2025; Rokhman dkk., 2026). Sepanjang penelusuran penulis, belum ditemukan penelitian yang memanfaatkan aplikasi presensi sebagai instrumen pengukuran QoS berbasis *crowdsourcing*, menguji perbedaan antarlokasi dan antaroperator, lalu mengelompokkan hasilnya dengan K-Means."),
  P("Penelitian ini perlu dilakukan karena presensi adalah dasar penggajian, perbaikan jaringan memerlukan biaya sehingga harus diarahkan ke lokasi dan operator yang terbukti bermasalah, dan aplikasi presensi sudah dipakai setiap hari di semua lokasi sehingga dapat menjadi instrumen pengukuran yang murah."),
  P("Oleh karena itu, modul telemetri ditambahkan pada aplikasi presensi untuk mengukur *delay*, *jitter*, tingkat kegagalan, *throughput* unggah, dan lama putus koneksi pada setiap sesi presensi ke server perusahaan dan alamat pembanding, serta mencatat jenis jaringan dan nama operator, tanpa mengubah alur presensi. Data selama empat minggu dikategorikan menurut standar TIPHON, perbedaannya antarlokasi dan antaroperator diuji dengan Kruskal-Wallis, lalu sesi presensi dikelompokkan dengan K-Means untuk menyusun profil kualitas jaringan setiap lokasi kerja."),
  H2("1.2 Batasan Masalah"),
  P("Agar penelitian ini fokus dan terarah, ruang lingkupnya dibatasi sebagai berikut:"),
  ...L([
    "Penelitian dilakukan pada aplikasi presensi Android PT Semeru Agung Mandiri versi 2.0.1; perangkat iOS tidak diteliti.",
    "Unit analisis adalah sesi presensi, yaitu pengukuran di sekitar satu presensi masuk atau pulang yang lolos validasi *geofence*. Sinkronisasi latar belakang (WorkManager) tidak dicatat.",
    "Jalur yang diukur adalah komunikasi HTTPS dari perangkat karyawan ke server perusahaan, dengan alamat pemeriksaan koneksi Google (`generate_204`) sebagai pembanding.",
    "Parameter yang diukur adalah *delay* (RTT tingkat aplikasi), *jitter*, tingkat kegagalan sebagai pengganti *packet loss*, *throughput* unggah, dan lama putus koneksi, disertai konteks jenis jaringan dan nama operator. Kekuatan sinyal dan lokasi BTS tidak diukur.",
    "Data dikumpulkan selama empat minggu dengan pseudonim, tanpa nama, email, koordinat GPS, maupun foto. Uji perbedaan antarlokasi hanya untuk lokasi dengan paling sedikit 30 sesi.",
    "Analisis menggunakan kategori TIPHON, uji Kruskal-Wallis, dan K-Means, sedangkan validasi instrumen dilakukan di meja terhadap PCAPdroid dan Wireshark. Penelitian tidak melakukan perbaikan jaringan, tetapi memberikan rekomendasi.",
  ]),
  H2("1.3 Rumusan Masalah"),
  P("Rumusan masalah dalam penelitian ini adalah sebagai berikut:"),
  ...L([
    "Bagaimana kualitas jaringan pada sesi presensi di setiap lokasi kerja dan setiap operator menurut kategori TIPHON, dan apakah terdapat perbedaan yang signifikan antarlokasi dan antaroperator?",
    "Bagaimana pola kualitas jaringan yang terbentuk dari pengelompokan sesi presensi menggunakan K-Means, dan lokasi kerja mana yang didominasi pola kualitas buruk?",
  ]),
  H2("1.4 Tujuan Penelitian"),
  P("Penelitian ini bertujuan menyediakan data objektif kualitas jaringan saat presensi di setiap lokasi kerja dengan aplikasi presensi sebagai instrumen, dengan tujuan khusus:"),
  ...L([
    "Mendeskripsikan kualitas jaringan pada sesi presensi per lokasi kerja dan per operator menurut kategori TIPHON, serta menguji perbedaannya dengan uji Kruskal-Wallis.",
    "Mengelompokkan sesi presensi berdasarkan *delay*, *jitter*, dan tingkat kegagalan menggunakan K-Means, lalu menyusun profil setiap lokasi kerja sehingga diketahui lokasi yang didominasi pola kualitas buruk.",
  ]),
  H2("1.5 Manfaat Penelitian"),
  P("Manfaat penelitian ini adalah sebagai berikut:"),
  ...L([
    "**Manfaat teoretis:** memberikan cara pengukuran QoS berbasis *crowdsourcing* yang memakai aplikasi operasional sebagai instrumen, sebagai pelengkap pengukuran manual di satu titik, serta penerapan uji Kruskal-Wallis dan K-Means pada data QoS dari perangkat pengguna.",
    "**Manfaat praktis:**",
    ["Bagi perusahaan, profil lokasi menjadi dasar penempatan *access point* atau pemilihan operator.",
     "Bagi HRD, data per lokasi membantu menelusuri keluhan presensi.",
     "Bagi pengembang, dua alamat pengukuran membedakan masalah server dari masalah jaringan."],
  ]),
];

// =====================================================================
// BAB II
// =====================================================================
const bab2 = [
  H1("BAB II", "TINJAUAN PUSTAKA"),
  H2("2.1 Landasan Teori"),
  P("Landasan teori berikut membahas objek penelitian (aplikasi presensi dan arsitektur *offline-first*), apa yang diukur (QoS, standar TIPHON, serta jaringan akses seluler dan Wi-Fi), cara mengukur (*crowdsourcing* dan telemetri), cara menganalisis (K-Means, penentuan jumlah klaster, dan uji Kruskal-Wallis), metode penelitian, dan pelindungan data pribadi."),
  H3("2.1.1 Aplikasi Presensi *Mobile* dan Arsitektur *Offline-First*"),
  P("Aplikasi presensi *mobile* adalah aplikasi pada telepon pintar yang digunakan karyawan untuk mencatat kehadiran, biasanya dilengkapi validasi lokasi dengan GPS dan foto. Ismail dan Zakaria (2023) membangun aplikasi presensi berbasis Flutter dan *library* Geolocator untuk menggantikan mesin sidik jari yang datanya harus direkap manual, sedangkan Rokhman dkk. (2026) membangun sistem personalia multiplatform dengan presensi berbasis *geofence*, verifikasi wajah, dan pelacakan lokasi tenaga penjual. Kedua aplikasi tersebut bergantung pada jaringan untuk mengirim data ke server."),
  P("Masalah koneksi di lapangan diatasi dengan mode *offline*. Indah dan Wati (2025) mengembangkan aplikasi absensi berbasis QR Code yang menyimpan data secara lokal ketika koneksi tidak tersedia dan menyinkronkannya ketika koneksi kembali, karena perusahaan memiliki banyak lokasi kerja dengan koneksi yang tidak stabil. Rokhman dkk. (2026) menerapkan penyimpanan lokal SQLite dan penanda `client_event_id` agar sinkronisasi tetap konsisten. Pendekatan yang menjadikan penyimpanan lokal sebagai sumber data utama dan sinkronisasi sebagai proses susulan disebut *offline-first* (Devina dkk., 2026)."),
  P("Aplikasi presensi PT Semeru Agung Mandiri menerapkan arsitektur *offline-first*. Setiap presensi disimpan terlebih dahulu di basis data lokal Isar, dimasukkan ke antrean sinkronisasi, lalu dikirim ke server PocketBase melalui HTTPS ketika perangkat terhubung ke jaringan. Antrean ini mencatat setiap percobaan pengiriman beserta hasilnya, sehingga dapat diamati tanpa mengubah cara kerjanya."),
  P("Aplikasi juga memvalidasi lokasi dengan *geofence*, yaitu presensi hanya dapat dilakukan jika perangkat berada di dalam radius lokasi kerja (15–30 meter). Terdapat tiga pengecualian, yaitu mode tugas luar (GAMAS), izin lokasi fleksibel dari admin, dan titik sementara buatan admin. Presensi tidak mewajibkan Wi-Fi kantor; aplikasi hanya mencatat apakah Wi-Fi yang terhubung adalah Wi-Fi kantor berdasarkan BSSID. Pemeriksaan *geofence* tetap berjalan tanpa internet karena posisi dibaca dari GPS dan daftar lokasi tersimpan di perangkat. Aturan ini menentukan apakah lokasi suatu pengukuran dapat dipercaya, sehingga diperhitungkan dalam pembentukan sesi pada Bab III."),
  H3("2.1.2 *Quality of Service*"),
  P("*Quality of Service* (QoS) adalah cara mengukur seberapa baik jaringan menyediakan layanan pengiriman data, yang dinyatakan dengan sejumlah parameter terukur (Rosid dkk., 2023). Parameter QoS yang umum digunakan adalah sebagai berikut (ETSI, 1999; Rosid dkk., 2023; Basmar & Yusuf, 2026)."),
  P("**Delay** adalah waktu yang dibutuhkan data untuk menempuh jarak dari asal ke tujuan. Pada pengukuran pulang-pergi, *delay* dinyatakan sebagai *round-trip time* (RTT), yaitu selisih waktu antara permintaan dikirim dan balasan diterima:"),
  eq([subT("t", "terima"), v("−"), subT("t", "kirim")].reduce((a, x) => a, [v("d"), v("="), subT("t", "terima"), v("−"), subT("t", "kirim")]), "(2.1)"),
  PN("dengan *d* adalah *delay* dalam milidetik (ms), *t*_{kirim} adalah waktu permintaan dikirim, dan *t*_{terima} adalah waktu balasan diterima."),
  P("**Jitter** adalah variasi *delay* antarpengukuran yang berurutan. Semakin besar *jitter*, semakin tidak stabil jaringan:"),
  eq([v("J"), v("="), frac([v("1")], [v("n−1")]), sum([v("i=2")], [v("n")], [v("|"), sub("d", "i"), v("−"), sub("d", "i−1"), v("|")])], "(2.2)"),
  PN("dengan *J* adalah *jitter* (ms), *d*_{i} adalah *delay* pengukuran ke-*i*, dan *n* adalah jumlah pengukuran."),
  P("**Packet loss** adalah persentase paket yang tidak sampai ke tujuan:"),
  eq([v("PL"), v("="), frac([subT("N", "kirim"), v("−"), subT("N", "terima")], [subT("N", "kirim")]), v("×100%")], "(2.3)"),
  PN("dengan *N*_{kirim} adalah jumlah paket yang dikirim dan *N*_{terima} adalah jumlah paket yang diterima."),
  P("**Throughput** adalah kecepatan nyata pengiriman data, yaitu jumlah data yang berhasil dikirim dibagi lama pengiriman:"),
  eq([v("T"), v("="), frac([v("B×8")], [v("Δt")])], "(2.4)"),
  PN("dengan *T* adalah *throughput* (kbps), *B* adalah jumlah data terkirim (*byte*), dan Δ*t* adalah lama pengiriman (ms)."),
  P("*Packet loss* pada Persamaan (2.3) dihitung per paket di tingkat jaringan. Aplikasi Android biasa tidak dapat melihat paket tanpa akses khusus, sehingga dalam penelitian ini *packet loss* diganti dengan tingkat kegagalan di tingkat aplikasi, yaitu persentase permintaan yang gagal karena *timeout* atau galat jaringan. Keduanya sama-sama menggambarkan data yang tidak sampai, tetapi tingkat kegagalan lebih kasar karena satu permintaan terdiri atas banyak paket. Penggantian ini dinyatakan sebagai keterbatasan penelitian."),
  H3("2.1.3 Standar TIPHON"),
  P("*Telecommunications and Internet Protocol Harmonization Over Networks* (TIPHON) adalah dokumen ETSI yang membahas aspek umum QoS pada jaringan berbasis IP (ETSI, 1999). Penelitian QoS di Indonesia menggunakan kategori TIPHON untuk menilai *delay*, *jitter*, *packet loss*, dan *throughput* ke dalam indeks 1 sampai 4 (Rosid dkk., 2023; Fiqria & Purnama, 2024; Ramayanti & Syarifudin, 2024; Basmar & Yusuf, 2026), seperti ditunjukkan pada Tabel 2.1."),
  capT("Tabel 2.1. Kategori Parameter QoS Menurut Standar TIPHON"),
  tbl([1417, 1304, 1247, 1191, 1984, 794], ["Kategori", "*Delay*", "*Jitter*", "*Packet Loss*", "*Throughput*", "Indeks"], [
    ["Sangat bagus", "< 150 ms", "0 ms", "0%", "> 2,1 Mbps", "4"],
    ["Bagus", "150–300 ms", "0–75 ms", "3%", "1,2–2,1 Mbps", "3"],
    ["Sedang", "300–450 ms", "75–125 ms", "15%", "700 kbps–1,2 Mbps", "2"],
    ["Jelek", "> 450 ms", "125–225 ms", "25%", "< 700 kbps", "1"],
  ], { align: [Lf, C, C, C, C, C], cantSplit: true }),
  src("Sumber: ETSI (1999) dalam Rosid dkk. (2023)"),
  P("Berdasarkan Tabel 2.1 dapat dinyatakan bahwa setiap parameter memiliki satuan dan ambang berbeda, tetapi semuanya dikonversi ke indeks yang sama. Nilai *packet loss* pada tabel merupakan batas bawah setiap kategori, sehingga dalam penelitian ini kategori sangat bagus diartikan kurang dari 3%, bagus 3% sampai kurang dari 15%, sedang 15% sampai kurang dari 25%, dan jelek 25% atau lebih. Indeks keseluruhan adalah rata-rata indeks keempat parameter yang ditafsirkan dengan Tabel 2.2."),
  capT("Tabel 2.2. Kategori Indeks Keseluruhan TIPHON"),
  tbl([2552, 2552, 2833], ["Rata-rata Indeks", "Persentase", "Kategori"], [
    ["3,80–4,00", "95–100%", "Sangat memuaskan"],
    ["3,00–3,79", "75–94,75%", "Memuaskan"],
    ["2,00–2,99", "50–74,75%", "Kurang memuaskan"],
    ["1,00–1,99", "25–49,75%", "Tidak memuaskan"],
  ], { align: [C, C, Lf], cantSplit: true }),
  src("Sumber: Rosid dkk. (2023)"),
  P("Ambang TIPHON awalnya disusun untuk layanan suara dan multimedia *real-time*, sehingga cukup ketat untuk aplikasi presensi. Dalam penelitian ini TIPHON tetap digunakan sebagai tolok ukur umum agar hasilnya dapat dibandingkan dengan penelitian QoS lain, sedangkan pola kualitas ditentukan juga oleh K-Means yang tidak bergantung pada ambang TIPHON."),
  H3("2.1.4 Jaringan Akses Seluler dan Wi-Fi"),
  P("Perangkat karyawan terhubung ke internet melalui salah satu dari dua jaringan akses. Pada Wi-Fi, perangkat terhubung ke *access point* (AP) yang tersambung ke penyedia layanan internet (ISP) kantor. Pada jaringan seluler, perangkat terhubung ke BTS atau eNodeB milik operator, lalu data diteruskan melalui jaringan inti operator ke internet. Kualitas yang diterima pengguna dipengaruhi oleh jarak dan hambatan menuju AP atau BTS, jumlah pengguna yang berbagi kapasitas yang sama, serta kapasitas jalur operator atau ISP menuju server."),
  P("Akibatnya, dua karyawan di lokasi yang sama dapat mengalami kualitas berbeda jika memakai operator berbeda, dan kualitas di satu lokasi dapat turun ketika banyak pengguna terhubung bersamaan. Basmar dan Yusuf (2026) menunjukkan penurunan QoS pada jam sibuk, Ainina dan Ridwan (2024) membandingkan tiga operator 4G di satu kecamatan, dan Makarim (2026) menemukan perbedaan *ping* yang signifikan antarpenyedia internet. Karena itu, jenis jaringan dan nama operator harus dicatat bersama hasil pengukuran."),
  P("Pada Android, nama operator untuk kartu SIM yang sedang dipakai untuk data dapat dibaca melalui `TelephonyManager` tanpa izin tambahan, sedangkan jenis jaringan dibaca dari status konektivitas. Dengan demikian, penelitian ini mengukur infrastruktur fisik jaringan (BTS operator dan AP Wi-Fi) dari sisi pengguna, dengan ponsel karyawan sebagai sensor."),
  H3("2.1.5 Pengukuran Jaringan Berbasis *Crowdsourcing*"),
  P("*Crowdsourced network measurement* adalah pengukuran yang dilakukan langsung pada perangkat pengguna akhir sehingga menggambarkan kinerja jaringan dari sudut pandang pengguna dalam skala besar (Wamser dkk., 2021). Berbeda dengan pengukuran manual di satu titik, data berasal dari banyak perangkat, lokasi, dan waktu. Berdasarkan keterlibatan pengguna, pengukuran dibedakan menjadi *participatory sensing*, yaitu pengguna sengaja menjalankan pengujian, dan *opportunistic sensing*, yaitu pengukuran berjalan otomatis ketika ada kesempatan tanpa tindakan pengguna (Wu dkk., 2017). Penelitian ini menggunakan *opportunistic sensing* yang dipicu oleh presensi."),
  P("Kelemahan *crowdsourcing* adalah lokasi dan waktu pengukuran tidak dikendalikan, sehingga validitasnya perlu dijaga. Wamser dkk. (2021) menganalisis lebih dari 20,4 juta pengukuran seluler di Prancis dan menegaskan bahwa jumlah pengukuran menentukan apakah suatu pernyataan tentang kualitas jaringan dapat dianggap valid. Tripkovic dkk. (2021) menunjukkan bahwa pengukuran perlu dikelompokkan dan dirangkum per area untuk mengurangi derau. Karena itu, penelitian ini merangkum pengukuran per sesi presensi, menetapkan paling sedikit 30 sesi per lokasi untuk uji perbedaan, dan menyajikan hasil secara agregat."),
  H3("2.1.6 Telemetri dan RTT Tingkat Aplikasi"),
  P("Telemetri adalah pengukuran otomatis yang hasilnya dikirim ke pusat pengolahan data. Dalam penelitian ini, telemetri berupa modul di dalam aplikasi presensi yang mengukur kualitas jaringan pada satu perangkat lalu mengunggah hasilnya ke server, sedangkan *crowdsourcing* adalah penggabungan data dari banyak perangkat. Wu dkk. (2017) mengembangkan MopEye yang mengukur RTT setiap aplikasi secara oportunistik melalui layanan VPN Android. Penelitian ini mengukur di tingkat aplikasi karena aplikasi biasa tidak dapat mengirim paket ICMP (*ping*) tanpa akses *root*."),
  P("RTT tingkat aplikasi adalah waktu sejak permintaan HTTP dikirim sampai balasan diterima, yang terdiri atas waktu tempuh jaringan pulang-pergi dan waktu pemrosesan di server. Jika permintaan ditujukan ke alamat yang sangat ringan, seperti `/api/health` yang tidak membuka basis data, waktu pemrosesan sangat kecil sehingga RTT didominasi oleh jaringan. Hasil telemetri divalidasi dengan RTT yang direkam PCAPdroid dan dibaca dengan Wireshark, alat yang juga digunakan penelitian QoS sebelumnya (Rosid dkk., 2023; Fiqria & Purnama, 2024)."),
  P("Pengukuran bersifat hibrida. Sebagian data diambil secara pasif dari komunikasi presensi yang sudah berjalan, yaitu percobaan sinkronisasi, unggah foto, dan perubahan status koneksi. Sebagian lain diambil dari *probe*, yaitu beberapa permintaan kecil yang dikirim saat presensi tersimpan. *Probe* dikirim ke dua alamat, yaitu server perusahaan dan alamat `generate_204` milik Google yang juga dipakai Android untuk memeriksa koneksi internet. Perbandingan kedua alamat digunakan untuk menafsirkan sumber masalah seperti pada Tabel 2.3."),
  capT("Tabel 2.3. Penafsiran Hasil Dua Alamat Pengukuran"),
  tbl([1984, 1984, 3969], ["Server Perusahaan", "Alamat Pembanding", "Penafsiran"], [
    ["Baik", "Baik", "Jaringan dan server dalam kondisi baik"],
    ["Buruk", "Buruk", "Masalah berada di jaringan akses lokal atau operator (BTS, AP, atau ISP)"],
    ["Buruk", "Baik", "Masalah berada di server perusahaan atau jalur menuju server"],
  ], { align: [C, C, Lf], cantSplit: true }),
  src("Sumber: diolah penulis, 2026"),
  H3("2.1.7 Algoritma K-Means"),
  P("K-Means adalah algoritma *clustering* yang membagi *n* data ke dalam *k* klaster sehingga setiap data masuk ke klaster dengan pusat (*centroid*) terdekat (Ikotun dkk., 2023). K-Means termasuk *unsupervised learning* karena tidak membutuhkan data berlabel. Algoritma ini sederhana, cepat, dan mudah ditafsirkan, tetapi jumlah klaster harus ditentukan terlebih dahulu dan hasilnya dipengaruhi pusat awal (Ikotun dkk., 2023). Langkah-langkah K-Means adalah sebagai berikut:"),
  ...L([
    "Menentukan jumlah klaster *k*.",
    "Memilih *k* pusat awal dengan inisialisasi k-means++, yaitu pusat awal dipilih saling berjauhan agar hasil lebih stabil (Ikotun dkk., 2023).",
    "Menghitung jarak setiap data ke setiap pusat klaster dengan jarak Euclidean pada Persamaan (2.5).",
    "Memasukkan setiap data ke klaster dengan jarak terkecil.",
    "Menghitung ulang pusat setiap klaster sebagai rata-rata anggotanya dengan Persamaan (2.6).",
    "Mengulangi langkah 3 sampai 5 hingga keanggotaan klaster tidak berubah.",
  ]),
  eq([v("D"), v("("), sub("x", "i"), v(","), sub("c", "j"), v(")"), v("="), new MathRadical({ children: [sum([v("p=1")], [v("m")], [new MathSuperScript({ children: [v("("), sub("x", "ip"), v("−"), sub("c", "jp"), v(")")], superScript: [v("2")] })])] })], "(2.5)"),
  eq([sub("c", "j"), v("="), frac([v("1")], [v("|"), sub("C", "j"), v("|")]), sum([sub("x", "i"), v("∈"), sub("C", "j")], [], [sub("x", "i")])], "(2.6)"),
  PN("dengan *x*_{i} adalah data ke-*i*, *c*_{j} adalah pusat klaster ke-*j*, *m* adalah jumlah atribut, *C*_{j} adalah himpunan anggota klaster ke-*j*, dan |*C*_{j}| adalah jumlah anggotanya."),
  P("Karena K-Means berbasis jarak, atribut dengan rentang nilai besar akan mendominasi perhitungan. *Delay* bernilai ratusan milidetik, sedangkan tingkat kegagalan 0–100%, sehingga setiap atribut harus dinormalisasi. Irwansyah dkk. (2025) menggunakan RobustScaler yang memakai median dan rentang antarkuartil sehingga tidak mudah terpengaruh pencilan:"),
  eq([v("x'"), v("="), frac([v("x−"), sub("Q", "2")], [sub("Q", "3"), v("−"), sub("Q", "1")])], "(2.7)"),
  PN("dengan *x'* adalah nilai hasil normalisasi, *Q*_{2} adalah median, serta *Q*_{1} dan *Q*_{3} adalah kuartil pertama dan ketiga atribut tersebut."),
  H3("2.1.8 Penentuan Jumlah Klaster"),
  P("Jumlah klaster ditentukan dari data dengan dua cara. Metode *elbow* menghitung *Sum of Squared Error* (SSE) untuk beberapa nilai *k*, lalu memilih titik “siku”, yaitu titik setelah penambahan klaster tidak lagi menurunkan SSE secara berarti:"),
  eq([v("SSE"), v("="), sum([v("j=1")], [v("k")], [sum([sub("x", "i"), v("∈"), sub("C", "j")], [], [new MathSuperScript({ children: [v("D"), v("("), sub("x", "i"), v(","), sub("c", "j"), v(")")], superScript: [v("2")] })])])], "(2.8)"),
  P("Mihevc dan Podržaj (2025) menerapkan metode *elbow* pada data komunikasi elektronik 32 negara dan menegaskan bahwa hasilnya perlu diperiksa kembali dengan pemahaman bidang yang diteliti. Cara kedua adalah nilai *silhouette*, yang mengukur seberapa dekat suatu data dengan klasternya sendiri dibandingkan dengan klaster lain (Shahapure & Nicholas, 2020):"),
  eq([v("s(i)"), v("="), frac([v("b(i)−a(i)")], [new MathFunction({ name: [tx("max")], children: [v("{a(i),b(i)}")] })])], "(2.9)"),
  PN("dengan *a*(*i*) adalah rata-rata jarak data ke-*i* ke anggota lain dalam klasternya dan *b*(*i*) adalah rata-rata jarak terkecil data ke-*i* ke anggota klaster lain. Nilai *s*(*i*) berada pada rentang −1 sampai 1; nilai mendekati 1 berarti data berada di klaster yang tepat, sekitar 0 berarti berada di perbatasan, dan negatif berarti kemungkinan salah klaster. Sebagai pembanding, Irwansyah dkk. (2025) memperoleh nilai *silhouette* 0,351 untuk K-Means pada data kualitas internet seluler."),
  H3("2.1.9 Uji Kruskal-Wallis"),
  P("Uji Kruskal-Wallis adalah uji nonparametrik untuk mengetahui apakah tiga atau lebih kelompok sampel independen berasal dari populasi dengan median yang sama; untuk dua kelompok, uji ini setara dengan uji Mann-Whitney. Uji ini tidak mensyaratkan data berdistribusi normal karena bekerja pada peringkat data, sehingga cocok untuk *delay* yang umumnya menceng ke kanan. Statistik uji dihitung dengan:"),
  eq([v("H"), v("="), frac([v("12")], [v("N(N+1)")]), sum([v("j=1")], [v("g")], [frac([new MathSuperScript({ children: [sub("R", "j")], superScript: [v("2")] })], [sub("n", "j")])]), v("−3(N+1)")], "(2.10)"),
  PN("dengan *N* adalah jumlah seluruh data, *g* adalah jumlah kelompok, *n*_{j} adalah jumlah data kelompok ke-*j*, dan *R*_{j} adalah jumlah peringkat kelompok ke-*j*. Nilai *H* dibandingkan dengan distribusi *chi-square* berderajat bebas *g* − 1; jika nilai *p* < 0,05, terdapat paling sedikit satu kelompok yang berbeda. Kelompok yang berbeda ditelusuri dengan uji lanjut Dunn yang dikoreksi Bonferroni. Makarim (2026) menggunakan uji ini untuk membandingkan *ping*, unggah, dan unduh tiga penyedia internet."),
  H3("2.1.10 Penelitian Kuantitatif Deskriptif dan Komparatif"),
  P("Penelitian kuantitatif menggunakan data berupa angka yang dikumpulkan dengan instrumen penelitian dan dianalisis secara statistik (Sugiyono, 2019). Penelitian deskriptif bertujuan mengetahui nilai variabel mandiri tanpa membandingkan atau menghubungkannya dengan variabel lain, sedangkan penelitian komparatif membandingkan keadaan satu variabel pada dua atau lebih sampel yang berbeda (Sugiyono, 2019). Instrumen harus valid dan reliabel, yaitu mengukur apa yang seharusnya diukur dan memberikan hasil yang konsisten. Dalam penelitian ini, variabelnya adalah kualitas jaringan pada sesi presensi, sampelnya dibandingkan antarlokasi dan antaroperator, dan instrumennya adalah modul telemetri yang divalidasi terlebih dahulu."),
  H3("2.1.11 Pelindungan Data Pribadi"),
  P("Data telemetri berasal dari perangkat karyawan sehingga pengumpulannya harus memperhatikan Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi, yang mengatur bahwa pemrosesan data pribadi harus terbatas, spesifik, sah, dan transparan sesuai tujuannya (Republik Indonesia, 2022). Penelitian ini mengganti identitas pengguna dengan pseudonim, yaitu potongan kode SHA-256 dari ID pengguna dan *salt* rahasia yang tidak ikut diekspor. Pseudonim berbeda dengan data anonim karena masih dapat dikaitkan kembali oleh pihak yang memegang *salt*, sehingga data tetap diperlakukan sebagai data pribadi: hanya data teknis jaringan yang dicatat, akses dibatasi untuk admin, dan karyawan diberi pemberitahuan di dalam aplikasi."),
  H2("2.2 Penelitian Terdahulu"),
  P("Penelitian terdahulu yang relevan dirangkum pada Tabel 2.4, beserta hasil dan perbedaannya dengan penelitian yang dilakukan."),
  capT("Tabel 2.4. Ringkasan Penelitian Terdahulu"),
  tbl([567, 2268, 2552, 2550], ["No.", "Peneliti dan Judul", "Hasil Penelitian", "Perbedaan dengan Penelitian Ini"], [
    ["1.", "Rosid dkk. (2023), Analisis *Internet Network Performance* Menggunakan Parameter *Quality of Service*", "Lalu lintas jaringan SMK direkam dengan Wireshark dan dinilai dengan TIPHON; *delay* 3,15 ms dan *packet loss* 0% (sangat bagus), *jitter* 3,156 ms (bagus).", "Pengukuran berjalan otomatis dari perangkat banyak karyawan di banyak lokasi selama empat minggu, bukan manual di satu jaringan."],
    ["2.", "Fiqria dan Purnama (2024), Analisis QoS Jaringan *Wireless* pada ISP PT. Sinar Alam Abadi dengan Standar TIPHON", "QoS diukur dengan Wireshark sebelum dan sesudah manajemen *bandwidth* PCQ; *delay* turun dari 9,967 ms menjadi 0,283 ms.", "Tidak mengubah konfigurasi jaringan, tetapi memetakan kualitas yang ada dan menambahkan uji perbedaan serta K-Means."],
    ["3.", "Ainina dan Ridwan (2024), Analisis QoS Jaringan Internet 4G di Kecamatan Seulimeum", "Survei dengan nPerf pada tiga operator; *throughput* 67,90 Mbps dan *delay* 110 ms (sangat bagus), *jitter* 182 ms (sedang).", "Pengukuran tidak dilakukan peneliti di titik survei, tetapi oleh aplikasi yang dipakai karyawan; mencakup Wi-Fi dan seluler ke server perusahaan."],
    ["4.", "Basmar dan Yusuf (2026), Analisis QoS Jaringan Nirkabel pada Jam Sibuk di Gedung Fakultas Teknik UPRI Makassar", "Pada jam sibuk *packet loss* 26,5% dan *delay* 485 ms (buruk); disarankan manajemen *bandwidth* dan penambahan *access point*.", "Mengukur pada setiap sesi presensi di 16 lokasi kerja, termasuk jam presensi pagi yang padat, tidak hanya satu gedung."],
    ["5.", "Makarim (2026), Analisis Komparatif Kecepatan Layanan Internet Menggunakan Uji Kruskal-Wallis di Kota Balikpapan", "SpeedTest di 30 titik untuk tiga penyedia; perbedaan *ping* signifikan (*p* < 0,05), perbedaan unggah tidak signifikan (*p* = 0,975).", "Data berasal dari sesi presensi nyata, bukan uji kecepatan manual; uji perbedaan dilakukan antarlokasi kerja dan antaroperator."],
    ["6.", "Wu dkk. (2017), *MopEye: Opportunistic Monitoring of Per-App Mobile Network Performance*", "Aplikasi Android mengukur RTT per aplikasi secara oportunistik; lebih dari lima juta pengukuran dari 2.351 ponsel.", "Pengukuran ditanam di aplikasi operasional perusahaan, dipicu presensi, dan diarahkan ke server perusahaan serta alamat pembanding."],
    ["7.", "Wamser dkk. (2021), *Valid Statements by the Crowd*", "Pedoman presisi pengukuran *crowdsourcing* dari 20,4 juta pengukuran di Prancis; jumlah pengukuran menentukan validitas pernyataan.", "Diterapkan pada skala satu perusahaan dengan batas minimal 30 sesi per lokasi."],
    ["8.", "Mubarak dkk. (2023), Algoritma K-Means *Clustering* Penggunaan *Bandwidth* Internet", "Data Cacti 32 OPD dikelompokkan menjadi tiga klaster (tinggi, sedang, rendah).", "Data berasal dari perangkat pengguna, bukan perangkat pemantau jaringan; jumlah klaster ditentukan dengan *elbow* dan *silhouette*."],
    ["9.", "Irwansyah dkk. (2025), Analisis Klasterisasi Kualitas Internet Seluler Menggunakan K-Means dan GMM", "Data Ookla 17 kabupaten/kota dinormalisasi RobustScaler dan dikelompokkan menjadi tiga klaster; *silhouette* K-Means 0,351.", "Data dikumpulkan sendiri per sesi presensi di lokasi kerja, bukan data pihak ketiga per kabupaten."],
    ["10.", "Indah dan Wati (2025), Pengembangan Mode *Offline* dan Sinkronisasi Data pada Aplikasi Absensi Berbasis QR Code", "Aplikasi absensi menyimpan data lokal saat koneksi tidak stabil dan menyinkronkannya ketika koneksi kembali.", "Tidak membangun mode *offline*, tetapi mengukur kualitas jaringan yang menjadi alasan mode *offline* dibutuhkan."],
    ["11.", "Rokhman dkk. (2026), Rancang Bangun Manajemen Personalia Multiplatform dengan *Live Tracking* dan *Payroll*", "Sistem Flutter dan Laravel dengan presensi *geofence*, mode *offline*, dan `client_event_id`; lulus uji *black-box*.", "Aplikasi presensi dijadikan instrumen pengukuran QoS yang divalidasi terhadap PCAPdroid, bukan diuji fungsinya."],
  ], { align: [C, Lf, Lf, Lf] }),
  src("Sumber: diolah dari penelitian terdahulu, 2026"),
  P("Berdasarkan Tabel 2.4 dapat dinyatakan bahwa penelitian terdahulu terbagi menjadi tiga kelompok. Kelompok pertama (nomor 1–5) mengukur QoS secara manual dengan Wireshark atau aplikasi pengukur, lalu menilainya dengan TIPHON atau uji statistik. Kelompok kedua (nomor 6–9) membuktikan bahwa pengukuran *crowdsourcing* dapat dilakukan otomatis dalam skala besar dan bahwa K-Means dapat mengelompokkan data kualitas jaringan, tetapi datanya berasal dari aplikasi pengukur khusus, pihak ketiga, atau perangkat jaringan. Kelompok ketiga (nomor 10–11) menangani koneksi buruk pada aplikasi presensi tanpa mengukur jaringannya. Penelitian ini menggabungkan ketiganya, yaitu mengukur QoS secara otomatis dari aplikasi presensi, menilainya dengan TIPHON, menguji perbedaannya dengan Kruskal-Wallis, dan mengelompokkannya dengan K-Means per lokasi kerja dan operator."),
];

// =====================================================================
// BAB III
// =====================================================================
const t36 = [
  ["S1", "Kantor pusat, Wi-Fi kantor, masuk", "85 (4)", "12 (3)", "0 (4)", "3.200 (4)", "3,75 Memuaskan"],
  ["S2", "Kantor pusat, operator A, masuk", "140 (4)", "35 (3)", "0 (4)", "1.900 (3)", "3,50 Memuaskan"],
  ["S3", "Posko A, operator A, masuk", "320 (2)", "95 (2)", "12,5 (3)", "850 (2)", "2,25 Kurang memuaskan"],
  ["S4", "Posko A, operator B, pulang", "510 (1)", "160 (1)", "37,5 (1)", "420 (1)", "1,00 Tidak memuaskan"],
  ["S5", "Gudang, Wi-Fi kantor, pulang", "180 (3)", "40 (3)", "0 (4)", "1.500 (3)", "3,25 Memuaskan"],
  ["S6", "Posko B, operator C, pulang", "460 (1)", "140 (1)", "25,0 (1)", "600 (1)", "1,00 Tidak memuaskan"],
];
const t37 = [
  ["S1", "−0,6000", "−0,2857", "0,0000", "2,3081", "C1", "Memuaskan"],
  ["S2", "−0,4000", "−0,2857", "0,2000", "2,1792", "C1", "Memuaskan"],
  ["S3", "0,2545", "0,2857", "1,0280", "1,3355", "C1", "Kurang memuaskan"],
  ["S4", "0,9455", "1,4286", "2,3081", "0,0000", "C2", "Tidak memuaskan"],
  ["S5", "−0,2545", "−0,2857", "0,3455", "2,0926", "C1", "Memuaskan"],
  ["S6", "0,7636", "0,8571", "1,7792", "0,5997", "C2", "Tidak memuaskan"],
];
const wk = (a, b) => [12, 13, 14].map((w) => (w >= a && w <= b ? "■" : ""));
function jadwal() {
  const rows = [
    ["1.", "Studi pendahuluan, studi literatur, dan proposal", 1, 1],
    ["2.", "Ujian proposal dan izin penelitian", 2, 2],
    ["3.", "Perancangan instrumen", 2, 3],
    ["4.", "Implementasi modul dan pengujian unit", 3, 5],
    ["5.", "Validasi instrumen di meja", 5, 6],
    ["6.", "Rilis bertahap dan pilot", 6, 6],
    ["7.", "Pengumpulan data dan wawancara HRD", 7, 10],
    ["8.", "Analisis data", 10, 11],
    ["9.", "Penyusunan laporan", 10, 12],
  ];
  const W = [450, 3287, ...Array(12).fill(350)];
  const hc = (t, w, o = {}) => new TableCell({ width: { size: w, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, ...o, children: cellP(t, { bold: true, align: C }) });
  const r1 = new TableRow({ tableHeader: true, children: [hc("No.", 450, { rowSpan: 2, borders: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000" } } }), hc("Kegiatan", 3287, { rowSpan: 2, borders: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000" } } }), hc("Bulan ke-1", 1400, { columnSpan: 4 }), hc("Bulan ke-2", 1400, { columnSpan: 4 }), hc("Bulan ke-3", 1400, { columnSpan: 4 })] });
  const r2 = new TableRow({ tableHeader: true, children: Array.from({ length: 12 }, (_, i) => hc(String((i % 4) + 1), 350, { borders: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000" } } })) });
  const body = rows.map(([n, k, a, b]) => new TableRow({ cantSplit: true, children: [
    new TableCell({ width: { size: 450, type: WidthType.DXA }, children: cellP(n, { align: C }) }),
    new TableCell({ width: { size: 3287, type: WidthType.DXA }, children: cellP(k) }),
    ...Array.from({ length: 12 }, (_, i) => new TableCell({ width: { size: 350, type: WidthType.DXA }, children: cellP(""), ...(i + 1 >= a && i + 1 <= b ? { shading: { type: ShadingType.CLEAR, color: "auto", fill: "999999" } } : {}) })),
  ] }));
  return new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: W, layout: TableLayoutType.FIXED,
    borders: { top: B1, bottom: B1, left: B0, right: B0, insideHorizontal: BG, insideVertical: BG }, margins: { top: 40, bottom: 40, left: 60, right: 60 }, rows: [r1, r2, ...body] });
}

const bab3 = [
  H1("BAB III", "METODE PENELITIAN"),
  H2("3.1 Jenis dan Pendekatan Penelitian"),
  P("Penelitian ini menggunakan pendekatan kuantitatif dengan jenis penelitian deskriptif dan komparatif (Sugiyono, 2019). Bagian deskriptif menggambarkan kualitas jaringan pada sesi presensi di setiap lokasi kerja dan operator menurut kategori TIPHON, sedangkan bagian komparatif menguji apakah kualitas tersebut berbeda secara signifikan antarlokasi dan antaroperator dengan uji Kruskal-Wallis. Pola kualitas kemudian dikelompokkan dengan K-Means. Data kualitatif dari wawancara HRD hanya digunakan sebagai pembanding hasil."),
  P("Penelitian ini termasuk Bidang Minat *Artificial Intelligence & Networks*, topik *Network Management*, dengan ruang lingkup analisis kinerja jaringan (Fakultas Teknik dan Informatika ITB Widya Gama Lumajang, 2026). Yang dianalisis adalah kinerja jaringan, bukan fitur aplikasi presensi. Modul telemetri pada aplikasi presensi berperan sebagai instrumen pengukuran, sama seperti Wireshark pada penelitian QoS sebelumnya (Rosid dkk., 2023; Fiqria & Purnama, 2024), sehingga modul tersebut divalidasi sebelum digunakan."),
  H2("3.2 Objek dan Sumber Data Penelitian"),
  H3("3.2.1 Lokasi dan Waktu Penelitian"),
  P("Penelitian dilakukan di PT Semeru Agung Mandiri pada 16 lokasi kerja yang terdaftar di aplikasi presensi, yang terdiri atas kantor, posko, dan gudang. Setiap lokasi memiliki kode (`office_id`) sehingga pengukuran dapat dikelompokkan per lokasi tanpa mencatat koordinat GPS. Pengembangan dan validasi modul dilakukan pada server uji (*staging*) yang terpisah dari server produksi. Penelitian direncanakan selama 12 minggu sesuai jadwal pada Subbab 3.9, dengan pengumpulan data selama empat minggu."),
  H3("3.2.2 Objek Penelitian"),
  P("Objek penelitian adalah kualitas jaringan pada saat presensi, yaitu pada jalur komunikasi antara perangkat karyawan dan server perusahaan melalui Wi-Fi atau jaringan seluler. Instrumen pengukurannya adalah aplikasi presensi Android versi 2.0.1 (Flutter, Isar, dan PocketBase) yang ditambah modul telemetri dan sudah dipakai karyawan setiap hari di semua lokasi kerja."),
  H3("3.2.3 Populasi, Sampel, dan Unit Analisis"),
  P("Unit analisis penelitian ini adalah **sesi presensi**, yaitu kumpulan pengukuran dari satu perangkat di sekitar satu presensi masuk atau pulang yang lolos validasi *geofence*. Sesi mencakup *probe* yang dipicu saat presensi tersimpan, percobaan sinkronisasi presensi tersebut, serta pengukuran lain dalam 15 menit pada sisi waktu ketika karyawan dipastikan berada di lokasi, yaitu 15 menit sesudah presensi masuk atau 15 menit sebelum presensi pulang. Dengan definisi ini, kode lokasi pada setiap sesi dapat dipercaya."),
  P("Populasi adalah seluruh sesi presensi karyawan PT Semeru Agung Mandiri selama periode pengumpulan data. Seluruh anggota populasi dijadikan sampel (sampling jenuh), sehingga tidak dilakukan pemilihan sampel secara acak (Sugiyono, 2019). Berdasarkan studi pendahuluan, rata-rata terdapat sekitar 50 catatan presensi per hari, sehingga dalam empat minggu diperkirakan terkumpul sekitar 1.400 catatan atau paling banyak sekitar 2.800 sesi masuk dan pulang. Lokasi dengan paling sedikit 30 sesi diikutkan dalam uji perbedaan, sedangkan lokasi lain dilaporkan secara deskriptif sebagai lokasi kecil (Wamser dkk., 2021)."),
  H3("3.2.4 Jenis dan Sumber Data"),
  P("Data yang digunakan terdiri atas data primer dan sekunder seperti ditunjukkan pada Tabel 3.1."),
  capT("Tabel 3.1. Jenis dan Sumber Data Penelitian"),
  tbl([3118, 1134, 3685], ["Data", "Jenis", "Sumber"], [
    ["Sampel *probe*, percobaan sinkronisasi, dan putus koneksi", "Primer", "Modul telemetri pada perangkat karyawan (koleksi `net_samples`)"],
    ["Data validasi instrumen", "Primer", "Pengukuran di meja dengan telemetri, PCAPdroid, dan Wireshark pada server uji"],
    ["Keterangan lokasi dan operator yang sering bermasalah", "Primer", "Wawancara dengan HRD atau admin presensi"],
    ["Data presensi agregat dan daftar lokasi kerja", "Sekunder", "Basis data aplikasi presensi"],
    ["Teori dan penelitian terdahulu", "Sekunder", "Jurnal ilmiah, prosiding, buku, dan dokumen standar"],
  ], { align: [Lf, C, Lf], cantSplit: true }),
  src("Sumber: diolah penulis, 2026"),
  H2("3.3 Teknik Pengumpulan Data"),
  P("Teknik pengumpulan data dalam penelitian ini adalah sebagai berikut:"),
  ...L([
    "**Telemetri berbasis** ***crowdsourcing.*** Setiap kali presensi masuk atau pulang tersimpan, modul mengirim *probe* ke server perusahaan dan ke alamat pembanding, lalu mencatat konteks jaringan. Modul juga mencatat percobaan sinkronisasi, unggah foto, dan putus koneksi, serta menjalankan *probe* berkala paling sering setiap 15 menit selama aplikasi berjalan. Definisi metrik per sesi ditunjukkan pada Tabel 3.2.",
    "**Validasi instrumen.** Sebelum dirilis, hasil telemetri dibandingkan dengan RTT yang direkam PCAPdroid dan dibaca dengan Wireshark pada kondisi Wi-Fi, seluler 4G, mode pesawat, dan putus-sambung, masing-masing paling sedikit sepuluh pasang pengukuran (Lampiran 2).",
    "**Wawancara.** Wawancara singkat dengan HRD atau admin tentang lokasi, jam, dan operator yang sering dikeluhkan (Lampiran 1). Hasilnya digunakan sebagai pembanding.",
    "**Dokumentasi.** Data presensi agregat dan daftar lokasi kerja diambil dari basis data aplikasi; data `net_samples` diekspor setiap minggu dalam format CSV.",
    "**Studi literatur** tentang QoS, TIPHON, jaringan akses, *crowdsourcing*, K-Means, dan uji Kruskal-Wallis.",
  ]),
  capT("Tabel 3.2. Definisi Metrik per Sesi Presensi"),
  tbl([1474, 1814, 3175, 1474], ["Metrik", "Sumber", "Cara Menghitung per Sesi", "Penilaian"], [
    ["*Delay* (RTT)", "*Probe* server", "Median RTT seluruh permintaan *probe* yang berhasil, Persamaan (2.1)", "TIPHON *delay*"],
    ["*Jitter*", "*Probe* server berurutan", "Persamaan (2.2) atas RTT berurutan dalam sesi", "TIPHON *jitter*"],
    ["Tingkat kegagalan", "*Probe* server dan percobaan sinkronisasi", "Permintaan gagal karena *timeout* atau galat jaringan dibagi seluruh permintaan × 100%; galat HTTP 4xx tidak dihitung", "Pengganti *packet loss*"],
    ["*Throughput* unggah", "Sinkronisasi presensi berfoto", "Persamaan (2.4) pada unggahan yang berhasil", "TIPHON *throughput*"],
    ["Lama putus koneksi", "Perubahan status koneksi", "Jumlah lama terputus dalam sesi", "Deskriptif"],
    ["Nilai pembanding", "*Probe* `generate_204`", "Median RTT, *jitter*, dan kegagalan dengan cara yang sama", "Penafsiran (Tabel 2.3)"],
  ], { cantSplit: true }),
  src("Sumber: diolah dari Rosid dkk. (2023) dan Wu dkk. (2017)"),
  P("Berdasarkan Tabel 3.2 dapat dinyatakan bahwa *delay* dan *jitter* dihitung dari *probe* karena ukuran permintaannya kecil dan seragam, sedangkan *throughput* hanya dihitung dari presensi berfoto karena ukuran datanya cukup besar. Waktu diukur dengan jam monoton perangkat (`Stopwatch`), sehingga selisih jam perangkat dengan server tidak memengaruhi hasil."),
  H2("3.4 Tahapan Penelitian"),
  P("Tahapan penelitian ditunjukkan pada Gambar 3.1."),
  fig("tahapan.png", 416, 397),
  capG("Gambar 3.1. Tahapan Penelitian"),
  src("Sumber: diolah penulis, 2026"),
  P("Berdasarkan Gambar 3.1, penelitian terdiri atas enam tahap. Tahap pertama adalah studi pendahuluan dan literatur untuk menetapkan masalah dan metrik. Tahap kedua adalah penyusunan instrumen berupa modul telemetri. Tahap ketiga adalah validasi instrumen di meja; jika selisih terhadap PCAPdroid lebih dari 20%, modul diperbaiki dan divalidasi ulang. Tahap keempat adalah pengumpulan data melalui rilis bertahap, pilot dua hari, dan pengumpulan selama empat minggu. Tahap kelima adalah analisis data, dan tahap keenam adalah pembahasan serta penyusunan laporan."),
  H2("3.5 Rancangan Instrumen Penelitian"),
  H3("3.5.1 Kebutuhan Modul Telemetri"),
  P("Modul telemetri harus mengukur kualitas jaringan tanpa mengganggu fungsi utama aplikasi. Kebutuhan fungsionalnya ditunjukkan pada Tabel 3.3."),
  capT("Tabel 3.3. Kebutuhan Fungsional Modul Telemetri"),
  tbl([850, 7087], ["Kode", "Kebutuhan Fungsional"], [
    ["F01", "Saat presensi masuk atau pulang tersimpan, mengirim satu permintaan pembuka koneksi lalu tiga permintaan terukur ke `/api/health` dan tiga ke `generate_204` dengan batas waktu 5 detik"],
    ["F02", "Menjalankan *probe* berkala paling sering setiap 15 menit selama aplikasi berjalan"],
    ["F03", "Mencatat hasil, lama, ukuran data, dan jenis galat setiap percobaan sinkronisasi presensi"],
    ["F04", "Mencatat lama putus koneksi ketika perangkat kembali terhubung"],
    ["F05", "Mencatat jenis jaringan, Wi-Fi kantor atau bukan, nama operator SIM data, kode lokasi, mode presensi, status *geofence*, versi aplikasi, dan model perangkat"],
    ["F06", "Memberi kode sesi dan jenis peristiwa (masuk, pulang, atau berkala) pada setiap sampel"],
    ["F07", "Menyimpan sampel di Isar dengan batas 2.000 sampel"],
    ["F08", "Mengunggah sampel ke koleksi `net_samples` secara berkelompok setelah antrean presensi kosong"],
    ["F09", "Menyala atau mati berdasarkan saklar server (`app_config`) dan mengganti identitas pengguna dengan pseudonim"],
  ], { align: [C, Lf], cantSplit: true }),
  src("Sumber: diolah penulis, 2026"),
  P("Kebutuhan nonfungsional modul adalah: (1) modul hanya mengamati dan tidak mengubah urutan, isi, maupun hasil sinkronisasi presensi; (2) setiap fungsi dijalankan tanpa ditunggu oleh alur presensi dan dibungkus penanganan galat sehingga kegagalan telemetri tidak menjalar ke presensi; (3) ukuran satu sampel kurang dari 300 *byte* dan beban data kurang dari 1 MB per hari per perangkat; serta (4) modul mati secara bawaan dan dapat dimatikan dari server tanpa memperbarui aplikasi."),
  H3("3.5.2 Arsitektur Modul Telemetri"),
  P("Hubungan antara alur presensi, modul telemetri, dan server ditunjukkan pada Gambar 3.2."),
  fig("arsitektur.png", 529, 358),
  capG("Gambar 3.2. Arsitektur Modul Telemetri pada Aplikasi Presensi"),
  src("Sumber: diolah penulis, 2026"),
  P("Berdasarkan Gambar 3.2, modul NetTelemetry berada di samping alur presensi dan hanya mengamatinya. Presensi yang tersimpan menjadi pemicu sesi, antrean sinkronisasi dan pemantau koneksi diamati untuk mencatat percobaan pengiriman dan putus koneksi, lalu sampel disimpan di Isar dan diunggah ke koleksi `net_samples` setelah antrean presensi kosong, sehingga data presensi selalu didahulukan. Data diekspor ke Python untuk dianalisis."),
  H3("3.5.3 Alur Pengukuran *Probe*"),
  P("Alur *probe* yang dipicu presensi ditunjukkan pada Gambar 3.3."),
  fig("alur.png", 454, 337),
  capG("Gambar 3.3. Alur Pengukuran *Probe* Saat Presensi"),
  src("Sumber: diolah penulis, 2026"),
  P("Berdasarkan Gambar 3.3, *probe* hanya berjalan jika telemetri aktif. Modul mencatat konteks, lalu mengirim permintaan ke server perusahaan dan alamat pembanding. Permintaan pembuka digunakan untuk membuka koneksi TCP dan TLS, sehingga tiga permintaan terukur berjalan pada koneksi yang sudah terbuka dan RTT-nya sebanding dengan RTT pada rekaman PCAPdroid."),
  H3("3.5.4 Rancangan Data"),
  P("Setiap sampel disimpan di koleksi `net_samples` pada server PocketBase dengan struktur pada Tabel 3.4."),
  capT("Tabel 3.4. Struktur Koleksi net_samples"),
  tbl([2381, 1304, 4252], ["Kolom", "Tipe", "Keterangan"], [
    ["`anon_id`", "teks", "Pseudonim: 16 karakter pertama SHA-256 dari ID pengguna dan *salt* rahasia"],
    ["`session_id`, `event`", "teks, pilihan", "Kode sesi dan peristiwa pemicu: `check_in`, `check_out`, atau `berkala`"],
    ["`kind`, `probe_target`", "pilihan", "Jenis sampel (`probe`, `sync_attempt`, `outage`) dan alamat *probe* (`server` atau `pembanding`)"],
    ["`office_id`, `mode`, `loc_valid`", "teks, pilihan, *boolean*", "Kode lokasi, mode presensi, dan status sampel termasuk sesi yang lolos *geofence*"],
    ["`network_type`, `office_wifi`, `carrier`", "pilihan, *boolean*, teks", "Jenis jaringan, Wi-Fi kantor atau bukan (BSSID tidak disimpan), dan nama operator SIM data"],
    ["`rtt_ms`, `jitter_ms`", "angka", "RTT dan *jitter* *probe*, atau lama permintaan sinkronisasi"],
    ["`ok`, `error_class`", "*boolean*, pilihan", "Status berhasil dan jenis galat (`timeout`, `network`, `http4xx`, `http5xx`)"],
    ["`bytes_sent`, `outage_ms`", "angka", "Ukuran data terkirim dan lama putus koneksi"],
    ["`sampled_at`", "tanggal", "Waktu pengukuran (UTC)"],
    ["`app_version`, `os_sdk`, `device_model`", "teks, angka", "Versi aplikasi, versi Android, dan model perangkat (bukan nomor seri)"],
  ], { align: [Lf, C, Lf], cantSplit: true }),
  src("Sumber: diolah penulis, 2026"),
  P("Berdasarkan Tabel 3.4 dapat dinyatakan bahwa tidak ada kolom yang menyimpan nama, email, nomor telepon, ID pengguna asli, koordinat GPS, maupun foto. Karyawan hanya dapat menambah data, sedangkan melihat, mengubah, dan menghapus data hanya dapat dilakukan admin."),
  H2("3.6 Alat Penelitian"),
  P("Alat yang digunakan dalam penelitian ini ditunjukkan pada Tabel 3.5."),
  capT("Tabel 3.5. Alat Penelitian"),
  tbl([3118, 4819], ["Alat", "Kegunaan"], [
    ["Laptop (Windows 11)", "Pengembangan modul, pengolahan data, dan penulisan laporan"],
    ["Minimal dua ponsel Android berbeda kelas", "Pengujian modul dan validasi instrumen"],
    ["Server PocketBase produksi dan server uji", "Penyimpanan data presensi dan sampel telemetri"],
    ["Flutter, Dart, dan Isar 3.1", "Pengembangan modul dan penyimpanan lokal sampel"],
    ["Kotlin (MethodChannel) dan `TelephonyManager`", "Membaca nama operator SIM data"],
    ["`connectivity_plus`", "Mendeteksi jenis jaringan dan perubahan status koneksi"],
    ["PCAPdroid, Wireshark, dan adb", "Merekam lalu lintas dan mengatur skenario jaringan saat validasi"],
    ["Python (pandas, scipy, scikit-posthocs, scikit-learn, matplotlib)", "Pembentukan sesi, TIPHON, Kruskal-Wallis dan uji Dunn, K-Means, serta grafik"],
  ], { cantSplit: true }),
  src("Sumber: diolah penulis, 2026"),
  H2("3.7 Teknik Analisis Data"),
  P("Analisis data dilakukan dalam enam langkah, yaitu validasi instrumen, pembersihan data dan pembentukan sesi, analisis deskriptif dan TIPHON, uji Kruskal-Wallis, K-Means, serta penyusunan profil lokasi. Karena data penelitian baru diperoleh setelah modul dirilis, contoh perhitungan menggunakan data ilustrasi."),
  H3("3.7.1 Validasi Instrumen"),
  P("Validasi dilakukan dengan membandingkan median RTT telemetri dan median RTT dari PCAPdroid yang dibaca dengan Wireshark pada setiap kondisi jaringan:"),
  eq([v("δ"), v("="), frac([v("|"), subT("M", "tel"), v("−"), subT("M", "PCAP"), v("|")], [subT("M", "PCAP")]), v("×100%")], "(3.1)"),
  PN("dengan δ adalah selisih relatif, *M*_{tel} adalah median RTT telemetri, dan *M*_{PCAP} adalah median RTT dari PCAPdroid. Instrumen dinyatakan valid jika δ ≤ 20% pada setiap kondisi. Selain itu, nama operator harus sesuai dengan SIM data yang aktif, *probe* harus terpicu pada setiap presensi uji, lama putus koneksi harus sesuai jadwal skenario dengan toleransi ±5 detik, dan beban data harus kurang dari 1 MB per hari."),
  H3("3.7.2 Pembersihan Data dan Pembentukan Sesi"),
  P("Sampel dengan RTT ≤ 0 atau > 60.000 ms dan sampel ganda dibuang. Sampel lalu dikelompokkan berdasarkan `session_id`, dan nilai setiap sesi dihitung sesuai Tabel 3.2. Sesi yang seluruh permintaannya gagal disebut sesi **tanpa layanan**; sesi ini tidak memiliki nilai *delay*, sehingga tidak diisi dengan nilai buatan, tidak diikutkan dalam K-Means, tetapi dilaporkan sebagai persentase per lokasi karena merupakan kondisi terburuk. Sesi mode GAMAS dan lokasi fleksibel dianalisis terpisah sebagai kelompok di luar lokasi kerja."),
  H3("3.7.3 Analisis Deskriptif dan Kategorisasi TIPHON"),
  P("Nilai sesi diringkas per lokasi, per operator, dan per peristiwa (masuk atau pulang) dalam bentuk jumlah sesi, median, dan rentang antarkuartil. Median setiap kelompok dikonversi ke indeks TIPHON (Tabel 2.1), lalu indeks keseluruhan ditafsirkan dengan Tabel 2.2. Contoh perhitungan pada sesi ilustrasi ditunjukkan pada Tabel 3.6, dengan indeks setiap parameter di dalam kurung."),
  capT("Tabel 3.6. Contoh Kategorisasi TIPHON pada Data Ilustrasi"),
  tbl([680, 1871, 907, 850, 850, 1134, 1645], ["Kode", "Sesi", "*Delay* (ms)", "*Jitter* (ms)", "Gagal (%)", "*Throughput* (kbps)", "Indeks dan Kategori"], t36, { align: [C, Lf, C, C, C, C, Lf], cantSplit: true }),
  src("Sumber: data ilustrasi, 2026"),
  P("Berdasarkan Tabel 3.6, sesi S3 memperoleh indeks (2 + 2 + 3 + 2)/4 = 2,25 sehingga termasuk kategori kurang memuaskan. Sesi S4 dan S6 di posko termasuk tidak memuaskan, sedangkan sesi di kantor pusat dan gudang termasuk memuaskan."),
  H3("3.7.4 Uji Perbedaan dengan Kruskal-Wallis"),
  P("Uji Kruskal-Wallis (Persamaan 2.10) dengan taraf signifikansi α = 0,05 digunakan untuk tiga perbandingan *delay*, *jitter*, dan tingkat kegagalan, yaitu antarlokasi kerja (lokasi dengan paling sedikit 30 sesi), antaroperator (hanya sesi seluler), serta antara sesi masuk dan pulang. Hipotesisnya adalah H_{0}: median kelompok sama, dan H_{1}: paling sedikit satu kelompok memiliki median berbeda. Jika H_{0} ditolak, uji Dunn dengan koreksi Bonferroni digunakan untuk menentukan pasangan yang berbeda, dan besar selisih median dilaporkan agar perbedaan yang signifikan dapat dinilai kepentingannya."),
  P("Karena satu karyawan dapat menyumbang banyak sesi, uji yang sama diulang pada median per karyawan untuk memastikan hasil tidak didominasi oleh karyawan tertentu. Komposisi operator di setiap lokasi juga dilaporkan, karena perbedaan antarlokasi dapat disebabkan oleh perbedaan operator yang dipakai."),
  H3("3.7.5 Pengelompokan dengan K-Means"),
  P("Atribut K-Means adalah *delay*, *jitter*, dan tingkat kegagalan setiap sesi. *Throughput* tidak dijadikan atribut karena hanya tersedia pada sesi berfoto, tetapi dilaporkan per klaster. Atribut dinormalisasi dengan RobustScaler (Persamaan 2.7), lalu K-Means dijalankan dengan inisialisasi k-means++ dan sepuluh kali percobaan untuk *k* = 2 sampai 6. Nilai *k* dipilih dengan metode *elbow* dan *silhouette*, lalu setiap klaster diberi label berdasarkan nilai pusatnya."),
  P("Contoh perhitungan memakai enam sesi pada Tabel 3.6 dengan atribut *delay* dan tingkat kegagalan agar mudah diikuti, *k* = 2, dan pusat awal S1 dan S4. Kuartil *delay* adalah *Q*_{1} = 150, *Q*_{2} = 250, dan *Q*_{3} = 425, sedangkan kuartil kegagalan adalah 0; 6,25; dan 21,875. Normalisasi S1 adalah:"),
  eqU([sub("x'", "S1,delay"), v("="), frac([v("85−250")], [v("425−150")]), v("=−0,6000"), tx("   "), sub("x'", "S1,gagal"), v("="), frac([v("0−6,25")], [v("21,875−0")]), v("=−0,2857")]),
  PN("Jarak S3 ke pusat C1 (S1) dihitung dengan Persamaan (2.5):"),
  eqU([v("D"), v("("), v("S3,"), sub("c", "1"), v(")"), v("="), new MathRadical({ children: [new MathSuperScript({ children: [v("(0,2545+0,6000)")], superScript: [v("2")] }), v("+"), new MathSuperScript({ children: [v("(0,2857+0,2857)")], superScript: [v("2")] })] }), v("=1,0280")]),
  P("Hasil normalisasi dan iterasi pertama seluruh sesi ditunjukkan pada Tabel 3.7."),
  capT("Tabel 3.7. Contoh Normalisasi dan Iterasi Pertama K-Means"),
  tbl([737, 1191, 1191, 1077, 1077, 964, 1700], ["Sesi", "*x'* *delay*", "*x'* gagal", "Jarak ke C1", "Jarak ke C2", "Klaster", "Kategori TIPHON"], t37, { align: [C, C, C, C, C, C, Lf], cantSplit: true }),
  src("Sumber: data ilustrasi, 2026"),
  P("Berdasarkan Tabel 3.7, pusat baru adalah C1 = (−0,2500; −0,1429) dari S1, S2, S3, dan S5, serta C2 = (0,8545; 1,1429) dari S4 dan S6. Pada iterasi kedua keanggotaan tidak berubah, sehingga perhitungan berhenti dengan SSE 0,824 dan rata-rata *silhouette* 0,62. C1 diberi label “baik dan stabil”, sedangkan C2 diberi label “lambat dan sering gagal”. S3 masuk C1 walaupun kategori TIPHON-nya kurang memuaskan, sehingga pada data sebenarnya beberapa nilai *k* perlu diuji dan *jitter* diikutkan agar pola sedang dapat terpisah."),
  H3("3.7.6 Profil Lokasi dan Perbandingan Hasil"),
  P("Profil lokasi adalah persentase sesi setiap lokasi pada setiap klaster. Pada data ilustrasi, Posko A memiliki 50% sesi di C2, Posko B 100%, sedangkan kantor pusat dan gudang 0%. Lokasi dinyatakan didominasi pola buruk jika lebih dari separuh sesinya berada pada klaster berlabel buruk. Untuk lokasi tersebut, nilai server perusahaan dibandingkan dengan nilai alamat pembanding (Tabel 2.3) untuk menentukan apakah masalah berada di jaringan akses atau di server."),
  P("Hasil analisis dibandingkan dengan keterangan HRD menggunakan tingkat kesesuaian:"),
  eq([v("K"), v("="), frac([subT("n", "sesuai")], [subT("n", "total")]), v("×100%")], "(3.2)"),
  PN("dengan *n*_{sesuai} adalah jumlah lokasi yang status bermasalah atau tidaknya sama antara hasil analisis dan keterangan HRD, dan *n*_{total} adalah jumlah lokasi yang dibandingkan. Keluaran penelitian adalah tabel kualitas per lokasi dan operator, hasil uji perbedaan, profil klaster setiap lokasi, dan rekomendasi perbaikan."),
  H2("3.8 Etika Penelitian dan Keterbatasan"),
  P("Penelitian dilakukan setelah memperoleh izin tertulis PT Semeru Agung Mandiri. Karyawan diberi pemberitahuan di dalam aplikasi (Lampiran 3), data hanya berisi informasi teknis jaringan dengan pseudonim, *salt* tidak ikut diekspor, dan data tidak dipublikasikan per individu (Republik Indonesia, 2022). Keterbatasan penelitian adalah: (1) tingkat kegagalan hanya pengganti *packet loss*; (2) pengukuran hanya berjalan ketika aplikasi aktif, sehingga jumlah sampel per sesi dapat berbeda; (3) kekuatan sinyal dan lokasi BTS tidak diukur; dan (4) lokasi dengan sedikit sesi hanya dapat dijelaskan secara deskriptif."),
  H2("3.9 Jadwal Penelitian"),
  P("Penelitian direncanakan selama 12 minggu dengan jadwal pada Tabel 3.8."),
  capT("Tabel 3.8. Jadwal Penelitian"),
  jadwal(),
  src("Sumber: diolah penulis, 2026"),
];

// =====================================================================
// DAFTAR PUSTAKA
// =====================================================================
const refs = [
  "Ainina, H., & Ridwan, R. (2024). Analisis Quality of Service Jaringan Internet 4G dengan Parameter Throughput, Delay dan Jitter pada Kecamatan Seulimeum Kabupaten Aceh Besar. *Cyberspace: Jurnal Pendidikan Teknologi Informasi*, *8*(2), 33–41. https://doi.org/10.22373/cj.v8i2.25447",
  "Basmar, M. F., & Yusuf, M. (2026). Analisis Quality of Service (QoS) Jaringan Internet Nirkabel pada Jam Sibuk (Peak Hours) di Gedung Fakultas Teknik Universitas Pejuang Republik Indonesia Makassar. *JATI (Jurnal Mahasiswa Teknik Informatika)*, *10*(3), 5399–5406. https://doi.org/10.36040/jati.v10i3.18367",
  "Devina, Hasibuan, P. E. S., Azzahra, D., Anggriani, A., & Gunawan. (2026). Design and Implementation of an Offline-First Mobile Grocery Arisan Information System Using Flutter and Firebase. *Nuansa Informatika*, *20*(2), 133–148. https://doi.org/10.25134/ilkom.v20i2.582",
  "European Telecommunications Standards Institute. (1999). *Telecommunications and Internet Protocol Harmonization Over Networks (TIPHON); General Aspects of Quality of Service (QoS)* (Technical Report No. TR 101 329 V2.1.1). European Telecommunications Standards Institute.",
  "Fakultas Teknik dan Informatika ITB Widya Gama Lumajang. (2026). *Buku Pedoman Tugas Akhir 2026-2027*. Institut Teknologi dan Bisnis Widya Gama Lumajang.",
  "Fiqria, C., & Purnama, G. (2024). Analisis Quality of Service Jaringan Wireless pada ISP PT. Sinar Alam Abadi (YesNet.Wifi) dengan Standar TIPHON. *JATI (Jurnal Mahasiswa Teknik Informatika)*, *8*(5), 10060–10068. https://doi.org/10.36040/jati.v8i5.10930",
  "Ikotun, A. M., Ezugwu, A. E., Abualigah, L., Abuhaija, B., & Heming, J. (2023). K-Means Clustering Algorithms: A Comprehensive Review, Variants Analysis, and Advances in the Era of Big Data. *Information Sciences*, *622*, 178–210. https://doi.org/10.1016/j.ins.2022.11.139",
  "Indah, N. K., & Wati, L. (2025). Pengembangan Mode Offline dan Sinkronisasi Data pada Aplikasi Absensi Berbasis QR Code untuk Karyawan PT. Bintang Energi Pratama. *JUTITI: Jurnal Teknik Informatika dan Teknologi Informasi*, *5*(2), 417–427. https://doi.org/10.55606/jutiti.v5i2.5544",
  "Irwansyah, M. A., Meiriza, A., & Lestarini, D. (2025). Analisis Klasterisasi Kualitas Internet Seluler Menggunakan Metode K-Means dan Gaussian Mixture Model. *Building of Informatics, Technology and Science (BITS)*, *7*(3), 1694–1704. https://doi.org/10.47065/bits.v7i3.8615",
  "Ismail, & Zakaria, H. (2023). Rancang Bangun Sistem Presensi Karyawan Berbasis Android Menggunakan Framework Flutter dan Library Geolocator (Studi Kasus: PT. KAIA Anugerah Internasional). *LOGIC: Jurnal Ilmu Komputer dan Pendidikan*, *1*(5), 1355–1369. https://journal.mediapublikasi.id/index.php/logic",
  "Makarim, H. (2026). Analisis Komparatif Kecepatan Layanan Internet Menggunakan Uji Kruskal-Wallis: Studi Kecepatan Ping, Upload, dan Download pada Penyedia Jasa Internet di Kota Balikpapan. *JATRI: Jurnal Teknik Industri*, *4*(1), 80–88. https://doi.org/10.30872/v4i1.jatri80",
  "Mihevc, A., & Podržaj, P. (2025). Analyzing the Elbow Method in Predicting the Optimal Number of Clusters in Electronic Communications Dataset. Dalam *2025 24th International Symposium INFOTEH-JAHORINA (INFOTEH)* (hlm. 1–7). IEEE. https://doi.org/10.1109/INFOTEH64129.2025.10959278",
  "Mubarak, R., Defit, S., & Nurcahyo, G. W. (2023). Algoritma K-Means Clustering Penggunaan Bandwidth Internet (Studi Kasus di Pemerintah Daerah Kabupaten Padang Pariaman). *Explore: Jurnal Sistem Informasi dan Telematika*, *14*(1), 37–47. https://doi.org/10.36448/jsit.v14i1.3037",
  "Ramayanti, D., & Syarifudin. (2024). Analisis dan Peningkatan Kualitas Layanan pada Jaringan Komputer Nirkabel Badan Penghubung Lampung dalam Mendukung Tugas Pemerintahan. *JSAI: Journal Scientific and Applied Informatics*, *7*(1), 1–13. https://doi.org/10.36085/jsai.v7i1.5529",
  "Republik Indonesia. (2022). *Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi*. Sekretariat Negara.",
  "Rokhman, A. M., Darmanto, E., & Supriyono. (2026). Rancang Bangun Manajemen Personalia Multiplatform Terintegrasi dengan Live Tracking dan Payroll. *Jurnal Sistem Komputer dan Informatika (JSON)*, *7*(4), 1390–1400. https://doi.org/10.30865/json.v7i4.9797",
  "Rosid, R. A., Martanto, & Ali, I. (2023). Analisis Internet Network Performance Menggunakan Parameter Quality of Service. *JATI (Jurnal Mahasiswa Teknik Informatika)*, *7*(1), 203–210. https://doi.org/10.36040/jati.v7i1.6252",
  "Shahapure, K. R., & Nicholas, C. (2020). Cluster Quality Analysis Using Silhouette Score. Dalam *2020 IEEE 7th International Conference on Data Science and Advanced Analytics (DSAA)* (hlm. 747–748). IEEE. https://doi.org/10.1109/DSAA49011.2020.00096",
  "Sugiyono. (2019). *Metode Penelitian Kuantitatif, Kualitatif, dan R&D*. Alfabeta.",
  "Tripkovic, S., Svoboda, P., Raida, V., & Rupp, M. (2021). Cluster Density in Crowdsourced Mobile Network Measurements. Dalam *2021 IEEE 93rd Vehicular Technology Conference (VTC2021-Spring)* (hlm. 1–7). IEEE. https://doi.org/10.1109/VTC2021-Spring51267.2021.9448661",
  "Wamser, F., Seufert, A., Hall, A., Wunderer, S., & Hoßfeld, T. (2021). Valid Statements by the Crowd: Statistical Measures for Precision in Crowdsourced Mobile Measurements. *Network*, *1*(2), 215–232. https://doi.org/10.3390/network1020013",
  "Wu, D., Chang, R. K. C., Li, W., Cheng, E. K. T., & Gao, D. (2017). MopEye: Opportunistic Monitoring of Per-App Mobile Network Performance. Dalam *Proceedings of the 2017 USENIX Annual Technical Conference (USENIX ATC '17)* (hlm. 445–457). USENIX Association. https://www.usenix.org/conference/atc17/technical-sessions/presentation/wu",
];
const pustaka = [H1("DAFTAR PUSTAKA"), ...refs.map((r) => new Paragraph({ alignment: Lf, indent: { left: 567, hanging: 567 }, spacing: { line: 240, after: 240 }, children: runs(r) }))];

// =====================================================================
// LAMPIRAN
// =====================================================================
const vrows = Array.from({ length: 10 }, (_, i) => [String(i + 1), "", "", "", ""]);
const lampiran = [
  H1("LAMPIRAN"),
  H2("Lampiran 1. Pedoman Wawancara HRD"),
  P("Wawancara dilakukan dengan satu orang HRD atau admin presensi setelah izin penelitian diperoleh. Jawaban dicatat apa adanya tanpa menyebut nama karyawan."),
  tbl([567, 7370], ["No.", "Pertanyaan"], [
    ["1.", "Lokasi kerja mana saja yang paling sering dikeluhkan karena presensi lambat atau gagal terkirim?"],
    ["2.", "Pada jam berapa keluhan tersebut paling sering muncul?"],
    ["3.", "Di lokasi tersebut, karyawan biasanya memakai Wi-Fi kantor atau data seluler? Operator apa yang umum dipakai, dan apakah ada operator yang dikenal sulit sinyal?"],
    ["4.", "Apakah ada lokasi yang sinyalnya dianggap baik tetapi tetap ada keluhan presensi?"],
    ["5.", "Bagaimana HRD menangani presensi yang terlambat masuk ke rekap karena masalah jaringan?"],
    ["6.", "Apakah perusahaan pernah atau berencana memasang Wi-Fi atau *repeater* di lokasi tertentu? Jika ya, di mana?"],
  ], { align: [C, Lf], cantSplit: true }),
  gap(),
  H2("Lampiran 2. Lembar Validasi Instrumen"),
  P("Lembar ini diisi untuk setiap kondisi jaringan pada server uji. Setiap baris adalah satu pasang pengukuran RTT dari telemetri dan dari PCAPdroid pada waktu yang sama."),
  PN("Kondisi: Wi-Fi / seluler 4G / mode pesawat / putus-sambung", { alignment: Lf }), PN("Perangkat: ........................     Tanggal: ........................", { alignment: Lf }),
  tbl([737, 1474, 1984, 1984, 1758], ["No.", "Jam", "RTT Telemetri (ms)", "RTT PCAPdroid (ms)", "Catatan"], [...vrows, ["", "Median", "", "", ""], ["", "δ (valid jika ≤ 20%)", "", "", ""]], { align: [C, C, C, C, Lf], cantSplit: true }),
  gap(),
  ...L([
    "Nama operator tercatat sesuai dengan SIM data yang aktif: ya / tidak",
    "*Probe* terpicu pada setiap presensi uji (masuk dan pulang): ya / tidak",
    "Lama putus koneksi tercatat sesuai jadwal skenario (±5 detik): ya / tidak",
    "Beban data telemetri selama 24 jam: ........ KB (valid jika < 1 MB)",
  ]),
  H2("Lampiran 3. Teks Pemberitahuan pada Aplikasi"),
  P("Teks berikut ditampilkan di dalam aplikasi selama periode pengumpulan data."),
  new Paragraph({ indent: { left: 567, right: 567, firstLine: 0 }, spacing: { line: 276 }, children: runs("*Aplikasi ini mencatat kualitas koneksi saat presensi, yaitu waktu respons dan keberhasilan pengiriman ke server perusahaan dan ke alamat pemeriksaan koneksi Google, kecepatan unggah, lama koneksi terputus, jenis jaringan, dan nama operator seluler. Data yang dicatat tidak memuat nama, email, nomor telepon, lokasi GPS, maupun foto, dan identitas pengguna diganti dengan kode. Pencatatan ini menggunakan kuota yang sangat kecil, tidak mengubah cara presensi, dan dapat dihentikan oleh perusahaan kapan saja. Pengumpulan data telah disetujui oleh PT Semeru Agung Mandiri.*") }),
];

// =====================================================================
// DOCUMENT
// =====================================================================
const doc = new Document({
  creator: "Abd. Rouf",
  title: "Proposal Skripsi - Analisis QoS Jaringan Berbasis Crowdsourcing pada Aplikasi Presensi Menggunakan K-Means",
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 24 }, paragraph: { spacing: { line: 360, before: 0, after: 0 }, alignment: AlignmentType.JUSTIFIED, indent: { firstLine: 425 } } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Times New Roman", size: 28, bold: true }, paragraph: { alignment: C, indent: { firstLine: 0 }, spacing: { before: 0, after: 360, line: 360 }, keepNext: true, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Times New Roman", size: 24, bold: true }, paragraph: { alignment: Lf, indent: { firstLine: 0 }, spacing: { before: 240, after: 120 }, keepNext: true, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Times New Roman", size: 24, bold: true }, paragraph: { alignment: Lf, indent: { firstLine: 0 }, spacing: { before: 120, after: 60 }, keepNext: true, outlineLevel: 2 } },
      { id: "JudulTabel", name: "JudulTabel", basedOn: "Normal", next: "Normal", run: { size: 22, italics: true }, paragraph: { alignment: C, indent: { firstLine: 0 }, spacing: { before: 120, after: 60, line: 240 }, keepNext: true } },
      { id: "JudulGambar", name: "JudulGambar", basedOn: "Normal", next: "Normal", run: { size: 22, italics: true }, paragraph: { alignment: C, indent: { firstLine: 0 }, spacing: { before: 60, after: 0, line: 240 } } },
      { id: "Sumber", name: "Sumber", basedOn: "Normal", next: "Normal", run: { size: 20 }, paragraph: { alignment: Lf, indent: { firstLine: 0 }, spacing: { before: 40, after: 240, line: 240 } } },
      { id: "IsiTabel", name: "IsiTabel", basedOn: "Normal", run: { size: 20 }, paragraph: { alignment: Lf, indent: { firstLine: 0 }, spacing: { line: 240, before: 0, after: 0 } } },
      { id: "Persamaan", name: "Persamaan", basedOn: "Normal", run: { size: 24 }, paragraph: { alignment: C, indent: { firstLine: 0 }, spacing: { before: 60, after: 60, line: 240 } } },
      { id: "TOC1", name: "toc 1", basedOn: "Normal", next: "Normal", paragraph: { alignment: Lf, indent: { firstLine: 0, left: 0 }, spacing: { line: 240, after: 80 } } },
      { id: "TOC2", name: "toc 2", basedOn: "Normal", next: "Normal", paragraph: { alignment: Lf, indent: { firstLine: 0, left: 284 }, spacing: { line: 240, after: 80 } } },
      { id: "TOC3", name: "toc 3", basedOn: "Normal", next: "Normal", paragraph: { alignment: Lf, indent: { firstLine: 0, left: 567 }, spacing: { line: 240, after: 80 } } },
    ],
  },
  numbering: { config: [
    { reference: "angka", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: Lf, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    { reference: "huruf", levels: [{ level: 0, format: LevelFormat.LOWER_LETTER, text: "%1.", alignment: Lf, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }] },
  ] },
  sections: [
    { properties: { page: PAGE }, headers: { default: new Header({ children: [empty()] }) }, footers: { default: new Footer({ children: [empty()] }) }, children: cover },
    { properties: { page: { ...PAGE, pageNumbers: { start: 2, formatType: NumberFormat.LOWER_ROMAN } } }, headers: { default: new Header({ children: [empty()] }) }, footers: { default: new Footer({ children: [pnum(C)] }) }, children: front },
    chapterSection(bab1, 1),
    chapterSection(bab2),
    chapterSection(bab3),
    chapterSection(pustaka),
    chapterSection(lampiran),
  ],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(OUT, buf); console.log("OK", OUT, buf.length); });
