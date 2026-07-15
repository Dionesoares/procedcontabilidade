import { jsPDF } from "jspdf";
import { fmtSaldo, fmtMoney } from "@/lib/balanceteCalc";

const fmtDate = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "-");

export function generateBalancetePdf(balancete) {
  const items = JSON.parse(balancete.items || "[]");
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

  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("Descrição", 14, y);
  doc.text("Saldo Anterior", 92, y);
  doc.text("Débito", 128, y);
  doc.text("Crédito", 152, y);
  doc.text("Saldo Atual", 176, y);
  y += 2;
  doc.line(14, y, 196, y);
  y += 6;
  doc.setFont(undefined, "normal");

  items.forEach((it) => {
    if (y > 280) {
      doc.addPage();
      y = 18;
    }
    doc.text(String(it.description).slice(0, 42), 14, y);
    doc.text("0,00", 92, y);
    doc.text(Number(it.debito).toLocaleString("pt-BR", { minimumFractionDigits: 2 }), 128, y);
    doc.text(Number(it.credito).toLocaleString("pt-BR", { minimumFractionDigits: 2 }), 152, y);
    doc.text(fmtSaldo(it.saldo), 176, y);
    y += 6;
  });

  if (y > 275) {
    doc.addPage();
    y = 18;
  }
  y += 3;
  doc.line(14, y, 196, y);
  y += 6;
  doc.setFont(undefined, "bold");
  doc.text("TOTAL", 14, y);
  doc.text(fmtSaldo(balancete.saldo_anterior), 92, y);
  doc.text(fmtMoney(balancete.total_debito).replace("R$ ", ""), 128, y);
  doc.text(fmtMoney(balancete.total_credito).replace("R$ ", ""), 152, y);
  doc.text(fmtSaldo(balancete.saldo_atual), 176, y);

  doc.save(`balancete-${(balancete.client_name || "cliente").replace(/\s+/g, "-").toLowerCase()}.pdf`);
}