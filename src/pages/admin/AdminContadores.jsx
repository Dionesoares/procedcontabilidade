import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, KeyRound, UserCog, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function AdminContadores() {
  const { toast } = useToast();
  const [contadores, setContadores] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('manageContadores', { action: 'list' });
      setContadores(res?.data?.contadores || []);
      const invites = await base44.entities.ContadorInvite.list();
      setPendingInvites(invites);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ name: "", email: "", phone: "", password: "" }); setDialogOpen(true); };

  const findUserByEmail = async (email) => {
    const res = await base44.functions.invoke('manageContadores', { action: 'findByEmail', email });
    return res?.data?.user || null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const existing = await findUserByEmail(form.email);
      if (existing && existing.full_name) {
        // Já possui conta ativa: apenas concede o acesso de contador.
        await base44.functions.invoke('manageContadores', { action: 'grantAccess', userId: existing.id, name: form.name, phone: form.phone });
        toast({ title: "Contador atualizado!", description: "O acesso ao painel do contador foi concedido." });
      } else {
        // Ainda não tem conta: cria/atualiza um convite pendente que será aplicado no cadastro.
        const invites = await base44.entities.ContadorInvite.filter({ email: form.email });
        if (invites.length > 0) {
          await base44.entities.ContadorInvite.update(invites[0].id, { name: form.name, phone: form.phone });
        } else {
          await base44.entities.ContadorInvite.create({ name: form.name, email: form.email, phone: form.phone });
        }
        toast({ title: "Convite criado!", description: "Envie o link pelo WhatsApp para o contador se cadastrar." });
      }
      handleSendAccess(form);
      setDialogOpen(false);
      load();
    } catch {
      toast({ title: "Erro ao criar convite", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!confirm("Excluir este contador? O usuário será removido do sistema, permitindo novo cadastro com o mesmo email.")) return;
    try {
      await base44.functions.invoke('manageContadores', { action: 'delete', userId: c.id });
      toast({ title: "Contador excluído do sistema!" });
      load();
    } catch { toast({ title: "Erro ao excluir", variant: "destructive" }); }
  };

  const handleDeleteInvite = async (invite) => {
    if (!confirm("Cancelar este convite pendente?")) return;
    try {
      await base44.entities.ContadorInvite.delete(invite.id);
      toast({ title: "Convite cancelado!" });
      load();
    } catch { toast({ title: "Erro ao cancelar convite", variant: "destructive" }); }
  };

  const handleSendAccess = (c) => {
    const registerLink = `${window.location.origin}/register`;
    const senhaInfo = c.password ? ` Sugestão de senha: ${c.password}.` : "";
    const message = `Olá, ${c.name || ""}! Você foi cadastrado como Contador na plataforma Proced Contabilidade, com acesso total ao painel do sistema. Para ativar seu acesso, acesse este link: ${registerLink} e crie sua conta usando exatamente o email ${c.email}.${senhaInfo} Assim que finalizar o cadastro, você já entrará direto no painel do contador com acesso total.`;
    const phoneDigits = (c.phone || "").replace(/\D/g, "");
    if (!phoneDigits) return;
    window.open(`https://wa.me/55${phoneDigits}?text=${encodeURIComponent(message)}`, "_blank");
    toast({ title: "WhatsApp aberto!", description: "Envie o link para o contador se cadastrar." });
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
                    <td className="px-4 py-3 font-medium text-slate-900">{c.display_name || c.full_name || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{c.email}</td>
                    <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Contador</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleSendAccess({ name: c.display_name || c.full_name, email: c.email, phone: c.phone })} title="Reenviar link" className="p-1.5 text-slate-400 hover:text-green-600 rounded" disabled={!c.phone}>
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

      {pendingInvites.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading font-semibold text-lg text-slate-900 mb-3">Convites Pendentes</h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">Nome</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Email</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingInvites.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{inv.name || "—"}</td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{inv.email}</td>
                      <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Aguardando cadastro</span></td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleSendAccess({ name: inv.name, email: inv.email, phone: inv.phone })} title="Reenviar link" className="p-1.5 text-slate-400 hover:text-green-600 rounded" disabled={!inv.phone}>
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteInvite(inv)} title="Cancelar convite" className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <p className="text-xs text-slate-400">O link de cadastro será enviado pelo WhatsApp. Assim que o contador criar a conta com o email informado, ele já entra direto no painel do contador com acesso total.</p>
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