import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Edit, Trash2, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import FolderBar from "@/components/documents/FolderBar";

const emptyForm = { title: "", description: "", category: "", client_id: "", status: "Pendente" };

export default function AdminDocumentos() {
  const { toast } = useToast();
  const [docs, setDocs] = useState([]);
  const [clients, setClients] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [d, c, f] = await Promise.all([base44.entities.Document.list("-created_date"), base44.entities.Client.list(), base44.entities.DocumentFolder.list("-created_date")]);
      setDocs(d); setClients(c); setFolders(f);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreateFolder = async (name) => {
    try {
      await base44.entities.DocumentFolder.create({ name });
      toast({ title: "Pasta criada!" });
      load();
    } catch { toast({ title: "Erro ao criar pasta", variant: "destructive" }); }
  };

  const visibleDocs = activeFolder ? docs.filter(d => d.folder_id === activeFolder) : docs;

  const clientName = (id) => clients.find(c => c.id === id)?.name || "—";

  const openNew = () => { setEditing(null); setForm(emptyForm); setFile(null); setDialogOpen(true); };
  const openEdit = (d) => { setEditing(d); setForm({ title: d.title||"", description: d.description||"", category: d.category||"", client_id: d.client_id||"", status: d.status||"Pendente" }); setFile(null); setDialogOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      let data = { ...form, folder_id: activeFolder || "" };
      if (file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        data.file_url = file_url;
      }
      if (editing) await base44.entities.Document.update(editing.id, data);
      else await base44.entities.Document.create(data);
      toast({ title: editing ? "Documento atualizado!" : "Documento criado!" });
      setDialogOpen(false); load();
    } catch { toast({ title: "Erro", variant: "destructive" }); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Excluir?")) return;
    try { await base44.entities.Document.delete(id); load(); } catch {}
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl text-slate-900">Documentos</h1>
        <Button onClick={openNew} className="bg-blue-700 hover:bg-blue-800"><Plus className="w-4 h-4 mr-1" /> Novo</Button>
      </div>

      <FolderBar folders={folders} activeFolder={activeFolder} onSelect={setActiveFolder} onCreate={handleCreateFolder} />

      {visibleDocs.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Nenhum documento ainda.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleDocs.map(d => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(d)} className="p-1 text-slate-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(d.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{d.title}</h3>
              <p className="text-xs text-slate-500 mb-2">{clientName(d.client_id)} • {d.category || "Sem categoria"}</p>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${d.status === "Aprovado" ? "bg-blue-100 text-blue-700" : d.status === "Enviado" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{d.status}</span>
              {d.file_url && <a href={d.file_url} target="_blank" rel="noopener" className="block mt-3 text-xs text-blue-600 hover:underline">Baixar arquivo →</a>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar Documento" : "Novo Documento"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Título*</label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Cliente</label>
                <Select value={form.client_id} onValueChange={v => setForm({...form, client_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Categoria</label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{["Fiscal","Contábil","Trabalhista","Societário","Outros"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Pendente","Enviado","Aprovado"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Descrição</label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
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