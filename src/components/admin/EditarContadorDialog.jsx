import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function EditarContadorDialog({ open, onOpenChange, contador, onSaved }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contador) {
      setName(contador.display_name || contador.full_name || "");
      setPhone(contador.phone || "");
    }
  }, [contador]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.functions.invoke('manageContadores', { action: 'update', userId: contador.id, name, phone });
      toast({ title: "Dados atualizados!" });
      onOpenChange(false);
      onSaved && onSaved();
    } catch {
      toast({ title: "Erro ao salvar dados", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Editar Perfil do Contador</DialogTitle></DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Nome</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do contador" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
            <Input value={contador?.email || ""} disabled />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Telefone</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(63) 99999-9999" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800">{saving ? "Salvando..." : "Salvar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}