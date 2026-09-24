/**
 * Syntax highlighting sederhana (berbasis token) untuk jendela kode
 * pada section "Materi" / Pameran Kode.
 *
 * - Mendukung bahasa umum yang dipakai di les: C++, Python, Java, JavaScript,
 *   PHP, dll. (cukup untuk tampilan, bukan compiler).
 * - AMAN: hasil berupa token teks polos yang dirender sebagai <span> React
 *   (otomatis di-escape), BUKAN HTML mentah — jadi kode dari admin tidak
 *   bisa menyisipkan script berbahaya.
 */

export interface CodeToken {
  text: string;
  cls: string;
}

export type HighlightedLine = CodeToken[];

const CLS = {
  keyword: "text-sky-300",
  type: "text-teal-300",
  builtin: "text-slate-400",
  string: "text-emerald-300",
  number: "text-orange-300",
  comment: "text-slate-500 italic",
  fn: "text-amber-200",
  pre: "text-amber-300",
  plain: "text-slate-200",
} as const;

const KEYWORDS = new Set([
  // C / C++
  "using", "namespace", "include", "return", "if", "else", "for", "while",
  "do", "switch", "case", "break", "continue", "default", "new", "delete",
  "this", "template", "typename", "public", "private", "protected", "static",
  "const", "constexpr", "sizeof", "try", "catch", "throw", "true", "false",
  "nullptr", "NULL", "enum", "operator", "virtual", "override", "friend",
  "inline", "goto", "struct", "union", "extern", "mutable",
  // Python
  "def", "import", "from", "as", "pass", "lambda", "yield", "with", "in",
  "is", "not", "and", "or", "None", "True", "False", "elif", "global",
  "nonlocal", "assert", "raise", "finally", "async", "await", "self", "match",
  // JavaScript / TypeScript / Java / C#
  "function", "var", "let", "class", "extends", "implements", "interface",
  "export", "typeof", "instanceof", "void", "abstract", "final", "package",
  "super",
]);

const TYPES = new Set([
  "int", "float", "double", "char", "bool", "boolean", "string", "String",
  "long", "short", "unsigned", "signed", "size_t", "auto", "str", "list",
  "dict", "tuple", "set", "number", "any", "unknown", "never", "byte",
  "decimal", "object", "Integer", "Float", "Double", "Boolean", "Char",
  "Array", "ArrayList", "HashMap", "vector", "map", "pair", "ostream",
  "istream",
]);

const BUILTINS = new Set([
  "cout", "cin", "cerr", "clog", "endl", "std", "printf", "println",
  "print", "scanf", "len", "range", "input", "open", "sorted", "sum",
  "min", "max", "abs", "round", "enumerate", "zip", "console", "log",
  "System", "out", "err", "Math", "echo", "var_dump",
]);

const NUMBER_START = /[0-9]/;
const NUMBER_BODY = /[0-9._]/;
const IDENT_START = /[A-Za-z_]/;
const IDENT_BODY = /\w/;
const PREPROCESSOR = /^#\s*(include|define|ifndef|ifdef|endif|pragma|import)/;
const FULL_LINE_COMMENT = /^\s*(\/\/|#)/;

/** Ubah kode (teks biasa) menjadi per-baris token berwarna */
export function highlightCode(code: string): HighlightedLine[] {
  return code
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map(tokenizeLine);
}

function tokenizeLine(line: string): CodeToken[] {
  const tokens: CodeToken[] = [];

  const push = (text: string, cls: string) => {
    if (!text) return;
    const last = tokens[tokens.length - 1];
    if (last && last.cls === cls) {
      last.text += text;
    } else {
      tokens.push({ text, cls });
    }
  };

  // Preprocessor C/C++: #include, #define, dst.
  if (PREPROCESSOR.test(line.trimStart())) {
    push(line, CLS.pre);
    return tokens;
  }

  // Komentar satu baris penuh (C++ // atau Python #)
  if (FULL_LINE_COMMENT.test(line)) {
    push(line, CLS.comment);
    return tokens;
  }

  let i = 0;
  while (i < line.length) {
    const ch = line[i];

    // Komentar // sampai akhir baris
    if (ch === "/" && line[i + 1] === "/") {
      push(line.slice(i), CLS.comment);
      break;
    }

    // Komentar blok /* ... */ (untuk tampilan: berhenti di akhir baris)
    if (ch === "/" && line[i + 1] === "*") {
      const end = line.indexOf("*/", i + 2);
      const stop = end === -1 ? line.length : end + 2;
      push(line.slice(i, stop), CLS.comment);
      i = stop;
      continue;
    }

    // String "..." '...' `...`
    if (ch === '"' || ch === "'" || ch === "`") {
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === "\\") {
          j += 2;
          continue;
        }
        if (line[j] === ch) {
          j++;
          break;
        }
        j++;
      }
      push(line.slice(i, j), CLS.string);
      i = j;
      continue;
    }

    // Angka (tidak di tengah identifier)
    if (NUMBER_START.test(ch) && !(i > 0 && /[A-Za-z_]/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && NUMBER_BODY.test(line[j])) j++;
      push(line.slice(i, j), CLS.number);
      i = j;
      continue;
    }

    // Identifier / kata kunci
    if (IDENT_START.test(ch)) {
      let j = i;
      while (j < line.length && IDENT_BODY.test(line[j])) j++;
      const word = line.slice(i, j);

      let k = j;
      while (k < line.length && line[k] === " ") k++;
      const isCall = line[k] === "(";

      let cls: string = CLS.plain;
      if (KEYWORDS.has(word)) cls = CLS.keyword;
      else if (TYPES.has(word)) cls = CLS.type;
      else if (BUILTINS.has(word)) cls = CLS.builtin;
      else if (isCall) cls = CLS.fn;

      push(word, cls);
      i = j;
      continue;
    }

    // Karakter lain (spasi, tanda baca, operator) — dipertahankan apa adanya
    push(ch, CLS.plain);
    i++;
  }

  return tokens;
}
