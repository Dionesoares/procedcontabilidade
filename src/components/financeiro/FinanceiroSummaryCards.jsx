import React from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

export default function FinanceiroSummaryCards({ records }) {
  const receitas = records.filter(r => r.type === "Receita").reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const despesas = records.filter(r => r.type === "Despesa").reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const saldo = receitas - despesas;

  const fmt = (v) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-blue-400" /></div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Entradas</p>
          <p className="text-lg font-bold text-white font-mono">{fmt(receitas)}</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center"><TrendingDown className="w-5 h-5 text-red-400" /></div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Saídas</p>
          <p className="text-lg font-bold text-white font-mono">{fmt(despesas)}</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center"><Wallet className="w-5 h-5 text-emerald-400" /></div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Saldo</p>
          <p className={`text-lg font-bold font-mono ${saldo >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(saldo)}</p>
        </div>
      </div>
    </div>
  );
}