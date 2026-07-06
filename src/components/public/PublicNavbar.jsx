import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Início", path: "/" },
  { label: "Sobre", path: "/#sobre" },
  { label: "Serviços", path: "/#servicos" },
  { label: "Benefícios", path: "/#beneficios" },
  { label: "Contato", path: "/#contato" },
  { label: "Falar Conosco", path: "/falar-conosco" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span
              className="font-heading font-black text-2xl text-slate-900 tracking-tight"
              style={{ textShadow: "1px 1px 0px rgba(37, 99, 235, 0.25), 2px 2px 0px rgba(37, 99, 235, 0.12)" }}
            >
              Proced<span className="text-blue-600">Contabilidade</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                Área do Cliente
              </Button>
            </Link>
            <Link to="/login?tipo=admin">
              <Button size="sm" className="bg-blue-700 hover:bg-blue-800">
                Administrador
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full border-blue-200 text-blue-700" size="sm">
                  Área do Cliente
                </Button>
              </Link>
              <Link to="/login?tipo=admin" onClick={() => setOpen(false)}>
                <Button className="w-full bg-blue-700 hover:bg-blue-800" size="sm">
                  Administrador
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}