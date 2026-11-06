"""Konversi proposal skripsi LaTeX (template-skripsi) ke DOCX sesuai Pedoman TA FTI ITB WiGa.

Pemakaian:
    python -I skrip/tex_ke_docx.py <folder template-skripsi> <output.docx> <folder cache gambar> [folder pylib]

Hanya menangani subset LaTeX yang dipakai di isi-bab/*.tex (bab, subbab, paragraf, enumerate,
table/longtable/tabular, figure+tikz, equation/align*). Persamaan tampilan dan diagram TikZ
dirender ke PNG lewat pdflatex + pdftoppm. Nomor tabel/gambar/persamaan diambil dari
ujian-proposal.aux, jadi kompilasi LaTeX harus dijalankan lebih dulu.
"""
import hashlib
import os
import re
import struct
import subprocess
import sys

ROOT, OUT = sys.argv[1], sys.argv[2]
# Absolut, karena pdflatex dijalankan dengan cwd=CACHE
CACHE = os.path.abspath(sys.argv[3])
if len(sys.argv) > 4:
    sys.path.insert(0, sys.argv[4])

from docx import Document  # noqa: E402
from docx.enum.section import WD_SECTION  # noqa: E402
from docx.enum.table import WD_TABLE_ALIGNMENT  # noqa: E402
from docx.enum.text import WD_ALIGN_PARAGRAPH  # noqa: E402
from docx.opc.constants import RELATIONSHIP_TYPE as RT  # noqa: E402
from docx.oxml import OxmlElement  # noqa: E402
from docx.oxml.ns import qn  # noqa: E402
from docx.shared import Cm, Pt, RGBColor  # noqa: E402

os.makedirs(CACHE, exist_ok=True)
TEXT_WIDTH_CM = 14.0  # A4 21 cm - margin kiri 4 cm - margin kanan 3 cm
FONT = "Times New Roman"
ROMAN = ["", "I", "II", "III", "IV", "V", "VI"]


def baca(path):
    return open(path, encoding="utf-8").read()


def buang_komentar(s):
    # Hapus komentar "%" yang tidak di-escape sampai akhir baris
    return re.sub(r"(?<!\\)%[^\n]*", "", s)


# ---------------------------------------------------------------- label & bib
LABEL = {}
for m in re.finditer(r"\\newlabel\{([^}]*)\}\{\{([^}]*)\}", baca(os.path.join(ROOT, "ujian-proposal.aux"))):
    LABEL[m.group(1)] = m.group(2)


def group(s, i):
    """s[i] == '{' -> (isi, indeks setelah '}')."""
    assert s[i] == "{", s[i:i + 30]
    depth, j = 0, i
    while j < len(s):
        c = s[j]
        if c == "\\":
            j += 2
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return s[i + 1:j], j + 1
        j += 1
    raise ValueError("kurung kurawal tidak seimbang: " + s[i:i + 60])


def bracket(s, i):
    """s[i] == '[' -> (isi, indeks setelah ']')."""
    j = s.index("]", i)
    return s[i + 1:j], j + 1


def parse_bib(text):
    out = {}
    for m in re.finditer(r"@(\w+)\{([^,]+),", text):
        tipe, key = m.group(1).lower(), m.group(2).strip()
        i = m.end()
        fields = {}
        while True:
            fm = re.compile(r"\s*(\w+)\s*=\s*").match(text, i)
            if not fm:
                break
            i = fm.end()
            if text[i] == "{":
                val, i = group(text, i)
            else:
                vm = re.compile(r"[^,\n}]+").match(text, i)
                val, i = vm.group(0), vm.end()
            fields[fm.group(1).lower()] = val.strip()
            cm = re.compile(r"\s*,").match(text, i)
            if not cm:
                break
            i = cm.end()
        out[key] = (tipe, fields)
    return out


BIB = parse_bib(baca(os.path.join(ROOT, "referensi", "daftar-pustaka.bib")))


def bersih_bib(s):
    s = s.replace("\\&", "&").replace("--", "–")
    return re.sub(r"[{}]", "", s)


def nama_list(f):
    names = [n.strip() for n in f.get("author", "").split(" and ")]
    others = "others" in names
    return [n for n in names if n != "others"], others


def nama_belakang(n):
    n = n.strip()
    if n.startswith("{"):
        return bersih_bib(n)
    return bersih_bib(n.split(",")[0]) if "," in n else bersih_bib(n)


def inisial(first):
    parts = re.split(r"\s+", first.strip())
    out = []
    for p in parts:
        if not p:
            continue
        out.append("-".join(x[0] + "." for x in p.split("-") if x))
    return " ".join(out)


def nama_daftar(n):
    if n.startswith("{") or "," not in n:
        return bersih_bib(n)
    last, first = n.split(",", 1)
    return f"{bersih_bib(last.strip())}, {inisial(bersih_bib(first))}"


def sitasi_penulis(key):
    tipe, f = BIB[key]
    if f.get("shortauthor"):  # lembaga dengan singkatan, misalnya ETSI
        return bersih_bib(f["shortauthor"])
    names, others = nama_list(f)
    lasts = [nama_belakang(n) for n in names]
    if others or len(lasts) >= 3:
        return lasts[0] + " dkk."
    if len(lasts) == 2:
        return f"{lasts[0]} & {lasts[1]}"
    return lasts[0]


def tahun(key):
    return BIB[key][1].get("year", "t.t.")


def bookmark_pustaka(key):
    # Nama bookmark Word: diawali huruf, maksimal 40 karakter
    return "pustaka_" + re.sub(r"\W", "_", key)[:32]


# Sitasi dikembalikan sebagai list (teks, key); bagian tahun membawa key agar menjadi tautan
# ke entri daftar pustaka, sama seperti biblatex-apa di PDF
def parencite(keys):
    keys = sorted(keys, key=lambda k: (sitasi_penulis(k).lower(), tahun(k)))
    out = [("(", None)]
    for n, k in enumerate(keys):
        out += [(("; " if n else "") + f"{sitasi_penulis(k)}, ", None), (tahun(k), k)]
    return out + [(")", None)]


def textcite(keys):
    out = []
    for n, k in enumerate(keys):
        out += [(("; " if n else "") + f"{sitasi_penulis(k)} (", None), (tahun(k), k), (")", None)]
    return out


