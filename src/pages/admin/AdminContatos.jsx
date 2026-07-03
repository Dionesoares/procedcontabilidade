import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function AdminContatos() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setContacts(await base44.entities.ContactSubmission.list("-created_date")); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try { await base44.entities.ContactSubmission.update(id, { status }); toast({ title: "Atualizado!" }); load(); } catch {}
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-slate-900 mb-6">Contatos Recebidos</h1>
      {contacts.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Nenhum contato recebido.</div>
      ) : (
        <div className="space-y-4">
          {contacts.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{c.name}</h3>
                  <p className="text-sm text-slate-500">{c.email} {c.phone && `• ${c.phone}`}</p>
                </div>
                <Select value={c.status} onValueChange={v => updateStatus(c.id, v)}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Novo","Em Análise","Respondido","Arquivado"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <p className="text-sm text-slate-600">{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}