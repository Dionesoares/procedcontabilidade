import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const emptyForm = { client_id: "", description: "", amount: "", due_date: "" };

export default function CobrancaDialog({ open, onOpenChange, onCharged }) {
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      base44.entities.Client.list().then(setClients).catch(() => setClients([]));
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const client = clients.find(c => c.id === form.client_id);
    if (!client) return;
    setSaving(true);
    try {
      await base44.entities.FinancialRecord.create({
        description: form.description,
        client_id: client.id,
        client_name: client.name,
        type: "Receita",
        amount: Number(form.amount) || 0,
        due_date: form.due_date,
        status: "Pendente",
      });
      await base44.entities.Message.create({
        client_id: client.id,
        sender_type: "admin",
        sender_name: "Financeiro",
        content: `Nova cobrança: ${form.description} - R$ ${Number(form.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}${form.due_date ? ` (venc. ${new Date(form.due_date + "T00:00:00").toLocaleDateString("pt-BR")})` : ""}`,
        is_read: false,
      });
      toast({ title: "Cobrança enviada!", description: `O cliente ${client.name} foi notificado.` });
      onOpenChange(false);
      onCharged?.();
    } catch {
      toast({ title: "Erro ao enviar cobrança", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cobrar Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Cliente*</label>
            <Select value={form.client_id} onValueChange={v => setForm({ ...form, client_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
              <SelectContent>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Descrição*</label>
            <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="Ex: Honorários contábeis - Julho" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Valor*</label>
              <Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="0.00" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Vencimento</label>
              <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </div>
          </div>
          <p className="text-xs text-slate-400">O cliente receberá uma notificação sobre esta cobrança no painel dele.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving || !form.client_id} className="bg-blue-700 hover:bg-blue-800">{saving ? "Enviando..." : "Enviar Cobrança"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}