def entri_pustaka(key):
    """Kembalikan list (teks, miring) untuk satu entri daftar pustaka gaya APA."""
    tipe, f = BIB[key]
    names, others = nama_list(f)
    daftar = [nama_daftar(n) for n in names]
    if others:
        penulis = ", ".join(daftar) + ", dkk."
    elif len(daftar) == 1:
        penulis = daftar[0]
    else:
        penulis = ", ".join(daftar[:-1]) + ", & " + daftar[-1]
    if not penulis.endswith("."):
        penulis += "."
    judul = bersih_bib(f.get("title", ""))
    runs = [(f"{penulis} ({f.get('year')}). ", False)]
    link = ("https://doi.org/" + f["doi"]) if "doi" in f else f.get("url", "")
    if tipe == "article":
        runs.append((judul + ". ", False))
        runs.append((bersih_bib(f.get("journal", "")) + ", ", True))
        if f.get("volume"):
            runs.append((f["volume"], True))
        if f.get("number"):
            runs.append((f"({f['number']})", False))
        if f.get("pages"):
            runs.append((", " + bersih_bib(f["pages"]), False))
        runs.append((". ", False))
        if link:
            runs.append((link, False, link))
    elif tipe == "book":
        runs.append((judul + ". ", True))
        runs.append((bersih_bib(f.get("publisher", "")) + ".", False))
    elif tipe == "inproceedings":
        runs.append((judul + ". ", False))
        runs.append(("Dalam ", False))
        runs.append((bersih_bib(f.get("booktitle", "")), True))
        if f.get("pages"):
            runs.append((" (hlm. " + bersih_bib(f["pages"]) + ")", False))
        runs.append((". " + bersih_bib(f.get("publisher", "")) + ". ", False))
        if link:
            runs.append((link, False, link))
    elif tipe == "techreport":
        runs.append((judul, True))
        runs.append((f" ({bersih_bib(f.get('type', 'Technical Report'))} No. {bersih_bib(f.get('number', ''))}). ", False))
        runs.append((bersih_bib(f.get("institution", "")) + ".", False))
    else:  # online
        runs.append((judul + ". ", True))
        adden = bersih_bib(f.get("addendum", ""))
        if adden:
            runs.append((f"{adden}, dari ", False))
        runs.append((link, False, link))
    return runs


# ---------------------------------------------------------------- render gambar
def png_size(path):
    with open(path, "rb") as fh:
        head = fh.read(24)
    return struct.unpack(">II", head[16:24])


PREAMBLE = (
    "\\documentclass[12pt,border=3pt]{standalone}\n"
    "\\usepackage{amsmath}\n\\usepackage{newtxtext,newtxmath}\n"
    "\\usepackage[table]{xcolor}\n\\usepackage{tikz}\n"
    "\\usetikzlibrary{shapes.geometric,arrows.meta,positioning,fit,calc,backgrounds}\n"
    "\\usepackage[none]{hyphenat}\n"
)


def render(body, varwidth=False):
    """Kompilasi potongan LaTeX menjadi PNG 300 dpi; hasil di-cache berdasarkan hash."""
    pre = PREAMBLE.replace("border=3pt", "border=3pt,varwidth=14cm") if varwidth else PREAMBLE
    src = pre + "\\begin{document}\n" + body + "\n\\end{document}\n"
    h = hashlib.sha1(src.encode("utf-8")).hexdigest()[:16]
    png = os.path.join(CACHE, h + ".png")
    if not os.path.exists(png):
        tex = os.path.join(CACHE, h + ".tex")
        open(tex, "w", encoding="utf-8").write(src)
        r = subprocess.run(["pdflatex", "-interaction=nonstopmode", "-output-directory", CACHE, tex],
                           capture_output=True, text=True, cwd=CACHE)
        pdf = os.path.join(CACHE, h + ".pdf")
        if not os.path.exists(pdf):
            raise RuntimeError("gagal render:\n" + body + "\n" + r.stdout[-1500:])
        subprocess.run(["pdftoppm", "-png", "-r", "300", "-singlefile", pdf, os.path.join(CACHE, h)], check=True)
    return png


# ---------------------------------------------------------------- inline LaTeX -> runs
SIMBOL = {
    "geq": "≥", "leq": "≤", "times": "×", "sum": "Σ", "varphi": "φ", "lambda": "λ", "Delta": "Δ",
    "pi": "π", "ldots": "…", "cdots": "⋯", "in": "∈", "blacktriangledown": "▼", "cdot": "·",
    "max": "max", "min": "min", "checkmark": "✓", "circ": "°",
    "le": "≤", "ge": "≥", "pm": "±", "delta": "δ", "mid": "|",
}
ABAIKAN = {"small", "footnotesize", "normalsize", "singlespacing", "centering", "par", "noindent",
           "hline", "raggedright", "raggedleft", "arraybackslash", "limits", "left", "right", "selectfont",
           "phantomsection", "medskip", "smallskip", "bigskip", "displaystyle", "relax", "large", "Large"}
ABAIKAN_ARG = {"label": 1, "vspace": 1, "hspace": 1, "setlength": 2, "addcontentsline": 3, "fontsize": 2}


class R(dict):
    """Satu potongan teks dengan format."""


def run(text, fmt):
    r = R(fmt)
    r["text"] = text
    return r


def math_runs(s, fmt):
    if s == ",":  # {,} = koma desimal, tanpa spasi
        return [run(",", fmt)]
    out = []
    f = dict(fmt)
    i = 0
    while i < len(s):
        c = s[i]
        if c.isspace():
            i += 1
            continue
        if c == "{":
            g, i = group(s, i)
            out += math_runs(g, f)
            continue
        if c in "_^":
            i += 1
            while s[i].isspace():
                i += 1
            sub = dict(f, sub=(c == "_"), sup=(c == "^"))
            if s[i] == "{":
                g, i = group(s, i)
            elif s[i] == "\\":
                m = re.compile(r"\\[A-Za-z]+").match(s, i)
                g, i = m.group(0), m.end()
            else:
                g, i = s[i], i + 1
            out += math_runs(g, sub)
            continue
        if c == "\\":
            m = re.compile(r"\\([A-Za-z]+|.)").match(s, i)
            name, i = m.group(1), m.end()
            if name in ("text", "mathrm", "textit", "textbf"):
                g, i = group(s, i)
                out += inline(g, dict(f, i=(name == "textit"), b=(name == "textbf") or f.get("b")))
            elif name in ("bar", "tilde"):
                g, i = group(s, i) if s[i] == "{" else (s[i], i + 1)
                out.append(run(g + ("\u0304" if name == "bar" else "\u0303"), dict(f, i=True)))
            elif name == "frac":
                a, i = group(s, i)
                b, i = group(s, i)
                out += math_runs(a, f) + [run("/", f)] + math_runs(b, f)
            elif name == "sqrt":
                a, i = group(s, i)
                out += [run("√(", f)] + math_runs(a, f) + [run(")", f)]
            elif name in ("{", "}", "%", "&", "_", "#"):
                out.append(run(name, f))
            elif name in (",", ";", "!", " ", "quad"):
                out.append(run(" ", f) if name in (" ", "quad") else run("", f))
            elif name in SIMBOL:
                sym = SIMBOL[name]
                if name in ("times", "geq", "leq", "le", "ge", "in", "cdot"):
                    sym = " " + sym + " "
                out.append(run(sym, f))
            elif name in ABAIKAN:
                pass
            else:
                out.append(run(name, f))
            continue
        if c in "=+<>":
            out.append(run(" " + c + " ", f))
        elif c == ",":
            out.append(run(", ", f))
        elif c == "-":
            out.append(run("−", f))
        elif c.isalpha():
            out.append(run(c, dict(f, i=True)))
        else:
            out.append(run(c, f))
        i += 1
    return out


