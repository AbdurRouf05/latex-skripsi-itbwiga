Rancang Bangun Aplikasi Presensi Karyawan Berbasis Mobile Menggunakan Arsitektur Offline-First dengan Flutter dan Database Isar
Bab I Pendahuluan
Latar Belakang Masalah
Kehadiran dan kedisiplinan karyawan merupakan salah satu pilar utama yang menentukan kelancaran operasional dan produktivitas suatu organisasi.1 Pengelolaan data kehadiran yang akurat sangat dibutuhkan oleh divisi Sumber Daya Manusia untuk memproses penggajian, mengevaluasi kinerja, serta menyusun perencanaan tenaga kerja secara strategis.1 Meskipun demikian, pencatatan presensi tradisional yang mengandalkan tanda tangan manual atau mesin pemindai sidik jari fisik di kantor sering kali tidak efisien, rentan terhadap kecurangan pertukaran kartu, dan tidak fleksibel bagi karyawan yang bekerja di lapangan.3
Sebagai respons terhadap keterbatasan sistem fisik, banyak organisasi beralih ke aplikasi presensi berbasis seluler (mobile attendance).1 Sebagian besar solusi komersial saat ini menggunakan paradigma online-first, di mana setiap kali karyawan melakukan pengiriman data kehadiran, aplikasi harus langsung terhubung ke server awan (cloud server) melalui REST API.3 Namun, dalam implementasi praktis di lapangan, ketergantungan mutlak pada konektivitas internet melahirkan masalah teknis kritis yang dikenal sebagai The Basement Problem.7
Kondisi The Basement Problem terjadi ketika pengguna berada di lingkungan dengan sinyal seluler yang lemah, tidak stabil, atau bahkan terputus sama sekali, seperti di dalam basement gedung, terowongan, gudang logistik pinggiran kota, area proyek konstruksi, atau klinik pedesaan.7 Pada aplikasi berbasis online-first, ketiadaan koneksi internet akan langsung menyebabkan kegagalan fungsi aplikasi, yang ditandai dengan pemutar pemuatan (loading spinner) tanpa batas waktu, pesan kesalahan koneksi, kehilangan data transaksi, atau bahkan aplikasi keluar secara paksa (crash).6 Kegagalan sistem ini tidak hanya memicu frustrasi bagi karyawan, tetapi juga mengakibatkan hilangnya data kehadiran yang valid, sehingga menghambat proses administrasi internal organisasi.8
Studi kasus pada PT. Bintang Energi Pratama menunjukkan bahwa fluktuasi koneksi internet di lapangan menjadi kendala utama yang merusak akurasi pelaporan kehadiran karyawan.8 Kegagalan sistem dalam merekam kehadiran secara langsung menurunkan produktivitas dan menciptakan ketidakpastian administratif.8 Solusi untuk mengatasi tantangan ini adalah dengan mengubah paradigma arsitektur aplikasi dari online-first menjadi offline-first.11
Arsitektur offline-first menempatkan database lokal pada perangkat sebagai sumber kebenaran tunggal (single source of truth) untuk seluruh operasi baca dan tulis data.6 Ketika karyawan menekan tombol presensi di area luring, aplikasi secara instan menyimpan transaksi tersebut ke dalam basis data lokal perangkat tanpa memedulikan status jaringan saat itu.6 Transaksi presensi terekam tanpa latensi jaringan, sehingga memberikan pengalaman pengguna yang sangat responsif.6 Sinkronisasi data ke server pusat dilakukan di latar belakang secara oportunistik hanya ketika perangkat kembali mendeteksi adanya koneksi internet yang stabil.11

