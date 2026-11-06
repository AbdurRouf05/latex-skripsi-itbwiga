% To Do
% perbaiki jarak setelah figure dengan subsubsection
% perbaiki jarak setelah table dengan subsubsection
% buat header table center tapi isinya rata kiri

%===========================================================
% Skripsi LaTeX Class Style
%
% Original author:
% Dir Sulaiman
% https://github.com/dirsulaiman/skripsi
% 
% Thanks and reference to:
% Andi Kresna Jaya, S.Si.M.Si (unhasskripsi-latex)
% Guntur D Putra (https://github.com/gtrdp/template-skripsi)
% 
% License:
% BSD 3-Clause "New" or "Revised" License
% https://github.com/dirsulaiman/skripsi/blob/master/LICENSE
%-----------------------------------------------------------

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{pengaturan/skripsi}[2020/03/11 Skripsi Class]
\LoadClass[a4paper, 12pt]{report}

%===========================================================
% Require Package
%-----------------------------------------------------------
% to add indent for first paragraph
\RequirePackage{indentfirst}

% to justify
\RequirePackage{ragged2e}

% Prevent hyphenating the words
\RequirePackage[none]{hyphenat}
\sloppy

% Times New Roman Font like
\RequirePackage{amsmath}
\RequirePackage{newtxtext, newtxmath}

% to use or import image
\RequirePackage{graphicx}
\RequirePackage[export]{adjustbox}

% to use color in table
\RequirePackage[table]{xcolor}

% use CSV to generate table
\RequirePackage{csvsimple}

% to set space of paragraph line
\RequirePackage{setspace}
\onehalfspacing

% to customize Table of contents
\RequirePackage{tocloft}

% to customize footer and header
\RequirePackage{fancyhdr}

% Hyperlink: semua tautan (daftar isi, sitasi, URL/DOI) berwarna hitam tetapi tetap bisa diklik.
% linktoc=all: judul dan nomor halaman di daftar isi, daftar tabel, dan daftar gambar
% bisa diklik untuk melompat ke halaman yang dituju. Bookmark PDF diberi nomor bab.
\RequirePackage[pdftex,bookmarks=true,bookmarksnumbered=true,bookmarksopen=true,
  colorlinks=true,linktoc=all,citecolor=black,linkcolor=black,urlcolor=black]{hyperref}
% Bab tanpa nomor (\chapter*) perlu \phantomsection agar link di daftar isi tepat sasaran
\newcommand{\tocchapter}[1]{\cleardoublepage\phantomsection\addcontentsline{toc}{chapter}{#1}}

% Counter for figure, table and equation
\RequirePackage{chngcntr}

% Setup the caption of figure, table and equation
% Pedoman 5.1.D/E: "Tabel 4.1. Deskripsi Responden" (pemisah titik)
\RequirePackage[font=small, labelfont={it},textfont={it}, labelsep=period, justification=centering]{caption}

% Setup label of enumerate item
\RequirePackage{enumitem}
\setlist[enumerate]{itemsep=0pt, topsep=2pt, parsep=0pt} 
% \renewcommand{\theenumi}{\Alph{enumi}}

% use Watermark
\RequirePackage[pages=some]{background}

% use listings for code script
\RequirePackage{listings}
\RequirePackage{color}

% float [H]
\RequirePackage{float}

% Tabel hitam-putih (Pedoman 5.1.D: tanpa garis vertikal, spasi tunggal):
% garis atas/bawah tebal, garis bawah judul kolom sedang, \garis tipis antarbaris
\RequirePackage{booktabs}
\RequirePackage{etoolbox}
\setlength{\heavyrulewidth}{1pt}
\setlength{\lightrulewidth}{0.6pt}
\setlength{\aboverulesep}{2pt}
\setlength{\belowrulesep}{2.5pt}
\newcommand{\garis}{\specialrule{0.3pt}{1.5pt}{2pt}}
% Dipasang di tabular, bukan table, karena float mengembalikan ukuran huruf ke \normalsize
\AtBeginEnvironment{tabular}{\small\singlespacing\setlength{\tabcolsep}{5pt}}
% Penempatan tabel/gambar lebih longgar agar tidak menyisakan halaman setengah kosong
\renewcommand{\topfraction}{0.85}
\renewcommand{\bottomfraction}{0.6}
\renewcommand{\textfraction}{0.12}
\renewcommand{\floatpagefraction}{0.75}
\setlength{\textfloatsep}{14pt plus 2pt minus 2pt}
\setlength{\floatsep}{12pt plus 2pt minus 2pt}
\setlength{\intextsep}{12pt plus 2pt minus 2pt}
% Isi jadwal: batang hitam setinggi baris teks
\newcommand{\batang}{\rule[-0.35ex]{\linewidth}{1.9ex}}
%-----------------------------------------------------------
% End Require Package
%===========================================================

\renewcommand{\baselinestretch}{1.42}
\renewcommand{\UrlFont}{\small\rm}

\newcommand{\listappendicesname}{DAFTAR LAMPIRAN}
\newlistof{appendices}{apc}{\listappendicesname}
\newcommand{\appendices}[1]{\addcontentsline{apc}{appendices}{#1}}
\newcommand{\newappendix}[1]{\section{#1}\appendices{#1}}

%===========================================================
% Package Daftar Pustaka, bentuk citasi
% Config
% - style, citestyle = {authoryear, numeric, apa, mla}
% - sorting {year,name,title} = ynt
%-----------------------------------------------------------
% Pedoman TA FTI ITB WiGa 5.1.H: daftar pustaka format APA, urut abjad, spasi 1
\usepackage[backend=biber, style=apa]{biblatex}
\addbibresource{referensi/daftar-pustaka.bib}
\DeclareLanguageMapping{english}{english-apa}
% "et al." -> "dkk.", "&" tetap dipakai sesuai pedoman
\DefineBibliographyStrings{english}{andothers={dkk\adddot}, and={\&}, retrieved={Diperoleh pada}, from={dari}}
\setlength{\bibhang}{1.5cm}
% Pedoman: judul artikel/buku memakai huruf besar di setiap awal kata, jadi
% konversi sentence case bawaan APA dimatikan (judul ditulis apa adanya dari .bib)
\DeclareFieldFormat{apacase}{#1}
\AtBeginBibliography{\singlespacing}

% new citation style
\let\oldcitate\cite
\newcommand*\thecite[1]{\hyperlink{cite.\therefsection @#1}{(\citeauthor*{#1} \citeyear{#1})}}
\renewcommand*\cite[1]{\hyperlink{cite.\therefsection @#1}{(\citeauthor*{#1} \citeyear{#1})}}
%-----------------------------------------------------------
% End Biblatex Config
%===========================================================


%===========================================================
% Setting footer, header and page number
%-----------------------------------------------------------
\pagestyle{fancy}
\fancyhf{}
\fancyhead[R]{\thepage}
\fancyheadoffset[R]{1.5cm}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}
\fancypagestyle{plain}{ %style for chapter page
    \fancyhf{} % clear all header and footer fields
    \fancyfoot[C]{\thepage}
    % \renewcommand{\headrulewidth}{0pt}
    % \renewcommand{\footrulewidth}{0pt}
}
\fancypagestyle{empty}{ %style for cover
    \fancyhf{}
    % \renewcommand{\headrulewidth}{0pt}
    % \renewcommand{\footrulewidth}{0pt}
}
\fancypagestyle{theheader}{ %style for header
    \fancyhead[R]{Universitas Hasanuddin}
}
%-----------------------------------------------------------
% End Setting footer, header and page number
%===========================================================


%===========================================================
% Code Script, Listing
%-----------------------------------------------------------
\definecolor{light-gray}{gray}{0.95}
\definecolor{dkgreen}{rgb}{0,0.6,0}
\definecolor{gray}{rgb}{0.5,0.5,0.5}
\definecolor{mauve}{rgb}{0.58,0,0.82}

\lstdefinestyle{python}{
    language=Python,
    emptylines=1,
    backgroundcolor=\color{light-gray},
    rulecolor=\color{light-gray},
    xleftmargin=1cm,
    framexleftmargin=1cm,
    columns=flexible,
    basicstyle={\linespread{0.85}\small\ttfamily},
    breaklines=true,
    breakatwhitespace=true,
    showstringspaces=false,
    tabsize=2,
    moredelim=**[is][\color{red}]{@}{@},
    keywordstyle=\color{blue},
    commentstyle=\color{dkgreen},
    stringstyle=\color{mauve},
}

\lstdefinestyle{shell}{
    language=bash,
    emptylines=1,
    backgroundcolor=\color{black},
    rulecolor=\color{black},
    columns=flexible,
    basicstyle={\small\ttfamily\color{white}},
    breaklines=true,
    breakatwhitespace=true,
    showstringspaces=false,
    tabsize=2,
    moredelim=**[is][\color{red}]{@}{@},
    keywordstyle=\color{blue},
    commentstyle=\color{dkgreen},
    stringstyle=\color{mauve},
}

\lstdefinestyle{plain}{
    emptylines=1,
    backgroundcolor=\color{light-gray},
    rulecolor=\color{light-gray},
    columns=flexible,
    basicstyle={\footnotesize\ttfamily\color{black}},
    breaklines=true,
    breakatwhitespace=true,
    tabsize=2
}
%-----------------------------------------------------------
% End Code Script, Listing
%===========================================================


%===========================================================
% Page Layout, Margin
%-----------------------------------------------------------
% Pedoman TA FTI ITB WiGa 2026-2027: atas & kiri 4 cm, kanan & bawah 3 cm,
% nomor halaman 1,5 cm dari tepi atas/kanan, nomor halaman judul bab 1 cm dari tepi bawah
\RequirePackage[a4paper, top=4cm, left=4cm, right=3cm, bottom=3cm,
    headheight=0.5cm, headsep=2cm, footskip=2cm]{geometry}
% indentasi paragraf 0,75 cm
\setlength{\parindent}{0.75cm} 
%-----------------------------------------------------------
% End Page Layout, Margin
%===========================================================


%===========================================================
% Set Watermark
%-----------------------------------------------------------
\backgroundsetup{
  scale=1,       
  angle=0,       
  opacity=.2,
  hshift=3mm,
  contents={\includegraphics[width=16cm]{"gambar/logo-wiga.png"}}
}
\newcommand\addwatermark{\BgThispage}
%-----------------------------------------------------------
% End Set Watermark
%===========================================================


%===========================================================
% Redefition Terms
%-----------------------------------------------------------
\def\prefacename{PRAKATA}
\def\contentsname{DAFTAR ISI}
\def\listfigurename{DAFTAR GAMBAR}
\def\listtablename{DAFTAR TABEL}
\def\listappendixname{DAFTAR LAMPIRAN}
\def\nomenclaturename{DAFTAR LAMBANG DAN SINGKATAN}
\def\partname{BAGIAN}
\def\chaptername{BAB}
\def\appendixname{LAMPIRAN}
\def\refname{DAFTAR PUSTAKA}
\def\bibname{DAFTAR PUSTAKA}
\def\indexname{Indek}
\def\figurename{Gambar}
\def\tablename{Tabel}
\def\pagename{Halaman}
%-----------------------------------------------------------
% End Redefinition Terms
%===========================================================


%===========================================================
% Define thesis's inputs
%-----------------------------------------------------------
\newcommand{\titleskripsi}[1]{\gdef\@titleskripsi{#1}}
\newcommand{\@titleskripsi}{}
\newcommand{\titleeng}[1]{\gdef\@titleeng{#1}}
\newcommand{\@titleeng}{}
\newcommand{\fullname}[1]{\gdef\@fullname{#1}}
\newcommand{\@fullname}{}
\newcommand{\idnum}[1]{\gdef\@idnum{#1}}
\newcommand{\@idnum}{}
\newcommand{\datesubmit}[1]{\gdef\@datesubmit{#1}}
\newcommand{\@datesubmit}{}
\newcommand{\monthsubmit}[1]{\gdef\@monthsubmit{#1}}
\newcommand{\@monthsubmit}{}
\newcommand{\yearsubmit}[1]{\gdef\@yearsubmit{#1}}
\newcommand{\@yearsubmit}{}
\newcommand{\@examdate}{\@datesubmit \space \@monthsubmit \space \@yearsubmit}
\newcommand{\degree}[1]{\gdef\@degree{#1}}
\newcommand{\@degree}{}
\newcommand{\program}[1]{\gdef\@program{#1}}
\newcommand{\@program}{}
\newcommand{\dept}[1]{\gdef\@dept{#1}}
\newcommand{\@dept}{}
\newcommand{\faculty}[1]{\gdef\@faculty{#1}}
\newcommand{\@faculty}{}
\newcommand{\university}[1]{\gdef\@university{#1}}
\newcommand{\@university}{}
\newcommand{\city}[1]{\gdef\@city{#1}}
\newcommand{\@city}{}
\newcommand{\firstsupervisor}[1]{\gdef\@firstsupervisor{#1}}
\newcommand{\@firstsupervisor}{}
\newcommand{\firstsupervisorNIP}[1]{\gdef\@firstsupervisorNIP{#1}}
\newcommand{\@firstsupervisorNIP}{}
\newcommand{\secondsupervisor}[1]{\gdef\@secondsupervisor{#1}}
\newcommand{\@secondsupervisor}{}
\newcommand{\secondsupervisorNIP}[1]{\gdef\@secondsupervisorNIP{#1}}
\newcommand{\@secondsupervisorNIP}{}
\newcommand{\firstexaminer}[1]{\gdef\@firstexaminer{#1}}
\newcommand{\@firstexaminer}{}
\newcommand{\secondexaminer}[1]{\gdef\@secondexaminer{#1}}
\newcommand{\@secondexaminer}{}
\newcommand{\headprogram}[1]{\gdef\@headprogram{#1}}
\newcommand{\@headprogram}{}
\newcommand{\headprogramNIP}[1]{\gdef\@headprogramNIP{#1}}
\newcommand{\@headprogramNIP}{}
%-----------------------------------------------------------
% End Define thesis's inputs
%===========================================================


%===========================================================
% Define Cover Proposal Skripsi (Ujian Proposal)
%-----------------------------------------------------------
\def\coverproposal{
    \thispagestyle{empty}
    \pagenumbering{roman}
    \setcounter{page}{1}
    \begin{center}
        \begin{singlespace}
            {\fontsize{14}{18}\selectfont\bfseries\MakeUppercase{\@titleskripsi}\par}
            \vspace{1.5cm}
            {\fontsize{14}{18}\selectfont\bfseries PROPOSAL SKRIPSI\par}
            \vfill
            \includegraphics[height=6cm]{"gambar/logo-wiga.png"}
            \vfill
            {\bfseries OLEH:\\[4pt]
            \MakeUppercase{\@fullname}\\
            NIM. \@idnum\par}
            \vfill
            {\fontsize{14}{18}\selectfont\bfseries
            PROGRAM STUDI \MakeUppercase{\@program}\\
            \MakeUppercase{\@faculty}\\
            \MakeUppercase{\@university}\\
            \MakeUppercase{\@city}\\
            \@yearsubmit\par}
        \end{singlespace}
    \end{center}
    \pagebreak
}
%-----------------------------------------------------------
% End Define Cover Proposal Skripsi
%===========================================================


%===========================================================
% Define Cover Skripsi
%-----------------------------------------------------------
\def\cover{%
    \thispagestyle{empty}%
    \pagenumbering{roman}
    \setcounter{page}{1}
    \begin{center}
        \begin{singlespace}
            \MakeUppercase{\normalfont\bfseries Skripsi}
            \vspace{2.0cm}
            % \vfill

            \MakeUppercase{\normalfont\bfseries\@titleskripsi}\\
            \par\nobreak
            \vspace{2cm}

            {\normalfont\large{Disusun dan diajukan oleh}}\\
            \vspace{1.5cm}

            \normalfont\bfseries{\@fullname}\\
            \normalfont\bfseries{\@idnum}\\
            \vfill

            \includegraphics[height=4.85cm]{"gambar/logo-wiga.png"}
            \vfill
            
            {\normalfont
            \MakeUppercase{\normalfont\bfseries Program Studi \@program}\\
            \MakeUppercase{\normalfont\bfseries Departemen \@dept}\\
            \MakeUppercase{\normalfont\bfseries Fakultas \@faculty}\\
            \MakeUppercase{\normalfont\bfseries\@university}\\
            \MakeUppercase{\normalfont\bfseries\@city}\\

            \vspace{0.2cm}
            % \normalfont\bfseries{\MakeUppercase{\@monthsubmit} {\@yearsubmit}}
            \normalfont\bfseries{\MakeUppercase{\@yearsubmit}}
            }\\
        \end{singlespace}
    \end{center}
    \pagebreak
}
%-----------------------------------------------------------
% End Define Cover Skripsi
%===========================================================


%===========================================================
% Define Title Page
%-----------------------------------------------------------
\def\titlepage{
    \begin{center}
        \addwatermark
        \addcontentsline{toc}{chapter}{HALAMAN JUDUL}
        \begin{singlespace}
            \vspace*{2cm}
            \MakeUppercase{\normalfont\bfseries\@titleskripsi}\\
            \vfill

            \bfseries{SKRIPSI}
            \vfill

            \normalfont{Diajukan sebagai salah satu syarat untuk memperoleh gelar {\@degree} pada Program Studi {\@program} Departemen {\@dept} Fakultas {\@faculty} {\@university} {\@city}}\\
            \vfill

            {\normalfont\bfseries
                \@fullname\\
                \@idnum
            }\\
            \vfill

            {\normalfont
                \MakeUppercase{\normalfont\bfseries Program Studi \@program}\\
                \MakeUppercase{\normalfont\bfseries Departemen \@dept}\\
                \MakeUppercase{\normalfont\bfseries Fakultas \@faculty}\\
                \MakeUppercase{\normalfont\bfseries\@university}\\
                \MakeUppercase{\normalfont\bfseries\@city}\\
                \vspace{0.2cm}
                {\normalfont\bfseries{{\@monthsubmit} {\@yearsubmit}}}
                \vspace{2cm}
            }\\
        \end{singlespace}
    \end{center}
    \pagebreak
}
%-----------------------------------------------------------
% End Define Title Page
%===========================================================


%===========================================================
% Define Authentication Page
%-----------------------------------------------------------
\def\authenticationpage{
    \addwatermark
    \addcontentsline{toc}{chapter}{HALAMAN PERNYATAAN KEOTENTIKAN}
    
    \begin{center}
        \MakeUppercase{\normalfont\large\bfseries\expandafter{HALAMAN PERNYATAAN KEOTENTIKAN}}\\
        \vspace{1cm}
    \end{center}

    \noindent
    Yang bertanda tangan di bawah ini: \\
    \begin{tabular}{ m{0.5cm} l c l } 
        & Nama          & : & \@fullname \\
        & NIM           & : & \@idnum \\
        & Program Studi & : & \@program \\
        & Jenjang       & : & S1 \\
    \end{tabular}
    \vspace{0.2cm}

    \noindent
    Menyatakan dengan ini bahwa karya tulisan saya berjudul
    \vspace{0.5cm}

    \begin{center}
        \bfseries{\@titleskripsi}
        \vspace{0.5cm}
    \end{center}

    \noindent
    Adalah benar hasil karya saya sendiri bukan merupakan pengambilan alihan tulisan orang lain dan belum pernah dipublikasikan dalam bentuk apapun. \\

    \noindent
    Apabila dikemudian hari terbukti atau dapat dibuktikan bahwa sebagian atau keseluruhan skripsi ini merupakan hasil karya orang lain, maka saya bersedia menerima sanksi atas perbuatan tersebut.
    
    \vspace{1cm}
    \begin{flushright}
        \@city, \@examdate\\
        \vspace{2.5cm}
        {\@fullname}\\
        NIM. {\@idnum}
    \end{flushright}
    \pagebreak
}
%-----------------------------------------------------------
% End Define Authentication Page
%===========================================================


%===========================================================
% Define Supervisor Approval Page
%-----------------------------------------------------------
\def\supervisorapprovalpage{
    \addwatermark
    \addcontentsline{toc}{chapter}{HALAMAN PERSETUJUAN PEMBIMBING}
    \begin{center}
        \MakeUppercase{\normalfont\large\bfseries\expandafter{\@titleskripsi}}\\
        \vspace{0.5cm}
    \end{center}

    \begin{center}
        Disusun dan diajukan oleh\\
        \begin{singlespace}
            \large\bfseries{\@fullname}\\
            \large\bfseries{\@idnum}\\
            \vspace{1.0cm}
        \end{singlespace}

            Telah dipertahankan di hadapan Panitia Ujian yang dibentuk dalam rangka Penyelesaian Studi Program Sarjana pada Program Studi {\@program} Fakultas {\@faculty} {\@university} dan dinyatakan telah memenuhi syarat kelulusan \\

            \vspace{0.2cm}
            Menyetujui,
            \vspace{0.2cm}
    \end{center}

    \begin{table}[h]
        \centering
        \begin{tabular}{ >{\centering\arraybackslash}m{6cm}  m{2cm} >{\centering\arraybackslash}m{6cm} }
            Pembimbing Utama & & Pembimbing Pertama \\
            & & \\
            & & \\
            & & \\
            & & \\
            & & \\
            \underline{\@firstsupervisor} & & \underline{\@secondsupervisor} \\
            NIP. \@firstsupervisorNIP & & NIP. \@secondsupervisorNIP
        \end{tabular}

        \vspace{1cm}
        \begin{tabular}{ >{\centering\arraybackslash}m{6cm} }
            Ketua Program Studi \\
            \\
            \\
            \\
            \\
            \\
            \underline{\@headprogram} \\
            NIP. \@headprogramNIP
        \end{tabular}
    \end{table}
    \pagebreak
}
%-----------------------------------------------------------
% End Define Supervisor Approval Page
%===========================================================


%===========================================================
% Define Approval Page
%-----------------------------------------------------------
\def\approvalpage{%
    \addwatermark
    \addcontentsline{toc}{chapter}{HALAMAN PENGESAHAN}
    \begin{center}
        \MakeUppercase{\normalfont\large\bfseries\expandafter{HALAMAN PENGESAHAN}}\\
        \vspace{0.5cm}
    \end{center}

    \begin{singlespace}
        \noindent
        Skripsi ini diajukan oleh:
        \begin{center}
            \begin{tabular}{ p{3cm}  p{.1cm} p{10.5cm}}
                Nama &:& \@fullname\\
                NIM &:& \@idnum\\
                Program Studi &:& \@program\\
                Judul Skripsi &:& \@titleskripsi\\
            \end{tabular}
        \end{center}
    \end{singlespace}
    
    \noindent
    Telah dipertahankan di depan Tim Penguji dan diterima sebagai bagian persyaratan untuk memperoleh gelar {\@degree} pada Program Studi {\@program} Fakultas {\@faculty} {\@university}.\\

    \begin{center}
        \begin{doublespace} 
            DEWAN PENGUJI\\
            \begin{tabular}{l l l c}
                & & & Tanda Tangan \\ 
                1. & Ketua &: \@firstsupervisor & (........................)\\ \\
                2. & Sekretaris &: \@secondsupervisor & (........................)\\ \\
                3. & Anggota &: \@firstexaminer & (........................)\\ \\
                4. & Anggota &: \@secondexaminer & (........................)\\
            \end{tabular}
        \end{doublespace}
    \end{center}
    \begin{tabular}{l l}
        Ditetapkan di &: \@city \\ 
        Tanggal &: \@examdate
    \end{tabular}
    \pagebreak
}
%-----------------------------------------------------------
% End Define Approval Page
%===========================================================


%===========================================================
% Define Persetujuan Publikasi Karya Ilmiah
%-----------------------------------------------------------
\def\publicationapprovalpage{%
    % \addwatermark
    \addcontentsline{toc}{chapter}{PERSETUJUAN PUBLIKASI KARYA ILMIAH}
    \begin{center}
        \begin{singlespace}
            \MakeUppercase{\normalfont\large\bfseries\expandafter{PERNYATAAN PERSETUJUAN PUBLIKASI TUGAS AKHIR UNTUK KEPENTINGAN AKADEMIS}}\\
            \vspace{1.0cm}
        \end{singlespace}
    \end{center}

    \begin{singlespace}
        \noindent
        Sebagai civitas akademik {\@university}, saya yang bertanda tangan di bawah ini:
        \begin{center}
            \begin{tabular}{ p{3cm}  p{.1cm} p{10.5cm}}
                Nama &:& \@fullname\\
                NIM &:& \@idnum\\
                Program Studi &:& \@program\\
                Departemen &:& \@dept\\
                Fakultas &:& \@faculty\\
                Jenis Karya &:& Skripsi
            \end{tabular}
        \end{center}
    \end{singlespace}

    \noindent
    Demi pengembangan ilmu pengetahuan, menyetujui untuk memberikan kepada {\@university} \textbf{Hak Predikator Royalti Noneksklusif} (\textit{Non-exclusive Royalty-Free Right}) atas tugas akhir saya yang berjudul:

    \begin{center}
        {\normalfont\bfseries\expandafter{"\@titleskripsi"}}\\
            % \vspace{1.0cm}
    \end{center}

    \noindent
    beserta perangkat yang ada (jika diperlukan). Terkait dengan hal diatas, maka pihak {\@university} berhak menyimpan, mengalih-media/format-kan, mengola dalam bentuk pangkalan data (\textit{database}), merawat dan mempublikasikan tugas akhir saya selama tetap mencantumkan nama saya sebagai penulis/pencipta dan sebagai pemilik Hak Cipta.

    \noindent
    Demikian surat pernyataan ini saya buat dengan sebenarnya.

    \vspace{.5cm}
    \begin{flushright}
        Dibuat di {\@city} pada \@examdate\\
        Yang menyatakan\\
        \vspace{2.5cm}
        {(\@fullname)}\\
    \end{flushright}
    \pagebreak
}
%-----------------------------------------------------------
% End Define Persetujuan Publikasi Karya Ilmiah
%===========================================================


%===========================================================
% Redefine chapter and sections
%-----------------------------------------------------------
\renewcommand \thechapter {\@Roman\c@chapter}
\renewcommand \thesection {\@arabic\c@chapter.\@arabic\c@section}
\renewcommand \thesubsection {\@arabic\c@chapter.\@arabic\c@section.\@arabic\c@subsection}
\renewcommand \thesubsubsection {\@arabic\c@chapter.\@arabic\c@section.\@arabic\c@subsection.\@arabic\c@subsubsection}
\renewcommand{\@makechapterhead}[1]{%
    {\parindent \z@ \centering \normalfont
    \ifnum \c@secnumdepth >\m@ne
        \large\bfseries \@chapapp\space \thechapter
        \par\nobreak
        \vskip 0\p@
    \fi
        \interlinepenalty\@M
        \large \bfseries #1\par\nobreak
        \vskip 15\p@
    }
}
\renewcommand{\section}{
    \@startsection {section}{1}{\z@}
        {-3.3ex \@plus -1ex \@minus -.2ex}
        {2.1ex \@plus.2ex}
        {\normalfont\normalsize\bfseries}
}
\renewcommand{\subsection}{
    \@startsection{subsection}{2}{\z@}
        {-3.25ex\@plus -1ex \@minus -.2ex}
        {1.5ex \@plus .2ex}
        {\normalfont\normalsize\bfseries}
}
\renewcommand{\subsubsection}{
    \@startsection{subsubsection}{2}{\z@}
        {-3.25ex\@plus -1ex \@minus -.2ex}
        {1.5ex \@plus .2ex}
        {\normalfont\normalsize\bfseries}
}
\renewcommand{\@makeschapterhead}[1]{%
    {\parindent \z@ \centering \normalfont
    \large\bfseries #1
    \par\nobreak
    \vskip 20\p@}
}
%-----------------------------------------------------------
% End Redefine chapter and sections
%===========================================================


%===========================================================
% Setting Tabble of Content, list of figure, list of table
%-----------------------------------------------------------
% customize Table of contents
\renewcommand{\cftchappresnum}{BAB }
\renewcommand{\cftchapnumwidth}{3.7em}
\renewcommand{\cftchapdotsep}{\cftdotsep}
% table of contents
\renewcommand{\cftbeforetoctitleskip}{-0.25cm}
\renewcommand{\cftaftertoctitleskip}{0.75cm}
\renewcommand\cfttoctitlefont{\hfill\Large\bfseries\MakeUppercase}
\renewcommand\cftaftertoctitle{\hfill\mbox{}}
% list of figures
\renewcommand{\cftbeforeloftitleskip}{-0.25cm}
\renewcommand{\cftafterloftitleskip}{0.75cm}
\renewcommand\cftloftitlefont{\hfill\Large\bfseries\MakeUppercase}
\renewcommand\cftafterloftitle{\hfill\mbox{}}
% list of tables
\renewcommand{\cftbeforelottitleskip}{-0.25cm}
\renewcommand{\cftafterlottitleskip}{0.75cm}
\renewcommand\cftlottitlefont{\hfill\Large\bfseries\MakeUppercase}
\renewcommand\cftafterlottitle{\hfill\mbox{}}
% list of appendix
\renewcommand{\cftbeforeapctitleskip}{-0.25cm}
\renewcommand{\cftafterapctitleskip}{0.75cm}
\renewcommand\cftapctitlefont{\hfill\Large\bfseries\MakeUppercase}
\renewcommand\cftafterapctitle{\hfill\mbox{}}
%-----------------------------------------------------------
% End Setting Tabble of Content, list of figure, list of table
%===========================================================


%===========================================================
% Set Counter for figure, table, and equation
%-----------------------------------------------------------
\counterwithin{figure}{chapter}
\counterwithin{table}{chapter}
\counterwithin{equation}{chapter}
\renewcommand \thefigure {\@arabic\c@chapter.\@arabic\c@figure}
\renewcommand \thetable {\@arabic\c@chapter.\@arabic\c@table}
\renewcommand \theequation {\@arabic\c@chapter.\@arabic\c@equation}
%-----------------------------------------------------------
% End Set Counter for figure, table, and equation
%===========================================================

%===========================================================
% Set Table, Figure Environment
%-----------------------------------------------------------
% new environment for Figure
\newenvironment{afigure}
    {\begin{figure}[ht]}
    {\end{figure}}

% new environment for Table
\newenvironment{atable}
    {\begin{table}[ht] \renewcommand{\arraystretch}{1.3} \centering \small}
    {\end{table}}
%-----------------------------------------------------------
% End Set Table, Figure Environment
%===========================================================