def inline(s, fmt=None):
    """Ubah teks LaTeX sebaris menjadi list R."""
    fmt = dict(fmt or {})
    out = []
    i, buf = 0, []

    def flush():
        if buf:
            out.append(run("".join(buf), fmt))
            buf.clear()

    while i < len(s):
        c = s[i]
        if c == "\\":
            m = re.compile(r"\\([A-Za-z]+\*?|.)").match(s, i)
            name, i = m.group(1), m.end()
            if name in ("%", "&", "_", "#", "$", "{", "}"):
                buf.append(name)
                continue
            if name == " ":
                buf.append(" ")
                continue
            if name == ",":
                continue
            if name == "\\":
                flush()
                out.append(R(br=True, text=""))
                if i < len(s) and s[i] == "[":
                    _, i = bracket(s, i)
                continue
            flush()
            if name in ("textbf", "textit", "emph", "texttt", "textsuperscript", "textsubscript", "mbox", "fbox"):
                g, i = group(s, i)
                f2 = dict(fmt)
                if name == "textbf":
                    f2["b"] = True
                elif name in ("textit", "emph"):
                    f2["i"] = True
                elif name == "texttt":
                    f2["mono"] = True
                elif name == "textsuperscript":
                    f2["sup"] = True
                elif name == "textsubscript":
                    f2["sub"] = True
                if name == "fbox":
                    out.append(run("[", fmt))
                out += inline(g, f2)
                if name == "fbox":
                    out.append(run("]", fmt))
            elif name in ("parencite", "textcite", "cite"):
                g, i = group(s, i)
                keys = [k.strip() for k in g.split(",")]
                # Satu sitasi = satu field ADDIN (seperti Mendeley), jadi saat diklik Word
                # menandai seluruh sitasi abu-abu sebagai satu blok
                out.append(R(fld="ADDIN SITASI " + " ".join(keys), text=""))
                for teks, k in textcite(keys) if name == "textcite" else parencite(keys):
                    out.append(run(teks, dict(fmt, anchor=bookmark_pustaka(k)) if k else fmt))
                out.append(R(fld_end=True, text=""))
            elif name == "ref":
                g, i = group(s, i)
                out.append(run(LABEL.get(g, "??"), fmt))
            elif name in ("quad", "qquad"):
                out.append(run("  ", fmt))
            elif name == "dotfill":
                out.append(run("……………………", fmt))
            elif name == "newline":
                out.append(R(br=True, text=""))
            elif name in SIMBOL:
                out.append(run(SIMBOL[name], fmt))
            elif name in ABAIKAN_ARG:
                for _ in range(ABAIKAN_ARG[name]):
                    while i < len(s) and s[i].isspace():
                        i += 1
                    if i < len(s) and s[i] == "{":
                        _, i = group(s, i)
            elif name == "isi":
                out.append(R(shade=True, text=""))
            elif name in ABAIKAN:
                pass
            else:
                pass  # perintah lain diabaikan, argumennya tetap diproses sebagai teks
            continue
        if c == "{":
            flush()
            g, i = group(s, i)
            out += inline(g, fmt)
            continue
        if c == "}":
            i += 1
            continue
        if c == "$":
            flush()
            j = s.index("$", i + 1)
            out += math_runs(s[i + 1:j], fmt)
            i = j + 1
            continue
        if s.startswith("``", i):
            buf.append("“")
            i += 2
            continue
        if s.startswith("''", i):
            buf.append("”")
            i += 2
            continue
        if s.startswith("---", i):
            buf.append("—")
            i += 3
            continue
        if s.startswith("--", i):
            buf.append("–")
            i += 2
            continue
        if c == "~":
            buf.append("\u00a0")
            i += 1
            continue
        if c in "\n\t":
            buf.append(" ")
            i += 1
            continue
        buf.append(c)
        i += 1
    flush()
    # rapikan spasi ganda
    for r in out:
        if r.get("text"):
            r["text"] = re.sub(r" {2,}", " ", r["text"]) if "  " not in r["text"].strip() else r["text"]
    return out


# ---------------------------------------------------------------- penulisan docx
doc = Document()


def set_cell_border(cell, **sides):
    """sides: nama sisi -> ketebalan garis dalam 1/8 pt (0 = tanpa garis)."""
    tcPr = cell._tc.get_or_add_tcPr()
    borders = tcPr.find(qn("w:tcBorders"))
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tcPr.append(borders)
    for side, sz in sides.items():
        el = OxmlElement(f"w:{side}")
        el.set(qn("w:val"), "single" if sz else "nil")
        el.set(qn("w:sz"), str(sz))
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), "000000")
        borders.append(el)


# Ketebalan garis tabel (1/8 pt), setara booktabs di pengaturan/skripsi.cls
GARIS = {"toprule": 8, "bottomrule": 8, "midrule": 5, "hline": 5, "garis": 2}
RULE_RE = r"\\(?:hline|toprule|midrule|bottomrule|garis)\b"


def shade(cell, color="000000"):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), color)
    tcPr.append(shd)


BIRU = RGBColor(0, 0, 0)  # tautan hitam (tetap bisa diklik), sama dengan PDF


def tautan(p, x, anchor=None, url=None):
    """Bungkus run x dengan w:hyperlink ke bookmark (anchor) atau alamat luar (url), warna biru."""
    h = OxmlElement("w:hyperlink")
    if anchor:
        h.set(qn("w:anchor"), anchor)
    else:
        h.set(qn("r:id"), p.part.relate_to(url, RT.HYPERLINK, is_external=True))
    h.set(qn("w:history"), "1")
    x._r.addprevious(h)
    h.append(x._r)
    x.font.color.rgb = BIRU


def bookmark(p, nama, bid):
    """Tandai seluruh isi paragraf p sebagai bookmark (panggil setelah semua run ditulis)."""
    s = OxmlElement("w:bookmarkStart")
    s.set(qn("w:id"), str(bid))
    s.set(qn("w:name"), nama)
    e = OxmlElement("w:bookmarkEnd")
    e.set(qn("w:id"), str(bid))
    pPr = p._p.find(qn("w:pPr"))
    if pPr is not None:
        pPr.addnext(s)
    else:
        p._p.insert(0, s)
    p._p.append(e)


