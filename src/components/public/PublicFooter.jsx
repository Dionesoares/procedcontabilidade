import React from "react";
import { Link } from "react-router-dom";
import { Calculator, Mail, Phone, MapPin } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-white">
                Proced<span className="text-emerald-400">Contabilidade</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Soluções contábeis inteligentes para sua empresa crescer com segurança.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Links</h4>
            <div className="space-y-2.5">
              {[
                { label: "Início", path: "/" },
                { label: "Sobre", path: "/sobre" },
                { label: "Serviços", path: "/servicos" },
                { label: "Benefícios", path: "/beneficios" },
              ].map((l) => (
                <Link key={l.path} to={l.path} className="block text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Serviços</h4>
            <div className="space-y-2.5 text-sm text-slate-400">
              <p>Abertura de Empresa</p>
              <p>Contabilidade Completa</p>
              <p>Regularização de MEI</p>
              <p>Planejamento Tributário</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>contato@procedcontabilidade.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>São Paulo, SP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Proced Contabilidade. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}