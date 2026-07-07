import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isSameMonth, addMonths, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CalendarWidget({ tasks = [], requests = [], isAdmin = false }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const itemsByDate = useMemo(() => {
    const map = {};
    const addItem = (date, item, type) => {
      const key = format(date, "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push({ ...item, _type: type });
    };
    tasks.forEach(t => {
      if (t.due_date) {
        try { addItem(parseISO(t.due_date), t, "task"); } catch {}
      }
    });
    requests.forEach(r => {
      if (r.created_date) {
        try {
          const d = new Date(r.created_date);
          if (isSameMonth(d, currentDate)) addItem(d, r, "request");
        } catch {}
      }
    });
    return map;
  }, [tasks, requests, currentDate]);

  const selectedItems = itemsByDate[format(selectedDate, "yyyy-MM-dd")] || [];

  const priorityColor = { Alta: "text-red-600", Urgente: "text-red-600", Média: "text-amber-600", Baixa: "text-slate-500" };
  const statusIcon = (item) => {
    if (item._type === "task") {
      if (item.status === "Concluída") return <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />;
      if (item.status === "Pendente") return <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      return <AlertCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    }
    return <AlertCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-slate-900">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }} className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded font-medium">
            Hoje
          </button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <div key={i} className="text-center text-[11px] font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const key = format(day, "yyyy-MM-dd");
          const dayItems = itemsByDate[key] || [];
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          const inMonth = isSameMonth(day, currentDate);
          return (
            <button
              key={key}
              onClick={() => setSelectedDate(day)}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                isSelected ? "bg-blue-600 text-white" : isToday ? "bg-blue-50 text-blue-700" : inMonth ? "text-slate-700 hover:bg-slate-50" : "text-slate-300"
              }`}
            >
              <span className={`text-xs ${inMonth ? "" : "opacity-50"}`}>{format(day, "d")}</span>
              {dayItems.length > 0 && (
                <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-blue-600"}`} />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
          {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
        </p>
        {selectedItems.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum compromisso neste dia.</p>
        ) : (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                {statusIcon(item)}
                <div className="min-w-0">
                  <p className={`text-slate-700 ${item._type === "task" ? "font-medium" : ""}`}>
                    {item._type === "task" ? item.title : `${item.service_type} (solicitação)`}
                  </p>
                  {item._type === "task" && item.category && (
                    <p className={`text-xs ${priorityColor[item.priority] || "text-slate-400"}`}>{item.category} · {item.priority}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}