def tulis_runs(p, runs, size=None, base_italic=False):
    for r in runs:
        if r.get("fld"):
            fld_char(p, "begin")
            instr_text(p, r["fld"])
            fld_char(p, "separate")
            continue
        if r.get("fld_end"):
            fld_char(p, "end")
            continue
        if r.get("br"):
            p.add_run().add_break()
            continue
        if r.get("shade") or not r.get("text"):
            continue
        x = p.add_run(r["text"])
        x.bold = bool(r.get("b")) or None
        x.italic = (bool(r.get("i")) != base_italic) or None
        if r.get("sup"):
            x.font.superscript = True
        if r.get("sub"):
            x.font.subscript = True
        if r.get("mono"):
            x.font.name = "Courier New"
        if size:
            x.font.size = Pt(size)
        if r.get("anchor"):
            tautan(p, x, anchor=r["anchor"])


def fmt_par(p, indent_first=True, left=0.0, hanging=0.0, align=WD_ALIGN_PARAGRAPH.JUSTIFY,
            spacing=1.5, after=0, before=0, size=None):
    pf = p.paragraph_format
    pf.alignment = align
    pf.line_spacing = spacing
    pf.space_after = Pt(after)
    pf.space_before = Pt(before)
    pf.left_indent = Cm(left + hanging)
    if hanging:
        pf.first_line_indent = Cm(-hanging)
    elif indent_first:
        pf.first_line_indent = Cm(0.75)
    else:
        pf.first_line_indent = Cm(0)


def fld_char(p, jenis):
    """Run berisi penanda field: begin, separate, atau end."""
    r = p.add_run()
    el = OxmlElement("w:fldChar")
    el.set(qn("w:fldCharType"), jenis)
    r._r.append(el)
    return r


def instr_text(p, code):
    r = p.add_run()
    t = OxmlElement("w:instrText")
    t.set(qn("xml:space"), "preserve")
    t.text = " " + code + " "
    r._r.append(t)
    return r


def add_field(p, code, size=None):
    """Sisipkan field Word (PAGE, TOC, ...)."""
    r = fld_char(p, "begin")
    r2 = instr_text(p, code)
    r3 = fld_char(p, "separate")
    r4 = p.add_run("1" if code.startswith("PAGE") else "Klik kanan lalu pilih Update Field.")
    r5 = fld_char(p, "end")
    if size:
        for x in (r, r2, r3, r4, r5):
            x.font.size = Pt(size)


def gaya_dasar():
    st = doc.styles["Normal"]
    st.font.name = FONT
    st.font.size = Pt(12)
    st.element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
    st.paragraph_format.space_after = Pt(0)
    for nama, size, align in (("Heading 1", 14, WD_ALIGN_PARAGRAPH.CENTER),
                              ("Heading 2", 12, WD_ALIGN_PARAGRAPH.LEFT),
                              ("Heading 3", 12, WD_ALIGN_PARAGRAPH.LEFT)):
        h = doc.styles[nama]
        h.font.name = FONT
        h.font.size = Pt(size)
        h.font.bold = True
        h.font.italic = False
        h.font.color.rgb = RGBColor(0, 0, 0)
        rpr = h.element.get_or_add_rPr()
        rf = rpr.find(qn("w:rFonts"))
        if rf is None:
            rf = OxmlElement("w:rFonts")
            rpr.append(rf)
        for a in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
            rf.set(qn(a), FONT)
        for a in ("w:asciiTheme", "w:hAnsiTheme", "w:eastAsiaTheme", "w:cstheme"):
            if rf.get(qn(a)) is not None:
                del rf.attrib[qn(a)]
        pf = h.paragraph_format
        pf.alignment = align
        pf.space_before = Pt(12 if nama != "Heading 1" else 0)
        pf.space_after = Pt(12 if nama == "Heading 1" else 6)
        pf.line_spacing = 1.5 if nama != "Heading 1" else 1.15
        pf.keep_with_next = True
        pf.first_line_indent = Cm(0)
    from docx.enum.style import WD_STYLE_TYPE
    for nama in ("Caption Tabel", "Caption Gambar"):
        c = doc.styles.add_style(nama, WD_STYLE_TYPE.PARAGRAPH)
        c.base_style = doc.styles["Normal"]
        c.font.size = Pt(11)
        c.font.italic = True
        c.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        c.paragraph_format.line_spacing = 1.0
        c.paragraph_format.space_before = Pt(6)
        c.paragraph_format.space_after = Pt(6)
        c.paragraph_format.first_line_indent = Cm(0)
        if nama == "Caption Tabel":
            c.paragraph_format.keep_with_next = True


gaya_dasar()

# Penomoran halaman: setiap "bab" = section baru. Halaman pertama bab: nomor tengah bawah,
# halaman lain: kanan atas (Pedoman 5.1.B).
SECTION_COUNT = [0]


def section_baru(fmt="decimal", start=None, tanpa_nomor=False):
    if SECTION_COUNT[0] == 0:
        sec = doc.sections[0]
    else:
        sec = doc.add_section(WD_SECTION.NEW_PAGE)
    SECTION_COUNT[0] += 1
    sec.page_width, sec.page_height = Cm(21), Cm(29.7)
    sec.top_margin, sec.left_margin = Cm(4), Cm(4)
    sec.bottom_margin, sec.right_margin = Cm(3), Cm(3)
    sec.header_distance, sec.footer_distance = Cm(1.5), Cm(1)
    sec.different_first_page_header_footer = True
    for hf in (sec.header, sec.footer, sec.first_page_header, sec.first_page_footer):
        hf.is_linked_to_previous = False
        for p in hf.paragraphs:
            p.text = ""
    if not tanpa_nomor:
        hp = sec.header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hp.paragraph_format.right_indent = Cm(-1.5)
        add_field(hp, "PAGE")
        fp = sec.first_page_footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        add_field(fp, "PAGE")
    sectPr = sec._sectPr
    pg = sectPr.find(qn("w:pgNumType"))
    if pg is None:
        pg = OxmlElement("w:pgNumType")
        sectPr.append(pg)
    pg.set(qn("w:fmt"), fmt)
    if start is not None:
        pg.set(qn("w:start"), str(start))
    elif pg.get(qn("w:start")) is not None:
        # add_section menyalin sectPr sebelumnya; tanpa ini nomor halaman mulai ulang di tiap bab
        del pg.attrib[qn("w:start")]
    return sec


FIRST_PAR = [True]


