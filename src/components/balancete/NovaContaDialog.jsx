import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const GRUPO_OPTIONS = [
  { value: "ativo", label: "Ativo" },
  { value: "passivo", label: "Passivo" },
  { value: "despesas", label: "Despesas" },
  { value: "receitas", label: "Receitas" },
];

export default function NovaContaDialog({ open, onOpenChange, onCreated }) {
  const { toast } = useToast();
  const [label, setLabel] = useState("");
  const [grupo, setGrupo] = useState("ativo");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setLabel(""); setGrupo("ativo"); }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    setSaving(true);
    try {
      const conta = await base44.entities.ContaContabil.create({ label: label.trim(), grupo });
      toast({ title: "Conta contábil criada!" });
      onCreated(conta);
    } catch {
      toast({ title: "Erro ao criar conta", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nova Conta Contábil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Nome da Conta*</label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Veículos" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Grupo*</label>
            <Select value={grupo} onValueChange={setGrupo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GRUPO_OPTIONS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving || !label.trim()} className="bg-blue-700 hover:bg-blue-800">{saving ? "Salvando..." : "Criar Conta"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}