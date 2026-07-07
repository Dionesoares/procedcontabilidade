import React from "react";
import { Plus, Download, Trash2, Send, Search } from "lucide-react";

export default function DocumentsToolbar({ canManage, onAdd, onDownload, onDelete, filter, onFilterChange, search, onSearchChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-700 text-white px-3 py-2 rounded-t-lg">
      <div className="flex items-center gap-1 flex-wrap">
        {canManage && (
          <button onClick={onAdd} className="flex items-center gap-1 px-2.5 py-1.5 text-sm rounded hover:bg-white/10">
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        )}
        <button onClick={onDownload} className="flex items-center gap-1 px-2.5 py-1.5 text-sm rounded hover:bg-white/10">
          <Download className="w-4 h-4" /> Baixar
        </button>
        {canManage && (
          <>
            <button onClick={onDelete} className="flex items-center gap-1 px-2.5 py-1.5 text-sm rounded hover:bg-white/10">
              <Trash2 className="w-4 h-4" /> Excluir
            </button>
            <button className="flex items-center gap-1 px-2.5 py-1.5 text-sm rounded hover:bg-white/10">
              <Send className="w-4 h-4" /> Enviar
            </button>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {["Todos", "Não lidos", "Lidos"].map(f => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`px-3 py-1 rounded text-xs font-medium ${filter === f ? "bg-white text-blue-700" : "bg-white/20 hover:bg-white/30"}`}
          >
            {f.toUpperCase()}
          </button>
        ))}
        <div className="flex items-center gap-1 bg-white rounded px-2 py-1">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Pesquisar"
            className="text-xs text-slate-700 outline-none w-28"
          />
        </div>
      </div>
    </div>
  );
}