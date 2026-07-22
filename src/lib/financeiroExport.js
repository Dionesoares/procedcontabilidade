import jsPDF from "jspdf";

const fmt = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—");

export function exportFinanceiroPdf(records) {
  const doc = new jsPDF();
  const receitas = records.filter((r) => r.type === "Receita").reduce((s, r) => s + Number(r.amount || 0), 0);
  const despesas = records.filter((r) => r.type === "Despesa").reduce((s, r) => s + Number(r.amount || 0), 0);

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("Relatório Financeiro", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 24);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Receitas: ${fmt(receitas)}`, 14, 34);
  doc.text(`Despesas: ${fmt(despesas)}`, 80, 34);
  doc.text(`Saldo: ${fmt(receitas - despesas)}`, 146, 34);

  let y = 46;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y - 5, 182, 8, "F");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Descrição", 16, y);
  doc.text("Tipo", 90, y);
  doc.text("Valor", 115, y);
  doc.text("Vencimento", 145, y);
  doc.text("Status", 175, y);
  y += 8;

  doc.setTextColor(30, 41, 59);
  records.forEach((r) => {
    if (y > 280) { doc.addPage(); y = 20; }
    doc.text(String(r.description || "").slice(0, 38), 16, y);
    doc.text(r.type || "", 90, y);
    doc.text(fmt(r.amount), 115, y);
    doc.text(fmtDate(r.due_date), 145, y);
    doc.text(r.status || "", 175, y);
    y += 7;
  });

  doc.save(`relatorio-financeiro-${Date.now()}.pdf`);
}

export function exportFinanceiroExcel(records) {
  const header = ["Descrição", "Tipo", "Valor", "Vencimento", "Status", "Cliente"];
  const rows = records.map((r) => [
    r.description || "",
    r.type || "",
    Number(r.amount || 0).toFixed(2).replace(".", ","),
    fmtDate(r.due_date),
    r.status || "",
    r.client_name || "",
  ]);
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