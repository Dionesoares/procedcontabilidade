import { buildTreeFromFlatRows } from "@/lib/balanceteCalc";

// Parses a value like "312.182,87d" or "26.240,20c" (Brazilian thousands/decimal
// separators with a trailing d=débito/c=crédito suffix) into a signed number,
// matching the same convention used across the rest of the balancete (positive = "d").
function parseValor(str) {
  if (!str) return 0;
  const s = str.trim();
  if (!s) return 0;
  const suffixMatch = /([dc])$/i.exec(s);
  const suffix = suffixMatch ? suffixMatch[1].toLowerCase() : null;
  const numPart = suffix ? s.slice(0, -1) : s;
  const num = parseFloat(numPart.replace(/\./g, "").replace(",", ".")) || 0;
  return suffix === "c" ? -num : num;
}

function parsePlainNumber(str) {
  if (!str) return 0;
  return parseFloat(str.trim().replace(/\./g, "").replace(",", ".")) || 0;
}

// Parses a balancete CSV export in the standard format:
// "Código;Descrição da conta;;Saldo Anterior;;Débito;Crédito;Saldo Atual;"
// followed by one row per account, with indentation (leading spaces) in the
// description column indicating the hierarchy level.
export function parseBalanceteCsv(text) {
  const clean = (text || "").replace(/^\uFEFF/, "");
  const lines = clean.split(/\r?\n/);

  const headerIdx = lines.findIndex((l) => /c[oó]digo;.*descri[cç][aã]o/i.test(l));
  if (headerIdx === -1) return null;

  const rows = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const fields = lines[i].split(";");
    const codigo = (fields[0] || "").trim();
    if (!/^\d+$/.test(codigo)) break; // end of the accounts table
    const descRaw = fields[1] || "";
    const leadingSpaces = (descRaw.match(/^ */) || [""])[0].length;
    const nivel = Math.round(leadingSpaces / 3);
    rows.push({
      codigo,
      descricao: descRaw.trim(),
      nivel,
      saldo_anterior: parseValor(fields[3]),
      debito: parsePlainNumber(fields[5]),
      credito: parsePlainNumber(fields[6]),
      saldo_atual: parseValor(fields[7]),
    });
  }

  if (rows.length === 0) return null;

  const tree = buildTreeFromFlatRows(rows);

  // Best-effort extraction of the signature block at the end of the file:
  //   _______________________________________
  //   NAME
  //   ROLE (or "Contador")
  //   [Reg. no CRC ... sob o No. 000000]
  //   CPF: 000.000.000-00
  const sigRegex = /_{5,}\s*\r?\n([^\r\n]+)\r?\n([^\r\n]+)\r?\n(?:[^\r\n]*Reg\.[^\r\n]*\r?\n)?CPF:\s*([\d.\-/]+)/gi;
  const sigs = [];
  let m;
  while ((m = sigRegex.exec(clean)) !== null) {
    sigs.push({ nome: m[1].trim(), cargo: m[2].trim(), cpf: m[3].trim() });
  }
  const crcMatch = clean.match(/Reg\.\s*no\s*CRC[^\d]*?(\d+)/i);

  const result = { tree };
  if (sigs[0]) {
    result.signature_cliente = sigs[0].nome;
    result.signature_cliente_role = sigs[0].cargo;
    result.signature_cliente_cpf = sigs[0].cpf;
  }
  if (sigs[1]) {
    result.signature_contador = sigs[1].nome;
    result.signature_contador_cpf = sigs[1].cpf;
  }
  if (crcMatch) result.signature_contador_crc = crcMatch[1];

  return result;
}