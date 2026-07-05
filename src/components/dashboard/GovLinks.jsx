import React from "react";
import { ExternalLink } from "lucide-react";

const links = [
  { label: "Gov.br", url: "https://sso.acesso.gov.br/login?client_id=www.gov.br&authorization_id=19f294a9206" },
  { label: "e-CAC Receita Federal", url: "https://cav.receita.fazenda.gov.br/autenticacao/login" },
  { label: "Portal do Cliente", url: "https://onvio.com.br/clientcenter/pt/auth?r=%2Fhome" },
  { label: "Sintegra", url: "http://www.sintegra.gov.br/" },
  { label: "CCP", url: "https://ccponline.palmas.to.gov.br/" },
  { label: "Sefaz", url: "https://www.to.gov.br/sefaz" },
];

export default function GovLinks() {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-blue-600" />
          {l.label}
        </a>
      ))}
    </div>
  );
}