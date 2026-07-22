import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function FinanceiroReportChart({ records }) {
  const data = useMemo(() => {
    const map = {};
    records.forEach(r => {
      const dateStr = r.due_date || r.created_date;
      if (!dateStr) return;
      const d = new Date(dateStr);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      if (!map[key]) map[key] = { key, label, Receita: 0, Despesa: 0 };
      map[key][r.type === "Despesa" ? "Despesa" : "Receita"] += Number(r.amount || 0);
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
  }, [records]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-heading font-semibold text-slate-900 mb-1">Evolução Mensal</h3>
      <p className="text-xs text-slate-400 mb-4">Entradas e saídas por mês</p>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Sem dados suficientes para gerar o relatório.</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => `R$${v}`} axisLine={{ stroke: "#e2e8f0" }} />
            <Tooltip formatter={(v) => `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
            <Legend />
            <Bar dataKey="Receita" name="Entradas" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Despesa" name="Saídas" fill="#0f172a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}