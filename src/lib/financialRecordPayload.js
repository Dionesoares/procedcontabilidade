const FINANCIAL_COLUMNS = [
  "description",
  "type",
  "type_label",
  "amount",
  "amount_paid",
  "due_date",
  "status",
  "client_id",
  "client_name",
  "read_by_client",
  "is_recurring",
  "recurrence_group_id",
  "recurrence_frequency",
];

function isMissingPartialColumnError(error) {
  const message = error?.message || error?.details || String(error || "");
  return /amount_paid|schema cache|financial_records_status_check|Could not find the .* column/i.test(message);
}

export function sanitizeFinancialRecord(data, { includeAmountPaid = true } = {}) {
  const row = {};
  for (const key of FINANCIAL_COLUMNS) {
    if (!includeAmountPaid && key === "amount_paid") continue;
    if (!(key in data)) continue;
    let value = data[key];
    if (value === "") value = null;
    if (!includeAmountPaid && key === "status" && value === "Parcial") value = "Pendente";
    row[key] = value;
  }
  return row;
}

export async function saveFinancialRecord(operation, { retryWithoutPartial = true } = {}) {
  try {
    return await operation(true);
  } catch (error) {
    if (retryWithoutPartial && isMissingPartialColumnError(error)) {
      return await operation(false);
    }
    throw error;
  }
}