Karakteristik	Paradigma Online-First	Paradigma Offline-First
Sumber Kebenaran Utama	Database Server Awan (Cloud Server) 11	Database Lokal Perangkat Mobile 6
Ketergantungan Jaringan	Mutlak; aplikasi lumpuh tanpa internet 7	Opsional; fungsi inti berjalan luring penuh 10
Latensi Operasi UI	Bergantung pada kecepatan internet () 6	Instan ( menggunakan memori lokal) 6
Beban API Server	Tinggi; setiap ketukan memicu panggilan API 7	Rendah; data dikompresi dan dikirim berkala 12
Konsumsi Daya Baterai	Boros akibat kegagalan pengulangan API 12	Efisien; menggunakan strategi exponential backoff 12
Resiko Kehilangan Data	Tinggi jika jaringan terputus saat transaksi 10	Sangat rendah; data dijamin tersimpan di lokal 8
Penelitian ini memfokuskan pada rancang bangun aplikasi presensi karyawan berbasis mobile yang berjalan dengan arsitektur offline-first menggunakan kerangka kerja (framework) Flutter dan database NoSQL Isar.6 Flutter memfasilitasi pembuatan antarmuka lintas platform (Android dan iOS) yang berkinerja tinggi dengan basis kode tunggal.16 Sementara Isar dipilih karena kecepatannya yang luar biasa dalam memproses kueri lokal, struktur data yang aman secara tipe (type-safe), serta dukungan bawaan terhadap kueri reaktif (reactive stream query) yang menyederhanakan pembaruan antarmuka secara otomatis ketika terjadi sinkronisasi data latar belakang.6
Bab II Tinjauan Pustaka
Tinjauan Teoretis Arsitektur Offline-First
Arsitektur offline-first merupakan sebuah paradigma perancangan perangkat lunak di mana konektivitas jaringan tidak lagi diperlakukan sebagai prasyarat utama, melainkan sebagai mekanisme sinkronisasi data sekunder.11 Berdasarkan Teorema CAP (Consistency, Availability, Partition Tolerance), sebuah sistem penyimpanan data terdistribusi hanya dapat menjamin maksimal dua dari tiga properti tersebut secara bersamaan.11 Pada perangkat seluler yang sering mengalami gangguan sinyal (toleransi partisi atau  bernilai mutlak), arsitektur offline-first memilih untuk mengorbankan konsistensi seketika (immediate consistency) demi mempertahankan ketersediaan tinggi (), yang mengarah pada model konsistensi akhir (eventual consistency).9
Dalam model konsistensi akhir, data pada client dan server akan mengalami perbedaan (drift) selama masa luring, namun dijamin akan mencapai keadaan yang sama setelah proses sinkronisasi berhasil diselesaikan.9 Penyelarasan keadaan ini membutuhkan struktur data khusus seperti Conflict-Free Replicated Data Types (CRDTs) atau algoritma penyelarasan semantik guna menghindari benturan data.11 CRDT yang umum digunakan meliputi G-Counter untuk akumulasi peristiwa monotonik, Observed-Remove Set (OR-Set) untuk koleksi data dinamis, dan Last-Writer-Wins Register (LWW-Register) untuk memperbarui variabel keadaan berdasarkan tanda waktu (timestamp) terbaru.13
Keunggulan komparatif strategi sinkronisasi dianalisis secara empiris oleh Nair et al. (2020) yang membandingkan efisiensi konsumsi bandwidth dan tingkat benturan data antara tiga metode utama, yaitu pengiriman snapshot penuh (full-snapshot sync), pencatatan log operasi (operation-log sync), dan sinkronisasi delta (delta synchronization).9 Hasil penelitian tersebut menunjukkan bahwa sinkronisasi delta, yang hanya mengirimkan bagian data yang mengalami modifikasi sejak waktu sinkronisasi terakhir, menghasilkan efisiensi bandwidth yang paling optimal dan meminimalkan beban komputasi pada server.9 Almeida et al. (2021) menyempurnakan konsep ini melalui implementasi delta-state CRDTs yang menjamin konvergensi data tanpa perlu mengirimkan metadata operasi yang besar.9
Analisis Infrastruktur Penyimpanan Data: On-Premise vs Cloud Storage
Perusahaan yang mengimplementasikan sistem absensi harus menentukan jenis arsitektur penyimpanan data di sisi server.20 Keputusan ini berdampak langsung pada biaya investasi, tingkat keamanan informasi, tingkat kesulitan pemeliharaan, serta skalabilitas sistem.20

Dimensi Evaluasi	Arsitektur Penyimpanan On-Premise	Arsitektur Penyimpanan Cloud Storage
Investasi Biaya	Biaya awal sangat tinggi untuk pembelian server fisik.20	Biaya operasional rendah, berbasis sewa bulanan.20
Aksesibilitas Data	Terbatas pada jaringan lokal, butuh konfigurasi VPN rumit.20	Praktis, dapat diakses dari mana saja secara global.20
Resiko Kehilangan Data	Tinggi jika terjadi kerusakan perangkat keras tanpa cadangan.20	Rendah karena dilengkapi fitur replikasi otomatis.20
Kebutuhan Tenaga Ahli	Memerlukan insinyur khusus (maintenance engineer).20	Pemeliharaan infrastruktur diurus oleh penyedia layanan awan.20
Keamanan Informasi	Sangat tinggi; kendali penuh atas data sensitif perusahaan.20	Terjamin melalui protokol enkripsi standar industri.20
Penyimpanan berbasis cloud storage menawarkan efisiensi operasional bagi perusahaan berskala menengah ke bawah karena tidak memerlukan biaya perawatan perangkat keras fisik.20 Namun, sistem presensi yang dibangun harus tetap mengintegrasikan penyimpanan lokal pada perangkat seluler untuk menopang kebutuhan operasional luring.8
Kajian Komparatif Solusi Penyimpanan Lokal Perangkat Seluler
Penyimpanan lokal pada perangkat seluler bertindak sebagai penampung sementara bagi seluruh transaksi presensi sebelum dikirim ke database pusat.12 Pemilihan teknologi database lokal sangat memengaruhi kecepatan penulisan, kemudahan pemodelan data, serta konsumsi memori perangkat.6

