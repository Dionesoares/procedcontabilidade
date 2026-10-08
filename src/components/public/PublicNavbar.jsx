import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Início", path: "/" },
  { label: "Sobre", path: "/#sobre" },
  { label: "Serviços", path: "/#servicos" },
  { label: "Como funciona", path: "/#como-funciona" },
  { label: "Contato", path: "/#contato" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center text-white font-heading font-bold text-sm shadow-sm">
              PC
            </span>
            <span className="font-heading font-extrabold text-lg tracking-tight text-navy">
              Proced<span className="text-brand">Contabilidade</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active =
                isHome &&
                (link.path === "/"
                  ? !location.hash || location.hash === "#"
                  : location.hash === link.path.replace("/", ""));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? "text-brand bg-brand-soft"
                      : "text-slate-600 hover:text-brand hover:bg-brand-soft"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-slate-200 text-navy hover:bg-slate-50 h-10 px-4"
              >
                Área do Cliente
              </Button>
            </Link>
            <Link to="/login?tipo=admin">
              <Button size="sm" className="rounded-full bg-brand hover:brightness-110 text-white h-10 px-5">
                Administrador
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-slate-600 hover:text-navy"
            aria-label="Menu"
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
                className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-brand hover:bg-brand-soft rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/falar-conosco"
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-brand hover:bg-brand-soft rounded-lg"
            >
              Falar Conosco
            </Link>
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full rounded-full border-slate-200 text-navy" size="sm">
                  Área do Cliente
                </Button>
              </Link>
              <Link to="/login?tipo=admin" onClick={() => setOpen(false)}>
                <Button className="w-full rounded-full bg-brand hover:brightness-110" size="sm">
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
