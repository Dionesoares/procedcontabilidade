import React from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

const fmtDate = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "-");

export default function BalanceteClientHeader({
  companyName,
  cnpj,
  address,
  periodStart,
  periodEnd,
  folha,
  numeroLivro,
  onEdit,
}) {
  if (!companyName && !cnpj && !address) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 relative">
      {onEdit && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute top-3 right-3"
          onClick={onEdit}
        >
          <Pencil className="w-3.5 h-3.5 mr-1" /> Editar Cabeçalho
        </Button>
      )}
      <div className="grid sm:grid-cols-2 gap-2 text-sm">
        <div className="space-y-1">
          <p><span className="font-semibold text-slate-700">Empresa: </span><span className="text-slate-600">{companyName || "-"}</span></p>
          <p><span className="font-semibold text-slate-700">C.N.P.J: </span><span className="text-slate-600">{cnpj || "-"}</span></p>
          <p><span className="font-semibold text-slate-700">Endereço: </span><span className="text-slate-600">{address || "-"}</span></p>
          <p><span className="font-semibold text-slate-700">Período: </span><span className="text-slate-600">{fmtDate(periodStart)} - {fmtDate(periodEnd)}</span></p>
        </div>
        <div className="space-y-1 sm:text-right">
          <p><span className="font-semibold text-slate-700">Folha: </span><span className="text-slate-600">{folha || "0001"}</span></p>
          <p><span className="font-semibold text-slate-700">Número livro: </span><span className="text-slate-600">{numeroLivro || "0001"}</span></p>
        </div>
      </div>
    </div>
  );
}