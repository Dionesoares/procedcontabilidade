import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, FileText, ListTodo, Inbox, TrendingUp, AlertCircle, Plus, Clock } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GovLinks from "@/components/dashboard/GovLinks";
import CalendarWidget from "@/components/dashboard/CalendarWidget";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ clients: 0, tasks: 0, documents: 0, requests: 0, pendingTasks: 0, newRequests: 0 });
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [clients, tasksData, docs, requestsData] = await Promise.all([
          base44.entities.Client.list(),
          base44.entities.Task.list(),
          base44.entities.Document.list(),
          base44.entities.ServiceRequest.list(),
        ]);
        setTasks(tasksData);
        setRequests(requestsData);
        setStats({
          clients: clients.length,
          tasks: tasksData.length,
          documents: docs.length,
          requests: requestsData.length,
          pendingTasks: tasksData.filter(t => t.status === "Pendente").length,
          newRequests: requestsData.filter(r => r.status === "Novo").length,
        });
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const cards = [
    { icon: Users, label: "Clientes", value: stats.clients, color: "bg-blue-50 text-blue-600", to: "/admin/clientes" },
    { icon: ListTodo, label: "Tarefas", value: stats.tasks, color: "bg-amber-50 text-amber-600", to: "/admin/tarefas" },
    { icon: FileText, label: "Documentos", value: stats.documents, color: "bg-purple-50 text-purple-600", to: "/admin/documentos" },
    { icon: Inbox, label: "Solicitações", value: stats.requests, color: "bg-blue-50 text-blue-600", to: "/admin/solicitacoes" },
    { icon: AlertCircle, label: "Tarefas Pendentes", value: stats.pendingTasks, color: "bg-red-50 text-red-600", to: "/admin/tarefas" },
    { icon: TrendingUp, label: "Novas Solicitações", value: stats.newRequests, color: "bg-cyan-50 text-cyan-600", to: "/admin/solicitacoes" },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <h1 className="font-heading font-bold text-2xl text-slate-900">Área do Administrador</h1>
        <Link to="/admin/clientes">
          <Button className="bg-blue-700 hover:bg-blue-800">
            <Plus className="w-4 h-4 mr-1" /> Cadastrar Novo Cliente
          </Button>
        </Link>
      </div>
      <GovLinks />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={c.to} className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center`}>
                  <c.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
              <p className="text-sm text-slate-500">{c.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <CalendarWidget tasks={tasks} requests={requests} isAdmin />
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-heading font-semibold text-slate-900 mb-4">Tarefas com Vencimento Próximo</h3>
            {tasks.filter(t => t.status !== "Concluída" && t.due_date).sort((a, b) => new Date(a.due_date) - new Date(b.due_date)).slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{t.title}</p>
                  <p className="text-xs text-slate-400">{t.category} · {t.priority}</p>
                </div>
                <span className="text-xs font-medium text-slate-500 shrink-0">{format(new Date(t.due_date), "dd/MM")}</span>
              </div>
            ))}
            {tasks.filter(t => t.status !== "Concluída" && t.due_date).length === 0 && (
              <p className="text-sm text-slate-400">Nenhuma tarefa com vencimento.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}