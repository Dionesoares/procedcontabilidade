import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import useCountUp from "@/hooks/useCountUp";

const stats = [
  { value: 10, suffix: "+", title: "Anos de mercado", sub: "Experiência consolidada" },
  { value: 100, suffix: "+", title: "Clientes satisfeitos", sub: "Em todo o Brasil" },
  { value: 300, suffix: "+", title: "Projetos concluídos", sub: "Entregas com excelência" },
  { value: 40, suffix: "%", title: "Economia média", sub: "Em impostos via planejamento" },
];

function StatItem({ item, enabled, delay }) {
  const value = useCountUp(item.value, { enabled, duration: 1600 + delay * 1000 });
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={enabled ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.45 }}
      className="text-center lg:text-left"
    >
      <p className="font-heading font-extrabold text-4xl sm:text-5xl text-brand tracking-tight mb-1">
        {value}
        {item.suffix}
      </p>
      <p className="font-semibold text-white text-sm sm:text-base">{item.title}</p>
      <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{item.sub}</p>
    </motion.div>
  );
}

export default function StatsBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section ref={ref} className="bg-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {stats.map((item, i) => (
            <StatItem key={item.title} item={item} enabled={inView} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}
