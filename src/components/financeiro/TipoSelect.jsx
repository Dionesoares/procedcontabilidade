import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Pencil, Plus, Check, TrendingUp, TrendingDown, Trash2 } from "lucide-react";

const DEFAULTS = [
  { label: "Receita", classification: "Receita" },
  { label: "Despesa", classification: "Despesa" },
];

export default function TipoSelect({ value, label, onChange }) {
  const [types, setTypes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editClassification, setEditClassification] = useState("Receita");
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newClassification, setNewClassification] = useState("Receita");

  const load = async () => {
    let list = await base44.entities.TipoLancamento.list();
    if (list.length === 0) {
      list = await base44.entities.TipoLancamento.bulkCreate(DEFAULTS);
    }
    setTypes(list);
  };

  useEffect(() => { load(); }, []);

  const selectedLabel = label || value;

  const handleSelect = (t) => {
    onChange({ type: t.classification, type_label: t.label });
    setOpen(false);
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditLabel(t.label);
    setEditClassification(t.classification);
  };

  const saveEdit = async () => {
    const updated = await base44.entities.TipoLancamento.update(editingId, { label: editLabel, classification: editClassification });
    setTypes(types.map(t => t.id === editingId ? updated : t));
    if (selectedLabel === types.find(t => t.id === editingId)?.label) {
      onChange({ type: editClassification, type_label: editLabel });
    }
    setEditingId(null);
  };

  const handleDelete = async (t) => {
    if (!confirm(`Excluir o tipo "${t.label}"?`)) return;
    await base44.entities.TipoLancamento.delete(t.id);
    const remaining = types.filter(x => x.id !== t.id);
    setTypes(remaining);
    if (selectedLabel === t.label && remaining.length > 0) {
      handleSelect(remaining[0]);
    }
  };

  const saveNew = async () => {
    if (!newLabel.trim()) return;
    const created = await base44.entities.TipoLancamento.create({ label: newLabel.trim(), classification: newClassification });
    setTypes([...types, created]);
    setCreating(false);
    setNewLabel("");
    handleSelect(created);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
        >
          <span className="flex items-center gap-1.5">
            {value === "Receita" ? <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> : <TrendingDown className="w-3.5 h-3.5 text-slate-500" />}
            {selectedLabel || "Selecione"}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="space-y-1 max-h-56 overflow-y-auto">
          {types.map((t) => (
            <div key={t.id} className="flex items-center gap-1">
              {editingId === t.id ? (
                <div className="flex-1 space-y-2 p-2 bg-slate-50 rounded-md">
                  <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="h-8 text-sm" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setEditClassification("Receita")} className={`flex-1 text-xs py-1 rounded ${editClassification === "Receita" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>Receita</button>
                    <button type="button" onClick={() => setEditClassification("Despesa")} className={`flex-1 text-xs py-1 rounded ${editClassification === "Despesa" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>Despesa</button>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                    <Button type="button" size="sm" onClick={saveEdit} className="bg-blue-700 hover:bg-blue-800">Salvar</Button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleSelect(t)}
                    className="flex-1 flex items-center justify-between px-2 py-1.5 rounded-md text-sm hover:bg-slate-50 text-left"
                  >
                    <span className="flex items-center gap-1.5">
                      {t.classification === "Receita" ? <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> : <TrendingDown className="w-3.5 h-3.5 text-slate-500" />}
                      {t.label}
                    </span>
                    {selectedLabel === t.label && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                  <button type="button" onClick={() => startEdit(t)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => handleDelete(t)} className="p-1.5 text-slate-400 hover:text-red-600 rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 mt-2 pt-2">
          {creating ? (
            <div className="space-y-2 p-1">
              <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Nome do novo tipo" className="h-8 text-sm" autoFocus />
              <div className="flex gap-2">
                <button type="button" onClick={() => setNewClassification("Receita")} className={`flex-1 text-xs py-1 rounded ${newClassification === "Receita" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>Receita</button>
                <button type="button" onClick={() => setNewClassification("Despesa")} className={`flex-1 text-xs py-1 rounded ${newClassification === "Despesa" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>Despesa</button>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" size="sm" variant="ghost" onClick={() => setCreating(false)}>Cancelar</Button>
                <Button type="button" size="sm" onClick={saveNew} className="bg-blue-700 hover:bg-blue-800">Adicionar</Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-sm text-blue-700 hover:bg-blue-50"
            >
              <Plus className="w-3.5 h-3.5" /> Novo tipo
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}