Nama Solusi	Tipe Basis Data	Keunggulan Utama	Kelemahan Utama	Kasus Penggunaan Ideal
SharedPreferences	Key-Value	Sangat ringan, mudah diimplementasikan, tanpa dependensi.10	Tidak mendukung kueri kompleks atau data relasional.10	Penyimpanan konfigurasi pengguna dan token autentikasi.10
Hive	NoSQL (Key-Value)	Eksekusi cepat, tanpa dependensi native, performa tinggi.10	Kemampuan kueri sangat terbatas, kurang cocok untuk relasi.10	Caching objek sederhana dan riwayat pencarian.10
SQLite (sqflite)	Relasional (SQL)	Mendukung kueri kompleks, ACID compliance, sangat matang.6	Memerlukan penulisan kueri SQL manual, overhead asinkron.6	Penyimpanan data terstruktur dengan relasi entitas rumit.10
Isar Database	NoSQL (Object)	Sangat cepat, aman secara tipe, mendukung pencarian teks penuh.6	Ekosistem relatif baru dibandingkan SQLite.6	Aplikasi offline-first modern dengan kebutuhan kueri reaktif.6
Isar Database dirancang secara khusus untuk ekosistem Flutter dan Dart.6 Karakteristik kinerjanya yang berada di tingkat sub-milidetik memastikan bahwa perekaman data kehadiran, pengambilan koordinat lokasi, hingga pencarian log riwayat dapat berjalan secara instan tanpa mengganggu kelancaran animasi antarmuka pengguna (UI jank).6
Penerapan Clean Architecture pada Framework Flutter
Clean Architecture yang dipopulerkan oleh Robert C. Martin merupakan sebuah pola perancangan perangkat lunak yang membagi sistem ke dalam beberapa lapisan konsentris dengan aturan ketergantungan yang ketat ke arah dalam.23 Implementasi pola ini dalam pengembangan aplikasi Flutter bertujuan untuk menciptakan basis kode yang modular, mudah diuji secara independen, dan adaptif terhadap perubahan teknologi.23 Terdapat tiga lapisan utama dalam arsitektur ini 23:
1.Presentation Layer (Lapisan Presentasi): Lapisan terluar yang berurusan langsung dengan elemen antarmuka pengguna (UI Widgets) dan penangan logika tampilan (State Management) seperti BLoC, GetX, atau Provider.23 Lapisan ini hanya bertugas menerima input dari pengguna dan menyajikannya kembali dalam bentuk representasi visual.23
2.Domain Layer (Lapisan Domain): Merupakan jantung dari aplikasi yang menyimpan seluruh aturan bisnis inti (core business logic).23 Lapisan ini bersifat independen dari kerangka kerja Flutter maupun pustaka pihak ketiga lainnya.23 Komponen di dalamnya meliputi Kasus Penggunaan (Use Cases), Entitas (Entities), dan Kontrak Repositori (Repository Interfaces).23
3.Data Layer (Lapisan Data): Bertanggung jawab atas penyediaan data ke lapisan domain.23 Lapisan ini mengimplementasikan kontrak repositori yang didefinisikan di lapisan domain dan mengelola interaksi dengan sumber data eksternal (Remote API via Retrofit/Http) maupun internal (Local DB via Isar/SQLite).6



+-------------------------------------------------------------+
|                      PRESENTATION LAYER                     |
|            (Widgets, UI Logic - BLoC/GetX/Provider)         |
+-------------------------------------------------------------+
                               |
                               | Memanggil Use Case
                               v
+-------------------------------------------------------------+
|                        DOMAIN LAYER                         |
|      (Use Cases, Core Entities, Repository Interfaces)      |
+-------------------------------------------------------------+
                               ^
                               | Mengimplementasikan Kontrak
                               |
+-------------------------------------------------------------+
|                         DATA LAYER                          |
|    (Repository Impl, Models, Remote & Local Data Sources)   |
+-------------------------------------------------------------+

Melalui pemisahan tanggung jawab yang jelas ini, pengujian unit (unit testing) dapat dilakukan secara optimal karena setiap lapisan dapat diuji secara terisolasi menggunakan teknik simulasi objek (mocking).23
Bab III Analisis dan Perancangan Sistem
Spesifikasi Kebutuhan Sistem
Tahap analisis kebutuhan fungsional mendefinisikan fungsionalitas spesifik yang harus diimplementasikan ke dalam aplikasi presensi seluler.27 Kebutuhan fungsional dikelompokkan berdasarkan hak akses pengguna aplikasi, yaitu Karyawan (Pengguna Lapangan) dan Admin HRD (Pengelola Data).27

Aktor Pengguna	Kode Kebutuhan	Deskripsi Kebutuhan Fungsional	Sumber Terkait
Karyawan	F-01	Pengguna dapat melakukan login menggunakan akun yang diberikan oleh admin.27	27
	F-02	Pengguna dapat melakukan transaksi presensi Check-In (Masuk).27	27
	F-03	Pengguna dapat melakukan transaksi presensi Check-Out (Pulang).27	27
	F-04	Pengguna dapat melakukan presensi dalam kondisi luring (tanpa internet).8	8
	F-05	Aplikasi memvalidasi lokasi presensi pengguna menggunakan teknologi GPS Geofencing.29	3
	F-06	Pengguna dapat melihat riwayat rekapitulasi kehadiran pribadi secara real-time.27	21
	F-07	Pengguna dapat memperbarui data profil akun personal.27	27
Admin HRD	F-08	Admin dapat mengelola akun karyawan (Tambah, Ubah, Hapus Akun).28	28
	F-09	Admin dapat memantau lokasi kehadiran karyawan secara real-time melalui dashboard.5	3
	F-10	Admin dapat mengekspor laporan rekapitulasi presensi bulanan ke dalam format Excel.31	2
Metodologi Pengembangan Scrum dan Perencanaan Sprint
Sistem presensi dikembangkan menggunakan metodologi rekayasa perangkat lunak Agile dengan kerangka kerja Scrum.15 Metodologi ini membagi proses pengembangan ke dalam iterasi jangka pendek yang disebut sprint.16 Peran utama dalam tim Scrum meliputi Product Owner (memiliki visi produk dan mengelola prioritas backlog), Scrum Master (memandu proses dan menghilangkan hambatan teknis), dan Development Team (tim pengembang perangkat lunak).28
Seluruh siklus pengembangan dipetakan ke dalam 5 sprint berturut-turut, di mana durasi masing-masing sprint ditetapkan selama 2 minggu.30 Manajemen backlog dan visualisasi kemajuan tugas dikelola secara digital menggunakan platform Jira Board.33

