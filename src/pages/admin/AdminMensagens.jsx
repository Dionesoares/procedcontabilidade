import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function AdminMensagens() {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);
  const [newMsg, setNewMsg] = useState({ client_id: "", subject: "", content: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [m, c] = await Promise.all([base44.entities.Message.list("-created_date"), base44.entities.Client.list()]);
      setMessages(m); setClients(c);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const clientName = (id) => clients.find(c => c.id === id)?.name || "—";

  const sendReply = async () => {
    if (!replyContent.trim()) return;
    setSending(true);
    try {
      await base44.entities.Message.create({ client_id: replyTo.client_id, content: replyContent, sender_type: "admin", sender_name: "Proced", subject: "RE: " + (replyTo.subject || "") });
      toast({ title: "Resposta enviada!" });
      setReplyTo(null); setReplyContent(""); load();
    } catch {} finally { setSending(false); }
  };

  const sendNew = async (e) => {
    e.preventDefault();
    if (!newMsg.client_id || !newMsg.content) return;
    setSending(true);
    try {
      await base44.entities.Message.create({ ...newMsg, sender_type: "admin", sender_name: "Proced" });
      toast({ title: "Mensagem enviada!" });
      setNewMsg({ client_id: "", subject: "", content: "" }); load();
    } catch {} finally { setSending(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-slate-900 mb-6">Mensagens</h1>

      {/* New message */}
      <form onSubmit={sendNew} className="bg-white rounded-xl border border-slate-200 p-5 mb-6 space-y-3">
        <h3 className="font-semibold text-slate-700 text-sm">Nova Mensagem</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Select value={newMsg.client_id} onValueChange={v => setNewMsg({...newMsg, client_id: v})}>
            <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
            <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={newMsg.subject} onChange={e => setNewMsg({...newMsg, subject: e.target.value})} placeholder="Assunto" />
        </div>
        <Textarea value={newMsg.content} onChange={e => setNewMsg({...newMsg, content: e.target.value})} rows={2} placeholder="Mensagem..." />
        <Button type="submit" disabled={sending} size="sm" className="bg-emerald-700 hover:bg-emerald-800"><Send className="w-3 h-3 mr-1" /> Enviar</Button>
      </form>

      {messages.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Nenhuma mensagem.</div>
      ) : (
        <div className="space-y-3">
          {messages.map(m => (
            <div key={m.id} className={`bg-white rounded-xl border p-4 ${m.sender_type === "client" && !m.is_read ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.sender_type === "admin" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {m.sender_type === "admin" ? "Admin" : "Cliente"}
                  </span>
                  <span className="text-sm text-slate-700 ml-2 font-medium">{m.sender_name || clientName(m.client_id)}</span>
                </div>
                <span className="text-xs text-slate-400">{clientName(m.client_id)}</span>
              </div>
              {m.subject && <p className="text-sm font-medium text-slate-800 mb-1">{m.subject}</p>}
              <p className="text-sm text-slate-600">{m.content}</p>
              {m.sender_type === "client" && (
                <div className="mt-3">
                  {replyTo?.id === m.id ? (
                    <div className="flex gap-2">
                      <Input value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Responder..." className="flex-1" />
                      <Button size="sm" onClick={sendReply} disabled={sending} className="bg-emerald-700 hover:bg-emerald-800">Enviar</Button>
                      <Button size="sm" variant="outline" onClick={() => setReplyTo(null)}>Cancelar</Button>
                    </div>
                  ) : (
                    <button onClick={() => { setReplyTo(m); setReplyContent(""); }} className="text-xs text-emerald-600 hover:underline">Responder</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}