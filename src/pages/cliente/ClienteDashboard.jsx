import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Inbox, MessageSquare, TrendingUp, Pencil, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import GovLinks from "@/components/dashboard/GovLinks";
import { getMyClient } from "@/lib/clientLookup";
import { Button } from "@/components/ui/button";
import EditarDadosDialog from "@/components/cliente/EditarDadosDialog";

const WHATSAPP_LINK = "https://wa.me/5563992544417";

export default function ClienteDashboard() {
  const [stats, setStats] = useState({ docs: 0, requests: 0, messages: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const cl = await getMyClient(user);
        setClient(cl);
        if (cl) {
          const [docs, reqs, msgs] = await Promise.all([
            base44.entities.Document.filter({ client_id: cl.id }),
            base44.entities.ServiceRequest.filter({ client_id: cl.id }),
            base44.entities.Message.filter({ client_id: cl.id }),
          ]);
          setStats({ docs: docs.length, requests: reqs.length, messages: msgs.length, unread: msgs.filter(m => m.sender_type === "admin" && !m.is_read).length });
        }
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const cards = [
    { icon: FileText, label: "Documentos", value: stats.docs, color: "bg-purple-50 text-purple-600" },
    { icon: Inbox, label: "Solicitações", value: stats.requests, color: "bg-blue-50 text-blue-600" },
    { icon: MessageSquare, label: "Mensagens", value: stats.messages, color: "bg-blue-50 text-blue-600" },
    { icon: TrendingUp, label: "Não Lidas", value: stats.unread, color: "bg-amber-50 text-amber-600" },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <h1 className="font-heading font-bold text-2xl text-slate-900">Meu Painel</h1>
        <div className="flex items-center gap-2">
          {client && (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="w-4 h-4 mr-1.5" /> Editar Dados
            </Button>
          )}
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener">
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <MessageCircle className="w-4 h-4 mr-1.5" /> Falar com meu contador
            </Button>
          </a>
        </div>
      </div>
      {client ? (
        <p className="text-slate-500 mb-6">Bem-vindo(a), {client.name}!</p>
      ) : (
        <p className="text-slate-500 mb-6">Seu perfil de cliente ainda não foi vinculado. Contate a administração.</p>
      )}
      <GovLinks />
      {client && (
        <EditarDadosDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          client={client}
          onSaved={() => window.location.reload()}
        />
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="text-sm text-slate-500">{c.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}