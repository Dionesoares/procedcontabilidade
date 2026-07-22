import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = { Receita: "#2563eb", Despesa: "#0f172a" };

export default function FinanceiroPieChart({ records }) {
  const data = useMemo(() => {
    const receitas = records.filter((r) => r.type === "Receita").reduce((s, r) => s + Number(r.amount || 0), 0);
    const despesas = records.filter((r) => r.type === "Despesa").reduce((s, r) => s + Number(r.amount || 0), 0);
    return [
      { name: "Entradas", value: receitas, key: "Receita" },
      { name: "Saídas", value: despesas, key: "Despesa" },
    ].filter((d) => d.value > 0);
  }, [records]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-heading font-semibold text-slate-900 mb-1">Distribuição</h3>
      <p className="text-xs text-slate-400 mb-4">Entradas vs. Saídas</p>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Sem dados suficientes.</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3}>
              {data.map((d) => <Cell key={d.key} fill={COLORS[d.key]} />)}
            </Pie>
            <Tooltip formatter={(v) => `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}