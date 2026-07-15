import { jsPDF } from "jspdf";
import { flattenTree, fmtRawPlain, fmtMoneyPlain, fmtRaw, getTotals } from "@/lib/balanceteCalc";

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

  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("Empresa:", 14, y);
  doc.setFont(undefined, "normal");
  doc.text(String(balancete.client_company_name || balancete.client_name || ""), 34, y);
  doc.setFont(undefined, "bold");
  doc.text("Folha:", 165, y);
  doc.setFont(undefined, "normal");
  doc.text(String(balancete.folha || "0001"), 180, y);
  y += 6;
  doc.setFont(undefined, "bold");
  doc.text("C.N.P.J:", 14, y);
  doc.setFont(undefined, "normal");
  doc.text(String(balancete.client_cnpj || "-"), 34, y);
  doc.setFont(undefined, "bold");
  doc.text("Número livro:", 165, y);
  doc.setFont(undefined, "normal");
  doc.text(String(balancete.numero_livro || "0001"), 190, y);
  y += 6;
  doc.setFont(undefined, "bold");
  doc.text("Endereço:", 14, y);
  doc.setFont(undefined, "normal");
  doc.text(String(balancete.client_address || "-").slice(0, 100), 34, y);
  y += 6;
  doc.setFont(undefined, "bold");
  doc.text("Período:", 14, y);
  doc.setFont(undefined, "normal");
  doc.text(`${fmtDate(balancete.period_start)} - ${fmtDate(balancete.period_end)}`, 34, y);
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
    doc.text(String(r.label).slice(0, 42), 30 + r.depth * 3, y);
    doc.text(fmtRawPlain(r.saldoAnteriorRaw), 105, y);
    doc.text(fmtMoneyPlain(r.debito), 138, y);
    doc.text(fmtMoneyPlain(r.credito), 160, y);
    doc.text(fmtRawPlain(r.saldoAtualRaw), 180, y);
    y += 6;
  });

  const { ativo, passivo, despesas, receitas } = getTotals(tree);
  const resultado = (receitas?.saldoAtualRaw || 0) - (despesas?.saldoAtualRaw || 0);

  if (y > 240) {
    doc.addPage();
    y = 18;
  }
  y += 6;
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("RELATÓRIO GERAL", 14, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.text(`Total do Ativo: ${fmtRaw(ativo?.saldoAtualRaw)}`, 14, y);
  doc.text(`Total do Passivo: ${fmtRaw(passivo?.saldoAtualRaw)}`, 90, y);
  y += 6;
  doc.text(`Total de Despesas: ${fmtRaw(despesas?.saldoAtualRaw)}`, 14, y);
  doc.text(`Total de Receitas: ${fmtRaw(receitas?.saldoAtualRaw)}`, 90, y);
  y += 6;
  doc.text(`Resultado do Período: R$ ${Math.abs(resultado).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ${resultado >= 0 ? "(Lucro)" : "(Prejuízo)"}`, 14, y);

  y += 20;
  if (y > 270) {
    doc.addPage();
    y = 40;
  }
  doc.line(20, y, 90, y);
  doc.line(120, y, 190, y);
  y += 5;
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text(balancete.signature_cliente || balancete.client_name || "", 20, y);
  doc.text(balancete.signature_contador || "", 120, y);
  y += 5;
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.text(balancete.signature_cliente_role || "Sócio Proprietário", 20, y);
  doc.text("Contador", 120, y);
  if (balancete.signature_contador_crc) {
    y += 4;
    doc.text(`Reg. no CRC sob o No. ${balancete.signature_contador_crc}`, 120, y);
  }
  const clienteCpfY = y;
  if (balancete.signature_cliente_cpf) {
    doc.text(`CPF: ${balancete.signature_cliente_cpf}`, 20, clienteCpfY);
  }
  if (balancete.signature_contador_cpf) {
    y += 4;
    doc.text(`CPF: ${balancete.signature_contador_cpf}`, 120, y);
  }

  doc.save(`balancete-${(balancete.client_name || "cliente").replace(/\s+/g, "-").toLowerCase()}.pdf`);
}