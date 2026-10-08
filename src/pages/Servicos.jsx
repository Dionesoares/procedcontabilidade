import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Building2,
  BookOpen,
  FileCheck,
  Users,
  ScrollText,
  Ban,
  Calculator,
  Wallet,
  Lightbulb,
  PieChart,
  BadgeDollarSign,
  LayoutDashboard,
  Bot,
  Plug,
  Shield,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import useCountUp from "@/hooks/useCountUp";

const WHATSAPP_LINK = "https://wa.me/5563992544417";

const serviceTabs = {
  Empresarial: [
    {
      icon: Building2,
      badge: "Popular",
      title: "Abertura de Empresa",
      desc: "Criamos sua empresa de forma rápida e correta, escolhendo o melhor regime e estrutura para seu perfil.",
    },
    {
      icon: BookOpen,
      title: "Contabilidade Mensal",
      desc: "Escrituração completa, apuração de impostos, balancetes e DRE com entrega pontual de todas as obrigações.",
    },
    {
      icon: FileCheck,
      title: "Departamento Fiscal",
      desc: "SPED, EFD, DCTF, EFD-Contribuições e todas as obrigações acessórias dentro dos prazos.",
    },
    {
      icon: Users,
      title: "Departamento Pessoal",
      desc: "Folha de pagamento, eSocial, FGTS, férias, rescisões e toda a gestão trabalhista da sua equipe.",
    },
    {
      icon: ScrollText,
      title: "Legalização e Alvarás",
      desc: "Regularização de licenças, alvarás, certificações e processos junto aos órgãos públicos.",
    },
    {
      icon: Ban,
      title: "Encerramento",
      desc: "Processo completo e seguro para encerrar sua empresa sem surpresas fiscais ou trabalhistas.",
    },
  ],
  Estratégico: [
    {
      icon: Calculator,
      badge: "Mais buscado",
      title: "Planejamento Tributário",
      desc: "Análise profunda da carga tributária com estratégias legais de redução de impostos e maximização de lucro.",
    },
    {
      icon: Wallet,
      title: "BPO Financeiro",
      desc: "Terceirização completa das finanças: contas a pagar/receber, conciliação e fluxo de caixa.",
    },
    {
      icon: Lightbulb,
      title: "Consultoria Estratégica",
      desc: "Orientação especializada para decisões de crescimento, fusões, aquisições e reestruturações.",
    },
    {
      icon: PieChart,
      title: "Gestão de Custos",
      desc: "Identificação de desperdícios e criação de planos precisos de otimização.",
    },
    {
      icon: BadgeDollarSign,
      title: "Valuation Empresarial",
      desc: "Avaliação do valor real da empresa para investidores, sócios e operações estratégicas.",
    },
    {
      icon: FileCheck,
      title: "Regularização de MEI",
      desc: "Mantenha seu MEI sempre em dia com o governo e evite juros e multas.",
    },
  ],
  Digital: [
    {
      icon: LayoutDashboard,
      badge: "Novo",
      title: "Dashboard Financeiro",
      desc: "Painel visual com KPIs, gráficos e indicadores em tempo real.",
    },
    {
      icon: Bot,
      title: "Automação de Processos",
      desc: "Robôs contábeis que automatizam lançamentos, conciliações e geração de relatórios.",
    },
    {
      icon: Plug,
      title: "Integração com ERPs",
      desc: "Conectividade com sistemas como Omie, Conta Azul, Bling e bancos.",
    },
    {
      icon: Shield,
      title: "Portal do Cliente",
      desc: "Acesso a documentos, aprovações, comunicados e análises em um portal digital.",
    },
  ],
};

const regimes = [
  { name: "Simples Nacional", pct: 72, tag: "Atual", tagClass: "bg-orange-100 text-orange-700" },
  { name: "Lucro Presumido", pct: 48, tag: null },
  { name: "Lucro Real", pct: 88, tag: "Recomendado", tagClass: "bg-brand-soft text-teal-700" },
];