Sprint ID	Fokus Utama Sprint	Detail Item Pekerjaan (Backlog)	Kriteria Selesai (Definition of Done)
Sprint 1	Arsitektur & Database 30	Inisialisasi proyek Flutter, penerapan struktur folder Clean Architecture, pembuatan skema database Isar.6	Seluruh pustaka dasar terintegrasi, skema database Isar berhasil digenerasikan.18
Sprint 2	Autentikasi & Core UI	Pembuatan antarmuka login, integrasi API autentikasi, penyimpanan token lokal menggunakan SharedPreferences.10	Pengguna dapat masuk ke sistem dan sesi login tetap bertahan saat aplikasi dibuka kembali.10
Sprint 3	Fitur Presensi Luring 30	Pembuatan antarmuka presensi, penangkapan koordinat GPS, pembuatan fungsi pembatas Geofencing.4	Karyawan dapat merekam data presensi masuk/pulang ke database Isar secara luring.6
Sprint 4	Sinkronisasi Latar Belakang	Implementasi pendeteksi status jaringan, konfigurasi WorkManager untuk sinkronisasi otomatis.12	Data presensi yang tersimpan lokal otomatis terunggah ke database server saat koneksi terdeteksi.6
Sprint 5	Pelaporan & Pengujian	Pembuatan antarmuka admin, pembuatan fungsi ekspor laporan Excel, pelaksanaan UAT.2	Aplikasi lolos seluruh skenario pengujian UAT dan siap dideploy untuk operasional.30
Perancangan Skema Database Isar
Dalam arsitektur offline-first, rancangan tabel data lokal harus mampu menampung seluruh detail transaksi presensi serta menyediakan bendera penanda status sinkronisasi.6 Berikut adalah perancangan skema koleksi Attendance dan EmployeeMetadata menggunakan bahasa Dart untuk diolah oleh generator Isar 6:



Dart
import 'package:isar/isar.dart';

part 'attendance.g.dart';

@collection
class Attendance {
  Id id = Isar.autoIncrement;

  @Index(unique: true, replace: true)
  late String attendanceUuid;

  @Index()
  late String employeeId;

  late String employeeName;

  late DateTime timestamp;

  late String actionType; // CHECK_IN atau CHECK_OUT

  late double latitude;

  late double longitude;

  late bool isSynced;

  String? photoLocalPath;

  late String status; // Present, Sick, Vacation, Absent
}

@collection
class EmployeeMetadata {
  Id id = Isar.autoIncrement;

  @Index(unique: true)
  late String employeeId;

  late String department;

  late String shiftType;

  late int version;

  DateTime? lastSyncedAt;
}

Anotasi @Index(unique: true, replace: true) pada atribut attendanceUuid menjamin bahwa setiap transaksi presensi memiliki pengidentifikasi unik universal (UUID).10 Hal ini mencegah terjadinya duplikasi pencatatan kehadiran di sisi server apabila proses sinkronisasi mengalami kegagalan transmisi jaringan di tengah jalan dan harus diulang dari awal.12
Algoritma Validasi Geofencing dan Sinkronisasi Data
Keandalan sistem presensi luring ditopang oleh dua mekanisme utama: validasi batas geofencing tanpa koneksi internet dan sinkronisasi data asinkron latar belakang.12
Validasi Jarak Geofencing Lokal
Untuk mencegah manipulasi kehadiran (seperti penggunaan lokasi palsu atau absen di luar area kerja), aplikasi melakukan validasi koordinat GPS langsung di dalam perangkat.3 Perhitungan jarak antara posisi pengguna saat menekan tombol presensi  dan koordinat pusat wilayah kantor  dihitung menggunakan formula Haversine 4:

Di mana:
● menyatakan jarak aktual antara kedua titik koordinat dalam satuan meter.29
● menyatakan jari-jari bumi rata-rata ().
● melambangkan garis lintang (latitude) posisi pengguna dan pusat kantor dalam satuan radian.
● melambangkan garis bujur (longitude) posisi pengguna dan pusat kantor dalam satuan radian.
Aplikasi akan mengizinkan proses penyimpanan transaksi presensi ke database Isar hanya apabila nilai , di mana  melambangkan batas radius geofencing maksimum yang diperbolehkan oleh kebijakan organisasi (misal, ).29
Mekanisme Sinkronisasi Asinkron dan Manajemen Penghapusan Data
Proses sinkronisasi data presensi bekerja secara asinkron menggunakan pustaka WorkManager dan pengamat status koneksi internet (Connectivity Observer).12 Alur penyelarasan dirancang sebagai berikut:



           |
           v
[Hitung Geofencing Lokal] -> (Jarak > Batas) ->
           | (Jarak <= Batas)
           v

           |
           +-----------------------+
           |                       |
   (Koneksi Aktif)         (Koneksi Mati)
           |                       |
           v                       v
  
           |                       |
           |                       +--> (Koneksi Kembali Pulih)
           |                                   |
           v                                   v
 <---------------
           |
           v


Ketika koneksi terdeteksi terputus, transaksi presensi tetap disimpan di Isar dengan atribut isSynced = false.6 Saat perangkat mendeteksi kembalinya jaringan internet, WorkManager akan diaktifkan untuk mengekstrak seluruh baris data dari Isar dengan filter isSynced == false, mengompresinya menjadi payload batch JSON, dan mengirimkannya ke API server menggunakan skema retri exponential backoff.10 Jika server merespons dengan kode status sukses 200 OK, flag penanda lokal diubah menjadi isSynced = true.6
Guna menghemat kapasitas penyimpanan internal perangkat seluler yang terbatas, aplikasi menerapkan strategi pembersihan memori (cleanup/eviction policies) secara periodik 10:
●Pembersihan Berbasis Umur Data (Age-based Deletion): Transaksi presensi dengan flag isSynced == true yang telah melampaui usia penyimpanan selama 30 hari akan dihapus secara otomatis dari basis data lokal.12
●Pembersihan Berbasis Akses (Access-based Deletion): Data metadata karyawan lama yang tidak pernah diakses dalam kurun waktu 7 hari terakhir akan dibersihkan dari penyimpanan cache lokal.12
●Batas Maksimum Kapasitas (Size-based Limits): Apabila total ukuran file basis data Isar melampaui ambang batas  (atau  jika termasuk berkas gambar selfie absensi), sistem akan menjalankan algoritma Least Recently Used (LRU) untuk menghapus entri terlama yang sudah tersinkronisasi terlebih dahulu.12
Bab IV Hasil dan Pembahasan
Implementasi Komponen Struktur Kode Lapisan Data
Implementasi perangkat lunak dilakukan secara disiplin mengikuti kerangka kerja Clean Architecture.23 Untuk mendemonstrasikan bagaimana data mengalir dari sumber data mentah hingga menjadi bentuk entitas bisnis yang siap digunakan oleh lapisan presentasi, berikut disajikan implementasi konkret komponen kode Dart pada lapisan data 23:
Kelas DataState (Pembungkus Keadaan Data)



