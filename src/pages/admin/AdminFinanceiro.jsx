import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Pencil, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import FinanceiroFormDialog from "@/components/financeiro/FinanceiroFormDialog";
import FinanceiroSummaryCards from "@/components/financeiro/FinanceiroSummaryCards";
import FinanceiroReportChart from "@/components/financeiro/FinanceiroReportChart";
import NovaCobrancaDialog from "@/components/financeiro/NovaCobrancaDialog";

export default function AdminFinanceiro() {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cobrancaOpen, setCobrancaOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.FinancialRecord.list("-due_date");
      setRecords(data);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => {
    load();
    base44.entities.Client.list().then(setClients).catch(() => {});
  }, []);

  const handleSaveCobranca = async (data) => {
    try {
      await base44.entities.FinancialRecord.create(data);
      toast({ title: "Cobrança criada!" });
      setCobrancaOpen(false);
      load();
    } catch {
      toast({ title: "Erro ao criar cobrança", variant: "destructive" });
    }
  };

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (r) => { setEditing(r); setDialogOpen(true); };

  const handleSave = async (data) => {
    try {
      if (editing) {
        await base44.entities.FinancialRecord.update(editing.id, data);
        toast({ title: "Lançamento atualizado!" });
      } else {
        await base44.entities.FinancialRecord.create(data);
        toast({ title: "Lançamento criado!" });
      }
      setDialogOpen(false);
      load();
    } catch {
      toast({ title: "Erro ao salvar lançamento", variant: "destructive" });
    }
  };

  const handleDelete = async (r) => {
    if (!confirm("Excluir este lançamento?")) return;
    try {
      await base44.entities.FinancialRecord.delete(r.id);
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
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">Financeiro</h1>
          <p className="text-sm text-slate-500 mt-1">Controle de receitas e despesas do escritório.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={openNew} className="bg-blue-700 hover:bg-blue-800">
            <Plus className="w-4 h-4 mr-1" /> Novo Lançamento
          </Button>
          <Button onClick={() => setCobrancaOpen(true)} variant="outline">
            <Plus className="w-4 h-4 mr-1" /> Nova Cobrança
          </Button>
        </div>
      </div>

      <FinanceiroSummaryCards records={records} />

      <div className="mt-6">
        <FinanceiroReportChart records={records} />
      </div>

      {records.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Nenhum lançamento cadastrado.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Descrição</th>
                  <th className="text-left px-4 py-3">Tipo</th>
                  <th className="text-left px-4 py-3">Valor</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Vencimento</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.description}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${r.type === "Receita" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-700"}`}>
                        {r.type === "Receita" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {r.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-medium ${r.type === "Receita" ? "text-blue-700" : "text-slate-700"}`}>
                      R$ {Number(r.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FinanceiroFormDialog open={dialogOpen} onOpenChange={setDialogOpen} record={editing} onSave={handleSave} />
      <NovaCobrancaDialog open={cobrancaOpen} onOpenChange={setCobrancaOpen} clients={clients} onSave={handleSaveCobranca} />
    </div>
  );
}