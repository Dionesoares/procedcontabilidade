import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import QuickLinksMobile from "@/components/home/QuickLinksMobile";
import HeroDashboardMock from "@/components/home/HeroDashboardMock";
import StatsBar from "@/components/home/StatsBar";
import Sobre from "@/pages/Sobre";
import Servicos from "@/pages/Servicos";
import Beneficios from "@/pages/Beneficios";
import Contato from "@/pages/Contato";

const WHATSAPP_LINK = "https://wa.me/5563992544417";

export default function Home() {
  useEffect(() => {
    const hash = window.location.hash || "";
    if (!hash || hash.startsWith("#error") || hash.includes("access_token") || hash.includes("error_code")) {
      return;
    }
    const el = document.querySelector(hash);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-surface dot-grid pt-8 pb-20 sm:pb-28">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
            >
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-teal-700 bg-brand-soft px-3.5 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                CONTABILIDADE DO FUTURO, HOJE
              </span>

              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-[3.4rem] text-navy leading-[1.12] tracking-tight mb-5">
                Contabilidade <span className="text-brand">inteligente</span> para empresas que querem{" "}
                <span className="text-brand">crescer</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-8 max-w-xl">
                Combinamos <span className="font-semibold text-navy">tecnologia</span>,{" "}
                <span className="font-semibold text-navy">automação</span> e atendimento consultivo para manter sua
                empresa regularizada — e pagar menos impostos dentro da lei.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-brand text-white font-semibold text-sm shadow-lg shadow-blue-900/15 hover:brightness-110 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Falar com especialista
                </a>
                <Link
                  to="/#servicos"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-slate-200 bg-white text-navy font-semibold text-sm hover:bg-slate-50 transition"
                >
                  Ver serviços <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            <div className="lg:pl-4 hidden sm:block">
              <HeroDashboardMock />
            </div>
          </div>
        </div>
      </section>

      <StatsBar />

      <QuickLinksMobile />

      <div id="sobre" className="scroll-mt-24">
        <Sobre embedded />
      </div>
      <div id="como-funciona" className="scroll-mt-24">
        <Beneficios embedded />
      </div>
      <div id="servicos" className="scroll-mt-24">
        <Servicos embedded />
      </div>
      <div id="contato" className="scroll-mt-24">
        <Contato embedded />
      </div>
    </div>
  );
}
