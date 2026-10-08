import React from "react";
import { motion } from "framer-motion";
import { Handshake, HeartHandshake, TrendingUp } from "lucide-react";

const differentials = [
  {
    icon: Handshake,
    tint: "bg-blue-50 text-blue-700",
    title: "Atendimento Consultivo",
    desc: "Não somos apenas contadores. Somos parceiros estratégicos que entendem seu negócio e orientam suas decisões.",
  },
  {
    icon: HeartHandshake,
    tint: "bg-teal-50 text-teal-700",
    title: "Atendimento Humanizado",
    desc: "Tecnologia avançada sem perder o contato humano. Um time real, presente, acessível e comprometido.",
  },
  {
    icon: TrendingUp,
    tint: "bg-sky-50 text-sky-700",
    title: "Crescimento Empresarial",
    desc: "Nossa missão vai além de cumprir obrigações. Queremos que seu negócio cresça de forma sólida e sustentável.",
  },
];

export default function Sobre({ embedded = false }) {
  return (
    <section className={`${embedded ? "" : "pt-8"} scroll-mt-24 py-20 sm:py-24 bg-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!embedded && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mb-14"
          >
            <p className="text-brand font-semibold text-sm uppercase tracking-wider mb-3">Sobre nós</p>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-navy mb-4 tracking-tight">
              Sobre a Proced Contabilidade
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed">
              A Proced Contabilidade nasceu com o propósito de oferecer soluções contábeis modernas, seguras e
              estratégicas para empresas e empreendedores.
            </p>
          </motion.div>
        )}

        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-navy tracking-tight mb-3">
            Diferenciais que colocam a sua empresa <span className="text-brand">à frente</span>
          </h2>
          <p className="text-slate-500 text-base sm:text-lg">
            Décadas de expertise contábil com tecnologia de ponta – e um time que atende de verdade.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {differentials.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl ${item.tint} flex items-center justify-center mb-5`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-navy mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
