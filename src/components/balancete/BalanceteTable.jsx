import React from "react";
import { fmtSaldo, fmtMoney } from "@/lib/balanceteCalc";

export default function BalanceteTable({ items, saldoAnterior, totalDebito, totalCredito, saldoAtual }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Descrição da Conta</th>
              <th className="text-right px-4 py-3">Saldo Anterior</th>
              <th className="text-right px-4 py-3">Débito</th>
              <th className="text-right px-4 py-3">Crédito</th>
              <th className="text-right px-4 py-3">Saldo Atual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Nenhum lançamento no período.</td>
              </tr>
            ) : items.map((it, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-medium text-slate-700">{it.description}</td>
                <td className="px-4 py-2.5 text-right text-slate-400">0,00</td>
                <td className="px-4 py-2.5 text-right text-red-600">{fmtMoney(it.debito)}</td>
                <td className="px-4 py-2.5 text-right text-blue-600">{fmtMoney(it.credito)}</td>
                <td className="px-4 py-2.5 text-right font-medium text-slate-900">{fmtSaldo(it.saldo)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-semibold text-slate-900">
              <td className="px-4 py-3">TOTAL</td>
              <td className="px-4 py-3 text-right">{fmtSaldo(saldoAnterior)}</td>
              <td className="px-4 py-3 text-right text-red-700">{fmtMoney(totalDebito)}</td>
              <td className="px-4 py-3 text-right text-blue-700">{fmtMoney(totalCredito)}</td>
              <td className="px-4 py-3 text-right">{fmtSaldo(saldoAtual)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}