import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const serviceTypes = ["Abertura de Empresa", "Contabilidade Completa", "Regularização de MEI", "Planejamento Tributário", "Departamento Pessoal", "Consultoria Contábil", "Outro"];

export default function ClienteSolicitacoes() {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ service_type: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const clients = await base44.entities.Client.filter({ user_id: user.id });
        const cl = clients[0];
        setClient(cl);
        if (cl) setRequests(await base44.entities.ServiceRequest.filter({ client_id: cl.id }, "-created_date"));
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await base44.entities.ServiceRequest.create({ ...form, client_id: client.id, client_name: client.name, client_email: client.email, client_phone: client.phone });
      toast({ title: "Solicitação enviada!" });
      setDialogOpen(false);
      setForm({ service_type: "", description: "" });
      setRequests(await base44.entities.ServiceRequest.filter({ client_id: client.id }, "-created_date"));
    } catch { toast({ title: "Erro", variant: "destructive" }); } finally { setSaving(false); }
  };

  const statusColor = { Novo: "bg-blue-100 text-blue-700", "Em Análise": "bg-amber-100 text-amber-700", "Em Andamento": "bg-purple-100 text-purple-700", Concluído: "bg-blue-100 text-blue-700", Cancelado: "bg-red-100 text-red-700" };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl text-slate-900">Minhas Solicitações</h1>
        {client && <Button onClick={() => setDialogOpen(true)} className="bg-blue-700 hover:bg-blue-800"><Plus className="w-4 h-4 mr-1" /> Nova</Button>}
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Nenhuma solicitação.</div>
      ) : (
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">{r.service_type}</h3>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[r.status] || ""}`}>{r.status}</span>
              </div>
              {r.description && <p className="text-sm text-slate-600">{r.description}</p>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Solicitação</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Serviço</label>
              <Select value={form.service_type} onValueChange={v => setForm({...form, service_type: v})}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{serviceTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Descrição</label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800">{saving ? "Enviando..." : "Enviar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}