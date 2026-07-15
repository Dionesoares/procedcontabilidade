import React from "react";
import { flattenTree, fmtRawPlain, fmtMoneyPlain } from "@/lib/balanceteCalc";

export default function BalanceteHierarchyTable({ tree }) {
  const rows = flattenTree(tree);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-2 py-3 w-14">Código</th>
              <th className="text-left px-2 py-3">Descrição da Conta</th>
              <th className="text-right px-2 py-3">Saldo Anterior</th>
              <th className="text-right px-2 py-3">Débito</th>
              <th className="text-right px-2 py-3">Crédito</th>
              <th className="text-right px-2 py-3">Saldo Atual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => {
              const isLeaf = !r.children || r.children.length === 0;
              return (
                <tr key={i} className={isLeaf ? "" : "bg-slate-50/60"}>
                  <td className="px-2 py-2 text-slate-400">{r.code}</td>
                  <td className={`px-2 py-2 ${isLeaf ? "text-slate-600" : "font-semibold text-slate-900"}`} style={{ paddingLeft: `${8 + r.depth * 18}px` }}>
                    {r.label}
                  </td>
                  <td className="px-2 py-2 text-right text-slate-500">{fmtRawPlain(r.saldoAnteriorRaw)}</td>
                  <td className="px-2 py-2 text-right text-red-600">{fmtMoneyPlain(r.debito)}</td>
                  <td className="px-2 py-2 text-right text-blue-600">{fmtMoneyPlain(r.credito)}</td>
                  <td className="px-2 py-2 text-right font-medium text-slate-900">{fmtRawPlain(r.saldoAtualRaw)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}