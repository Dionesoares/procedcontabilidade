import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminClientes from "@/pages/admin/AdminClientes";
import AdminTarefas from "@/pages/admin/AdminTarefas";
import AdminDocumentos from "@/pages/admin/AdminDocumentos";
import AdminSolicitacoes from "@/pages/admin/AdminSolicitacoes";
import AdminMensagens from "@/pages/admin/AdminMensagens";
import AdminContatos from "@/pages/admin/AdminContatos";
import ClienteDashboard from "@/pages/cliente/ClienteDashboard";
import ClienteDocumentos from "@/pages/cliente/ClienteDocumentos";
import ClienteSolicitacoes from "@/pages/cliente/ClienteSolicitacoes";
import ClienteMensagens from "@/pages/cliente/ClienteMensagens";

export function AdminRouter() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/cliente" replace />;

  return (
    <Routes>
      <Route element={<DashboardLayout user={user} isAdmin={true} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="clientes" element={<AdminClientes />} />
        <Route path="tarefas" element={<AdminTarefas />} />
        <Route path="documentos" element={<AdminDocumentos />} />
        <Route path="solicitacoes" element={<AdminSolicitacoes />} />
        <Route path="mensagens" element={<AdminMensagens />} />
        <Route path="contatos-recebidos" element={<AdminContatos />} />
      </Route>
    </Routes>
  );
}

export function ClienteRouter() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;

  return (
    <Routes>
      <Route element={<DashboardLayout user={user} isAdmin={false} />}>
        <Route index element={<ClienteDashboard />} />
        <Route path="documentos" element={<ClienteDocumentos />} />
        <Route path="solicitacoes" element={<ClienteSolicitacoes />} />
        <Route path="mensagens" element={<ClienteMensagens />} />
      </Route>
    </Routes>
  );
}