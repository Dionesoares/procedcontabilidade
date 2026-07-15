import React from "react";
import { fmtRaw } from "@/lib/balanceteCalc";

export default function BalanceteRelatorioGeral({ tree, clientName, signatureContador, signatureCliente }) {
  const [ativo, passivo, despesas, receitas] = tree || [];
  const resultado = (receitas?.saldoAtualRaw || 0) - (despesas?.saldoAtualRaw || 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-heading font-semibold text-slate-900 mb-4">Relatório Geral</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm mb-8">
        <div>
          <p className="text-xs text-slate-400">Total do Ativo</p>
          <p className="font-semibold text-slate-900">{fmtRaw(ativo?.saldoAtualRaw)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Total do Passivo</p>
          <p className="font-semibold text-slate-900">{fmtRaw(passivo?.saldoAtualRaw)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Total de Despesas</p>
          <p className="font-semibold text-slate-900">{fmtRaw(despesas?.saldoAtualRaw)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Total de Receitas</p>
          <p className="font-semibold text-slate-900">{fmtRaw(receitas?.saldoAtualRaw)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Resultado do Período</p>
          <p className={`font-semibold ${resultado >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            R$ {Math.abs(resultado).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} {resultado >= 0 ? "(Lucro)" : "(Prejuízo)"}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
        <div className="text-center">
          <p className="border-t border-slate-400 pt-2 mt-10 text-sm font-medium text-slate-800">{signatureContador || "___________________________"}</p>
          <p className="text-xs text-slate-400">Contador Responsável</p>
        </div>
        <div className="text-center">
          <p className="border-t border-slate-400 pt-2 mt-10 text-sm font-medium text-slate-800">{signatureCliente || clientName || "___________________________"}</p>
          <p className="text-xs text-slate-400">Cliente / Sócio Proprietário</p>
        </div>
      </div>
    </div>
  );
}