def judul_bab(nomor, judul):
    p = doc.add_paragraph(style="Heading 1")
    if nomor:
        p.add_run(f"BAB {nomor}")
        p.add_run().add_break()
    p.add_run(judul)


def heading(level, nomor, teks):
    p = doc.add_paragraph(style=f"Heading {level}")
    if nomor:
        p.add_run(nomor + "\t")
        p.paragraph_format.tab_stops.add_tab_stop(Cm(1.25 if level == 2 else 1.5))
    tulis_runs(p, inline(teks))


# ---------------------------------------------------------------- tabel
def parse_colspec(spec):
    cols = []
    i = 0
    align = None
    while i < len(spec):
        c = spec[i]
        if c == ">":
            g, i = group(spec, i + 1)
            if "centering" in g:
                align = "c"
            elif "raggedleft" in g:
                align = "r"
            else:
                align = "l"
            continue
        if c == "@" or c == "!":
            _, i = group(spec, i + 1)
            continue
        if c == "*":
            n, i = group(spec, i + 1)
            sub, i = group(spec, i)
            cols += parse_colspec(sub) * int(n)
            continue
        if c in "pmb":
            w, i = group(spec, i + 1)
            cols.append((align or "l", float(w.replace("cm", ""))))
            align = None
            continue
        if c in "lcr":
            cols.append((c, None))
            i += 1
            continue
        i += 1
    return cols


def split_top(s, sep):
    """Pisahkan s pada sep di kedalaman kurung 0 (abaikan yang di-escape)."""
    parts, depth, start, i = [], 0, 0, 0
    while i < len(s):
        c = s[i]
        if c == "\\":
            if sep == "\\\\" and s.startswith("\\\\", i) and depth == 0:
                parts.append(s[start:i])
                i += 2
                if i < len(s) and s[i] == "[":
                    _, i = bracket(s, i)
                start = i
                continue
            i += 2
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
        elif sep == "&" and c == "&" and depth == 0:
            parts.append(s[start:i])
            start = i + 1
        i += 1
    parts.append(s[start:])
    return parts


def ratakan_tabular(s):
    """Tabular bersarang di dalam sel diratakan menjadi baris teks dipisah tab."""
    def ganti(m):
        body = m.group(0)
        body = re.sub(r"^\\begin\{tabular\}", "", body)
        _, j = group(body, 0)
        body = body[j:-len("\\end{tabular}")]
        rows = [r for r in split_top(body, "\\\\") if r.strip()]
        return "\\\\".join("\\quad ".join(c.strip() for c in split_top(r, "&")) for r in rows)
    return re.sub(r"\\begin\{tabular\}.*?\\end\{tabular\}", ganti, s, flags=re.S)


def buat_tabel(container, spec, body, size=11, header_rows=0, keep_together=True):
    cols = parse_colspec(spec)
    body = ratakan_tabular(body)
    chunks = split_top(body, "\\\\")
    rows = []          # list of [cells_raw, tebal_garis_atas, tebal_garis_bawah]
    pending_top = 0
    for ch in chunks:
        m = re.match(r"\s*((?:" + RULE_RE + r"\s*)*)", ch)
        jenis = re.findall(r"\\(hline|toprule|midrule|bottomrule|garis)", m.group(1))
        tebal = max((GARIS[j] for j in jenis), default=0)
        rest = ch[m.end():]
        rest = re.sub(r"\\(endfirsthead|endhead|endfoot|endlastfoot)", "", rest)
        if tebal:
            if rows:
                rows[-1][2] = tebal  # garis bawah baris sebelumnya
            else:
                pending_top = tebal
        if not rest.strip():
            continue
        rows.append([split_top(rest, "&"), pending_top, 0])
        pending_top = 0
    known = sum(w for _, w in cols if w)
    free = [k for k, (_, w) in enumerate(cols) if not w]
    sisa = max(TEXT_WIDTH_CM - known, 1.5 * len(free)) if free else 0
    widths = [w if w else sisa / max(len(free), 1) for _, w in cols]
    if not free:
        widths = [w for w in widths]
    # Lebar p{} di LaTeX belum termasuk \tabcolsep, sedangkan lebar sel Word sudah termasuk
    # margin sel; tambahkan 0,3 cm per kolom agar teks tidak terpotong
    widths = [w + 0.45 for w in widths]
    total = sum(widths)
    if total > TEXT_WIDTH_CM:
        widths = [w * TEXT_WIDTH_CM / total for w in widths]
    elif free:
        # kolom l/c tanpa lebar: ambil lebar seperlunya, maksimum lebar teks
        est = []
        for k, (al, w) in enumerate(cols):
            if w:
                est.append(w)
                continue
            longest = 0
            for cells, _, _ in rows:
                if k < len(cells):
                    txt = "".join(r.get("text", "") for r in inline(cells[k]))
                    longest = max(longest, len(txt))
            est.append(min(max(longest * 0.24 + 0.5, 1.2), 6.0))
        widths = est
        if sum(widths) > TEXT_WIDTH_CM:
            widths = [w * TEXT_WIDTH_CM / sum(widths) for w in widths]
    tbl = container.add_table(rows=len(rows), cols=len(cols))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tblPr = tbl._tbl.tblPr
    for el in tblPr.findall(qn("w:tblStyle")):
        tblPr.remove(el)
    lay = OxmlElement("w:tblLayout")
    lay.set(qn("w:type"), "fixed")
    tblPr.append(lay)
    # margin sel kiri/kanan kecil (setara \tabcolsep 4pt) agar kolom sempit tidak memotong kata
    mar = OxmlElement("w:tblCellMar")
    # kiri/kanan setara \tabcolsep 5pt; atas/bawah memberi ruang napas tiap baris
    for side, w in (("top", "15"), ("left", "90"), ("bottom", "15"), ("right", "90")):
        el = OxmlElement(f"w:{side}")
        el.set(qn("w:w"), w)
        el.set(qn("w:type"), "dxa")
        mar.append(el)
    tblPr.append(mar)
    grid = tbl._tbl.tblGrid
    for k, gc in enumerate(grid.findall(qn("w:gridCol"))):
        gc.set(qn("w:w"), str(int(widths[k] / 2.54 * 1440)))
    for ri, (cells, top, bottom) in enumerate(rows):
        row = tbl.rows[ri]
        if ri < header_rows:
            trPr = row._tr.get_or_add_trPr()
            th = OxmlElement("w:tblHeader")
            trPr.append(th)
        ci = 0
        for raw in cells:
            if ci >= len(cols):
                break
            span, al = 1, cols[ci][0]
            mm = re.match(r"\s*\\multicolumn\{(\d+)\}", raw)
            if mm:
                span = int(mm.group(1))
                j = mm.end()
                cspec, j = group(raw, j)
                raw, _ = group(raw, j)
                sub = parse_colspec(cspec)
                al = sub[0][0] if sub else "l"
            cell = row.cells[ci]
            if span > 1:
                cell = cell.merge(row.cells[min(ci + span - 1, len(cols) - 1)])
            runs = inline(raw.strip())
            if any(r.get("shade") for r in runs):
                shade(cell)
            p = cell.paragraphs[0]
            fmt_par(p, indent_first=False, spacing=1.0,
                    align={"l": WD_ALIGN_PARAGRAPH.LEFT, "c": WD_ALIGN_PARAGRAPH.CENTER,
                           "r": WD_ALIGN_PARAGRAPH.RIGHT}[al])
            tulis_runs(p, runs, size=size)
            ci += span
        for k, cell in enumerate(row.cells):
            cell.width = Cm(widths[k])
            set_cell_border(cell, top=top, bottom=bottom, left=0, right=0)
        trPr = row._tr.get_or_add_trPr()
        trPr.append(OxmlElement("w:cantSplit"))
        if keep_together and ri < len(rows) - 1:
            # Pedoman 5.1.D: tabel tidak terpisah halaman
            for cell in row.cells:
                for p in cell.paragraphs:
                    p.paragraph_format.keep_with_next = True
    return tbl


