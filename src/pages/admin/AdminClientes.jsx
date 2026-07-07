import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Edit, Trash2, X, KeyRound, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const emptyForm = { name: "", email: "", phone: "", cpf_cnpj: "", company_name: "", company_type: "", address: "", notes: "", status: "Ativo" };

export default function AdminClientes() {
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setClients(await base44.entities.Client.list("-created_date", 1000)); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name || "", email: c.email || "", phone: c.phone || "", cpf_cnpj: c.cpf_cnpj || "", company_name: c.company_name || "", company_type: c.company_type || "", address: c.address || "", notes: c.notes || "", status: c.status || "Ativo" }); setDialogOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await base44.entities.Client.update(editing.id, form);
        toast({ title: "Cliente atualizado!" });
      } else {
        await base44.entities.Client.create(form);
        toast({ title: "Cliente criado!" });
        await handleSendAccess(form);
      }
      setDialogOpen(false);
      load();
    } catch { toast({ title: "Erro ao salvar", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Excluir este cliente?")) return;
    try { await base44.entities.Client.delete(id); load(); } catch {}
  };

  const handleLink = async (c) => {
    try {
      const users = await base44.entities.User.filter({ email: c.email });
      if (!users.length) { toast({ title: "Cliente ainda não possui conta de login", description: "Envie a senha de acesso primeiro.", variant: "destructive" }); return; }
      await base44.entities.Client.update(c.id, { user_id: users[0].id });
      toast({ title: "Cliente vinculado com sucesso!" });
      load();
    } catch { toast({ title: "Erro ao vincular cliente", variant: "destructive" }); }
  };

  const generateAccessPassword = () => {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
    const digits = "23456789";
    let pass = "";
    for (let i = 0; i < 5; i++) pass += letters[Math.floor(Math.random() * letters.length)];
    for (let i = 0; i < 3; i++) pass += digits[Math.floor(Math.random() * digits.length)];
    return pass;
  };

  const handleSendAccess = async (c) => {
    if (!c.email) { toast({ title: "Cliente sem email cadastrado", variant: "destructive" }); return; }
    if (!c.phone) { toast({ title: "Cliente sem telefone cadastrado", variant: "destructive" }); return; }
    const accessPassword = generateAccessPassword();
    try {
      await base44.users.inviteUser(c.email, "user");
      const instructions = `Sua senha de acesso à Área do Cliente é: ${accessPassword}. Acesse o site, clique em "Área do Cliente" > "Criar uma conta" e use este email e essa senha para ativar seu login. Você poderá alterá-la a qualquer momento pela opção "Redefinir Senha" no seu painel.`;
      await base44.integrations.Core.SendEmail({
        to: c.email,
        subject: "Sua senha de acesso à Área do Cliente",
        body: `Olá, ${c.name || ""}!\n\n${instructions}`,
      });
      const message = `Olá, ${c.name || ""}! ${instructions}`;
      const phoneDigits = c.phone.replace(/\D/g, "");
      window.open(`https://wa.me/55${phoneDigits}?text=${encodeURIComponent(message)}`, "_blank");
      toast({ title: "Senha de acesso enviada!", description: "Enviamos por email e abrimos o WhatsApp para você confirmar o envio." });
    } catch (err) {
      toast({ title: "Erro ao gerar senha de acesso", description: err?.message, variant: "destructive" });
    }
  };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf_cnpj?.includes(search)
  );

  const statusColor = { Ativo: "bg-blue-100 text-blue-700", Inativo: "bg-slate-100 text-slate-600", Pendente: "bg-amber-100 text-amber-700" };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-heading font-bold text-2xl text-slate-900">Clientes</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={openNew} className="bg-blue-700 hover:bg-blue-800 shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Nenhum cliente encontrado.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Nome</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">CPF/CNPJ</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Empresa</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{c.email}</td>
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{c.cpf_cnpj}</td>
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{c.company_name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[c.status] || "bg-slate-100 text-slate-600"}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!c.user_id && (
                          <button onClick={() => handleLink(c)} title="Vincular cliente" className="p-1.5 text-slate-400 hover:text-purple-600 rounded"><Link2 className="w-4 h-4" /></button>
                        )}
                        <button onClick={() => handleSendAccess(c)} title="Enviar senha de acesso" className="p-1.5 text-slate-400 hover:text-green-600 rounded"><KeyRound className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-slate-700 mb-1 block">Nome*</label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div><label className="text-sm font-medium text-slate-700 mb-1 block">Email*</label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-slate-700 mb-1 block">CPF/CNPJ*</label><Input value={form.cpf_cnpj} onChange={e => setForm({...form, cpf_cnpj: e.target.value})} required /></div>
              <div><label className="text-sm font-medium text-slate-700 mb-1 block">Telefone</label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-slate-700 mb-1 block">Razão Social</label><Input value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} /></div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Tipo de Empresa</label>
                <Select value={form.company_type} onValueChange={v => setForm({...form, company_type: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{["MEI","ME","EPP","LTDA","SA","Outro"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Endereço</label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Ativo","Inativo","Pendente"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Observações</label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} /></div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800">{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}