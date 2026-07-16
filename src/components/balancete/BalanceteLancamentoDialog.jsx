import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { buildCategoriaOptions } from "@/lib/chartOfAccounts";
import NovaContaDialog from "@/components/balancete/NovaContaDialog";

const emptyForm = { categoria: "", descricao: "", tipo: "Débito", amount: "", due_date: "" };
const NEW_ACCOUNT_VALUE = "__nova_conta__";

export default function BalanceteLancamentoDialog({ open, onOpenChange, lancamento, onSave, customAccounts = [], onAccountCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [novaContaOpen, setNovaContaOpen] = useState(false);

  useEffect(() => {
    if (open) setForm(lancamento ? { ...emptyForm, ...lancamento } : emptyForm);
  }, [open, lancamento]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, amount: Number(form.amount) || 0 });
    setSaving(false);
  };

  const handleCategoriaChange = (v) => {
    if (v === NEW_ACCOUNT_VALUE) { setNovaContaOpen(true); return; }
    setForm({ ...form, categoria: v });
  };

  const handleContaCreated = (conta) => {
    onAccountCreated?.(conta);
    setForm({ ...form, categoria: `custom_${conta.id}` });
    setNovaContaOpen(false);
  };

  const allOptions = buildCategoriaOptions(customAccounts);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{lancamento ? "Editar Lançamento" : "Novo Lançamento"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Conta Contábil*</label>
              <Select value={form.categoria} onValueChange={handleCategoriaChange}>
                <SelectTrigger><SelectValue placeholder="Selecione a conta" /></SelectTrigger>
                <SelectContent>
                  {allOptions.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  <SelectSeparator />
                  <SelectItem value={NEW_ACCOUNT_VALUE} className="text-blue-700 font-medium">+ Criar nova conta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Descrição</label>
              <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Fornecedor XPTO, Venda de mercadorias..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Tipo*</label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Débito">Débito</SelectItem>
                    <SelectItem value="Crédito">Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Valor*</label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Data</label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving || !form.categoria} className="bg-blue-700 hover:bg-blue-800">{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <NovaContaDialog open={novaContaOpen} onOpenChange={setNovaContaOpen} onCreated={handleContaCreated} />
    </>
  );
}