def buka_grup(raw):
    """Buka kurung kurawal pembungkus (mis. {\\footnotesize ...}) tanpa menyentuh argumen perintah."""
    out, i = [], 0
    while i < len(raw):
        if raw[i] == "{" and (i == 0 or not raw[i - 1].isalpha() and raw[i - 1] not in "}]*"):
            g, i = group(raw, i)
            out.append(buka_grup(g))
            continue
        out.append(raw[i])
        i += 1
    return "".join(out)


def catatan_tabel(container, raw, align=WD_ALIGN_PARAGRAPH.LEFT):
    raw = re.sub(r"\\begin\{minipage\}\{[^}]*\}|\\end\{minipage\}", "", raw)
    raw = re.sub(r"\\par\b|\\vspace\{[^}]*\}", "", raw)
    p = None
    for line in split_top(buka_grup(raw.strip()), "\\\\"):
        line = line.strip()
        if not line:
            continue
        p = container.add_paragraph()
        fmt_par(p, indent_first=False, spacing=1.0, align=align, after=0, before=2)
        tulis_runs(p, inline(line), size=10)
    if p is not None:
        p.paragraph_format.space_after = Pt(10)


# ---------------------------------------------------------------- blok
def cari_env(s, i, env):
    """s[i:] diawali \\begin{env}; kembalikan (isi, indeks setelah \\end{env})."""
    b, e = "\\begin{" + env + "}", "\\end{" + env + "}"
    depth, j = 0, i
    while True:
        nb, ne = s.find(b, j), s.find(e, j)
        if nb != -1 and nb < ne:
            depth += 1
            j = nb + len(b)
        else:
            depth -= 1
            if depth == 0:
                return s[i + len(b):ne], ne + len(e)
            j = ne + len(e)


COUNTER = {"chapter": 0, "section": 0, "subsection": 0, "table": 0, "figure": 0, "equation": 0}


def paragraf(container, teks, indent_first=True, left=0.0, label=None, hanging=0.6, align=None):
    teks = teks.strip()
    if not teks:
        return
    noindent = teks.startswith("\\noindent")
    if noindent:
        teks = teks[len("\\noindent"):].lstrip()
    p = container.add_paragraph()
    if label:
        fmt_par(p, indent_first=False, left=left, hanging=hanging)
        p.add_run(label + "\t")
        p.paragraph_format.tab_stops.add_tab_stop(Cm(left + hanging))
    else:
        fmt_par(p, indent_first=indent_first and not noindent and left == 0, left=left)
    if align is not None:
        p.paragraph_format.alignment = align
    tulis_runs(p, inline(teks))
    return p


def gambar(container, png, max_cm=TEXT_WIDTH_CM, scale=1.0):
    w, h = png_size(png)
    width_cm = min(w / 300 * 2.54 * scale, max_cm)
    p = container.add_paragraph()
    fmt_par(p, indent_first=False, spacing=1.0, align=WD_ALIGN_PARAGRAPH.CENTER, before=4, after=4)
    p.add_run().add_picture(png, width=Cm(width_cm))
    return p


def persamaan(container, body, nomor=None, left=0.0, aligned=False):
    body = re.sub(r"\\label\{[^}]*\}", "", body).strip()
    if aligned:
        png = render("$\\displaystyle\\begin{aligned}" + body + "\\end{aligned}$")
    else:
        png = render("$\\displaystyle " + body + "$")
    w, h = png_size(png)
    avail = TEXT_WIDTH_CM - left
    nomor_w = 1.6 if nomor else 0.2
    # gambar harus lebih kecil dari ruang di dalam sel; Word memotong gambar yang lebih lebar
    width_cm = min(w / 300 * 2.54, avail - 2 * nomor_w - 0.6)
    # Tabel tanpa garis 3 kolom: [kosong | rumus di tengah | nomor di kanan, rata tengah vertikal]
    from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
    t = container.add_table(rows=1, cols=3)
    t.autofit = False
    tblPr = t._tbl.tblPr
    for el in tblPr.findall(qn("w:tblStyle")):
        tblPr.remove(el)
    ind = OxmlElement("w:tblInd")
    ind.set(qn("w:w"), str(int(left / 2.54 * 1440)))
    ind.set(qn("w:type"), "dxa")
    tblPr.append(ind)
    lay = OxmlElement("w:tblLayout")
    lay.set(qn("w:type"), "fixed")
    tblPr.append(lay)
    ws = [nomor_w, avail - 2 * nomor_w, nomor_w]
    for k, gc in enumerate(t._tbl.tblGrid.findall(qn("w:gridCol"))):
        gc.set(qn("w:w"), str(int(ws[k] / 2.54 * 1440)))
    for k, cell in enumerate(t.rows[0].cells):
        cell.width = Cm(ws[k])
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        set_cell_border(cell, top="nil", bottom="nil", left="nil", right="nil")
        p = cell.paragraphs[0]
        fmt_par(p, indent_first=False, spacing=1.0, before=4, after=4,
                align=[WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.RIGHT][k])
    t.rows[0].cells[1].paragraphs[0].add_run().add_picture(png, width=Cm(width_cm))
    if nomor:
        t.rows[0].cells[2].paragraphs[0].add_run("(" + nomor + ")")


def caption_text(raw):
    return raw.strip()