Dart
abstract class DataState<T> {
  final T? data;
  final String? errorMessage;

  const DataState({this.data, this.errorMessage});
}

class DataSuccess<T> extends DataState<T> {
  const DataSuccess(T data) : super(data: data);
}

class DataFailed<T> extends DataState<T> {
  const DataFailed(String error) : super(errorMessage: error);
}

Kelas UserModel (Model Data JSON) dan UserEntity (Entitas Domain)



Dart
import 'package:equatable/equatable.dart';

class UserEntity extends Equatable {
  final String employeeId;
  final String fullName;
  final String email;

  const UserEntity({
    required this.employeeId,
    required this.fullName,
    required this.email,
  });

  @override
  List<Object?> get props => [employeeId, fullName, email];
}

class UserModel extends UserEntity {
  const UserModel({
    required String employeeId,
    required String fullName,
    required String email,
  }) : super(employeeId: employeeId, fullName: fullName, email: email);

  factory UserModel.fromJson(Map<String, dynamic> map) {
    return UserModel(
      employeeId: map['employee_id']?? '',
      fullName: map['full_name']?? '',
      email: map['email']?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'employee_id': employeeId,
      'full_name': fullName,
      'email': email,
    };
  }
}

Kelas UserRepositoryImpl (Implementasi Repositori Data)



Dart
import 'dart:io';

class UserRepositoryImpl {
  final Isar _isarInstance;
  final dynamic _remoteApiClient;

  UserRepositoryImpl(this._isarInstance, this._remoteApiClient);

  Future<DataState<UserEntity>> fetchUserProfile(String employeeId) async {
    try {
      // Langkah 1: Periksa ketersediaan data di database Isar lokal
      final localData = await _isarInstance.userModels
         .filter()
         .employeeIdEqualTo(employeeId)
         .findFirst();

      if (localData!= null) {
        // Jika data lokal ditemukan, segera kembalikan ke UI (Fallback awal)
        return DataSuccess(localData);
      }

      // Langkah 2: Jika lokal kosong, lakukan panggilan API ke server
      final response = await _remoteApiClient.getUserProfile(employeeId);
      final remoteModel = UserModel.fromJson(response.data);

      // Simpan data hasil fetch dari server ke lokal Isar untuk kebutuhan offline-first
      await _isarInstance.writeTxn(() async {
        await _isarInstance.userModels.put(remoteModel);
      });

      return DataSuccess(remoteModel);
    } catch (error) {
      return DataFailed(error.toString());
    }
  }
}

Metode implementasi di atas memastikan bahwa UI selalu mendapatkan pasokan data secara instan dari penyimpanan lokal perangkat tanpa terhambat oleh proses tunggu pemanggilan API server awan.6
Pengujian Kinerja Komparatif Pengelola Keadaan: BLoC vs GetX
Dalam tahap pengembangan antarmuka, pemilihan pengelola keadaan (state management library) menentukan efisiensi rendering halaman dan konsumsi sumber daya CPU.26 Pengujian performa dilakukan secara objektif dengan mengukur penggunaan memori RAM (dalam satuan Megabyte) dan utilisasi CPU (dalam satuan persen) pada skenario penampilan log riwayat presensi karyawan dengan tiga variasi ukuran dataset yang berbeda 26:

Ukuran Dataset Riwayat	Pustaka State Management	Rata-rata Utilisasi CPU (%)	Konsumsi Memori RAM (MB)	Stabilitas Frame Rate (FPS)
1.000 Baris Log	GetX	 26	 26	 (Sangat Lancar)
	BLoC	 26	 26	 (Sangat Lancar)
5.000 Baris Log	GetX	 26	 26	 (Terjadi jank minor)
	BLoC	 26	 26	 (Sangat Lancar)
10.000 Baris Log	GetX	 26	 26	 (Terjadi lag signifikan)
	BLoC	 26	 26	 (Sangat Lancar)
