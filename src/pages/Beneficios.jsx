import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Rocket, Link2, Bot, LineChart } from "lucide-react";

const steps = [
  {
    n: 1,
    color: "bg-blue-600",
    soft: "bg-blue-50 text-blue-700",
    icon: MessageSquare,
    pill: "Análise completa",
    title: "Conversa Inicial",
    desc: "Entendemos o momento atual da sua empresa, os riscos, as oportunidades e o regime tributário mais adequado.",
  },
  {
    n: 2,
    color: "bg-teal-500",
    soft: "bg-teal-50 text-teal-700",
    icon: Rocket,
    pill: "Migração sem dor",
    title: "Implantação",
    desc: "Migramos toda a contabilidade de forma segura e sem burocracia. Você não precisa fazer nada.",
  },
  {
    n: 3,
    color: "bg-sky-500",
    soft: "bg-sky-50 text-sky-700",
    icon: Link2,
    pill: "Conectado",
    title: "Integração Digital",
    desc: "Conectamos sua contabilidade com seus sistemas, bancos e plataformas em um ecossistema integrado.",
  },
  {
    n: 4,
    color: "bg-amber-500",
    soft: "bg-amber-50 text-amber-700",
    icon: Bot,
    pill: "Zero retrabalho",
    title: "Automação",
    desc: "Obrigações fiscais, folha, relatórios — processos manuais se tornam automáticos. Zero retrabalho.",
  },
  {
    n: 5,
    color: "bg-indigo-600",
    soft: "bg-indigo-50 text-indigo-700",
    icon: LineChart,
    pill: "Resultados reais",
    title: "Crescimento",
    desc: "Com a casa em ordem, focamos em estratégia. Planejamento tributário, gestão de custos e expansão.",
  },
];

export default function Beneficios({ embedded = false }) {
  return (
    <section className={`${embedded ? "" : "pt-8"} scroll-mt-24 py-20 sm:py-24 bg-surface`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex text-[11px] font-bold tracking-wider text-navy bg-white border border-slate-200 px-3 py-1 rounded-full mb-4">
            COMO FUNCIONA
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-navy tracking-tight mb-3">
            Cinco passos para <span className="text-brand">transformar</span> sua empresa
          </h2>
          <p className="text-slate-500">Um processo simples, eficiente e com resultado desde o primeiro dia.</p>
        </div>

        <div className="relative grid sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px bg-slate-200" />
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative text-center lg:text-left"
            >
              <div className="relative inline-flex mb-4">
                <div className={`w-16 h-16 rounded-2xl ${step.soft} flex items-center justify-center`}>
                  <step.icon className="w-7 h-7" />
                </div>
                <span
                  className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full ${step.color} text-white text-xs font-bold flex items-center justify-center`}
                >
                  {step.n}
                </span>
              </div>
              <span className="inline-flex text-[11px] font-semibold text-teal-700 bg-brand-soft px-2.5 py-0.5 rounded-full mb-2">
                {step.pill}
              </span>
              <h3 className="font-heading font-bold text-navy mb-1.5">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
