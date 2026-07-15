import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { fmtMoney } from "@/lib/balanceteCalc";

export default function BalanceteChart({ items }) {
  const data = items.slice(0, 8).map((it) => ({
    name: it.description.length > 16 ? it.description.slice(0, 16) + "…" : it.description,
    Débito: it.debito,
    Crédito: it.credito,
  }));

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 h-72 flex items-center justify-center text-slate-400 text-sm">
        Sem lançamentos no período selecionado.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-heading font-semibold text-slate-900 mb-4">Composição do Balancete</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => fmtMoney(v)} />
          <Legend />
          <Bar dataKey="Crédito" fill="#2563eb" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Débito" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}