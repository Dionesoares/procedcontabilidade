import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function AdminSolicitacoes() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setItems(await base44.entities.ServiceRequest.list("-created_date")); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try { await base44.entities.ServiceRequest.update(id, { status }); toast({ title: "Status atualizado!" }); load(); } catch {}
  };

  const statusColor = { Novo: "bg-blue-100 text-blue-700", "Em Análise": "bg-amber-100 text-amber-700", "Em Andamento": "bg-purple-100 text-purple-700", Concluído: "bg-blue-100 text-blue-700", Cancelado: "bg-red-100 text-red-700" };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-slate-900 mb-6">Solicitações de Serviço</h1>
      {items.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Nenhuma solicitação ainda.</div>
      ) : (
        <div className="space-y-4">
          {items.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{r.service_type}</h3>
                  <p className="text-sm text-slate-500">{r.client_name} • {r.client_email}</p>
                </div>
                <Select value={r.status} onValueChange={v => updateStatus(r.id, v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Novo","Em Análise","Em Andamento","Concluído","Cancelado"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {r.description && <p className="text-sm text-slate-600">{r.description}</p>}
              {r.client_phone && <p className="text-xs text-slate-400 mt-2">Tel: {r.client_phone}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}