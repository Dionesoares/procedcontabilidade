import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingDown, ShieldCheck } from "lucide-react";
import useCountUp from "@/hooks/useCountUp";

function formatBRL(n) {
  return Math.round(n).toLocaleString("pt-BR");
}

export default function HeroDashboardMock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const faturamento = useCountUp(248500, { enabled: inView, duration: 1800 });
  const imposto = useCountUp(31200, { enabled: inView, duration: 1800 });
  const economia = useCountUp(8400, { enabled: inView, duration: 1600 });
  const up = useCountUp(12.4, { enabled: inView, duration: 1400, decimals: 1 });
  const down = useCountUp(18.2, { enabled: inView, duration: 1400, decimals: 1 });
  const prazo = useCountUp(100, { enabled: inView, duration: 1400 });
  const bars = [40, 58, 48, 72, 65, 88];

  return (
    <div ref={ref} className="relative">
      <motion.div
        initial={{ opacity: 0, x: -28, y: -8 }}
        animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{ delay: 0.45, duration: 0.55, ease: "easeOut" }}
        className="absolute -top-4 -left-2 sm:left-4 z-10 bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-3 flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-brand-soft flex items-center justify-center">
          <TrendingDown className="w-4 h-4 text-teal-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-navy">Imposto reduzido</p>
          <p className="text-[11px] text-slate-500">Economia de R$ {formatBRL(economia)}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ delay: 0.15, duration: 0.65, ease: "easeOut" }}
        className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/60 p-5 sm:p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Dashboard Financeiro</p>
            <p className="text-sm font-semibold text-navy">Visão Geral</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-brand-soft px-2.5 py-1 rounded-full">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500" />
            </span>
            Ao vivo
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between gap-3 pb-3 border-b border-slate-50">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Faturamento Mensal</p>
              <p className="text-xl font-bold text-navy tracking-tight">R$ {formatBRL(faturamento)}</p>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-brand-soft px-2 py-1 rounded-full">+{up}%</span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Imposto Economizado</p>
              <p className="text-xl font-bold text-navy tracking-tight">R$ {formatBRL(imposto)}</p>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-brand-soft px-2 py-1 rounded-full">-{down}%</span>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-3">Performance Trimestral</p>
          <div className="flex items-end gap-2 h-20">
            {bars.map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t-md bg-brand/80 origin-bottom"
                initial={{ height: 0 }}
                animate={inView ? { height: `${h}%` } : { height: 0 }}
                transition={{ delay: 0.55 + i * 0.08, duration: 0.7, ease: "easeOut" }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 28, y: 8 }}
        animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{ delay: 0.65, duration: 0.55, ease: "easeOut" }}
        className="absolute -bottom-3 right-2 sm:right-6 z-10 bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-3 flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-navy">Obrigações em dia</p>
          <p className="text-[11px] text-slate-500">{prazo}% no prazo este mês</p>
        </div>
      </motion.div>
    </div>
  );
}
