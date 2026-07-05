import React from "react";
import { Link } from "react-router-dom";
import { Info, Briefcase, Award, Mail, MessageCircle, Home as HomeIcon } from "lucide-react";

const pages = [
  { label: "Início", path: "/", icon: HomeIcon },
  { label: "Sobre", path: "/sobre", icon: Info },
  { label: "Serviços", path: "/servicos", icon: Briefcase },
  { label: "Benefícios", path: "/beneficios", icon: Award },
  { label: "Contato", path: "/contato", icon: Mail },
  { label: "Falar Conosco", path: "/falar-conosco", icon: MessageCircle },
];

export default function QuickLinksMobile() {
  return (
    <section className="lg:hidden bg-white border-b border-slate-100 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Navegue pelo site</h2>
        <div className="grid grid-cols-3 gap-3">
          {pages.map((p) => (
            <Link
              key={p.path}
              to={p.path}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:border-blue-200 hover:text-blue-700 transition-colors"
            >
              <p.icon className="w-5 h-5" />
              <span className="text-xs font-medium text-center">{p.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}