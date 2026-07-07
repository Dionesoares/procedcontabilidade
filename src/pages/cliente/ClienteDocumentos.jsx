import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { getMyClient } from "@/lib/clientLookup";
import FolderSidebar from "@/components/documents/FolderSidebar";
import DocumentsToolbar from "@/components/documents/DocumentsToolbar";
import DocumentsTable from "@/components/documents/DocumentsTable";
import { DEFAULT_FOLDERS } from "@/lib/defaultFolders";
import { useToast } from "@/components/ui/use-toast";

export default function ClienteDocumentos() {
  const { toast } = useToast();
  const [docs, setDocs] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const user = await base44.auth.me();
      const cl = await getMyClient(user);
      setClient(cl);
      if (cl) {
        const [d, f] = await Promise.all([
          base44.entities.Document.filter({ client_id: cl.id }, "-created_date"),
          base44.entities.DocumentFolder.filter({ client_id: cl.id }, "-created_date"),
        ]);
        if (f.length === 0) {
          const created = await Promise.all(DEFAULT_FOLDERS.map(name => base44.entities.DocumentFolder.create({ name, client_id: cl.id })));
          setFolders(created);
        } else {
          setFolders(f);
        }
        setDocs(d);
      }
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const visibleDocs = docs.filter(d => {
    if (activeFolder && d.folder_id !== activeFolder) return false;
    if (filter === "Lidos" && d.status !== "Aprovado") return false;
    if (filter === "Não lidos" && d.status === "Aprovado") return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === visibleDocs.length ? [] : visibleDocs.map(d => d.id));

  const handleDownloadSelected = () => {
    const toDownload = visibleDocs.filter(d => selected.includes(d.id) && d.file_url);
    if (toDownload.length === 0) { toast({ title: "Selecione ao menos um documento com arquivo" }); return; }
    toDownload.forEach(d => window.open(d.file_url, "_blank"));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-slate-900 mb-1">Meus Documentos</h1>
      <p className="text-sm text-slate-500 mb-6">Baixe aqui os documentos em PDF enviados pelo seu contador.</p>

      {!client ? (
        <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-lg">Nenhum documento disponível.</div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4">
          <FolderSidebar folders={folders} activeFolder={activeFolder} onSelect={setActiveFolder} canManage={false} />
          <div className="flex-1 min-w-0">
            <DocumentsToolbar
              canManage={false}
              onDownload={handleDownloadSelected}
              filter={filter}
              onFilterChange={setFilter}
              search={search}
              onSearchChange={setSearch}
            />
            <DocumentsTable docs={visibleDocs} selected={selected} onToggle={toggleSelect} onToggleAll={toggleAll} showClientColumn={false} />
          </div>
        </div>
      )}
    </div>
  );
}