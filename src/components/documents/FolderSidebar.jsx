import React, { useState } from "react";
import { Folder, Plus, X } from "lucide-react";

export default function FolderSidebar({ folders, activeFolder, onSelect, onCreate, onDelete, canManage }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) { setCreating(false); return; }
    await onCreate(name.trim());
    setName(""); setCreating(false);
  };

  return (
    <div className="w-full sm:w-56 bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0">
      <button
        onClick={() => onSelect(null)}
        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left border-l-2 ${!activeFolder ? "bg-blue-50 border-blue-600 text-blue-700 font-medium" : "border-transparent text-slate-700 hover:bg-slate-50"}`}
      >
        <Folder className="w-4 h-4" /> Todos
      </button>
      {folders.map(f => (
        <div
          key={f.id}
          onClick={() => onSelect(f.id)}
          className={`group flex items-center justify-between px-4 py-2.5 border-l-2 cursor-pointer ${activeFolder === f.id ? "bg-blue-50 border-blue-600 text-blue-700 font-medium" : "border-transparent text-slate-700 hover:bg-slate-50"}`}
        >
          <span className="flex items-center gap-2 text-sm"><Folder className="w-4 h-4" /> {f.name}</span>
          {canManage && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(f.id); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
      {canManage && (
        creating ? (
          <div className="flex items-center gap-1 p-2 border-t border-slate-100">
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              placeholder="Nome da pasta"
              className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded outline-none focus:border-blue-400"
            />
            <button onClick={handleCreate} className="text-xs text-blue-600 font-medium">OK</button>
          </div>
        ) : (
          <button onClick={() => setCreating(true)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 border-t border-slate-100">
            <Plus className="w-3.5 h-3.5" /> Nova pasta
          </button>
        )
      )}
    </div>
  );
}