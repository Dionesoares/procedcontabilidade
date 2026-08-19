import React, { useState, useEffect } from "react";
import { Document, DocumentFolder, Client, uploadDocumentFile, resolveDocumentUrl } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import FolderSidebar from "@/components/documents/FolderSidebar";
import DocumentsToolbar from "@/components/documents/DocumentsToolbar";
import DocumentsTable from "@/components/documents/DocumentsTable";
import { DEFAULT_FOLDERS } from "@/lib/defaultFolders";
import { sortClientsByName } from "@/lib/clientLookup";

const emptyForm = { title: "", description: "", category: "", status: "Pendente" };

export default function AdminDocumentos() {
  const { toast } = useToast();
  const [docs, setDocs] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([Document.list("-created_date"), Client.list()]);
      setDocs(d); setClients(sortClientsByName(c));
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const loadFolders = async (clientId) => {
    if (!clientId) { setFolders([]); return; }
    let f = await DocumentFolder.filter({ client_id: clientId }, "-created_date");
    if (f.length === 0) {
      f = await Promise.all(DEFAULT_FOLDERS.map(name => DocumentFolder.create({ name, client_id: clientId })));
    }
    setFolders(f);
  };

  useEffect(() => { setActiveFolder(null); setSelected([]); loadFolders(selectedClient); }, [selectedClient]);

  const handleCreateFolder = async (name) => {
    if (!selectedClient) return;
    try {
      await DocumentFolder.create({ name, client_id: selectedClient });
      toast({ title: "Pasta criada!" });
      loadFolders(selectedClient);
    } catch { toast({ title: "Erro ao criar pasta", variant: "destructive" }); }
  };

  const handleDeleteFolder = async (id) => {
    if (!confirm("Excluir pasta?")) return;
    try {
      await DocumentFolder.delete(id);
      if (activeFolder === id) setActiveFolder(null);
      loadFolders(selectedClient);
    } catch { toast({ title: "Erro ao excluir pasta", variant: "destructive" }); }
  };

  const clientName = (id) => { const c = clients.find(c => c.id === id); return c ? (c.company_name || c.name) : "—"; };

  const visibleDocs = docs.filter(d => {
    if (selectedClient && d.client_id !== selectedClient) return false;
    if (activeFolder && d.folder_id !== activeFolder) return false;
    if (filter === "Lidos" && d.status !== "Aprovado") return false;
    if (filter === "Não lidos" && d.status === "Aprovado") return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openNew = () => { setForm(emptyForm); setFile(null); setDialogOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      let data = { ...form, client_id: selectedClient, folder_id: activeFolder || null };
      if (file) {
        const storagePath = await uploadDocumentFile(file, selectedClient);
        data.storage_path = storagePath;
      }
      await Document.create(data);
      toast({ title: "Documento criado!" });
      setDialogOpen(false); load();
    } catch { toast({ title: "Erro", variant: "destructive" }); } finally { setSaving(false); }
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === visibleDocs.length ? [] : visibleDocs.map(d => d.id));

  const handleDownloadSelected = async () => {
    const toDownload = visibleDocs.filter(d => selected.includes(d.id) && (d.storage_path || d.file_url));
    if (toDownload.length === 0) { toast({ title: "Selecione ao menos um documento com arquivo" }); return; }
    for (const d of toDownload) {
      try {
        const url = await resolveDocumentUrl(d);
        if (url) window.open(url, "_blank");
      } catch {}
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0) { toast({ title: "Selecione ao menos um documento" }); return; }
    if (!confirm(`Excluir ${selected.length} documento(s)?`)) return;
    try {
      await Promise.all(selected.map(id => Document.delete(id)));
      setSelected([]); load();
    } catch { toast({ title: "Erro ao excluir", variant: "destructive" }); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-slate-900 mb-6">Documentos</h1>

      <div className="mb-6 max-w-xs">
        <label className="text-sm font-medium text-slate-700 mb-1 block">Empresa</label>
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger><SelectValue placeholder="Selecione uma empresa" /></SelectTrigger>
          <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name || c.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {!selectedClient ? (
        <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-lg">Selecione uma empresa para ver os documentos.</div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4">
          <FolderSidebar folders={folders} activeFolder={activeFolder} onSelect={setActiveFolder} onCreate={handleCreateFolder} onDelete={handleDeleteFolder} canManage />
          <div className="flex-1 min-w-0">
            <DocumentsToolbar
              canManage
              onAdd={openNew}
              onDownload={handleDownloadSelected}
              onDelete={handleDeleteSelected}
              filter={filter}
              onFilterChange={setFilter}
              search={search}
              onSearchChange={setSearch}
            />
            <DocumentsTable docs={visibleDocs} selected={selected} onToggle={toggleSelect} onToggleAll={toggleAll} clientName={clientName} showClientColumn={false} />
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo Documento</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Título*</label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Categoria</label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{["Fiscal","Contábil","Trabalhista","Societário","Outros"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Comentários</label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Arquivo (PDF)</label>
              <Input type="file" accept=".pdf,application/pdf" onChange={e => setFile(e.target.files[0])} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800">{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}