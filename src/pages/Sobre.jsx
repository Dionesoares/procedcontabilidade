import React from "react";
import { motion } from "framer-motion";
import { Target, Eye, Heart, Award, Users, Clock } from "lucide-react";

const values = [
  { icon: Target, title: "Missão", desc: "Simplificar a contabilidade e ajudar empresas a crescerem com segurança e economia." },
  { icon: Eye, title: "Visão", desc: "Ser referência nacional em contabilidade digital e consultoria estratégica." },
  { icon: Heart, title: "Valores", desc: "Ética, transparência, inovação e compromisso com o sucesso do cliente." },
];

const differentials = [
  { icon: Award, title: "Excelência", desc: "Profissionais qualificados e atualizados com a legislação vigente." },
  { icon: Users, title: "Proximidade", desc: "Atendimento humanizado e personalizado para cada cliente." },
  { icon: Clock, title: "Agilidade", desc: "Respostas rápidas e processos simplificados para sua comodidade." },
];

export default function Sobre() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3">Sobre nós</p>
              <h1 className="font-heading font-bold text-4xl sm:text-5xl text-slate-900 mb-6 leading-tight">
                Sobre a Proced Contabilidade
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed">
                A Proced Contabilidade nasceu com o propósito de oferecer soluções contábeis modernas, seguras e estratégicas para empresas e empreendedores. Nosso compromisso é simplificar a burocracia e ajudar nossos clientes a pagar o mínimo de impostos dentro da lei, mantendo sua empresa sempre regularizada.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-slate-50 rounded-2xl p-8 border border-slate-100"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                  <v.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-heading font-bold text-xl text-slate-900 mb-3">{v.title}</h3>
                <p className="text-slate-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentials */}
      <section className="py-20 bg-blue-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-3">Nossos Diferenciais</h2>
            <p className="text-slate-500">O que nos torna a melhor escolha para sua empresa.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {differentials.map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white border border-blue-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <d.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{d.title}</h3>
                <p className="text-sm text-slate-500">{d.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}