import React from "react";
import { Landmark, ScrollText, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { fmtRaw } from "@/lib/balanceteCalc";

export default function BalanceteSummaryCards({ tree }) {
  const [ativo, passivo, despesas, receitas] = tree || [];
  const cards = [
    { icon: Landmark, label: "Ativo", value: fmtRaw(ativo?.saldoAtualRaw), color: "bg-blue-100 text-blue-600" },
    { icon: ScrollText, label: "Passivo", value: fmtRaw(passivo?.saldoAtualRaw), color: "bg-slate-200 text-slate-700" },
    { icon: ArrowDownCircle, label: "Despesas", value: fmtRaw(despesas?.saldoAtualRaw), color: "bg-red-100 text-red-600" },
    { icon: ArrowUpCircle, label: "Receitas", value: fmtRaw(receitas?.saldoAtualRaw), color: "bg-emerald-100 text-emerald-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
            <c.icon className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400">{c.label}</p>
          <p className="text-lg font-bold text-slate-900">{c.value}</p>
        </div>
      ))}
    </div>
  );
}