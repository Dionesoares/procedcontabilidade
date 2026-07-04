import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const info = [
  { icon: Mail, label: "Email", value: "procedcontab@gmail.com" },
  { icon: Phone, label: "Telefone", value: "(63)992544417" },
  { icon: MapPin, label: "Endereço", value: "Palmas, TO" },
  { icon: Clock, label: "Horário", value: "Seg-Sex: 8h às 18h" },
];

export default function Contato() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.entities.ContactSubmission.create(form);
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
      <section className="py-24 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mb-14">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3">Contato</p>
            <h1 className="font-heading font-bold text-4xl sm:text-5xl text-slate-900 mb-4">Entre em Contato</h1>
            <p className="text-lg text-slate-500">Estamos prontos para ajudar sua empresa.</p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-12">
            {/* Info */}
            <div className="lg:col-span-2 space-y-6">
              {info.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="font-medium text-slate-700">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nome</label>
                    <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Seu nome" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
                    <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="seu@email.com" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Telefone</label>
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="(63) 992544417" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Mensagem</label>
                  <Textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} required rows={4} placeholder="Como podemos ajudar?" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 h-11">
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