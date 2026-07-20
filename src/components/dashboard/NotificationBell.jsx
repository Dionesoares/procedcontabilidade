import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, Inbox, MessageSquare, Mail, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotificationBell({ isAdmin }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (isAdmin) {
          const [reqs, contacts, msgs] = await Promise.all([
            base44.entities.ServiceRequest.filter({ status: "Novo" }),
            base44.entities.ContactSubmission.filter({ status: "Novo" }),
            base44.entities.Message.filter({ is_read: false, sender_type: "client" }),
          ]);
          const list = [
            ...reqs.map(r => ({ id: r.id, type: "request", title: `Nova solicitação: ${r.service_type}`, desc: r.client_name, link: "/admin/solicitacoes", icon: Inbox })),
            ...contacts.map(c => ({ id: c.id, type: "contact", title: `Novo contato: ${c.name}`, desc: c.message?.slice(0, 50), link: "/admin/contatos-recebidos", icon: Mail })),
            ...msgs.map(m => ({ id: m.id, type: "message", title: `Mensagem não lida`, desc: m.content?.slice(0, 50), link: "/admin/mensagens", icon: MessageSquare })),
          ];
          setNotifications(list);
        } else {
          const user = await base44.auth.me();
          const clients = await base44.entities.Client.filter({ user_id: user.id });
          if (clients.length > 0) {
            const clientId = clients[0].id;
            const [msgs, cobrancas] = await Promise.all([
              base44.entities.Message.filter({ client_id: clientId, is_read: false, sender_type: "admin" }),
              base44.entities.FinancialRecord.filter({ client_id: clientId, read_by_client: false }),
            ]);
            const list = [
              ...msgs.map(m => ({ id: m.id, type: "message", title: "Nova mensagem do contador", desc: m.content?.slice(0, 50), link: "/cliente/mensagens", icon: MessageSquare })),
              ...cobrancas.map(c => ({ id: c.id, type: "cobranca", title: "Nova cobrança", desc: `${c.description} - R$ ${Number(c.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, link: "/cliente", icon: DollarSign })),
            ];
            setNotifications(list);
          }
        }
      } catch {}
    };
    load();
  }, [isAdmin]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
        <Bell className="w-5 h-5 text-slate-600" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="font-semibold text-slate-900 text-sm">Notificações</p>
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">Sem novas notificações</div>
          ) : (
            notifications.map(n => (
              <Link
                key={`${n.type}-${n.id}`}
                to={n.link}
                onClick={() => {
                  setOpen(false);
                  if (n.type === "cobranca") base44.entities.FinancialRecord.update(n.id, { read_by_client: true }).catch(() => {});
                }}
                className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <n.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{n.title}</p>
                  {n.desc && <p className="text-xs text-slate-400 truncate">{n.desc}</p>}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}