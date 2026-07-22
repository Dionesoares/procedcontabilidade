import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";

export default function FinanceiroFiltros({ filters, onChange, clients }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-3 text-slate-500">
        <SlidersHorizontal className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Filtros</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Movimento</label>
          <Select value={filters.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Receita">Entradas</SelectItem>
              <SelectItem value="Despesa">Saídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
          <Select value={filters.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Pago">Pago</SelectItem>
              <SelectItem value="Atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Cliente</label>
          <Select value={filters.clientId} onValueChange={(v) => set("clientId", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">De</label>
          <Input type="date" value={filters.dateFrom} onChange={(e) => set("dateFrom", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Até</label>
          <Input type="date" value={filters.dateTo} onChange={(e) => set("dateTo", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Buscar</label>
          <Input placeholder="Descrição..." value={filters.search} onChange={(e) => set("search", e.target.value)} />
        </div>
      </div>
    </div>
  );
}