const digitalFeatures = [
  { title: "Automação inteligente", desc: "Mais velocidade e menos erros nos processos." },
  { title: "Dashboard em tempo real", desc: "Visibilidade total do financeiro e fiscal." },
  { title: "Integrações nativas", desc: "Conecte ERPs, bancos e plataformas." },
  { title: "Segurança total", desc: "Criptografia, backups e conformidade com a LGPD." },
];

function TaxAnalysisMock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const economia = useCountUp(47200, { enabled: inView, duration: 1800 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Análise Tributária</p>
          <p className="text-sm font-semibold text-navy">Planejamento Fiscal 2026</p>
        </div>
        <span className="text-[11px] font-bold text-teal-700 bg-brand-soft px-2.5 py-1 rounded-full">OTIMIZADO</span>
      </div>

      <div className="space-y-3 mb-5">
        {regimes.map((r) => (
          <div key={r.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-slate-600 font-medium">{r.name}</span>
              {r.tag && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.tagClass}`}>{r.tag}</span>
              )}
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-brand"
                initial={{ width: 0 }}
                animate={inView ? { width: `${r.pct}%` } : { width: 0 }}
                transition={{ duration: 0.9, delay: 0.2 }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-slate-500 mb-4">
        Potencial de economia:{" "}
        <span className="font-bold text-navy">R$ {economia.toLocaleString("pt-BR")}/ano</span>
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase mb-2">Obrigações do Mês</p>
          <div className="flex flex-wrap gap-1.5">
            {["DCTF", "GIA", "SPED", "eSocial"].map((o) => (
              <span key={o} className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-100 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3 text-teal-600" />
                {o}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase mb-2">Integrações Ativas</p>
          <div className="flex flex-wrap gap-1.5">
            {["Omie", "ContaAzul", "Bling", "Inter", "Itaú", "NF-e"].map((o) => (
              <span key={o} className="text-[11px] font-medium text-slate-600 bg-white border border-slate-100 px-2 py-0.5 rounded-md">
                {o}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Servicos({ embedded = false }) {
  const [tab, setTab] = useState("Empresarial");

  return (
    <div>
      <section className={`${embedded ? "" : "pt-8"} scroll-mt-24 py-20 sm:py-24 bg-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex text-[11px] font-bold tracking-wider text-navy bg-slate-50 border border-slate-200 px-3 py-1 rounded-full mb-4">
              NOSSOS SERVIÇOS
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-navy tracking-tight mb-3">
              Soluções completas para <span className="text-brand">cada fase</span> do seu negócio
            </h2>
            <p className="text-slate-500">
              Do nascimento ao crescimento, cobrimos o contábil, o fiscal e o estratégico.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {Object.keys(serviceTabs).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setTab(name)}
                className={`h-10 px-5 rounded-full text-sm font-semibold transition ${
                  tab === name
                    ? "bg-brand text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {serviceTabs[tab].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {s.badge && (
                  <span className="absolute top-4 right-4 text-[11px] font-semibold text-teal-700 bg-brand-soft px-2.5 py-0.5 rounded-full">
                    {s.badge}
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-navy mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{s.desc}</p>
                <Link to="/falar-conosco" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                  Saber mais <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>

          <TaxAnalysisMock />
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 dot-grid pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight mb-4">
                A contabilidade que a <span className="text-brand">era digital</span> exige
              </h2>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Saia das planilhas manuais. Tenha automação, dados em tempo real e decisões com clareza — sem abrir mão
                do atendimento humano.
              </p>
              <ul className="space-y-4 mb-8">
                {digitalFeatures.map((f) => (
                  <li key={f.title} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white text-sm">{f.title}</p>
                      <p className="text-sm text-slate-400">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-brand text-white font-semibold text-sm hover:brightness-110 transition"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com um especialista
              </a>
            </div>
            <div className="hidden lg:block">
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8">
                <div className="grid grid-cols-2 gap-4">
                  {[LayoutDashboard, Bot, Plug, Shield].map((Icon, i) => (
                    <div key={i} className="rounded-2xl bg-white/10 p-5 flex flex-col items-start gap-3">
                      <Icon className="w-6 h-6 text-teal-300" />
                      <div className="h-2 w-16 rounded bg-white/20" />
                      <div className="h-2 w-24 rounded bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
