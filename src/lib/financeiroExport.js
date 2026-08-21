import jsPDF from "jspdf";
import { formatMoney, recordPaidAmount, recordRemainingAmount, totalRemainingToReceive } from "@/lib/financeiroAmounts";

const fmt = (v) => `R$ ${formatMoney(v)}`;
const fmtDate = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—");
const fmtCsv = (v) => Number(v || 0).toFixed(2).replace(".", ",");

const COLS = {
  descricao: 14,
  empresa: 58,
  nome: 100,
  tipo: 136,
  valor: 154,
  recebido: 180,
  restante: 208,
  vencimento: 236,
  status: 264,
};
const PAGE_RIGHT = 283;
const TABLE_WIDTH = PAGE_RIGHT - 14;

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
  const aReceber = totalRemainingToReceive(sorted);

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("Relatório Financeiro", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 24);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Receitas: ${fmt(receitas)}`, 14, 34);
  doc.text(`Despesas: ${fmt(despesas)}`, 78, 34);
  doc.text(`A receber: ${fmt(aReceber)}`, 142, 34);
  doc.text(`Saldo: ${fmt(receitas - despesas)}`, 210, 34);

  const drawHeader = (y) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y - 5, TABLE_WIDTH, 8, "F");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Descrição", COLS.descricao, y);
    doc.text("Empresa", COLS.empresa, y);
    doc.text("Nome", COLS.nome, y);
    doc.text("Tipo", COLS.tipo, y);
    doc.text("Valor", COLS.valor, y);
    doc.text("Recebido", COLS.recebido, y);
    doc.text("Restante", COLS.restante, y);
    doc.text("Vencimento", COLS.vencimento, y);
    doc.text("Status", COLS.status, y);
  };

  let y = 46;
  drawHeader(y);
  y += 8;

  doc.setTextColor(30, 41, 59);
  sorted.forEach((r) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
      drawHeader(y);
      y += 8;
      doc.setTextColor(30, 41, 59);
    }
    const paid = recordPaidAmount(r);
    const remaining = recordRemainingAmount(r);
    doc.setFontSize(8);
    doc.text(String(r.description || "").slice(0, 22), COLS.descricao, y);
    doc.text(String(r.company_name || "—").slice(0, 20), COLS.empresa, y);
    doc.text(String(r.client_name || "—").slice(0, 16), COLS.nome, y);
    doc.text(r.type || "", COLS.tipo, y);
    doc.text(fmt(r.amount), COLS.valor, y);
    doc.text(r.type === "Receita" ? fmt(paid) : "—", COLS.recebido, y);
    doc.text(r.type === "Receita" ? fmt(remaining) : "—", COLS.restante, y);
    doc.text(fmtDate(r.due_date), COLS.vencimento, y);
    doc.text(r.status || "", COLS.status, y);
    y += 7;
  });

  if (y > 185) {
    doc.addPage();
    y = 20;
  }
  doc.setFillColor(224, 242, 254);
  doc.rect(14, y - 5, TABLE_WIDTH, 8, "F");
  doc.setFontSize(9);
  doc.setTextColor(7, 89, 133);
  doc.text("Total restante a receber", COLS.descricao, y);
  doc.text(fmt(aReceber), COLS.restante, y);

  doc.save(`relatorio-financeiro-${Date.now()}.pdf`);
}

export function exportFinanceiroExcel(records) {
  const header = ["Descrição", "Empresa", "Nome", "Tipo", "Valor", "Valor recebido", "Restante", "Vencimento", "Status"];
  const rows = records.map((r) => {
    const amount = Number(r.amount || 0);
    const paid = r.type === "Receita" ? recordPaidAmount(r) : 0;
    const remaining = recordRemainingAmount(r);
    return [
      r.description || "",
      r.company_name || "",
      r.client_name || "",
      r.type || "",
      fmtCsv(amount),
      r.type === "Receita" ? fmtCsv(paid) : "",
      r.type === "Receita" ? fmtCsv(remaining) : "",
      fmtDate(r.due_date),
      r.status || "",
    ];
  });
  const remainingTotal = totalRemainingToReceive(records);
  rows.push(["Total restante a receber", "", "", "", "", "", fmtCsv(remainingTotal), "", ""]);
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
