import React, { useState } from "react";
import { FolderPlus, Folder, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FolderBar({ folders, activeFolder, onSelect, onCreate, onDelete }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) { setCreating(false); return; }
    await onCreate(name.trim());
    setName("");
    setCreating(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6">
      <button
        onClick={() => onSelect(null)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!activeFolder ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
      >
        <Folder className="w-3.5 h-3.5" /> Todas
      </button>
      {folders.map(f => (
        <div
          key={f.id}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeFolder === f.id ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
        >
          <button onClick={() => onSelect(f.id)} className="flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5" /> {f.name}
          </button>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(f.id); }}
              className={`ml-1 ${activeFolder === f.id ? "text-white/70 hover:text-white" : "text-slate-400 hover:text-red-600"}`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}

      {creating ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            placeholder="Nome da pasta"
            className="px-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400"
          />
          <Button size="sm" onClick={handleCreate} className="bg-blue-700 hover:bg-blue-800 h-8">OK</Button>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setCreating(true)} className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50">
          <FolderPlus className="w-3.5 h-3.5 mr-1" /> Nova Pasta
        </Button>
      )}
    </div>
  );
}