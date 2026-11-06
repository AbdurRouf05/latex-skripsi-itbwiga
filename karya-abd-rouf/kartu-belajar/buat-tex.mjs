// Membuat kartu-belajar.tex dari data kartu di kartu-belajar.html.
// Pakai: node buat-tex.mjs  lalu  xelatex kartu-belajar.tex (jalankan 2x)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(dir, "kartu-belajar.html"), "utf8");
const start = html.indexOf("const DECKS");
const end = html.indexOf("CARDS.forEach");
const { DECKS, CARDS } = new Function(html.slice(start, end) + "\nreturn { DECKS, CARDS };")();

const esc = s => s
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/\\/g, "\\textbackslash{}")
  .replace(/([&%$#_{}])/g, "\\$1")
  .replace(/~/g, "\\textasciitilde{}").replace(/\^/g, "\\textasciicircum{}");

const TAGS = { "<b>": "\\textbf{", "<i>": "\\textit{", "<code>": "\\kode{", "</b>": "}", "</i>": "}", "</code>": "}" };
const tex = s => s
  .replace(/"([^"]*)"/g, "“$1”")
  .split(/(<\/?(?:b|i|code)>)/)
  .map(part => TAGS[part] ?? esc(part))
  .join("");

let body = "";
let no = 0;
for (const deck of DECKS) {
  const cards = CARDS.filter(c => c.d === deck.id);
  if (!cards.length) continue;
  body += `\n\\topik{${tex(deck.name)}}{${cards.length}}\n`;
  for (const c of cards) {
    no++;
    body += `\\kartu{${no}}{${tex(c.q)}}{${tex(c.a)}}{${c.i ? tex(c.i) : ""}}{${c.b ? tex(c.b) : ""}}\n`;
  }
}

const template = readFileSync(join(dir, "kartu-belajar.template.tex"), "utf8");
writeFileSync(join(dir, "kartu-belajar.tex"), template.replace("%%KARTU%%", () => body.trim()));
console.log(`${no} kartu dari ${DECKS.length} topik -> kartu-belajar.tex`);
