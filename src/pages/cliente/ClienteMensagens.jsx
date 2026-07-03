import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function ClienteMensagens() {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ subject: "", content: "" });
  const [sending, setSending] = useState(false);

  const load = async () => {
    try {
      const user = await base44.auth.me();
      const clients = await base44.entities.Client.filter({ user_id: user.id });
      const cl = clients[0];
      setClient(cl);
      if (cl) setMessages(await base44.entities.Message.filter({ client_id: cl.id }, "-created_date"));
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.content.trim() || !client) return;
    setSending(true);
    try {
      await base44.entities.Message.create({ client_id: client.id, content: form.content, subject: form.subject, sender_type: "client", sender_name: client.name });
      toast({ title: "Mensagem enviada!" });
      setForm({ subject: "", content: "" });
      setMessages(await base44.entities.Message.filter({ client_id: client.id }, "-created_date"));
    } catch {} finally { setSending(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-slate-900 mb-6">Mensagens</h1>

      {client ? (
        <form onSubmit={handleSend} className="bg-white rounded-xl border border-slate-200 p-5 mb-6 space-y-3">
          <h3 className="font-semibold text-slate-700 text-sm">Enviar Mensagem</h3>
          <Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Assunto" />
          <Textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={3} placeholder="Sua mensagem..." />
          <Button type="submit" disabled={sending} size="sm" className="bg-emerald-700 hover:bg-emerald-800"><Send className="w-3 h-3 mr-1" /> Enviar</Button>
        </form>
      ) : (
        <p className="text-slate-400 mb-6">Perfil não vinculado. Contate a administração.</p>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Nenhuma mensagem.</div>
      ) : (
        <div className="space-y-3">
          {messages.map(m => (
            <div key={m.id} className={`rounded-xl border p-4 ${m.sender_type === "admin" ? "bg-emerald-50/50 border-emerald-100" : "bg-white border-slate-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.sender_type === "admin" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                  {m.sender_type === "admin" ? "Proced" : "Você"}
                </span>
              </div>
              {m.subject && <p className="text-sm font-medium text-slate-800 mb-1">{m.subject}</p>}
              <p className="text-sm text-slate-600">{m.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}