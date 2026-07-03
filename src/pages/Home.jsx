import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Shield, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "500+", label: "Empresas Atendidas" },
  { value: "10+", label: "Anos de Experiência" },
  { value: "98%", label: "Clientes Satisfeitos" },
  { value: "24h", label: "Tempo de Resposta" },
];

const features = [
  { icon: Building2, title: "Abertura de Empresa", desc: "Processo rápido e descomplicado" },
  { icon: Shield, title: "Regularização", desc: "Empresa sempre em dia" },
  { icon: TrendingUp, title: "Planejamento Tributário", desc: "Pague menos impostos" },
  { icon: Users, title: "Departamento Pessoal", desc: "Gestão completa de RH" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-8">
                <CheckCircle2 className="w-4 h-4" />
                Contabilidade Digital & Estratégica
              </div>

              <h1 className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl text-slate-900 leading-[1.05] tracking-tight mb-6">
                <span className="relative inline-block">
                  <span className="relative" style={{
                    textShadow: "2px 2px 0px rgba(16, 185, 129, 0.15), 4px 4px 0px rgba(16, 185, 129, 0.08), 6px 6px 0px rgba(16, 185, 129, 0.03)"
                  }}>
                    Soluções contábeis
                  </span>
                </span>
                <br />
                <span style={{
                  textShadow: "2px 2px 0px rgba(16, 185, 129, 0.15), 4px 4px 0px rgba(16, 185, 129, 0.08), 6px 6px 0px rgba(16, 185, 129, 0.03)"
                }}>
                  inteligentes
                </span>{" "}
                <span className="text-emerald-600" style={{
                  textShadow: "2px 2px 0px rgba(16, 185, 129, 0.2), 4px 4px 0px rgba(16, 185, 129, 0.1)"
                }}>
                  para sua empresa
                </span>
                <br />
                <span style={{
                  textShadow: "2px 2px 0px rgba(16, 185, 129, 0.15), 4px 4px 0px rgba(16, 185, 129, 0.08), 6px 6px 0px rgba(16, 185, 129, 0.03)"
                }}>
                  crescer com segurança.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-500 leading-relaxed mb-10 max-w-2xl">
                Consultoria Contábil, Fiscal, Tributária e Pessoal para empresas e MEIs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/falar-conosco">
                  <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 h-13 text-base shadow-lg shadow-emerald-200">
                    Falar com especialista
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/servicos">
                  <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 h-13 text-base">
                    Abrir minha empresa
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-heading font-black text-emerald-700">{s.value}</div>
                <div className="text-sm text-slate-500 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features preview */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 mb-4">
              Tudo que sua empresa precisa
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Soluções completas de contabilidade em um só lugar.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <f.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/servicos">
              <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                Ver todos os serviços
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4">
            Pronto para simplificar sua contabilidade?
          </h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Fale com um de nossos especialistas e descubra como podemos ajudar sua empresa a crescer.
          </p>
          <Link to="/falar-conosco">
            <Button size="lg" className="bg-white text-emerald-800 hover:bg-emerald-50 px-8 h-13 text-base font-semibold">
              Falar com especialista
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}