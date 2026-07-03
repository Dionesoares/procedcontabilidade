import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingDown, Zap, HeadphonesIcon, ShieldCheck, PiggyBank, FileCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: TrendingDown, title: "Redução de impostos", desc: "Estratégias legais para pagar menos impostos e aumentar a lucratividade." },
  { icon: Zap, title: "Atendimento rápido", desc: "Respostas ágeis e suporte quando você mais precisa." },
  { icon: HeadphonesIcon, title: "Suporte especializado", desc: "Equipe de contadores especializados à sua disposição." },
  { icon: ShieldCheck, title: "Empresa sempre regularizada", desc: "Mantenha suas obrigações em dia e evite problemas com o fisco." },
  { icon: PiggyBank, title: "Planejamento financeiro", desc: "Orientação para uma gestão financeira eficiente e sustentável." },
];

export default function Beneficios() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-3">Benefícios</p>
            <h1 className="font-heading font-bold text-4xl sm:text-5xl text-slate-900 mb-4 leading-tight">
              Por que escolher a Proced Contabilidade?
            </h1>
            <p className="text-lg text-slate-500">
              Descubra as vantagens de contar com uma contabilidade moderna e estratégica.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 rounded-2xl p-7 border border-slate-100 hover:border-emerald-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <b.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">{b.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MEI Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
                <FileCheck className="w-8 h-8 text-emerald-200" />
              </div>
              <p className="text-emerald-300 font-semibold text-sm uppercase tracking-wider mb-3">MEI</p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4">
                Mantenha seu MEI regularizado
              </h2>
              <p className="text-emerald-100 text-lg mb-8">
                Evite juros e multas e mantenha sua empresa sempre em dia com o governo.
              </p>
              <Link to="/falar-conosco">
                <Button size="lg" className="bg-white text-emerald-800 hover:bg-emerald-50 px-8 h-13 text-base font-semibold">
                  Regularizar meu MEI
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}