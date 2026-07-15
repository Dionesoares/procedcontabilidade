import { CHART_OF_ACCOUNTS } from "@/lib/chartOfAccounts";

const getDate = (r) => new Date(r.due_date ? r.due_date + "T00:00:00" : r.created_date);

function sumLeaf(records, categoria, periodStart, periodEnd, before) {
  const start = periodStart ? new Date(periodStart + "T00:00:00") : null;
  const end = periodEnd ? new Date(periodEnd + "T23:59:59") : null;
  const inRange = (r) => {
    const d = getDate(r);
    if (before) return start ? d < start : false;
    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  };
  const list = records.filter((r) => r.categoria === categoria && inRange(r));
  const debito = list.filter((r) => r.tipo === "Débito").reduce((s, r) => s + Number(r.amount || 0), 0);
  const credito = list.filter((r) => r.tipo === "Crédito").reduce((s, r) => s + Number(r.amount || 0), 0);
  return { debito, credito };
}

function buildNode(node, records, periodStart, periodEnd) {
  if (node.categoria) {
    const before = sumLeaf(records, node.categoria, periodStart, periodEnd, true);
    const period = sumLeaf(records, node.categoria, periodStart, periodEnd, false);
    const saldoAnteriorRaw = before.debito - before.credito;
    const saldoAtualRaw = saldoAnteriorRaw + period.debito - period.credito;
    return { code: node.code, label: node.label, saldoAnteriorRaw, debito: period.debito, credito: period.credito, saldoAtualRaw, children: [] };
  }
  const children = (node.children || []).map((c) => buildNode(c, records, periodStart, periodEnd));
  return {
    code: node.code,
    label: node.label,
    saldoAnteriorRaw: children.reduce((s, c) => s + c.saldoAnteriorRaw, 0),
    debito: children.reduce((s, c) => s + c.debito, 0),
    credito: children.reduce((s, c) => s + c.credito, 0),
    saldoAtualRaw: children.reduce((s, c) => s + c.saldoAtualRaw, 0),
    children,
  };
}

export function computeBalanceteTree(records, periodStart, periodEnd) {
  return CHART_OF_ACCOUNTS.map((n) => buildNode(n, records, periodStart, periodEnd));
}

export function flattenTree(tree, depth = 0, out = []) {
  (tree || []).forEach((node) => {
    out.push({ ...node, depth });
    if (node.children?.length) flattenTree(node.children, depth + 1, out);
  });
  return out;
}

export function fmtRaw(raw) {
  const v = Number(raw || 0);
  return v >= 0
    ? `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}D`
    : `R$ ${(-v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}C`;
}

export function fmtMoney(v) {
  return `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}