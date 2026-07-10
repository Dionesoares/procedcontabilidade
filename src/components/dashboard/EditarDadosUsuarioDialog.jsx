import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function EditarDadosUsuarioDialog({ open, onOpenChange, user, onSaved }) {
  const { toast } = useToast();
  const [name, setName] = useState(user?.display_name || user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.auth.updateMe({ phone, display_name: name });
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
        <DialogHeader><DialogTitle>Editar Meus Dados</DialogTitle></DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Nome</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
            <Input value={user?.email || ""} disabled />
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