def lingkungan_table(container, isi):
    cap = re.search(r"\\caption\{", isi)
    cap_text, j = group(isi, cap.end() - 1) if cap else ("", 0)
    COUNTER["table"] += 1
    nomor = f"{COUNTER['chapter']}.{COUNTER['table']}"
    lab = re.search(r"\\label\{([^}]*)\}", isi)
    if lab and LABEL.get(lab.group(1)) != nomor:
        print("PERINGATAN nomor tabel", lab.group(1), LABEL.get(lab.group(1)), nomor)
    p = container.add_paragraph(style="Caption Tabel")
    p.add_run(f"Tabel {nomor}. ")
    tulis_runs(p, inline(caption_text(cap_text)))
    size = 10 if "\\footnotesize" in isi.split("\\begin{tabular}")[0] else 11
    t0 = isi.index("\\begin{tabular}")
    tab, t1 = cari_env(isi, t0, "tabular")
    spec, k = group(tab, 0)
    buat_tabel(container, spec, tab[k:], size=size)
    catatan_tabel(container, isi[t1:])


def lingkungan_longtable(container, isi, size=11):
    spec, k = group(isi, 0)
    body = isi[k:]
    cap = re.search(r"\\caption\{", body)
    header_rows = 0
    if cap:
        cap_text, j = group(body, cap.end() - 1)
        COUNTER["table"] += 1
        nomor = f"{COUNTER['chapter']}.{COUNTER['table']}"
        p = container.add_paragraph(style="Caption Tabel")
        p.add_run(f"Tabel {nomor}. ")
        tulis_runs(p, inline(cap_text))
        # buang \caption{...}\label{...}\\ di baris pertama
        akhir = body.index("\\\\", j)
        body = body[:cap.start()] + body[akhir + 2:]
    if "\\endfirsthead" in body:
        head, rest = body.split("\\endfirsthead", 1)
        rest = rest.split("\\endhead", 1)[1]
        body = head + "\\endhead" + rest
    if "\\endhead" in body:
        head = body.split("\\endhead")[0]
        header_rows = len([c for c in split_top(head, "\\\\")
                           if re.sub(RULE_RE, "", c).strip()])
    if "\\endfoot" in body:
        a, b = body.split("\\endfoot", 1)
        # bagian \endfoot berisi \hline penutup; buang dari isi
        a_parts = a.rsplit("\\endhead", 1)
        body = a_parts[0] + "\\endhead" + "\n" + b + "\\bottomrule" if len(a_parts) == 2 else a + b
        body = re.sub(r"\\endhead\s*" + RULE_RE, "\\\\endhead", body)
    body = re.sub(r"\\input\{([^}]*)\}", lambda m: baca(os.path.join(ROOT, m.group(1) + ("" if m.group(1).endswith(".tex") else ".tex"))), body)
    buat_tabel(container, spec, body, size=size, header_rows=header_rows, keep_together=False)


def lingkungan_figure(container, isi):
    tz = re.search(r"\\begin\{tikzpicture\}", isi)
    if tz:
        code, _ = cari_env(isi, tz.start(), "tikzpicture")
        png = render("\\begin{tikzpicture}" + code + "\\end{tikzpicture}")
        gambar(container, png).paragraph_format.keep_with_next = True
    cap = re.search(r"\\caption\{", isi)
    cap_text, _ = group(isi, cap.end() - 1)
    COUNTER["figure"] += 1
    nomor = f"{COUNTER['chapter']}.{COUNTER['figure']}"
    p = container.add_paragraph(style="Caption Gambar")
    p.add_run(f"Gambar {nomor}. ")
    tulis_runs(p, inline(cap_text))


def label_item(fmt, n):
    if fmt == "alph":
        return chr(ord("a") + n - 1) + "."
    return f"{n}."


def lingkungan_enumerate(container, isi, left=0.0):
    fmt = "arabic"
    m = re.match(r"\s*\[([^\]]*)\]", isi)
    if m:
        if "alph" in m.group(1):
            fmt = "alph"
        isi = isi[m.end():]
    # pisahkan item pada \item di kedalaman 0 (abaikan \item milik enumerate bersarang)
    items, depth, start, i = [], 0, None, 0
    while i < len(isi):
        if isi.startswith("\\begin{enumerate}", i):
            depth += 1
            i += 17
            continue
        if isi.startswith("\\end{enumerate}", i):
            depth -= 1
            i += 15
            continue
        if isi.startswith("\\item", i) and depth == 0:
            if start is not None:
                items.append(isi[start:i])
            start = i + 5
            i += 5
            continue
        i += 1
    if start is not None:
        items.append(isi[start:])
    for n, it in enumerate(items, 1):
        blok(container, it, left=left, label=label_item(fmt, n))


ENV_PAT = re.compile(r"\\begin\{(table|figure|longtable|enumerate|equation\*?|align\*|flushright|center|quote)\}")


