import { jsPDF } from "jspdf";
import { flattenTree, fmtRaw } from "@/lib/balanceteCalc";

const fmtDate = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "-");

export function generateBalancetePdf(balancete) {
  const tree = JSON.parse(balancete.tree || "[]");
  const rows = flattenTree(tree);
  const doc = new jsPDF();
  let y = 18;

  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("BALANCETE", 105, y, { align: "center" });
  y += 9;

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Cliente: ${balancete.client_name || ""}`, 14, y);
  y += 6;
  doc.text(`Período: ${fmtDate(balancete.period_start)} a ${fmtDate(balancete.period_end)}`, 14, y);
  y += 9;

  doc.setFontSize(8);
  doc.setFont(undefined, "bold");
  doc.text("Cód", 14, y);
  doc.text("Descrição", 30, y);
  doc.text("Saldo Anterior", 105, y);
  doc.text("Débito", 138, y);
  doc.text("Crédito", 160, y);
  doc.text("Saldo Atual", 180, y);
  y += 2;
  doc.line(14, y, 196, y);
  y += 5;

  rows.forEach((r) => {
    if (y > 280) {
      doc.addPage();
      y = 18;
    }
    const isLeaf = !r.children || r.children.length === 0;
    doc.setFont(undefined, isLeaf ? "normal" : "bold");
    doc.text(String(r.code), 14, y);
    doc.text(String(r.label).slice(0, 40), 30 + r.depth * 3, y);
    doc.text(fmtRaw(r.saldoAnteriorRaw).replace("R$ ", ""), 105, y);
    doc.text(Number(r.debito).toLocaleString("pt-BR", { minimumFractionDigits: 2 }), 138, y);
    doc.text(Number(r.credito).toLocaleString("pt-BR", { minimumFractionDigits: 2 }), 160, y);
    doc.text(fmtRaw(r.saldoAtualRaw).replace("R$ ", ""), 180, y);
    y += 6;
  });

  doc.save(`balancete-${(balancete.client_name || "cliente").replace(/\s+/g, "-").toLowerCase()}.pdf`);
}