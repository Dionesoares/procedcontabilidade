import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { fillContractTemplate } from "@/lib/contractTemplate";

export default function ContratoDialog({ open, onOpenChange, client, contract, onSave }) {
  const [content, setContent] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (open) {
      setContent(contract?.content || fillContractTemplate(client));
      setSignatureName(contract?.signature_name || client?.name || "");
      setSigned(contract?.status === "Assinado");
    }
  }, [open, contract, client]);

  const handleSave = () => {
    onSave({
      ...contract,
      content,
      signature_name: signatureName,
      status: signed ? "Assinado" : "Pendente",
      signed_at: signed ? new Date().toISOString() : "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Contrato de Prestação de Serviços</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto space-y-4 pr-1">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Conteúdo do Contrato (editável)</label>
            <Textarea value={content} onChange={e => setContent(e.target.value)} rows={16} className="font-mono text-xs" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Nome do Assinante</label>
            <Input value={signatureName} onChange={e => setSignatureName(e.target.value)} placeholder="Nome completo de quem assina" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="signed" checked={signed} onCheckedChange={setSigned} />
            <label htmlFor="signed" className="text-sm text-slate-700">Confirmo que li e assino digitalmente este contrato em nome do cliente.</label>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t mt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={handleSave} className="bg-blue-700 hover:bg-blue-800">
            {signed ? "Assinar e Salvar" : "Salvar Rascunho"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}