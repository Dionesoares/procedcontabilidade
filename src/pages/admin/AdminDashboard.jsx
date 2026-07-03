import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, FileText, ListTodo, Inbox, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ clients: 0, tasks: 0, documents: 0, requests: 0, pendingTasks: 0, newRequests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [clients, tasks, docs, requests] = await Promise.all([
          base44.entities.Client.list(),
          base44.entities.Task.list(),
          base44.entities.Document.list(),
          base44.entities.ServiceRequest.list(),
        ]);
        setStats({
          clients: clients.length,
          tasks: tasks.length,
          documents: docs.length,
          requests: requests.length,
          pendingTasks: tasks.filter(t => t.status === "Pendente").length,
          newRequests: requests.filter(r => r.status === "Novo").length,
        });
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const cards = [
    { icon: Users, label: "Clientes", value: stats.clients, color: "bg-blue-50 text-blue-600" },
    { icon: ListTodo, label: "Tarefas", value: stats.tasks, color: "bg-amber-50 text-amber-600" },
    { icon: FileText, label: "Documentos", value: stats.documents, color: "bg-purple-50 text-purple-600" },
    { icon: Inbox, label: "Solicitações", value: stats.requests, color: "bg-emerald-50 text-emerald-600" },
    { icon: AlertCircle, label: "Tarefas Pendentes", value: stats.pendingTasks, color: "bg-red-50 text-red-600" },
    { icon: TrendingUp, label: "Novas Solicitações", value: stats.newRequests, color: "bg-cyan-50 text-cyan-600" },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-slate-900 mb-6">Painel Administrativo</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center`}>
                <c.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="text-sm text-slate-500">{c.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}