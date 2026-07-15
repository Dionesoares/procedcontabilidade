import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function BalanceteHeaderEditDialog({ open, onOpenChange, data, onSave }) {
  const [form, setForm] = useState({ companyName: "", cnpj: "", address: "", folha: "0001", numeroLivro: "0001" });

  useEffect(() => {
    if (open) setForm(data || { companyName: "", cnpj: "", address: "", folha: "0001", numeroLivro: "0001" });
  }, [open, data]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Cabeçalho do Balancete</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Empresa (Razão Social)</Label>
            <Input value={form.companyName} onChange={set("companyName")} />
          </div>
          <div>
            <Label>C.N.P.J</Label>
            <Input value={form.cnpj} onChange={set("cnpj")} />
          </div>
          <div>
            <Label>Endereço</Label>
            <Input value={form.address} onChange={set("address")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Folha</Label>
              <Input value={form.folha} onChange={set("folha")} />
            </div>
            <div>
              <Label>Número do Livro</Label>
              <Input value={form.numeroLivro} onChange={set("numeroLivro")} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-blue-700 hover:bg-blue-800" onClick={() => onSave(form)}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}