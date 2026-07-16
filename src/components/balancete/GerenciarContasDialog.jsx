import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Trash2, RotateCcw, Check, X } from "lucide-react";
import { buildManagedAccountsList, BASE_ACCOUNT_GRUPO } from "@/lib/chartOfAccounts";

export default function GerenciarContasDialog({ open, onOpenChange, customAccounts, onAccountsChanged }) {
  const { toast } = useToast();
  const [editingKey, setEditingKey] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const items = buildManagedAccountsList(customAccounts);

  const startEdit = (item) => { setEditingKey(item.key); setEditLabel(item.label); };
  const cancelEdit = () => { setEditingKey(null); setEditLabel(""); };

  const saveEdit = async (item) => {
    if (!editLabel.trim()) return;
    setSaving(true);
    try {
      if (item.isBase) {
        if (item.overrideId) {
          await base44.entities.ContaContabil.update(item.overrideId, { label: editLabel.trim() });
        } else {
          await base44.entities.ContaContabil.create({ label: editLabel.trim(), grupo: BASE_ACCOUNT_GRUPO[item.key], base_categoria: item.key });
        }
      } else {
        await base44.entities.ContaContabil.update(item.id, { label: editLabel.trim() });
      }
      toast({ title: "Conta atualizada!" });
      cancelEdit();
      onAccountsChanged();
    } catch {
      toast({ title: "Erro ao atualizar conta", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleHiddenBase = async (item) => {
    try {
      if (item.overrideId) {
        await base44.entities.ContaContabil.update(item.overrideId, { hidden: !item.hidden });
      } else {
        await base44.entities.ContaContabil.create({ label: item.label, grupo: BASE_ACCOUNT_GRUPO[item.key], base_categoria: item.key, hidden: true });
      }
      toast({ title: item.hidden ? "Conta restaurada!" : "Conta excluída!" });
      onAccountsChanged();
    } catch {
      toast({ title: "Erro ao atualizar conta", variant: "destructive" });
    }
  };

  const deleteCustom = async (item) => {
    if (!confirm("Excluir esta conta contábil? Lançamentos já feitos com ela deixarão de aparecer no balancete.")) return;
    try {
      await base44.entities.ContaContabil.delete(item.id);
      toast({ title: "Conta excluída!" });
      onAccountsChanged();
    } catch {
      toast({ title: "Erro ao excluir conta", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerenciar Contas Contábeis</DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2.5 gap-2">
              {editingKey === item.key ? (
                <>
                  <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="h-8" autoFocus />
                  <button onClick={() => saveEdit(item)} disabled={saving} className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Check className="w-4 h-4" /></button>
                  <button onClick={cancelEdit} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><X className="w-4 h-4" /></button>
                </>
              ) : (
                <>
                  <span className={`text-sm ${item.hidden ? "text-slate-400 line-through" : "text-slate-700"}`}>{item.label}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(item)} title="Editar" className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Pencil className="w-4 h-4" /></button>
                    {item.isBase ? (
                      <button onClick={() => toggleHiddenBase(item)} title={item.hidden ? "Restaurar" : "Excluir"} className="p-1.5 text-slate-400 hover:text-red-600 rounded">
                        {item.hidden ? <RotateCcw className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    ) : (
                      <button onClick={() => deleteCustom(item)} title="Excluir" className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}