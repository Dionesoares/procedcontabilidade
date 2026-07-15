import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { FileBarChart, Download, Trash2, Eye } from "lucide-react";
import BalanceteSummaryCards from "@/components/balancete/BalanceteSummaryCards";
import BalanceteChart from "@/components/balancete/BalanceteChart";
import BalanceteTable from "@/components/balancete/BalanceteTable";
import { computeBalancete, fmtSaldo } from "@/lib/balanceteCalc";
import { generateBalancetePdf } from "@/lib/balancetePdf";

const todayYear = new Date().getFullYear();

export default function AdminBalancete() {
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [periodStart, setPeriodStart] = useState(`${todayYear}-01-01`);
  const [periodEnd, setPeriodEnd] = useState(`${todayYear}-12-31`);
  const [records, setRecords] = useState([]);
  const [saved, setSaved] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    base44.entities.Client.list().then(setClients).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!clientId) { setRecords([]); setSaved([]); setViewing(null); return; }
    base44.entities.FinancialRecord.filter({ client_id: clientId }).then(setRecords);
    base44.entities.Balancete.filter({ client_id: clientId }, "-created_date").then(setSaved);
    setViewing(null);
  }, [clientId]);

  const selectedClient = clients.find((c) => c.id === clientId);
  const preview = useMemo(() => computeBalancete(records, periodStart, periodEnd), [records, periodStart, periodEnd]);
  const current = viewing || preview;

  const handleGerar = async () => {
    if (!clientId) return;
    setGenerating(true);
    try {
      const created = await base44.entities.Balancete.create({
        client_id: clientId,
        client_name: selectedClient?.name || "",
        period_start: periodStart,
        period_end: periodEnd,
        saldo_anterior: preview.saldoAnterior,
        total_debito: preview.totalDebito,
        total_credito: preview.totalCredito,
        saldo_atual: preview.saldoAtual,
        items: JSON.stringify(preview.items),
      });
      toast({ title: "Balancete gerado!", description: "Já está disponível no portal do cliente." });
      setSaved((prev) => [created, ...prev]);
    } catch {
      toast({ title: "Erro ao gerar balancete", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (b) => {
    if (!confirm("Excluir este balancete gerado?")) return;
    try {
      await base44.entities.Balancete.delete(b.id);
      setSaved((prev) => prev.filter((s) => s.id !== b.id));
      if (viewing?.id === b.id) setViewing(null);
      toast({ title: "Balancete excluído!" });
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const handleDownload = (b) => generateBalancetePdf(b);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2">
          <FileBarChart className="w-6 h-6 text-blue-600" /> Balancete
        </h1>
        <p className="text-sm text-slate-500 mt-1">Gere o balancete de um cliente a partir dos lançamentos financeiros.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 flex flex-wrap items-end gap-4">
        <div className="min-w-[220px]">
          <label className="text-xs font-medium text-slate-500 mb-1 block">Cliente</label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
            <SelectContent>
              {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Início do Período</label>
          <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Fim do Período</label>
          <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
        </div>
        <Button onClick={handleGerar} disabled={!clientId || generating} className="bg-blue-700 hover:bg-blue-800">
          {generating ? "Gerando..." : "Gerar Balancete"}
        </Button>
      </div>

      {!clientId ? (
        <div className="text-center py-16 text-slate-400">Selecione um cliente para visualizar o balancete.</div>
      ) : (
        <>
          {viewing && (
            <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
              <span>Visualizando balancete gerado em {new Date(viewing.created_date).toLocaleDateString("pt-BR")}</span>
              <button onClick={() => setViewing(null)} className="font-medium hover:underline">Voltar à pré-visualização atual</button>
            </div>
          )}
          <div className="space-y-6">
            <BalanceteSummaryCards saldoAnterior={current.saldo_anterior ?? current.saldoAnterior} totalDebito={current.total_debito ?? current.totalDebito} totalCredito={current.total_credito ?? current.totalCredito} saldoAtual={current.saldo_atual ?? current.saldoAtual} />
            <BalanceteChart items={viewing ? JSON.parse(viewing.items || "[]") : preview.items} />
            <BalanceteTable
              items={viewing ? JSON.parse(viewing.items || "[]") : preview.items}
              saldoAnterior={current.saldo_anterior ?? current.saldoAnterior}
              totalDebito={current.total_debito ?? current.totalDebito}
              totalCredito={current.total_credito ?? current.totalCredito}
              saldoAtual={current.saldo_atual ?? current.saldoAtual}
            />
          </div>

          <div className="mt-8">
            <h2 className="font-heading font-semibold text-slate-900 mb-3">Balancetes Gerados</h2>
            {saved.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum balancete gerado ainda para este cliente.</p>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-4 py-3">Período</th>
                      <th className="text-left px-4 py-3">Gerado em</th>
                      <th className="text-right px-4 py-3">Saldo Atual</th>
                      <th className="text-right px-4 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {saved.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-700">{new Date(b.period_start + "T00:00:00").toLocaleDateString("pt-BR")} - {new Date(b.period_end + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(b.created_date).toLocaleDateString("pt-BR")}</td>
                        <td className="px-4 py-3 text-right font-medium">{fmtSaldo(b.saldo_atual)}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setViewing(b)} title="Visualizar" className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleDownload(b)} title="Baixar PDF" className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Download className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(b)} title="Excluir" className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}