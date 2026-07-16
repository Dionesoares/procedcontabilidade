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
import BalanceteHeaderEditDialog from "@/components/balancete/BalanceteHeaderEditDialog";
import BalanceteLancamentoDialog from "@/components/balancete/BalanceteLancamentoDialog";
import { computeBalanceteTree, buildTreeFromFlatRows, getTotals } from "@/lib/balanceteCalc";
import { generateBalancetePdf } from "@/lib/balancetePdf";
import { CATEGORIA_OPTIONS } from "@/lib/chartOfAccounts";

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
  const [signatureContadorCrc, setSignatureContadorCrc] = useState("");
  const [signatureContadorCpf, setSignatureContadorCpf] = useState("");
  const [signatureCliente, setSignatureCliente] = useState("");
  const [signatureClienteRole, setSignatureClienteRole] = useState("Sócio Proprietário");
  const [signatureClienteCpf, setSignatureClienteCpf] = useState("");
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const fileInputRef = useRef(null);
  const [headerData, setHeaderData] = useState({ companyName: "", cnpj: "", address: "", folha: "0001", numeroLivro: "0001" });
  const [headerDialogOpen, setHeaderDialogOpen] = useState(false);

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
    setHeaderData({
      companyName: c?.company_name || c?.name || "",
      cnpj: c?.cpf_cnpj || "",
      address: c?.address || "",
      folha: "0001",
      numeroLivro: "0001",
    });
  }, [clientId]);

  useEffect(() => {
    if (viewingBalancete) {
      setHeaderData({
        companyName: viewingBalancete.client_company_name || viewingBalancete.client_name || "",
        cnpj: viewingBalancete.client_cnpj || "",
        address: viewingBalancete.client_address || "",
        folha: viewingBalancete.folha || "0001",
        numeroLivro: viewingBalancete.numero_livro || "0001",
      });
    }
  }, [viewingBalancete]);

  const selectedClient = clients.find((c) => c.id === clientId);
  const categoriaLabel = (v) => CATEGORIA_OPTIONS.find((c) => c.value === v)?.label || v;
  const previewTree = useMemo(() => computeBalanceteTree(lancamentos, periodStart, periodEnd), [lancamentos, periodStart, periodEnd]);
  const currentTree = viewingBalancete ? JSON.parse(viewingBalancete.tree || "[]") : previewTree;
  const headerPeriodStart = viewingBalancete ? viewingBalancete.period_start : periodStart;
  const headerPeriodEnd = viewingBalancete ? viewingBalancete.period_end : periodEnd;
  const headerSignatureContador = viewingBalancete ? viewingBalancete.signature_contador : signatureContador;
  const headerSignatureContadorCrc = viewingBalancete ? viewingBalancete.signature_contador_crc : signatureContadorCrc;
  const headerSignatureContadorCpf = viewingBalancete ? viewingBalancete.signature_contador_cpf : signatureContadorCpf;
  const headerSignatureCliente = viewingBalancete ? viewingBalancete.signature_cliente : signatureCliente;
  const headerSignatureClienteRole = viewingBalancete ? viewingBalancete.signature_cliente_role : signatureClienteRole;
  const headerSignatureClienteCpf = viewingBalancete ? viewingBalancete.signature_cliente_cpf : signatureClienteCpf;

  const handleSaveHeader = async (form) => {
    setHeaderData(form);
    setHeaderDialogOpen(false);
    if (viewingBalancete) {
      try {
        const updated = await base44.entities.Balancete.update(viewingBalancete.id, {
          client_company_name: form.companyName,
          client_cnpj: form.cnpj,
          client_address: form.address,
          folha: form.folha,
          numero_livro: form.numeroLivro,
        });
        setViewingBalancete(updated);
        setSaved((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        toast({ title: "Cabeçalho atualizado!" });
      } catch {
        toast({ title: "Erro ao atualizar cabeçalho", variant: "destructive" });
      }
    } else {
      toast({ title: "Cabeçalho atualizado!", description: "Será usado ao gerar o próximo balancete." });
    }
  };

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
        client_company_name: headerData.companyName || selectedClient?.company_name || selectedClient?.name || "",
        client_cnpj: headerData.cnpj || selectedClient?.cpf_cnpj || "",
        client_address: headerData.address || selectedClient?.address || "",
        folha: headerData.folha || "0001",
        numero_livro: headerData.numeroLivro || "0001",
        period_start: periodStart,
        period_end: periodEnd,
        tree: JSON.stringify(previewTree),
        ativo_saldo: ativo.saldoAtualRaw,
        passivo_saldo: passivo.saldoAtualRaw,
        despesas_saldo: despesas.saldoAtualRaw,
        receitas_saldo: receitas.saldoAtualRaw,
        signature_contador: signatureContador,
        signature_contador_crc: signatureContadorCrc,
        signature_contador_cpf: signatureContadorCpf,
        signature_cliente: signatureCliente,
        signature_cliente_role: signatureClienteRole,
        signature_cliente_cpf: signatureClienteCpf,
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
    if (/\.xls$/i.test(file.name)) {
      toast({ title: "Formato não suportado", description: "Arquivos .xls não são aceitos. Abra a planilha e salve como .xlsx ou .csv antes de importar.", variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploadingExcel(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            empresa: { type: "string", description: "Nome/razão social da empresa. Fica no cabeçalho institucional, nas primeiras 7 linhas da planilha (linha 'Empresa'), ANTES da tabela de contas." },
            cnpj: { type: "string", description: "CNPJ da empresa, no cabeçalho institucional (primeiras 7 linhas)." },
            endereco: { type: "string", description: "Endereço da empresa, no cabeçalho institucional (primeiras 7 linhas)." },
            folha: { type: "string", description: "Número da folha, se houver, no cabeçalho institucional (primeiras 7 linhas)." },
            numero_livro: { type: "string", description: "Número do livro, se houver, no cabeçalho institucional (primeiras 7 linhas)." },
            periodo_inicio: { type: "string", description: "Data de início do período no formato YYYY-MM-DD, no cabeçalho institucional." },
            periodo_fim: { type: "string", description: "Data de fim do período no formato YYYY-MM-DD, no cabeçalho institucional." },
            linhas: {
              type: "array",
              description: "A tabela de contas do balancete SEMPRE começa na linha 8 da planilha, onde estão os títulos das colunas (Código, Descrição, Saldo Anterior, Débito, Crédito, Saldo Atual). IGNORE completamente as linhas 1 a 7 (cabeçalho institucional com empresa/CNPJ/endereço) ao montar esta lista - elas não são contas. A partir da linha 8, mapeie exatamente: coluna A = código da conta, coluna B = descrição da conta, coluna C é uma coluna VAZIA de espaçamento visual e deve ser ignorada, coluna D = saldo anterior, coluna E é uma coluna VAZIA de espaçamento visual e deve ser ignorada, coluna F = débito, coluna G = crédito, coluna H = saldo atual. Gere uma linha para CADA conta da tabela, na MESMA ordem em que aparecem, incluindo tanto as contas sintéticas/de grupo (ex: 1 - ATIVO, 2 - ATIVO CIRCULANTE) quanto as contas analíticas finais (ex: 5 - CAIXA GERAL). Não pule nenhuma linha da tabela e não invente colunas que não existem.",
              items: {
                type: "object",
                properties: {
                  codigo: { type: "string", description: "Código da conta, exatamente como está na coluna A (Código) da linha da tabela." },
                  descricao: { type: "string", description: "Descrição da conta, exatamente como está na coluna B (Descrição), sem os espaços de indentação à esquerda." },
                  nivel: { type: "integer", description: "Nível hierárquico da conta, começando em 0 para as contas de nível mais alto (ATIVO, PASSIVO...), com base no código e na indentação/espaços à esquerda da descrição original." },
                  saldo_anterior: { type: "number", description: "Valor numérico da coluna D (Saldo Anterior); NEGATIVO se o sufixo for 'c' (credor), POSITIVO se for 'd' (devedor)." },
                  debito: { type: "number", description: "Valor numérico da coluna F (Débito). A coluna E é vazia e deve ser ignorada." },
                  credito: { type: "number", description: "Valor numérico da coluna G (Crédito)." },
                  saldo_atual: { type: "number", description: "Valor numérico da coluna H (Saldo Atual); NEGATIVO se o sufixo for 'c' (credor), POSITIVO se for 'd' (devedor)." },
                },
                required: ["descricao", "nivel"],
              },
            },
            assinatura_cliente_nome: { type: "string", description: "Nome de quem assina pelo cliente (primeiro bloco de assinatura)" },
            assinatura_cliente_cargo: { type: "string", description: "Cargo de quem assina pelo cliente, ex: ADMINISTRADOR" },
            assinatura_cliente_cpf: { type: "string", description: "CPF de quem assina pelo cliente" },
            assinatura_contador_nome: { type: "string", description: "Nome do contador responsável" },
            assinatura_contador_crc: { type: "string", description: "Número de registro no CRC do contador" },
            assinatura_contador_cpf: { type: "string", description: "CPF do contador" },
          },
          required: ["linhas"],
        },
      });

      if (result?.status === "error") {
        toast({ title: "Erro ao importar planilha", description: result.details || "Não foi possível ler o arquivo.", variant: "destructive" });
        return;
      }

      const out = result?.output || {};
      const linhas = out.linhas || [];
      if (linhas.length === 0) {
        toast({ title: "Nenhuma conta reconhecida na planilha", description: "Verifique se o arquivo segue o modelo de balancete (Código, Descrição, Saldo Anterior, Débito, Crédito, Saldo Atual).", variant: "destructive" });
        return;
      }

      const tree = buildTreeFromFlatRows(linhas);
      const { ativo, passivo, despesas, receitas } = getTotals(tree);

      const created = await base44.entities.Balancete.create({
        client_id: clientId,
        client_name: selectedClient?.name || "",
        client_company_name: out.empresa || headerData.companyName || selectedClient?.company_name || selectedClient?.name || "",
        client_cnpj: out.cnpj || headerData.cnpj || selectedClient?.cpf_cnpj || "",
        client_address: out.endereco || headerData.address || selectedClient?.address || "",
        folha: out.folha || headerData.folha || "0001",
        numero_livro: out.numero_livro || headerData.numeroLivro || "0001",
        period_start: out.periodo_inicio || periodStart,
        period_end: out.periodo_fim || periodEnd,
        tree: JSON.stringify(tree),
        ativo_saldo: ativo?.saldoAtualRaw || 0,
        passivo_saldo: passivo?.saldoAtualRaw || 0,
        despesas_saldo: despesas?.saldoAtualRaw || 0,
        receitas_saldo: receitas?.saldoAtualRaw || 0,
        signature_contador: out.assinatura_contador_nome || signatureContador,
        signature_contador_crc: out.assinatura_contador_crc || signatureContadorCrc,
        signature_contador_cpf: out.assinatura_contador_cpf || signatureContadorCpf,
        signature_cliente: out.assinatura_cliente_nome || signatureCliente,
        signature_cliente_role: out.assinatura_cliente_cargo || signatureClienteRole,
        signature_cliente_cpf: out.assinatura_cliente_cpf || signatureClienteCpf,
      });

      setSaved((prev) => [created, ...prev]);
      setViewingBalancete(created);
      toast({ title: "Balancete importado!", description: "A árvore completa da planilha foi recriada e já está disponível no portal do cliente." });
    } catch (err) {
      const msg = /unsupported file type/i.test(err?.message || "")
        ? "Formato de arquivo não suportado. Use .xlsx ou .csv."
        : err?.message || "Verifique o formato do arquivo e tente novamente.";
      toast({ title: "Erro ao importar planilha", description: msg, variant: "destructive" });
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
          <label className="text-xs font-medium text-slate-500 mb-1 block">Reg. CRC do Contador</label>
          <Input value={signatureContadorCrc} onChange={(e) => setSignatureContadorCrc(e.target.value)} placeholder="Ex: 006394" className="w-32" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">CPF do Contador</label>
          <Input value={signatureContadorCpf} onChange={(e) => setSignatureContadorCpf(e.target.value)} placeholder="000.000.000-00" className="w-36" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Assinatura do Cliente/Sócio</label>
          <Input value={signatureCliente} onChange={(e) => setSignatureCliente(e.target.value)} placeholder="Nome do sócio proprietário" className="w-48" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Cargo do Cliente</label>
          <Input value={signatureClienteRole} onChange={(e) => setSignatureClienteRole(e.target.value)} placeholder="Ex: Administrador" className="w-36" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">CPF do Cliente</label>
          <Input value={signatureClienteCpf} onChange={(e) => setSignatureClienteCpf(e.target.value)} placeholder="000.000.000-00" className="w-36" />
        </div>
        <Button onClick={handleGerar} disabled={!clientId || generating} className="bg-blue-700 hover:bg-blue-800">
          {generating ? "Gerando..." : "Gerar Balancete"}
        </Button>
        <input ref={fileInputRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={handleExcelUpload} />
        <Button type="button" variant="outline" disabled={!clientId || uploadingExcel} onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-1" /> {uploadingExcel ? "Importando..." : "Carregar Excel (.xlsx/.csv)"}
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
            <BalanceteClientHeader
              companyName={headerData.companyName}
              cnpj={headerData.cnpj}
              address={headerData.address}
              folha={headerData.folha}
              numeroLivro={headerData.numeroLivro}
              periodStart={headerPeriodStart}
              periodEnd={headerPeriodEnd}
              onEdit={() => setHeaderDialogOpen(true)}
            />
            <BalanceteSummaryCards tree={currentTree} />
            <BalanceteChart tree={currentTree} />
            <BalanceteHierarchyTable tree={currentTree} />
            <BalanceteRelatorioGeral
              tree={currentTree}
              clientName={selectedClient?.name}
              signatureContador={headerSignatureContador}
              signatureContadorCrc={headerSignatureContadorCrc}
              signatureContadorCpf={headerSignatureContadorCpf}
              signatureCliente={headerSignatureCliente}
              signatureClienteRole={headerSignatureClienteRole}
              signatureClienteCpf={headerSignatureClienteCpf}
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
      <BalanceteHeaderEditDialog open={headerDialogOpen} onOpenChange={setHeaderDialogOpen} data={headerData} onSave={handleSaveHeader} />
    </div>
  );
}