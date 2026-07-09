import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, KeyRound, UserCog, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminContadores() {
  const { toast } = useToast();
  const [contadores, setContadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const users = await base44.entities.User.list();
      setContadores(users.filter(u => u.role === "contador"));
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ name: "", email: "", phone: "", password: "" }); setDialogOpen(true); };

  const findUserByEmail = async (email, attempts = 5) => {
    for (let i = 0; i < attempts; i++) {
      const users = await base44.entities.User.list();
      const found = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (found) return found;
      await new Promise(r => setTimeout(r, 1000));
    }
    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      try {
        const existing = await findUserByEmail(form.email, 1);
        if (existing) {
          await base44.entities.User.update(existing.id, { role: "contador", display_name: form.name, phone: form.phone });
        } else {
          await base44.users.inviteUser(form.email, "admin");
          const created = await findUserByEmail(form.email, 6);
          if (created) {
            await base44.entities.User.update(created.id, { role: "contador", display_name: form.name, phone: form.phone });
          } else {
            toast({ title: "Contador convidado, mas o acesso ao painel precisa ser confirmado manualmente.", variant: "destructive" });
          }
        }
        toast({ title: "Convite enviado!", description: "E-mail de convite enviado para criar a senha de acesso." });
      } catch {
        toast({ title: "Contador cadastrado!", description: "Não foi possível enviar o e-mail de convite automaticamente.", variant: "destructive" });
      }
      if (form.phone) handleSendAccess(form);
      setDialogOpen(false);
      load();
    } catch {
      toast({ title: "Erro ao cadastrar", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!confirm("Excluir este contador? O usuário será removido do sistema, permitindo novo cadastro com o mesmo email.")) return;
    try {
      await base44.entities.User.delete(c.id);
      toast({ title: "Contador excluído do sistema!" });
      load();
    } catch { toast({ title: "Erro ao excluir", variant: "destructive" }); }
  };

  const handleSendAccess = (c) => {
    const senhaInfo = c.password ? ` Sugestão de senha: ${c.password}` : "";
    const message = `Olá, ${c.name || ""}! Você foi cadastrado como Contador na plataforma Proced Contabilidade, com acesso total ao painel do sistema. Verifique seu email (${c.email}) e clique no link "Aceitar Convite" que enviamos para criar sua senha e ativar seu acesso.${senhaInfo} Depois disso, é só fazer login normalmente no site.`;
    const phoneDigits = c.phone.replace(/\D/g, "");
    window.open(`https://wa.me/55${phoneDigits}?text=${encodeURIComponent(message)}`, "_blank");
    toast({ title: "WhatsApp aberto!", description: "Envie o convite para o contador criar seu acesso." });
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">Contadores</h1>
          <p className="text-sm text-slate-500 mt-1">Contadores têm acesso total ao Painel do Administrador e podem cadastrar novos contadores.</p>
        </div>
        <Button onClick={openNew} className="bg-blue-700 hover:bg-blue-800">
          <Send className="w-4 h-4 mr-1" /> Enviar Convite
        </Button>
      </div>

      {contadores.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Nenhum contador cadastrado.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Nome</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3">Perfil</th>
                  <th className="text-right px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contadores.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{c.full_name || c.display_name || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{c.email}</td>
                    <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Contador</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleSendAccess({ name: c.full_name || c.display_name, email: c.email, phone: c.phone, password: "" })} title="Reenviar convite" className="p-1.5 text-slate-400 hover:text-green-600 rounded" disabled={!c.phone}>
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c)} title="Excluir" className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserCog className="w-5 h-5 text-blue-600" /> Enviar Convite de Contador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Nome*</label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Nome do contador" /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Email*</label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="email@exemplo.com" /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Telefone*</label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required placeholder="(63) 99999-9999" /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Senha sugerida*</label><Input value={form.password} onChange={e => setForm({...form, password: e.target.value})} required placeholder="Senha de acesso" /></div>
            <p className="text-xs text-slate-400">O contador receberá um convite por e-mail e um link será aberto no WhatsApp com os dados de acesso. Ao criar a conta, o contador tem acesso total ao painel do sistema.</p>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800">{saving ? "Enviando..." : "Enviar Convite"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}