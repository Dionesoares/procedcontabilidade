import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import QuickLinksMobile from "@/components/home/QuickLinksMobile";
import { Button } from "@/components/ui/button";
import Sobre from "@/pages/Sobre";
import Servicos from "@/pages/Servicos";
import Beneficios from "@/pages/Beneficios";
import Contato from "@/pages/Contato";

const WHATSAPP_LINK = "https://wa.me/5563992544417";
const HERO_ILLUSTRATION = "https://media.base44.com/images/public/6a47fd721adb1f32b231e32a/dca7282af_generated_image.png";

export default function Home() {
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-blue-700">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.1] tracking-tight mb-6">
                Soluções contábeis inteligentes para sua empresa{" "}
                <span className="text-teal-400">crescer com segurança.</span>
              </h1>

              <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed mb-8 max-w-xl">
                Consultoria Contábil, Fiscal, Tributária e Pessoal para empresas e MEIs.
              </p>

              <div className="flex flex-row flex-wrap gap-4">
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener">
                  <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white px-6 sm:px-8 h-13 text-sm sm:text-base shadow-lg shadow-teal-900/30">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Falar com especialista
                  </Button>
                </a>
                <Link to="/servicos">
                  <Button size="lg" variant="outline" className="border-white/40 text-white bg-transparent hover:bg-white/10 px-6 sm:px-8 h-13 text-sm sm:text-base">
                    Abrir empresa
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <img src={HERO_ILLUSTRATION} alt="Ilustração de crescimento contábil" className="w-full max-w-lg mx-auto" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick links - mobile only */}
      <QuickLinksMobile />

      {/* All pages as infinite scroll sections */}
      <div id="sobre" className="scroll-mt-16">
        <Sobre />
      </div>
      <div id="servicos" className="scroll-mt-16">
        <Servicos />
      </div>
      <div id="beneficios" className="scroll-mt-16">
        <Beneficios />
      </div>
      <div id="contato" className="scroll-mt-16">
        <Contato />
      </div>
    </div>
  );
}