import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Repeat, CircleDollarSign } from "lucide-react";
import TipoSelect from "@/components/financeiro/TipoSelect";
import DescricaoSelect from "@/components/financeiro/DescricaoSelect";

const emptyForm = {
  description: "",
  type: "Receita",
  type_label: "Receita",
  amount: "",
  due_date: "",
  status: "Pendente",
  client_id: "",
  is_recurring: false,
  recurrence_frequency: "Mensal",
  recurrence_count: 12,
  is_partial: false,
  amount_paid: "",
};

function isPartialRecord(record) {
  const paid = Number(record?.amount_paid || 0);
  const amount = Number(record?.amount || 0);
  return record?.status === "Parcial" || (paid > 0 && amount > 0 && paid < amount);
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const NO_CLIENT = "__none__";

export default function FinanceiroFormDialog({ open, onOpenChange, record, onSave, clients = [] }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (!record) {
        setForm(emptyForm);
        return;
      }
      const partial = isPartialRecord(record);
      setForm({
        ...emptyForm,
        ...record,
        client_id: record.client_id || "",
        due_date: record.due_date ? String(record.due_date).slice(0, 10) : "",
        is_partial: partial,
        amount_paid: partial ? String(record.amount_paid ?? "") : "",
      });
    }
  }, [open, record]);

  const billedAmount = Number(form.amount) || 0;
  const paidAmount = Number(form.amount_paid) || 0;
  const remainingAmount = Math.max(0, billedAmount - paidAmount);
  const showPartial = form.type === "Receita";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === form.client_id);
    const amount = Number(form.amount) || 0;
    const wantsPartial = showPartial && form.is_partial;
    let amountPaid = 0;
    let status = form.status;

    if (wantsPartial) {
      amountPaid = Number(form.amount_paid) || 0;
      if (amountPaid <= 0 || amountPaid >= amount) {
        return;
      }
      status = "Parcial";
    } else if (status === "Pago") {
      amountPaid = amount;
    } else if (status === "Parcial") {
      status = "Pendente";
    }

    setSaving(true);
    try {
      await onSave({
        description: form.description,
        type: form.type,
        type_label: form.type_label,
        amount,
        amount_paid: amountPaid,
        due_date: form.due_date || null,
        status,
        client_id: form.client_id || null,
        client_name: client ? (client.company_name || client.name) : null,
        is_recurring: !record ? form.is_recurring : false,
        recurrence_frequency: !record && form.is_recurring ? form.recurrence_frequency : null,
        recurrence_count: !record && form.is_recurring ? Number(form.recurrence_count) || 1 : 1,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? "Editar Lançamento" : "Novo Lançamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Descrição*</label>
            <DescricaoSelect value={form.description} onChange={(v) => setForm({ ...form, description: v })} scope="lancamento" />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Selecionar Cliente</label>
            <Select
              value={form.client_id || NO_CLIENT}
              onValueChange={(v) => setForm({ ...form, client_id: v === NO_CLIENT ? "" : v })}
            >
              <SelectTrigger><SelectValue placeholder="Nenhum (lançamento geral)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CLIENT}>Nenhum (lançamento geral)</SelectItem>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name || c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Tipo*</label>
              <TipoSelect
                value={form.type}
                label={form.type_label}
                onChange={({ type, type_label }) => setForm({
                  ...form,
                  type,
                  type_label,
                  ...(type !== "Receita"
                    ? { is_partial: false, amount_paid: "", status: form.status === "Parcial" ? "Pendente" : form.status }
                    : {}),
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Valor*</label>
              <Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Vencimento</label>
              <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Status*</label>
              <Select
                value={form.is_partial && showPartial ? "Parcial" : form.status}
                onValueChange={(v) => {
                  if (v === "Parcial") {
                    setForm({ ...form, status: "Parcial", is_partial: true });
                    return;
                  }
                  setForm({
                    ...form,
                    status: v,
                    is_partial: false,
                    amount_paid: v === "Pago" ? String(form.amount || "") : "",
                  });
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Atrasado">Atrasado</SelectItem>
                  {showPartial && <SelectItem value="Parcial">Parcial</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showPartial && (
            <div className="rounded-lg border border-slate-200 p-3 space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={form.is_partial}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm({
                      ...form,
                      is_partial: checked,
                      status: checked ? "Parcial" : (form.status === "Parcial" ? "Pendente" : form.status),
                      amount_paid: checked ? form.amount_paid : "",
                    });
                  }}
                />
                <CircleDollarSign className="w-4 h-4 text-slate-500" />
                Recebimento parcial
              </label>

              {form.is_partial && (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Valor recebido*</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={billedAmount > 0 ? billedAmount - 0.01 : undefined}
                      value={form.amount_paid}
                      onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
                      required
                      placeholder="0.00"
                    />
                  </div>
                  {billedAmount > 0 && paidAmount > 0 && paidAmount < billedAmount && (
                    <p className="text-xs text-slate-500">
                      Restante a receber: <span className="font-medium text-slate-700">R$ {formatMoney(remainingAmount)}</span>
                    </p>
                  )}
                  {paidAmount > 0 && paidAmount >= billedAmount && (
                    <p className="text-xs text-amber-600">
                      O valor recebido precisa ser menor que o valor do lançamento. Se o cliente pagou tudo, use o status Pago.
                    </p>
                  )}
                  {form.is_recurring && !record && (
                    <p className="text-xs text-slate-400">
                      O recebimento parcial vale só para o primeiro lançamento da recorrência. Os demais ficam como Pendente.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {!record && (
            <div className="rounded-lg border border-slate-200 p-3 space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={form.is_recurring}
                  onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })}
                />
                <Repeat className="w-4 h-4 text-slate-500" />
                Repetir lançamento (recorrência)
              </label>

              {form.is_recurring && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Frequência</label>
                    <Select value={form.recurrence_frequency} onValueChange={(v) => setForm({ ...form, recurrence_frequency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Semanal">Semanal</SelectItem>
                        <SelectItem value="Mensal">Mensal</SelectItem>
                        <SelectItem value="Anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Repetições</label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={form.recurrence_count}
                      onChange={(e) => setForm({ ...form, recurrence_count: e.target.value })}
                    />
                  </div>
                  <p className="col-span-2 text-xs text-slate-400">
                    Serão criados {Math.max(1, Number(form.recurrence_count) || 1)} lançamentos, a partir da data de vencimento informada.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button
              type="submit"
              disabled={saving || (showPartial && form.is_partial && (paidAmount <= 0 || paidAmount >= billedAmount))}
              className="bg-blue-700 hover:bg-blue-800"
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
