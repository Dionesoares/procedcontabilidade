import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Pencil, Trash2, Save, Check } from "lucide-react";

export default function DescricaoSelect({ value, onChange, scope = "lancamento" }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");

  const load = async () => {
    const list = await base44.entities.DescricaoLancamento.filter({ scope });
    setItems(list);
  };

  useEffect(() => { load(); }, [scope]);

  const handleSelect = (item) => {
    onChange(item.label);
    setOpen(false);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditLabel(item.label);
  };

  const saveEdit = async () => {
    const updated = await base44.entities.DescricaoLancamento.update(editingId, { label: editLabel });
    setItems(items.map(i => i.id === editingId ? updated : i));
    if (value === items.find(i => i.id === editingId)?.label) onChange(editLabel);
    setEditingId(null);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Excluir a descrição "${item.label}"?`)) return;
    await base44.entities.DescricaoLancamento.delete(item.id);
    setItems(items.filter(i => i.id !== item.id));
  };

  const saveCurrent = async () => {
    const label = (value || "").trim();
    if (!label) return;
    if (items.some(i => i.label.toLowerCase() === label.toLowerCase())) return;
    const created = await base44.entities.DescricaoLancamento.create({ label, scope });
    setItems([...items, created]);
  };

  return (
    <div className="flex gap-1">
      <Input value={value} onChange={(e) => onChange(e.target.value)} required placeholder="Ex: Honorários contábeis" className="flex-1" />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" title="Descrições salvas" className="h-9 w-9 shrink-0 border border-input rounded-md flex items-center justify-center text-slate-500 hover:text-blue-600">
            <ChevronDown className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="end">
          <div className="space-y-1 max-h-56 overflow-y-auto">
            {items.length === 0 && <p className="text-xs text-slate-400 px-2 py-1.5">Nenhuma descrição salva.</p>}
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-1">
                {editingId === item.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="h-8 text-sm" autoFocus />
                    <Button type="button" size="sm" onClick={saveEdit} className="bg-blue-700 hover:bg-blue-800 h-8">Salvar</Button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="flex-1 flex items-center justify-between px-2 py-1.5 rounded-md text-sm hover:bg-slate-50 text-left"
                    >
                      <span className="truncate">{item.label}</span>
                      {value === item.label && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                    <button type="button" onClick={() => startEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => handleDelete(item)} className="p-1.5 text-slate-400 hover:text-red-600 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <button type="button" title="Salvar descrição atual" onClick={saveCurrent} className="h-9 w-9 shrink-0 border border-input rounded-md flex items-center justify-center text-slate-500 hover:text-blue-600">
        <Save className="w-4 h-4" />
      </button>
    </div>
  );
}