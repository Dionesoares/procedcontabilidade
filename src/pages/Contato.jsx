import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContactSubmission } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";

const WHATSAPP_LINK = "https://wa.me/5563992544417";

const info = [
  { icon: Mail, label: "Email", value: "procedcontab@gmail.com" },
  { icon: Phone, label: "Telefone", value: "(63) 99254-4417" },
  {
    icon: MapPin,
    label: "Endereço",
    value: "Rua Porto Nacional Qd 28 Lt 15, Orla Oeste - Luzimangues / Porto Nacional CEP. 77.502-000",
  },
  { icon: Clock, label: "Horário", value: "Seg-Sex: 8h às 18h" },
];

export default function Contato({ embedded = false }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ContactSubmission.create(form);
      toast({ title: "Mensagem enviada!", description: "Entraremos em contato em breve." });
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast({ title: "Erro ao enviar", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="py-20 sm:py-24 bg-navy-deep text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex text-[11px] font-bold tracking-wider text-slate-300 border border-white/10 px-3 py-1 rounded-full mb-5">
            O PRIMEIRO PASSO É UMA CONVERSA
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight mb-4">
            Pronto para transformar sua empresa com uma{" "}
            <span className="text-brand">contabilidade inteligente?</span>
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            Converse com um especialista, entenda o seu cenário e receba uma proposta sob medida para o porte da sua
            empresa.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-brand text-white font-semibold text-sm hover:brightness-110 transition"
            >
              <MessageCircle className="w-4 h-4" /> Falar no WhatsApp
            </a>
            <Link
              to="/falar-conosco"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-brand text-white font-semibold text-sm hover:brightness-110 transition"
            >
              Solicitar proposta <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-300 mb-4">
            {["Sem compromisso", "Resposta em até 2h", "Especialista dedicado"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                {t}
              </span>
            ))}
          </div>
          <p className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            LGPD em conformidade
          </p>
        </div>
      </section>

      <section className={`${embedded ? "" : "pt-8"} scroll-mt-24 py-20 sm:py-24 bg-surface`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-14"
          >
            <span className="inline-flex text-[11px] font-bold tracking-wider text-navy bg-white border border-slate-200 px-3 py-1 rounded-full mb-4">
              CONTATO
            </span>
            <h2 className="font-heading font-extrabold text-4xl sm:text-5xl text-navy mb-4 tracking-tight">
              Entre em contato
            </h2>
            <p className="text-lg text-slate-500">Estamos prontos para ajudar sua empresa a continuar crescendo.</p>
            <a
              href={`${WHATSAPP_LINK}?text=${encodeURIComponent("Olá! Gostaria de falar com o contador.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 h-11 px-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Falar no WhatsApp
            </a>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {info.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="font-medium text-navy">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nome</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      placeholder="Seu nome"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      placeholder="seu@email.com"
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Telefone</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(63) 99254-4417"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Mensagem</label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={4}
                    placeholder="Como podemos ajudar?"
                    className="rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-full bg-brand hover:brightness-110 text-white"
                >
                  {loading ? "Enviando..." : "Enviar Mensagem"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
