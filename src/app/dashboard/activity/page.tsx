"use client";
import { useState, useMemo } from "react";
import { useStore } from "@/store";
import { formatTime } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle, Badge, Button, EmptyState } from "@/components/ui";
import { Activity, Package, ShoppingCart, Layers, Globe, User, ChevronLeft, ChevronRight, Download } from "lucide-react";
import toast from "react-hot-toast";

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  product: <Package className="w-3.5 h-3.5" />,
  order: <ShoppingCart className="w-3.5 h-3.5" />,
  inventory: <Layers className="w-3.5 h-3.5" />,
  channel: <Globe className="w-3.5 h-3.5" />,
  user: <User className="w-3.5 h-3.5" />,
};

const ENTITY_COLORS: Record<string, string> = {
  product: "bg-purple-50 text-purple-600",
  order: "bg-blue-50 text-blue-600",
  inventory: "bg-amber-50 text-amber-600",
  channel: "bg-emerald-50 text-emerald-600",
  user: "bg-gray-100 text-gray-600",
};

const ACTION_BADGE: Record<string, "success" | "danger" | "info" | "warning" | "purple"> = {
  "Product Created": "success",
  "Product Updated": "info",
  "Product Deleted": "danger",
  "Order Created": "purple",
  "Order Updated": "info",
  "Order Deleted": "danger",
  "Order Cancelled": "danger",
  "Inventory Updated": "warning",
  "User Login": "success",
};

const PAGE_SIZE = 12;

export default function ActivityPage() {
  const { logs } = useStore();
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...logs];
    if (entityFilter) list = list.filter((l) => l.entity === entityFilter);
    if (actionFilter) list = list.filter((l) => l.action === actionFilter);
    if (search) list = list.filter((l) => l.description.toLowerCase().includes(search.toLowerCase()) || l.entityName.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [logs, entityFilter, actionFilter, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const uniqueActions = [...new Set(logs.map((l) => l.action))];

  const exportCSV = () => {
    const headers = ["Action", "Entity", "Name", "User", "Description", "Timestamp"];
    const rows = filtered.map((l) => [l.action, l.entity, l.entityName, l.user, `"${l.description}"`, l.timestamp]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "syncstock-activity.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Activity logs exported!");
  };

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
        {[
          { label: "All Events", count: logs.length, entity: "" },
          { label: "Products", count: logs.filter((l) => l.entity === "product").length, entity: "product" },
          { label: "Orders", count: logs.filter((l) => l.entity === "order").length, entity: "order" },
          { label: "Inventory", count: logs.filter((l) => l.entity === "inventory").length, entity: "inventory" },
          { label: "System", count: logs.filter((l) => l.entity === "user").length, entity: "user" },
        ].map(({ label, count, entity }) => (
          <button
            key={label}
            onClick={() => { setEntityFilter(entityFilter === entity ? "" : entity); setPage(1); }}
            className={`p-6 rounded-2xl border text-center transition-all ${entityFilter === entity ? "border-purple-300 bg-purple-50 shadow-md scale-[1.02]" : "bg-white border-slate-100 shadow-sm hover:border-purple-200 hover:shadow-md"}`}
          >
            <p className="text-[32px] font-bold tracking-tight text-gray-900 leading-tight">{count}</p>
            <p className="text-[13px] font-medium text-gray-500 mt-1">{label}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-4 flex-1 items-center">
          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center justify-center pointer-events-none">
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <input placeholder="Search logs…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-10 pl-11 pr-4 w-72 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm" />
          </div>
          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all cursor-pointer">
            <option value="">All Actions</option>
            {uniqueActions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <Button variant="outline" size="md" onClick={exportCSV}><Download className="w-4 h-4" /> Export CSV</Button>
      </div>

      {/* Log Timeline */}
      <Card className="shadow-sm border border-gray-200/60 mt-4">
        <CardContent className="pt-8 pb-8 px-6 sm:px-8">
          {paged.length === 0 ? (
            <EmptyState icon={<Activity className="w-6 h-6" />} title="No activity found" description="No logs match your current filters." />
          ) : (
            <div className="space-y-0">
              {paged.map((log, i) => (
                <div key={log.id} className="flex gap-4 group">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${ENTITY_COLORS[log.entity]}`}>
                      {ENTITY_ICONS[log.entity]}
                    </div>
                    {i < paged.length - 1 && <div className="w-px flex-1 bg-gray-100 my-2" />}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-5 ${i < paged.length - 1 ? "" : ""}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={ACTION_BADGE[log.action] || "outline"} className="shrink-0">{log.action}</Badge>
                          <span className="text-[14px] font-semibold text-gray-900 truncate">{log.entityName}</span>
                        </div>
                        <p className="text-[14px] text-gray-500 mt-1 leading-relaxed">{log.description}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[12px] text-gray-400">{formatTime(log.timestamp)}</span>
                          <span className="text-[12px] text-gray-300">·</span>
                          <span className="text-[12px] text-gray-400">by <span className="font-medium text-gray-600">{log.user}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} events</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
                {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === page ? "bg-purple-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}>{p}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