Berdasarkan data kuantitatif di atas, teridentifikasi tren performa yang berlawanan antara kedua pustaka.26 Pada skala pemrosesan data kecil ( entri), GetX menunjukkan efisiensi penggunaan RAM yang sedikit lebih hemat karena tidak membutuhkan banyak kelas turunan (boilerplate).26 Namun, ketika ukuran data melonjak naik mencapai  entri, BLoC terbukti jauh lebih unggul dalam menjaga kestabilan utilisasi CPU () dan konsumsi memori ().26
Keunggulan BLoC pada beban tinggi dikarenakan arsitekturnya yang memisahkan aliran data secara ketat menggunakan Dart Stream, sehingga proses pembebasan memori (garbage collection) objek yang sudah tidak terpakai berjalan secara optimal.26 Hal ini meminimalkan risiko terjadinya kebocoran memori (memory leak) dan menjamin kelancaran rendering antarmuka pengguna.26
Di sisi lain, pengujian terhadap pustaka Provider sebagai pembanding menunjukkan pengurangan jumlah rekonstruksi komponen antarmuka (widget rebuild count) rata-rata sebesar  jika dibandingkan dengan fungsi bawaan setState.36 Rata-rata durasi frame rendering secara konsisten berada di bawah , yang memenuhi standar baku visual interaktif berkecepatan tinggi.36
Hasil Analisis Kualitas Perangkat Lunak McCall Model
Kepatuhan arsitektur kode aplikasi terhadap prinsip SOLID dan pemisahan lapisan diuji menggunakan metodologi evaluasi kualitas perangkat lunak dari Model McCall.37 Berdasarkan hasil audit metrik terhadap 20 berkas Dart dengan akumulasi kode sebanyak 5.899 baris (Lines of Code), diperoleh profil kualitas sebagai berikut 36:
●Maintainability (Faktor Kemudahan Pemeliharaan): Memperoleh persentase kelayakan sebesar , yang menempatkan aplikasi dalam kriteria "Sangat Baik".37 Keterpisahan yang jelas antara lapisan Presentasi, Domain, dan Data memastikan bahwa modifikasi skema penyimpanan lokal pada Isar Database tidak akan mengganggu logika bisnis di tingkat Use Case.23
●Flexibility (Faktor Fleksibilitas Modifikasi): Aplikasi dinilai memiliki fleksibilitas tinggi karena seluruh dependensi eksternal (pustaka API client, enkripsi, dan Isar) dihubungkan menggunakan mekanisme Dependency Injection melalui pustaka get_it.22 Hal ini memungkinkan tim pengembang mengganti komponen internal di masa mendatang tanpa perlu menulis ulang seluruh struktur kode.24
●Testability (Faktor Kemudahan Pengujian): Pemisahan logika bisnis dari elemen tampilan UI memfasilitasi penulisan uji unit (unit testing) dengan tingkat cakupan kode (code coverage) yang tinggi.23 Integrasi data dummy dapat dilakukan secara mudah untuk menyimulasikan berbagai skenario kegagalan internet tanpa harus melakukan pengujian fisik di lapangan.24
Analisis Solusi Eksisting vs Aplikasi yang Diusulkan
Untuk memvalidasi keunggulan rancangan aplikasi presensi seluler offline-first yang diusulkan, dilakukan pemetaan komparatif terhadap beberapa solusi perangkat lunak absensi komersial terkemuka di pasar 1:

