import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const emptyForm = { title: "", description: "", client_id: "", due_date: "", priority: "Média", status: "Pendente", category: "" };

export default function AdminTarefas() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [t, c] = await Promise.all([base44.entities.Task.list("-created_date"), base44.entities.Client.list()]);
      setTasks(t); setClients(c);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const clientName = (id) => clients.find(c => c.id === id)?.name || "—";

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ title: t.title||"", description: t.description||"", client_id: t.client_id||"", due_date: t.due_date||"", priority: t.priority||"Média", status: t.status||"Pendente", category: t.category||"" }); setDialogOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await base44.entities.Task.update(editing.id, form);
      else await base44.entities.Task.create(form);
      toast({ title: editing ? "Tarefa atualizada!" : "Tarefa criada!" });
      setDialogOpen(false); load();
    } catch { toast({ title: "Erro", variant: "destructive" }); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Excluir?")) return;
    try { await base44.entities.Task.delete(id); load(); } catch {}
  };

  const priorityColor = { Baixa: "bg-slate-100 text-slate-600", Média: "bg-blue-100 text-blue-700", Alta: "bg-amber-100 text-amber-700", Urgente: "bg-red-100 text-red-700" };
  const statusColor = { Pendente: "bg-amber-100 text-amber-700", "Em Andamento": "bg-blue-100 text-blue-700", Concluída: "bg-blue-100 text-blue-700" };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl text-slate-900">Tarefas</h1>
        <Button onClick={openNew} className="bg-blue-700 hover:bg-blue-800"><Plus className="w-4 h-4 mr-1" /> Nova</Button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Nenhuma tarefa ainda.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Título</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Cliente</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Vencimento</th>
                <th className="text-left px-4 py-3">Prioridade</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{t.title}</td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{clientName(t.client_id)}</td>
                  <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{t.due_date || "—"}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor[t.priority] || ""}`}>{t.priority}</span></td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[t.status] || ""}`}>{t.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(t)} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle></DialogHeader>
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
              <div><label className="text-sm font-medium text-slate-700 mb-1 block">Vencimento</label><Input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Prioridade</label>
                <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Baixa","Média","Alta","Urgente"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
                <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Pendente","Em Andamento","Concluída"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Categoria</label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{["Fiscal","Contábil","Trabalhista","Societário","MEI","Outros"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Descrição</label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
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