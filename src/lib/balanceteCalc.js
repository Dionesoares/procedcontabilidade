export function computeBalancete(records, periodStart, periodEnd) {
  const start = periodStart ? new Date(periodStart + "T00:00:00") : null;
  const end = periodEnd ? new Date(periodEnd + "T23:59:59") : null;
  const getDate = (r) => new Date(r.due_date ? r.due_date + "T00:00:00" : r.created_date);

  const inPeriod = (r) => {
    const d = getDate(r);
    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  };
  const before = (r) => (start ? getDate(r) < start : false);

  const periodRecords = records.filter(inPeriod);
  const beforeRecords = records.filter(before);

  const sumBy = (list, type) => list.filter((r) => r.type === type).reduce((s, r) => s + Number(r.amount || 0), 0);

  const saldoAnterior = sumBy(beforeRecords, "Receita") - sumBy(beforeRecords, "Despesa");
  const totalCredito = sumBy(periodRecords, "Receita");
  const totalDebito = sumBy(periodRecords, "Despesa");
  const saldoAtual = saldoAnterior + totalCredito - totalDebito;

  const map = {};
  periodRecords.forEach((r) => {
    const key = r.description || "Sem descrição";
    if (!map[key]) map[key] = { description: key, debito: 0, credito: 0 };
    if (r.type === "Receita") map[key].credito += Number(r.amount || 0);
    else map[key].debito += Number(r.amount || 0);
  });
  const items = Object.values(map)
    .map((it) => ({ ...it, saldo: it.credito - it.debito }))
    .sort((a, b) => (b.credito + b.debito) - (a.credito + a.debito));

  return { saldoAnterior, totalCredito, totalDebito, saldoAtual, items };
}

export function fmtSaldo(v) {
  const abs = Math.abs(Number(v || 0));
  const sign = v >= 0 ? "C" : "D";
  return `R$ ${abs.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}${sign}`;
}

export function fmtMoney(v) {
  return `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}