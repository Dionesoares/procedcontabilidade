import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Download } from "lucide-react";
import { getMyClient } from "@/lib/clientLookup";

export default function ClienteDocumentos() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const cl = await getMyClient(user);
        if (cl) {
          setDocs(await base44.entities.Document.filter({ client_id: cl.id }, "-created_date"));
        }
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-slate-900 mb-6">Meus Documentos</h1>
      <p className="text-sm text-slate-500 mb-4">Baixe aqui os documentos em PDF enviados pelo seu contador.</p>
      {docs.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Nenhum documento disponível.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map(d => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{d.title}</h3>
              <p className="text-xs text-slate-500 mb-2">{d.category || "Sem categoria"}</p>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${d.status === "Aprovado" ? "bg-blue-100 text-blue-700" : d.status === "Enviado" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{d.status}</span>
              {d.file_url && (
                <a href={d.file_url} target="_blank" rel="noopener" className="flex items-center gap-1 mt-3 text-xs text-blue-600 hover:underline">
                  <Download className="w-3 h-3" /> Baixar
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}