import React, { useState, useEffect, useMemo, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { FileBarChart, Download, Trash2, Eye, Plus, Pencil, Upload } from "lucide-react";
import BalanceteSummaryCards from "@/components/balancete/BalanceteSummaryCards";
import BalanceteChart from "@/components/balancete/BalanceteChart";
import BalanceteHierarchyTable from "@/components/balancete/BalanceteHierarchyTable";
import BalanceteRelatorioGeral from "@/components/balancete/BalanceteRelatorioGeral";
import BalanceteClientHeader from "@/components/balancete/BalanceteClientHeader";
import BalanceteLancamentoDialog from "@/components/balancete/BalanceteLancamentoDialog";
import { computeBalanceteTree } from "@/lib/balanceteCalc";
import { generateBalancetePdf } from "@/lib/balancetePdf";
import { CATEGORIA_OPTIONS } from "@/lib/chartOfAccounts";
import { mapDescricaoToCategoria } from "@/lib/balanceteCategoriaMap";

const todayYear = new Date().getFullYear();

export default function AdminBalancete() {
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [periodStart, setPeriodStart] = useState(`${todayYear}-01-01`);
  const [periodEnd, setPeriodEnd] = useState(`${todayYear}-12-31`);
  const [lancamentos, setLancamentos] = useState([]);
  const [saved, setSaved] = useState([]);
  const [viewingBalancete, setViewingBalancete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState(null);
  const [signatureContador, setSignatureContador] = useState("");
  const [signatureCliente, setSignatureCliente] = useState("");
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    base44.entities.Client.list().then(setClients).finally(() => setLoading(false));
    base44.auth.me().then((u) => setSignatureContador(u?.full_name || "")).catch(() => {});
  }, []);

  const loadLancamentos = (id) => base44.entities.BalanceteLancamento.filter({ client_id: id }).then(setLancamentos);

  useEffect(() => {
    if (!clientId) { setLancamentos([]); setSaved([]); setViewingBalancete(null); return; }
    loadLancamentos(clientId);
    base44.entities.Balancete.filter({ client_id: clientId }, "-created_date").then(setSaved);
    setViewingBalancete(null);
    const c = clients.find((cl) => cl.id === clientId);
    setSignatureCliente(c?.name || "");
  }, [clientId]);

  const selectedClient = clients.find((c) => c.id === clientId);
  const categoriaLabel = (v) => CATEGORIA_OPTIONS.find((c) => c.value === v)?.label || v;
  const previewTree = useMemo(() => computeBalanceteTree(lancamentos, periodStart, periodEnd), [lancamentos, periodStart, periodEnd]);
  const currentTree = viewingBalancete ? JSON.parse(viewingBalancete.tree || "[]") : previewTree;
  const headerPeriodStart = viewingBalancete ? viewingBalancete.period_start : periodStart;
  const headerPeriodEnd = viewingBalancete ? viewingBalancete.period_end : periodEnd;
  const headerSignatureContador = viewingBalancete ? viewingBalancete.signature_contador : signatureContador;
  const headerSignatureCliente = viewingBalancete ? viewingBalancete.signature_cliente : signatureCliente;

  const openNew = () => { setEditingLancamento(null); setDialogOpen(true); };
  const openEdit = (l) => { setEditingLancamento(l); setDialogOpen(true); };

  const handleSaveLancamento = async (data) => {
    try {
      if (editingLancamento) {
        await base44.entities.BalanceteLancamento.update(editingLancamento.id, data);
        toast({ title: "Lançamento atualizado!" });
      } else {
        await base44.entities.BalanceteLancamento.create({ ...data, client_id: clientId, client_name: selectedClient?.name || "" });
        toast({ title: "Lançamento criado!" });
      }
      setDialogOpen(false);
      loadLancamentos(clientId);
    } catch {
      toast({ title: "Erro ao salvar lançamento", variant: "destructive" });
    }
  };

  const handleDeleteLancamento = async (l) => {
    if (!confirm("Excluir este lançamento?")) return;
    try {
      await base44.entities.BalanceteLancamento.delete(l.id);
      toast({ title: "Lançamento excluído!" });
      loadLancamentos(clientId);
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const handleGerar = async () => {
    if (!clientId) return;
    setGenerating(true);
    try {
      const [ativo, passivo, despesas, receitas] = previewTree;
      const created = await base44.entities.Balancete.create({
        client_id: clientId,
        client_name: selectedClient?.name || "",
        client_company_name: selectedClient?.company_name || selectedClient?.name || "",
        client_cnpj: selectedClient?.cpf_cnpj || "",
        client_address: selectedClient?.address || "",
        period_start: periodStart,
        period_end: periodEnd,
        tree: JSON.stringify(previewTree),
        ativo_saldo: ativo.saldoAtualRaw,
        passivo_saldo: passivo.saldoAtualRaw,
        despesas_saldo: despesas.saldoAtualRaw,
        receitas_saldo: receitas.saldoAtualRaw,
        signature_contador: signatureContador,
        signature_cliente: signatureCliente,
      });
      toast({ title: "Balancete gerado!", description: "Já está disponível no portal do cliente." });
      setSaved((prev) => [created, ...prev]);
    } catch {
      toast({ title: "Erro ao gerar balancete", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !clientId) return;
    setUploadingExcel(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            linhas: {
              type: "array",
              description: "Uma linha para cada conta/lançamento da planilha (ignore linhas de título ou cabeçalho)",
              items: {
                type: "object",
                properties: {
                  descricao: { type: "string", description: "Descrição da conta (coluna Descrição da conta)" },
                  debito: { type: "number", description: "Valor da coluna Débito desta linha; use 0 se estiver vazia" },
                  credito: { type: "number", description: "Valor da coluna Crédito desta linha; use 0 se estiver vazia" },
                  data: { type: "string", description: "Data do lançamento no formato YYYY-MM-DD, se houver" },
                },
                required: ["descricao"],
              },
            },
          },
          required: ["linhas"],
        },
      });

      if (result?.status === "error") {
        toast({ title: "Erro ao importar planilha", description: result.details || "Não foi possível ler o arquivo.", variant: "destructive" });
        return;
      }

      const linhas = result?.output?.linhas || [];
      const items = [];
      linhas.forEach((linha) => {
        const categoria = mapDescricaoToCategoria(linha.descricao);
        if (!categoria) return; // linha de título/subtotal não reconhecida
        const debito = Number(linha.debito) || 0;
        const credito = Number(linha.credito) || 0;
        if (debito === 0 && credito === 0) return;
        items.push({
          client_id: clientId,
          client_name: selectedClient?.name || "",
          categoria,
          descricao: linha.descricao,
          tipo: debito > 0 ? "Débito" : "Crédito",
          amount: debito > 0 ? debito : credito,
          due_date: linha.data || "",
        });
      });

      if (items.length === 0) {
        toast({ title: "Nenhum lançamento reconhecido na planilha", description: "Verifique se as contas usam descrições contábeis reconhecíveis (ex: Caixa, Fornecedores, Salários...).", variant: "destructive" });
        return;
      }

      await base44.entities.BalanceteLancamento.bulkCreate(items);
      toast({ title: "Planilha importada!", description: `${items.length} lançamento(s) adicionado(s).` });
      loadLancamentos(clientId);
    } catch (err) {
      toast({ title: "Erro ao importar planilha", description: err?.message || "Verifique o formato do arquivo e tente novamente.", variant: "destructive" });
    } finally {
      setUploadingExcel(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteBalancete = async (b) => {
    if (!confirm("Excluir este balancete gerado?")) return;
    try {
      await base44.entities.Balancete.delete(b.id);
      setSaved((prev) => prev.filter((s) => s.id !== b.id));
      setViewingBalancete(null);
      toast({ title: "Balancete excluído!" });
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2">
          <FileBarChart className="w-6 h-6 text-blue-600" /> Balancete
        </h1>
        <p className="text-sm text-slate-500 mt-1">Lance despesas e receitas do cliente e gere o balancete contábil.</p>
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
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Assinatura do Contador</label>
          <Input value={signatureContador} onChange={(e) => setSignatureContador(e.target.value)} placeholder="Nome do contador" className="w-48" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Assinatura do Cliente/Sócio</label>
          <Input value={signatureCliente} onChange={(e) => setSignatureCliente(e.target.value)} placeholder="Nome do sócio proprietário" className="w-48" />
        </div>
        <Button onClick={handleGerar} disabled={!clientId || generating} className="bg-blue-700 hover:bg-blue-800">
          {generating ? "Gerando..." : "Gerar Balancete"}
        </Button>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelUpload} />
        <Button type="button" variant="outline" disabled={!clientId || uploadingExcel} onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-1" /> {uploadingExcel ? "Importando..." : "Carregar Excel"}
        </Button>
      </div>

      {!clientId ? (
        <div className="text-center py-16 text-slate-400">Selecione um cliente para lançar despesas/receitas e visualizar o balancete.</div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-slate-900">Lançamentos do Cliente</h2>
            <Button size="sm" onClick={openNew} className="bg-blue-700 hover:bg-blue-800">
              <Plus className="w-4 h-4 mr-1" /> Novo Lançamento
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Conta</th>
                  <th className="text-left px-4 py-3">Descrição</th>
                  <th className="text-left px-4 py-3">Tipo</th>
                  <th className="text-left px-4 py-3">Valor</th>
                  <th className="text-left px-4 py-3">Data</th>
                  <th className="text-right px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lancamentos.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Nenhum lançamento cadastrado para este cliente.</td></tr>
                ) : lancamentos.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{categoriaLabel(l.categoria)}</td>
                    <td className="px-4 py-3 text-slate-500">{l.descricao || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${l.tipo === "Crédito" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>{l.tipo}</span>
                    </td>
                    <td className="px-4 py-3 font-medium">R$ {Number(l.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-slate-500">{l.due_date ? new Date(l.due_date + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(l)} title="Editar" className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteLancamento(l)} title="Excluir" className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {viewingBalancete && (
            <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
              <span>Visualizando um balancete já gerado.</span>
              <button onClick={() => setViewingBalancete(null)} className="font-medium hover:underline">Voltar à pré-visualização atual</button>
            </div>
          )}
          <div className="space-y-6">
            <BalanceteClientHeader client={selectedClient} periodStart={headerPeriodStart} periodEnd={headerPeriodEnd} />
            <BalanceteSummaryCards tree={currentTree} />
            <BalanceteChart tree={currentTree} />
            <BalanceteHierarchyTable tree={currentTree} />
            <BalanceteRelatorioGeral tree={currentTree} clientName={selectedClient?.name} signatureContador={headerSignatureContador} signatureCliente={headerSignatureCliente} />
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
                      <th className="text-right px-4 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {saved.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-700">{new Date(b.period_start + "T00:00:00").toLocaleDateString("pt-BR")} - {new Date(b.period_end + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(b.created_date).toLocaleDateString("pt-BR")}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setViewingBalancete(b)} title="Visualizar" className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => generateBalancetePdf(b)} title="Baixar PDF" className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Download className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteBalancete(b)} title="Excluir" className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
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

      <BalanceteLancamentoDialog open={dialogOpen} onOpenChange={setDialogOpen} lancamento={editingLancamento} onSave={handleSaveLancamento} />
    </div>
  );
}