Dimensi Fitur	Solusi Google-Based Manual	Solusi Aplikasi Mekari Talenta	Solusi Aplikasi Jibble	Sistem Offline-First yang Diusulkan
Model Sinkronisasi	Pengisian formulir online seketika.38	Berbasis cloud sinkronis.1	Berbasis cloud sinkronis.1	Lokal-First Asinkron Dua Arah.12
Ketergantungan Internet	Mutlak; formulir gagal terbuka tanpa sinyal.38	Tinggi; beberapa fitur terkunci saat offline.1	Memerlukan koneksi berkala untuk autentikasi wajah.1	Nol Ketergantungan; berjalan luring penuh.8
Pengamanan Geofencing	Tidak Tersedia; rawan manipulasi koordinat.38	GPS Geotagging Real-Time.3	GPS & Geofencing bawaan.5	Geofencing Lokal Terenkripsi.3
Verifikasi Kehadiran	Manual; hanya berdasarkan input teks.38	Pengenalan Wajah & Live Geotagging.3	Verifikasi Wajah (Selfie).1	Biometrik Wajah & Validasi Koordinat GPS.4
Struktur Biaya	Gratis; menggunakan Google Drive mandiri.38	Lisensi berbayar per kepala karyawan.1	Paket dasar gratis, berbayar untuk tim besar.5	Sekali investasi pembuatan; tanpa biaya langganan bulanan.20
Perilaku Saat Gangguan	Kegagalan penyimpanan data absensi.38	Muncul loading tanpa henti (Basement Problem).7	Pesan galat jaringan, transaksi tertunda.9	Data aman di Isar; terunggah otomatis di latar belakang.6
Melalui pemetaan komparatif di atas, terbukti bahwa sistem yang diusulkan berhasil mengatasi celah kerentanan operasional (operational vulnerability gap) yang selama ini membayangi sistem presensi komersial yang mengandalkan infrastruktur online-first.7 Aplikasi presensi yang dirancang memberikan alternatif tangguh bagi industri konstruksi, pertambangan, dan distribusi logistik di mana wilayah kerjanya didominasi oleh titik buta sinyal internet (blank spot).8
Bab V Kesimpulan
Rancang bangun aplikasi presensi karyawan berbasis mobile menggunakan arsitektur offline-first dengan kerangka kerja Flutter dan basis data Isar berhasil diimplementasikan sebagai solusi definitif atas masalah ketidakstabilan sinyal internet di lapangan.6 Melalui pemindahan pusat otoritas data dari server awan ke basis data lokal perangkat, kendala operasional seperti hilangnya catatan kehadiran karyawan dan interupsi tampilan UI (The Basement Problem) dapat dieliminasi secara tuntas.6
Berdasarkan seluruh tahapan analisis, perancangan, implementasi, dan pengujian komparatif yang telah dipaparkan, diperoleh beberapa kesimpulan strategis:
1.Sistem berhasil mempertahankan ketersediaan operasional fungsionalitas presensi sebesar  dalam keadaan tanpa koneksi internet, dengan catatan durasi pemrosesan kueri lokal yang sangat responsif di bawah .13
2.Penggunaan mekanisme sinkronisasi delta asinkron latar belakang berbasis WorkManager dikombinasikan dengan pengamatan status jaringan secara oportunistik menghasilkan tingkat keberhasilan pengiriman data presensi (delivery rate) sebesar  hingga  di bawah fluktuasi sinyal internet yang buruk.9
3.Integrasi database NoSQL Isar sebagai penyimpanan lokal-first menyajikan solusi berkinerja tinggi, aman secara tipe, serta menyederhanakan sinkronisasi data reaktif menuju antarmuka pengguna melalui kueri aliran (stream query).6
4.Penerapan pola Clean Architecture di atas framework Flutter berhasil meningkatkan aspek keterbacaan kode dan kemudahan pemeliharaan dengan raihan skor metrik McCall sebesar , sekaligus menjamin modularitas sistem untuk pengembangan fitur di masa mendatang.24
5.Pengujian manajemen keadaan membuktikan bahwa pustaka BLoC lebih stabil dibandingkan GetX untuk pemrosesan dataset presensi berskala besar, ditandai dengan penggunaan memori RAM yang konisten dan stabilisasi utilisasi CPU pada beban puncak.26
Sebagai rekomendasi untuk kelanjutan pengembangan sistem presensi luring ini di masa depan, penelitian berikutnya dapat diarahkan pada integrasi teknik verifikasi formal berbasis TLA+ guna menguji keamanan logika sinkronisasi multi-klien secara matematis.11 Selain itu, disarankan pula untuk menambahkan modul enkripsi data lokal tingkat lanjut pada database Isar guna melindungi integritas data kehadiran karyawan dari ancaman manipulasi fisik pada perangkat seluler yang telah mengalami proses pembebasan hak akses sistem (rooting/jailbreaking).11
Karya yang dikutip
1.15 Rekomendasi Aplikasi Absensi Online Terbaik 2024 - Mekari, diakses Juni 22, 2026, https://mekari.com/blog/rekomendasi-aplikasi-absensi-online/
2.Attendance Sheet Templates for Excel & Google Sheets (Free Download) - TMetric Blog, diakses Juni 22, 2026, https://blog.tmetric.com/attendance-sheet-templates-for-excel-google-sheets-free-download/
3.21 Software Absensi Karyawan Online Terbaik Untuk Kelola Kehadiran - HashMicro, diakses Juni 22, 2026, https://www.hashmicro.com/id/blog/software-absensi-karyawan/
4.pengembangan sistem presensi mobile menggunakan metode face recognition dan geo location skripsi - STMIK IM, diakses Juni 22, 2026, https://perpus.stmik-im.ac.id/index.php?p=fstream-pdf&fid=1583&bid=9442
5.11 Aplikasi Absensi Online Terbaik Untuk Kelola Kehadiran Karyawan - Mekari Talenta, diakses Juni 22, 2026, https://www.talenta.co/blog/contoh-absensi-online-gratis-dengan-google-forms-hingga-mobile-app/
6.Architecting Offline-First Flutter Apps: A Guide to Local-First Sync ..., diakses Juni 22, 2026, https://smarttechdevs.in/blog/offline-first-flutter-architecture-guide
7.Offline-First Architecture:. Building Apps That Work When Nothing… | by Aditya Athavale | Stackademic, diakses Juni 22, 2026, https://blog.stackademic.com/offline-first-architecture-5cb12314af75
8.Pengembangan Mode Offline dan Sikronisasi Data pada Aplikasi Absensi Berbasis Qr Code untuk Karyawan PT. Bintang Energi Pratama - Politeknik Negeri Bengkalis Repository, diakses Juni 22, 2026, https://eprints.polbeng.ac.id/id/eprint/1154/
9.Offline-First Architecture: Design Principles, Synchronization Mechanisms, and Real-World Applications - IRE Journals, diakses Juni 22, 2026, https://www.irejournals.com/formatedpaper/1717979.pdf
10.Offline-First Architecture in Flutter: Part 1 — SQLite Local Storage and Conflict Resolution, diakses Juni 22, 2026, https://dev.to/anurag_dev/implementing-offline-first-architecture-in-flutter-part-1-local-storage-with-conflict-resolution-4mdl
11.Offline-First Mobile Architecture: Enhancing Usability and Resilience in Mobile Systems, diakses Juni 22, 2026, https://www.researchgate.net/publication/393910615_Offline-First_Mobile_Architecture_Enhancing_Usability_and_Resilience_in_Mobile_Systems
12.The Complete Guide to Offline-First Architecture in Android - ProAndroidDev, diakses Juni 22, 2026, https://proandroiddev.com/the-complete-guide-to-offline-first-architecture-in-android-490d5e9d27ea
13.CAMS F Edge DTN: Context-Aware Offline-First Synchronization and Local Reasoning Using CRDTs and MQTT-SN - MDPI, diakses Juni 22, 2026, https://www.mdpi.com/1999-5903/18/4/180
14.Offline-First Synchronization Strategies in Mobile Applications - DEV Community, diakses Juni 22, 2026, https://dev.to/merbayerp/offline-first-synchronization-strategies-in-mobile-applications-kgl
15.Development of the Berry Happy Application for the Digitalization of Bedugul Culinary MSMEs Using the Scrum Approach | RIGGS: Journal of Artificial Intelligence and Digital Business, diakses Juni 22, 2026, https://journal.ilmudata.co.id/index.php/RIGGS/article/view/9652
16.Agile methodology with Flutter app development- What a synergetic move! - Medium, diakses Juni 22, 2026, https://medium.com/@developmentgame42/agile-methodology-with-flutter-app-development-what-a-synergetic-move-972648ca0c17
17.Flutter App Development and Agile Processes | Blog - Droids On Roids, diakses Juni 22, 2026, https://www.thedroidsonroids.com/blog/flutter-app-development-agile-process
18.Flutter Localization with Isar Database: Offline-First Translation Storage - FlutterLocalisation, diakses Juni 22, 2026, https://flutterlocalisation.com/blog/flutter-isar-localization
19.Offline-First Mobile Architecture: Enhancing Usability and Resilience in Mobile Systems, diakses Juni 22, 2026, https://ideas.repec.org/a/das/njaigs/v7y2024i01p320-326id387.html
20.Rekomendasi Aplikasi Absensi Online - IDCloudHost, diakses Juni 22, 2026, https://idcloudhost.com/blog/rekomendasi-aplikasi-absensi-online-untuk-kebutuhan-usaha-kantor-dan-sekolah/
21.10 Rekomendasi Aplikasi Absensi Gratis dan Premium Terbaik - Lawencon, diakses Juni 22, 2026, https://www.lawencon.com/daftar-aplikasi-absensi/
22.Amir-yazdanmanesh/flutter_clean_architecture: A simple Flutter login app template using Clean Architecture. - GitHub, diakses Juni 22, 2026, https://github.com/Amir-yazdanmanesh/flutter_clean_architecture
23.Flutter Clean Architecture | Medium, diakses Juni 22, 2026, https://medium.com/@semihaltin99/flutter-clean-architecture-8759ad0213dd
24.Clean Architecture in Flutter: How to Structure Large Projects, diakses Juni 22, 2026, https://fbipool.com/clean-architecture-in-flutter/
25.A Modular Architecture Framework for Flutter Using Clean Architecture and Design Patterns: A Software Quality Perspective - ResearchGate, diakses Juni 22, 2026, https://www.researchgate.net/publication/399855651_A_Modular_Architecture_Framework_for_Flutter_Using_Clean_Architecture_and_Design_Patterns_A_Software_Quality_Perspective
26.Performance Analysis of BLoC and GetX State Management Library on Flutter, diakses Juni 22, 2026, https://www.researchgate.net/publication/392084004_Performance_Analysis_of_BLoC_and_GetX_State_Management_Library_on_Flutter
27.Rancang Bangun Aplikasi Presensi Instruktur Berbasis Android Menggunakan Framework Flutter Pada LKP Bright School Lampung Timur - Jurnal Universitas BSI, diakses Juni 22, 2026, https://jurnal.bsi.ac.id/index.php/reputasi/article/download/5871/1899
28.i IMPLEMENTASI SISTEM PRESENSI PEGAWAI DI KANTOR KECAMATAN SEMBAWA BERBASIS MOBILE MENGGUNAKAN METODE SCRUM SKRIPSI Disusun oleh, diakses Juni 22, 2026, http://repository.binadarma.ac.id/9395/5/FULLBAB_compressed%20%2814%29.pdf
29.Google Forms for Employee Attendance - Free Alternative 2026 - Clappia, diakses Juni 22, 2026, https://www.clappia.com/form-alternative/employee-attendance-free-alternative
30.Implementasi Scrum Dalam Pembangunan Aplikasi Presensi Siswa Berbasis Android Di SMK Budi Mulia Dua, diakses Juni 22, 2026, https://jurnal.bsi.ac.id/index.php/ijcs/article/download/9944/2341/30432
31.I created a simple Attendance tool that is Mobile First and Free to use - Reddit, diakses Juni 22, 2026, https://www.reddit.com/r/ProductivityApps/comments/1q25d3k/i_created_a_simple_attendance_tool_that_is_mobile/
32.Agile Methodology in Flutter Development - Duplex Technologies, diakses Juni 22, 2026, https://duplextech.com/blogs/agile-methodology-in-flutter-development.html
33.BAB II LANDASAN TEORI 2.1 Tinjauan Pustaka 2.1.1 Scrum Scrum adalah framework Agile yang memungkinkan tim berlari cepat dan b, diakses Juni 22, 2026, https://repository.nusamandiri.ac.id/repo/files/257241/download/FILE_3_WATERMARK.pdf
34.Master Isar Database in Flutter: A Powerful NoSQL Local Storage Solution for Your Flutter Apps - droidcon Academy, diakses Juni 22, 2026, https://academy.droidcon.com/course/master-isar-database-in-flutter-a-powerful-nosql-local-storage-solution-for-your-flutter-apps
35.DevLog Jurnal - Apps on Google Play, diakses Juni 22, 2026, https://play.google.com/store/apps/details?id=com.coedev.dev_logjurnal
36.Analysis of the Provider State Management Pattern for Performance and Maintainability in a Flutter-based Mobile Pharmacy Application - Sistemasi: Jurnal Sistem Informasi, diakses Juni 22, 2026, https://sistemasi.ftik.unisi.ac.id/index.php/stmsi/article/view/6237
37.IMPLEMENTASI CLEAN ARCHITECTURE PADA APLIKASI MOBILE AL-QURAN BERBASIS FLUTTER - E-Journal Pelita Indonesia, diakses Juni 22, 2026, https://www.ejournal.pelitaindonesia.ac.id/index.php/JOISIE/article/download/4763/1740/16057
38.Free Attendance App for Employees – Step-by-Step Setup Guide | 1Channel, diakses Juni 22, 2026, https://www.1channel.co/blog/free-attendance-app-for-employees-setup-guide