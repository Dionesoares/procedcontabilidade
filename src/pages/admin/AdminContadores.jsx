import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, KeyRound, UserCog, Trash2 } from "lucide-react";
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
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const users = await base44.entities.User.list();
      setContadores(users.filter(u => u.role === "admin"));
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ name: "", email: "", phone: "" }); setDialogOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.users.inviteUser(form.email, "admin");
      if (form.phone) handleSendAccess(form);
      toast({ title: "Contador cadastrado!", description: "E-mail de convite enviado para criar a senha de acesso." });
      setDialogOpen(false);
      load();
    } catch {
      toast({ title: "Erro ao cadastrar", description: "Verifique se o e-mail já não está cadastrado.", variant: "destructive" });
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
    const registerLink = `${window.location.origin}/register`;
    const message = `Olá, ${c.name || ""}! Seu cadastro como Contador foi criado na plataforma Proced Contabilidade. Para ativar seu acesso, acesse este link: ${registerLink} e crie sua senha de acesso usando o email ${c.email}. Depois de criar sua senha, é só fazer login normalmente no site.`;
    const phoneDigits = c.phone.replace(/\D/g, "");
    window.open(`https://wa.me/55${phoneDigits}?text=${encodeURIComponent(message)}`, "_blank");
    toast({ title: "WhatsApp aberto!", description: "Envie o link para o contador criar a senha de acesso." });
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-heading font-bold text-2xl text-slate-900">Contadores</h1>
        <Button onClick={openNew} className="bg-blue-700 hover:bg-blue-800">
          <Plus className="w-4 h-4 mr-1" /> Novo Contador
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
                    <td className="px-4 py-3 font-medium text-slate-900">{c.full_name || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{c.email}</td>
                    <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Contador</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleSendAccess({ ...c, phone: "" })} title="Reenviar acesso" className="p-1.5 text-slate-400 hover:text-green-600 rounded" disabled={!c.phone}>
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
            <DialogTitle className="flex items-center gap-2"><UserCog className="w-5 h-5 text-blue-600" /> Novo Contador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Nome</label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nome do contador" /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Email*</label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="email@exemplo.com" /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Telefone</label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="(63) 99999-9999" /></div>
            <p className="text-xs text-slate-400">O contador receberá um e-mail para criar a senha e um link será aberto no WhatsApp para envio manual.</p>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800">{saving ? "Salvando..." : "Cadastrar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}