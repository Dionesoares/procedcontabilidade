export function recordAmount(record) {
  return Number(record?.amount || 0);
}

export function recordPaidAmount(record) {
  const amount = recordAmount(record);
  if (record?.status === "Pago") return amount;
  return Number(record?.amount_paid || 0);
}

export function isPartialPayment(record) {
  if (record?.type !== "Receita") return false;
  if (record?.status === "Parcial") return true;
  const paid = Number(record?.amount_paid || 0);
  const amount = recordAmount(record);
  return paid > 0 && amount > 0 && paid < amount;
}

export function recordRemainingAmount(record) {
  if (record?.type === "Despesa") return 0;
  if (record?.status === "Pago") return 0;
  return Math.max(0, recordAmount(record) - Number(record?.amount_paid || 0));
}

export function recordPendingBalance(record) {
  if (!isPartialPayment(record)) return 0;
  return recordRemainingAmount(record);
}

export function totalPendingBalance(records) {
  return (records || []).reduce((sum, record) => sum + recordPendingBalance(record), 0);
}

export function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
