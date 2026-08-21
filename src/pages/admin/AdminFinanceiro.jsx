import React, { useState, useEffect, useMemo } from "react";
import { FinancialRecord, Client } from "@/api/entities";
import { Plus, Trash2, Pencil, TrendingUp, TrendingDown, FileDown, FileSpreadsheet, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import FinanceiroFormDialog from "@/components/financeiro/FinanceiroFormDialog";
import FinanceiroSummaryCards from "@/components/financeiro/FinanceiroSummaryCards";
import FinanceiroReportChart from "@/components/financeiro/FinanceiroReportChart";
import FinanceiroPieChart from "@/components/financeiro/FinanceiroPieChart";
import FinanceiroFiltros from "@/components/financeiro/FinanceiroFiltros";
import NovaCobrancaDialog from "@/components/financeiro/NovaCobrancaDialog";
import { exportFinanceiroPdf, exportFinanceiroExcel } from "@/lib/financeiroExport";
import { sortClientsByName } from "@/lib/clientLookup";
import { sanitizeFinancialRecord, saveFinancialRecord } from "@/lib/financialRecordPayload";
import { formatMoney, recordPaidAmount, recordPendingBalance, totalPendingBalance } from "@/lib/financeiroAmounts";

const emptyFilters = { type: "Todos", status: "Todos", clientId: "Todos", dateFrom: "", dateTo: "", search: "" };

function addInterval(dateStr, frequency, times) {
  const date = new Date(dateStr + "T00:00:00");
  if (frequency === "Semanal") date.setDate(date.getDate() + 7 * times);
  else if (frequency === "Anual") date.setFullYear(date.getFullYear() + times);
  else date.setMonth(date.getMonth() + times); // Mensal (default)
  return date.toISOString().slice(0, 10);
}

function buildRecurrenceRows(data) {
  const { is_recurring, recurrence_frequency, recurrence_count, ...base } = data;
  const count = Math.max(1, Number(recurrence_count) || 1);
  if (!is_recurring || !base.due_date || count <= 1) {
    return [{ ...base, is_recurring: false, recurrence_frequency: null, recurrence_group_id: null }];
  }
  const groupId = crypto.randomUUID();
  return Array.from({ length: count }, (_, i) => ({
    ...base,
    due_date: i === 0 ? base.due_date : addInterval(base.due_date, recurrence_frequency, i),
    is_recurring: true,
    recurrence_frequency,
    recurrence_group_id: groupId,
    amount_paid: i === 0 ? Number(base.amount_paid || 0) : 0,
    status: i === 0 ? base.status : "Pendente",
  }));
}

export default function AdminFinanceiro() {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cobrancaOpen, setCobrancaOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);

  const load = async () => {
    setLoading(true);
    try {
      const data = await FinancialRecord.list("-due_date");
      setRecords(data);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => {
    load();
    Client.list().then((c) => setClients(sortClientsByName(c))).catch(() => {});
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filters.type !== "Todos" && r.type !== filters.type) return false;
      if (filters.status !== "Todos" && r.status !== filters.status) return false;
      if (filters.clientId !== "Todos" && r.client_id !== filters.clientId) return false;
      if (filters.dateFrom && (!r.due_date || r.due_date < filters.dateFrom)) return false;
      if (filters.dateTo && (!r.due_date || r.due_date > filters.dateTo)) return false;
      if (filters.search && !r.description?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [records, filters]);

  const clientById = useMemo(() => {
    const map = {};
    clients.forEach((c) => { map[c.id] = c; });
    return map;
  }, [clients]);

  // Shows the client's company name (Razão Social) before their name, e.g.
  // "Contabilidade XP Ltda - João Silva", so the table identifies the
  // business the launch belongs to, not just the contact person.
  const getClientLabel = (record) => {
    const client = clientById[record.client_id];
    const name = client?.name || record.client_name || "";
    const companyName = client?.company_name;
    if (!name) return "";
    return companyName ? `${companyName} - ${name}` : name;
  };

  // Reports (PDF/Excel) show Empresa and Nome as separate columns instead of
  // one combined string — a long "Empresa - Nome" text was overlapping the
  // Tipo column in the PDF table.
  const getClientInfo = (record) => {
    const client = clientById[record.client_id];
    if (client) return { company_name: client.company_name || "", client_name: client.name || "" };
    return { company_name: "", client_name: record.client_name || "" };
  };

  const handleSaveCobranca = async (data) => {
    try {
      await saveFinancialRecord((includeAmountPaid) => (
        FinancialRecord.create(sanitizeFinancialRecord(data, { includeAmountPaid }))
      ));
      toast({ title: "Cobrança criada!" });
      setCobrancaOpen(false);
      load();
    } catch (error) {
      toast({ title: "Erro ao criar cobrança", description: error?.message, variant: "destructive" });
    }
  };

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (r) => { setEditing(r); setDialogOpen(true); };

  const handleSave = async (data) => {
    try {
      let createdCount = 1;
      await saveFinancialRecord(async (includeAmountPaid) => {
        if (editing) {
          const { is_recurring, recurrence_frequency, recurrence_count, ...rest } = data;
          await FinancialRecord.update(editing.id, sanitizeFinancialRecord(rest, { includeAmountPaid }));
          return;
        }
        const rows = buildRecurrenceRows(data).map((row) => sanitizeFinancialRecord(row, { includeAmountPaid }));
        createdCount = rows.length;
        if (rows.length > 1) {
          await FinancialRecord.bulkCreate(rows);
        } else {
          await FinancialRecord.create(rows[0]);
        }
      });
      toast({
        title: editing
          ? "Lançamento atualizado!"
          : createdCount > 1
            ? `${createdCount} lançamentos recorrentes criados!`
            : "Lançamento criado!",
      });
      setDialogOpen(false);
      load();
    } catch (error) {
      toast({ title: "Erro ao salvar lançamento", description: error?.message, variant: "destructive" });
    }
  };

  const handleDelete = async (r) => {
    if (!confirm("Excluir este lançamento?")) return;
    try {
      await FinancialRecord.delete(r.id);
      toast({ title: "Lançamento excluído!" });
      load();
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const statusColors = {
    Pago: "bg-green-100 text-green-700",
    Pendente: "bg-amber-100 text-amber-700",
    Atrasado: "bg-red-100 text-red-700",
    Parcial: "bg-sky-100 text-sky-700",
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">Financeiro</h1>
          <p className="text-sm text-slate-500 mt-1">Controle de receitas e despesas do escritório.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={openNew} className="bg-blue-700 hover:bg-blue-800">
            <Plus className="w-4 h-4 mr-1" /> Novo Lançamento
          </Button>
          <Button onClick={() => setCobrancaOpen(true)} variant="outline">
            <Plus className="w-4 h-4 mr-1" /> Nova Cobrança
          </Button>
          <Button variant="outline" onClick={() => exportFinanceiroPdf(filteredRecords.map(r => ({ ...r, ...getClientInfo(r) })))}>
            <FileDown className="w-4 h-4 mr-1" /> PDF
          </Button>
          <Button variant="outline" onClick={() => exportFinanceiroExcel(filteredRecords.map(r => ({ ...r, ...getClientInfo(r) })))}>
            <FileSpreadsheet className="w-4 h-4 mr-1" /> Excel
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <FinanceiroFiltros filters={filters} onChange={setFilters} clients={clients} />

        <FinanceiroSummaryCards records={filteredRecords} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 min-w-0">
            <FinanceiroReportChart records={filteredRecords} />
          </div>
          <div className="lg:col-span-1 min-w-0">
            <FinanceiroPieChart records={filteredRecords} />
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 text-slate-400">Nenhum lançamento encontrado para os filtros selecionados.</div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">Descrição</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Cliente</th>
                    <th className="text-left px-4 py-3">Tipo</th>
                    <th className="text-left px-4 py-3">Valor</th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">Recebido</th>
                    <th className="text-left px-4 py-3">Saldo Pendente</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Vencimento</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map(r => {
                    const pending = recordPendingBalance(r);
                    return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <span className="inline-flex items-center gap-1.5 min-w-0">
                          <span className="break-words">{r.description}</span>
                          {r.is_recurring && <Repeat className="w-3.5 h-3.5 text-slate-400 shrink-0" title="Lançamento recorrente" />}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{getClientLabel(r) || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${r.type === "Receita" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-700"}`}>
                          {r.type === "Receita" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {r.type}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-medium ${r.type === "Receita" ? "text-blue-700" : "text-slate-700"}`}>
                        R$ {formatMoney(r.amount)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                        {r.type === "Receita" ? `R$ ${formatMoney(recordPaidAmount(r))}` : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-amber-700">
                        {pending > 0 ? `R$ ${formatMoney(pending)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{r.due_date ? new Date(r.due_date + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status] || "bg-slate-100 text-slate-600"}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(r)} title="Editar" className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(r)} title="Excluir" className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3 bg-amber-50 border-t border-amber-100">
              <span className="text-sm font-medium text-slate-700">Saldo pendente</span>
              <span className="text-sm font-bold text-amber-800">R$ {formatMoney(totalPendingBalance(filteredRecords))}</span>
            </div>
          </div>
        )}
      </div>

      <FinanceiroFormDialog open={dialogOpen} onOpenChange={setDialogOpen} record={editing} onSave={handleSave} clients={clients} />
      <NovaCobrancaDialog open={cobrancaOpen} onOpenChange={setCobrancaOpen} clients={clients} onSave={handleSaveCobranca} />
    </div>
  );
}