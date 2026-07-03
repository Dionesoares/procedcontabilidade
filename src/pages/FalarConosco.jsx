import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const serviceTypes = [
  "Abertura de Empresa",
  "Contabilidade Completa",
  "Regularização de MEI",
  "Planejamento Tributário",
  "Departamento Pessoal",
  "Consultoria Contábil",
  "Outro",
];

export default function FalarConosco() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ client_name: "", client_email: "", client_phone: "", service_type: "", description: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.entities.ServiceRequest.create(form);
      toast({ title: "Solicitação enviada!", description: "Nosso especialista entrará em contato em breve." });
      setForm({ client_name: "", client_email: "", client_phone: "", service_type: "", description: "" });
    } catch {
      toast({ title: "Erro ao enviar", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="py-24 bg-gradient-to-br from-slate-50 to-white min-h-[80vh]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <MessageSquare className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="font-heading font-bold text-4xl text-slate-900 mb-3">Falar com Especialista</h1>
            <p className="text-slate-500 text-lg">Preencha o formulário e entraremos em contato rapidamente.</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nome Completo</label>
                <Input value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} required placeholder="Seu nome" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
                <Input type="email" value={form.client_email} onChange={e => setForm({...form, client_email: e.target.value})} required placeholder="seu@email.com" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Telefone</label>
                <Input value={form.client_phone} onChange={e => setForm({...form, client_phone: e.target.value})} placeholder="(11) 99999-9999" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Serviço de Interesse</label>
                <Select value={form.service_type} onValueChange={v => setForm({...form, service_type: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Mensagem</label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} placeholder="Conte-nos sobre sua necessidade..." />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-emerald-700 hover:bg-emerald-800 h-12 text-base">
              {loading ? "Enviando..." : "Enviar Solicitação"}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </motion.form>
        </div>
      </section>
    </div>
  );
}