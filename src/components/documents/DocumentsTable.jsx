import React from "react";
import { FileText } from "lucide-react";
import { format } from "date-fns";

export default function DocumentsTable({ docs, selected, onToggle, onToggleAll, clientName, showClientColumn }) {
  const allChecked = docs.length > 0 && selected.length === docs.length;
  const colSpan = showClientColumn ? 6 : 5;

  return (
    <div className="bg-white border border-t-0 border-slate-200 rounded-b-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs text-slate-500">
            <th className="w-10 px-3 py-2 text-left"><input type="checkbox" checked={allChecked} onChange={onToggleAll} /></th>
            <th className="px-3 py-2 text-left font-medium">Nome</th>
            <th className="px-3 py-2 text-left font-medium">Comentários</th>
            <th className="px-3 py-2 text-left font-medium">Data de publicação</th>
            {showClientColumn && <th className="px-3 py-2 text-left font-medium">Cliente</th>}
            <th className="px-3 py-2 text-left font-medium">Modificado</th>
          </tr>
        </thead>
        <tbody>
          {docs.length === 0 ? (
            <tr><td colSpan={colSpan} className="px-3 py-6 text-center text-slate-400">Nenhum documento para exibir.</td></tr>
          ) : docs.map(d => (
            <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="px-3 py-2"><input type="checkbox" checked={selected.includes(d.id)} onChange={() => onToggle(d.id)} /></td>
              <td className="px-3 py-2">
                <a href={d.file_url || "#"} target="_blank" rel="noopener" className="flex items-center gap-2 text-blue-600 hover:underline">
                  <FileText className="w-4 h-4 text-purple-500" /> {d.title}
                </a>
              </td>
              <td className="px-3 py-2 text-slate-600">{d.description || "—"}</td>
              <td className="px-3 py-2 text-slate-600">{d.created_date ? format(new Date(d.created_date), "dd/MM/yyyy") : "—"}</td>
              {showClientColumn && <td className="px-3 py-2 text-slate-600">{clientName(d.client_id)}</td>}
              <td className="px-3 py-2 text-slate-600">{d.updated_date ? format(new Date(d.updated_date), "dd/MM/yyyy") : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}