def blok(container, s, left=0.0, label=None):
    """Proses sederet blok LaTeX. Jika label diberikan, paragraf pertama diberi nomor itu."""
    i = 0
    first_label = label
    hang = 0.6

    def tulis_par(teks):
        nonlocal first_label
        if not teks.strip():
            return
        if first_label:
            paragraf(container, teks, left=left, label=first_label, hanging=hang)
            first_label = None
        else:
            paragraf(container, teks, indent_first=(left == 0), left=left + (hang if label else 0))

    buf = []
    while i < len(s):
        if s.startswith("\n", i) and re.compile(r"\n\s*\n").match(s, i):
            tulis_par("".join(buf))
            buf = []
            i = re.compile(r"\n\s*\n").match(s, i).end()
            continue
        m = ENV_PAT.match(s, i)
        if m:
            tulis_par("".join(buf))
            buf = []
            env = m.group(1)
            isi, i = cari_env(s, i, env)
            inner_left = left + (hang if label else 0)
            if env == "table":
                lingkungan_table(container, isi)
            elif env == "figure":
                lingkungan_figure(container, isi)
            elif env == "longtable":
                lingkungan_longtable(container, isi)
            elif env == "enumerate":
                lingkungan_enumerate(container, isi, left=inner_left)
            elif env == "equation":
                COUNTER["equation"] += 1
                persamaan(container, isi, nomor=f"{COUNTER['chapter']}.{COUNTER['equation']}", left=inner_left)
            elif env == "equation*":
                persamaan(container, isi, left=inner_left)
            elif env == "align*":
                persamaan(container, isi, left=inner_left, aligned=True)
            elif env == "flushright":
                for n, line in enumerate(split_top(isi.strip(), "\\\\")):
                    p = paragraf(container, line, indent_first=False, align=WD_ALIGN_PARAGRAPH.RIGHT)
                    if p is not None:
                        p.paragraph_format.space_before = Pt(56 if "Penulis" in line else 28 if n == 0 else 0)
            elif env == "center":
                for line in split_top(isi.strip(), "\\\\"):
                    paragraf(container, line, indent_first=False, align=WD_ALIGN_PARAGRAPH.CENTER)
            elif env == "quote":
                teks = re.sub(r"\\(singlespacing|small)\b", "", isi).strip()
                p = paragraf(container, teks, indent_first=False, left=inner_left + 1.0)
                if p is not None:
                    p.paragraph_format.right_indent = Cm(1.0)
                    p.paragraph_format.line_spacing = 1.0
            continue
        hm = re.compile(r"\\(chapter|section|subsection)(\*?)\{").match(s, i)
        if hm:
            tulis_par("".join(buf))
            buf = []
            judul, i = group(s, hm.end() - 1)
            kind, star = hm.group(1), hm.group(2)
            if kind == "chapter":
                if star:
                    judul_bab(None, judul)
                else:
                    COUNTER["chapter"] += 1
                    COUNTER.update(section=0, subsection=0, table=0, figure=0, equation=0)
                    judul_bab(ROMAN[COUNTER["chapter"]], judul)
            elif kind == "section":
                COUNTER["section"] += 1
                COUNTER["subsection"] = 0
                heading(2, f"{COUNTER['chapter']}.{COUNTER['section']}", judul)
            else:
                COUNTER["subsection"] += 1
                heading(3, f"{COUNTER['chapter']}.{COUNTER['section']}.{COUNTER['subsection']}", judul)
            continue
        jm = re.compile(r"\\judullampiran\{").match(s, i)
        if jm:
            tulis_par("".join(buf))
            buf = []
            judul, i = group(s, jm.end() - 1)
            p = doc.add_paragraph(style="Heading 2")
            tulis_runs(p, inline(judul))
            continue
        nm = re.compile(r"\\(newcommand|renewcommand)\{").match(s, i)
        if nm:
            _, j = group(s, nm.end() - 1)
            if j < len(s) and s[j] == "[":
                _, j = bracket(s, j)
            _, i = group(s, j)
            continue
        sm = re.compile(r"\\(label|addcontentsline|vspace|setlength|pagebreak|clearpage)\b").match(s, i)
        if sm:
            j = sm.end()
            n = {"label": 1, "addcontentsline": 3, "vspace": 1, "setlength": 2}.get(sm.group(1), 0)
            for _ in range(n):
                while s[j].isspace():
                    j += 1
                _, j = group(s, j)
            i = j
            continue
        # pembungkus {\small\singlespacing ... } di tingkat blok: abaikan kurungnya saja
        if s.startswith("{\\small", i) or s.startswith("{\\footnotesize", i):
            if s.startswith("{\\footnotesize", i):
                g, i = group(s, i)
                catatan_tabel(container, g, align=WD_ALIGN_PARAGRAPH.LEFT)
                continue
            i += 1
            for cmd in ("\\small", "\\singlespacing"):
                if s.startswith(cmd, i):
                    i += len(cmd)
            continue
        if s[i] == "}" and not "".join(buf).count("{") > "".join(buf).count("}"):
            i += 1
            continue
        buf.append(s[i])
        i += 1
    tulis_par("".join(buf))


# ---------------------------------------------------------------- bagian dokumen
def data_utama():
    t = baca(os.path.join(ROOT, "ujian-proposal.tex"))
    d = {}
    for k in ("titleskripsi", "fullname", "idnum", "yearsubmit", "program", "faculty", "university", "city"):
        m = re.search(r"\\" + k + r"\{", t)
        d[k], _ = group(t, m.end() - 1)
    return d


def sampul(d):
    section_baru(fmt="lowerRoman", start=1, tanpa_nomor=True)

    def baris(teks, size=14, bold=True, before=0, after=0):
        p = doc.add_paragraph()
        fmt_par(p, indent_first=False, spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, before=before, after=after)
        r = p.add_run(teks)
        r.bold = bold
        r.font.size = Pt(size)
        return p

    baris(d["titleskripsi"].upper())
    baris("PROPOSAL SKRIPSI", before=40)
    p = doc.add_paragraph()
    fmt_par(p, indent_first=False, spacing=1.0, align=WD_ALIGN_PARAGRAPH.CENTER, before=60, after=60)
    p.add_run().add_picture(os.path.join(ROOT, "gambar", "logo-wiga.png"), height=Cm(6))
    baris("OLEH:", size=12)
    baris(d["fullname"].upper(), size=12)
    baris("NIM. " + d["idnum"], size=12, after=60)
    baris("PROGRAM STUDI " + d["program"].upper())
    baris(d["faculty"].upper())
    baris(d["university"].upper())
    baris(d["city"].upper())
    baris(d["yearsubmit"])


def daftar(judul, kode):
    section_baru(fmt="lowerRoman")
    judul_bab(None, judul)
    p = doc.add_paragraph()
    fmt_par(p, indent_first=False, spacing=1.5)
    add_field(p, kode)


def berkas(nama):
    return buang_komentar(baca(os.path.join(ROOT, "isi-bab", nama)))


def main():
    d = data_utama()
    sampul(d)
    section_baru(fmt="lowerRoman", start=2)
    blok(doc, berkas("kata-pengantar.tex"))
    daftar("DAFTAR ISI", 'TOC \\o "1-3" \\h \\z \\u')
    daftar("DAFTAR TABEL", 'TOC \\h \\z \\t "Caption Tabel,1"')
    daftar("DAFTAR GAMBAR", 'TOC \\h \\z \\t "Caption Gambar,1"')
    for k, nama in enumerate(("bab1.tex", "bab2.tex", "bab3.tex")):
        section_baru(fmt="decimal", start=1 if k == 0 else None)
        blok(doc, berkas(nama))
    section_baru(fmt="decimal")
    judul_bab(None, "DAFTAR PUSTAKA")
    keys = sorted(BIB, key=lambda k: (sitasi_penulis(k).lower(), tahun(k)))
    for n, k in enumerate(keys):
        p = doc.add_paragraph()
        fmt_par(p, indent_first=False, hanging=1.5, spacing=1.0, after=6, align=WD_ALIGN_PARAGRAPH.LEFT)
        for teks, miring, *url in entri_pustaka(k):
            r = p.add_run(teks)
            r.italic = miring or None
            if url:
                tautan(p, r, url=url[0])
        bookmark(p, bookmark_pustaka(k), 1000 + n)
    section_baru(fmt="decimal")
    blok(doc, berkas("lampiran.tex"))
    # Field daftar isi/tabel/gambar diisi oleh skrip/word_update_fields.ps1 (Microsoft Word)
    doc.core_properties.title = d["titleskripsi"]
    doc.core_properties.author = d["fullname"]
    doc.save(OUT)
    print("tersimpan:", OUT)


main()
