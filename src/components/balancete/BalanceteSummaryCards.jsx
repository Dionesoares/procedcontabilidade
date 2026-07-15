import React from "react";
import { ArrowDownCircle, ArrowUpCircle, Scale, Wallet } from "lucide-react";
import { fmtSaldo, fmtMoney } from "@/lib/balanceteCalc";

export default function BalanceteSummaryCards({ saldoAnterior, totalDebito, totalCredito, saldoAtual }) {
  const cards = [
    { icon: Scale, label: "Saldo Anterior", value: fmtSaldo(saldoAnterior), color: "bg-slate-100 text-slate-600" },
    { icon: ArrowDownCircle, label: "Débito", value: fmtMoney(totalDebito), color: "bg-red-100 text-red-600" },
    { icon: ArrowUpCircle, label: "Crédito", value: fmtMoney(totalCredito), color: "bg-blue-100 text-blue-600" },
    { icon: Wallet, label: "Saldo Atual", value: fmtSaldo(saldoAtual), color: "bg-emerald-100 text-emerald-600" },
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