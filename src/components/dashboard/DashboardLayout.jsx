import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Users, FileText, ListTodo, MessageSquare, Inbox,
  LogOut, Menu, X, Calculator, ChevronRight, FolderOpen, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";

const adminLinks = [
  { label: "Painel", path: "/admin", icon: LayoutDashboard },
  { label: "Clientes", path: "/admin/clientes", icon: Users },
  { label: "Tarefas", path: "/admin/tarefas", icon: ListTodo },
  { label: "Documentos", path: "/admin/documentos", icon: FileText },
  { label: "Solicitações", path: "/admin/solicitacoes", icon: Inbox },
  { label: "Mensagens", path: "/admin/mensagens", icon: MessageSquare },
  { label: "Contatos", path: "/admin/contatos-recebidos", icon: FolderOpen },
];

const clientLinks = [
  { label: "Meu Painel", path: "/cliente", icon: LayoutDashboard },
  { label: "Meus Documentos", path: "/cliente/documentos", icon: FileText },
  { label: "Solicitações", path: "/cliente/solicitacoes", icon: Inbox },
  { label: "Mensagens", path: "/cliente/mensagens", icon: MessageSquare },
];

export default function DashboardLayout({ user, isAdmin }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const links = isAdmin ? adminLinks : clientLinks;

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-sm text-slate-900">
              Proced<span className="text-blue-600">Contabilidade</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 py-2">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 px-3 py-2">
            {isAdmin ? "Administração" : "Área do Cliente"}
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {links.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <link.icon className={`w-4 h-4 ${active ? "text-blue-600" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.full_name || user?.email}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6 gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1 text-slate-600">
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm text-slate-500 flex items-center gap-1">
            {isAdmin ? "Admin" : "Cliente"}
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 font-medium">
              {links.find(l => l.path === location.pathname)?.label || "Painel"}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}