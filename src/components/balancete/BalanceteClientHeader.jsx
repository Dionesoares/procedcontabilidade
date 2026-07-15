import React from "react";

const fmtDate = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "-");

export default function BalanceteClientHeader({ client, periodStart, periodEnd }) {
  if (!client) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
      <div className="grid sm:grid-cols-2 gap-2 text-sm">
        <div className="space-y-1">
          <p><span className="font-semibold text-slate-700">Empresa: </span><span className="text-slate-600">{client.company_name || client.name}</span></p>
          <p><span className="font-semibold text-slate-700">C.N.P.J: </span><span className="text-slate-600">{client.cpf_cnpj || "-"}</span></p>
          <p><span className="font-semibold text-slate-700">Endereço: </span><span className="text-slate-600">{client.address || "-"}</span></p>
          <p><span className="font-semibold text-slate-700">Período: </span><span className="text-slate-600">{fmtDate(periodStart)} - {fmtDate(periodEnd)}</span></p>
        </div>
        <div className="space-y-1 sm:text-right">
          <p><span className="font-semibold text-slate-700">Folha: </span><span className="text-slate-600">0001</span></p>
          <p><span className="font-semibold text-slate-700">Número livro: </span><span className="text-slate-600">0001</span></p>
        </div>
      </div>
    </div>
  );
}