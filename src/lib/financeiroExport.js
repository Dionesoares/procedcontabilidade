import jsPDF from "jspdf";

const fmt = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—");

// Column x-positions (mm) for the landscape A4 report. Landscape gives us
// ~269mm of usable width (vs ~182mm in portrait), which is needed now that
// Empresa and Nome are separate columns — cramming both into one "Cliente"
// column in portrait caused long company names to overlap the Tipo column.
const COLS = {
  descricao: 16,
  empresa: 78,
  nome: 140,
  tipo: 182,
  valor: 205,
  vencimento: 232,
  status: 262,
};
const PAGE_RIGHT = 283;
const TABLE_WIDTH = PAGE_RIGHT - 14;

// PDF rows are listed A–Z by Empresa, then Nome, then Descrição (pt-BR).
function sortRecordsAlphabetically(records) {
  return [...records].sort((a, b) => {
    const empresa = (a.company_name || "").localeCompare(b.company_name || "", "pt-BR", { sensitivity: "base" });
    if (empresa !== 0) return empresa;
    const nome = (a.client_name || "").localeCompare(b.client_name || "", "pt-BR", { sensitivity: "base" });
    if (nome !== 0) return nome;
    return (a.description || "").localeCompare(b.description || "", "pt-BR", { sensitivity: "base" });
  });
}

export function exportFinanceiroPdf(records) {
  const doc = new jsPDF({ orientation: "landscape" });
  const sorted = sortRecordsAlphabetically(records);
  const receitas = sorted.filter((r) => r.type === "Receita").reduce((s, r) => s + Number(r.amount || 0), 0);
  const despesas = sorted.filter((r) => r.type === "Despesa").reduce((s, r) => s + Number(r.amount || 0), 0);

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("Relatório Financeiro", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 24);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Receitas: ${fmt(receitas)}`, 14, 34);
  doc.text(`Despesas: ${fmt(despesas)}`, 90, 34);
  doc.text(`Saldo: ${fmt(receitas - despesas)}`, 166, 34);

  const drawHeader = (y) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y - 5, TABLE_WIDTH, 8, "F");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("Descrição", COLS.descricao, y);
    doc.text("Empresa", COLS.empresa, y);
    doc.text("Nome", COLS.nome, y);
    doc.text("Tipo", COLS.tipo, y);
    doc.text("Valor", COLS.valor, y);
    doc.text("Vencimento", COLS.vencimento, y);
    doc.text("Status", COLS.status, y);
  };

  let y = 46;
  drawHeader(y);
  y += 8;

  doc.setTextColor(30, 41, 59);
  sorted.forEach((r) => {
    if (y > 190) {
      doc.addPage();
      y = 20;
      drawHeader(y);
      y += 8;
      doc.setTextColor(30, 41, 59);
    }
    doc.text(String(r.description || "").slice(0, 28), COLS.descricao, y);
    doc.text(String(r.company_name || "—").slice(0, 26), COLS.empresa, y);
    doc.text(String(r.client_name || "—").slice(0, 20), COLS.nome, y);
    doc.text(r.type || "", COLS.tipo, y);
    doc.text(fmt(r.amount), COLS.valor, y);
    doc.text(fmtDate(r.due_date), COLS.vencimento, y);
    doc.text(r.status || "", COLS.status, y);
    y += 7;
  });

  doc.save(`relatorio-financeiro-${Date.now()}.pdf`);
}

export function exportFinanceiroExcel(records) {
  const header = ["Descrição", "Empresa", "Nome", "Tipo", "Valor", "Valor recebido", "Restante", "Vencimento", "Status"];
  const rows = records.map((r) => {
    const amount = Number(r.amount || 0);
    const paid = r.status === "Pago" ? amount : Number(r.amount_paid || 0);
    const remaining = r.status === "Pago" ? 0 : Math.max(0, amount - paid);
    return [
      r.description || "",
      r.company_name || "",
      r.client_name || "",
      r.type || "",
      amount.toFixed(2).replace(".", ","),
      paid.toFixed(2).replace(".", ","),
      remaining.toFixed(2).replace(".", ","),
      fmtDate(r.due_date),
      r.status || "",
    ];
  });
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((row) => row.map(escape).join(";")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio-financeiro-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
