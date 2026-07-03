import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Building2, BookOpen, FileCheck, Calculator, Users, Lightbulb, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const highlights = [
  "Atendimento personalizado",
  "Planejamento tributário",
  "Especialistas em MEI e pequenas empresas",
  "Suporte completo para empresas",
];

const services = [
  { icon: Building2, title: "Abertura de Empresa", desc: "Abrimos sua empresa de forma rápida e descomplicada." },
  { icon: BookOpen, title: "Contabilidade Completa", desc: "Gestão contábil completa para seu negócio." },
  { icon: FileCheck, title: "Regularização de MEI", desc: "Mantenha seu MEI sempre em dia com o governo." },
  { icon: Calculator, title: "Planejamento Tributário", desc: "Pague menos impostos dentro da lei." },
  { icon: Users, title: "Departamento Pessoal", desc: "Folha de pagamento, admissões e rescisões." },
  { icon: Lightbulb, title: "Consultoria Contábil", desc: "Orientação estratégica para seu negócio crescer." },
];

export default function Servicos() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-3">Serviços</p>
              <h1 className="font-heading font-bold text-4xl sm:text-5xl text-slate-900 mb-4 leading-tight">
                Nossos Serviços
              </h1>
              <p className="text-lg text-slate-500">
                Soluções completas para sua empresa ou MEI.
              </p>
            </motion.div>
          </div>

          {/* Highlights */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {highlights.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 bg-emerald-50 rounded-xl px-5 py-4 border border-emerald-100"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-sm font-medium text-slate-700">{h}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white rounded-2xl p-8 border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50/50 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mb-5 group-hover:from-emerald-100 group-hover:to-emerald-200 transition-all">
                  <s.icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/falar-conosco">
              <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800 px-8 h-13">
                Solicitar Serviço
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}