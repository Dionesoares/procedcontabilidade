import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileBarChart, Download } from "lucide-react";
import { getMyClient } from "@/lib/clientLookup";
import BalanceteSummaryCards from "@/components/balancete/BalanceteSummaryCards";
import BalanceteChart from "@/components/balancete/BalanceteChart";
import BalanceteHierarchyTable from "@/components/balancete/BalanceteHierarchyTable";
import BalanceteRelatorioGeral from "@/components/balancete/BalanceteRelatorioGeral";
import BalanceteClientHeader from "@/components/balancete/BalanceteClientHeader";
import { generateBalancetePdf } from "@/lib/balancetePdf";

export default function ClienteBalancete() {
  const [loading, setLoading] = useState(true);
  const [balancetes, setBalancetes] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [client, setClient] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const clientData = await getMyClient(user);
        if (clientData) {
          setClient(clientData);
          const data = await base44.entities.Balancete.filter({ client_id: clientData.id }, "-created_date");
          setBalancetes(data);
          if (data.length > 0) setSelectedId(data[0].id);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selected = balancetes.find((b) => b.id === selectedId);
  const tree = selected ? JSON.parse(selected.tree || "[]") : [];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-blue-600" /> Balancete
          </h1>
          <p className="text-sm text-slate-500 mt-1">Acompanhe o balancete gerado pelo seu contador.</p>
        </div>
        {balancetes.length > 0 && (
          <div className="flex items-center gap-2">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Selecione o período" /></SelectTrigger>
              <SelectContent>
                {balancetes.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {new Date(b.period_start + "T00:00:00").toLocaleDateString("pt-BR")} - {new Date(b.period_end + "T00:00:00").toLocaleDateString("pt-BR")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => generateBalancetePdf(selected)} variant="outline">
              <Download className="w-4 h-4 mr-1" /> Baixar PDF
            </Button>
          </div>
        )}
      </div>

      {balancetes.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Nenhum balancete disponível ainda. Seu contador irá gerá-lo em breve.</div>
      ) : (
        <div className="space-y-6">
          <BalanceteClientHeader client={client} periodStart={selected.period_start} periodEnd={selected.period_end} />
          <BalanceteSummaryCards tree={tree} />
          <BalanceteChart tree={tree} />
          <BalanceteHierarchyTable tree={tree} />
          <BalanceteRelatorioGeral tree={tree} clientName={selected.client_name} signatureContador={selected.signature_contador} signatureCliente={selected.signature_cliente} />
        </div>
      )}
    </div>
  );
}