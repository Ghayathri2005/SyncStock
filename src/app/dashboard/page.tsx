"use client";
import { useMemo } from "react";
import { useStore } from "@/store";
import { formatCurrency, formatNumber, formatTime } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle, StockStatusBadge, OrderStatusBadge, Badge } from "@/components/ui";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Package, DollarSign, ShoppingCart, TrendingUp,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Activity, Layers
} from "lucide-react";

// ─── Sales Chart Data ──────────────────────────────────────────────────────────
const SALES_DATA = [
  { date: "Jan", revenue: 42000, orders: 180, "Marketplace A": 20000, "Marketplace B": 14000, "Marketplace C": 8000 },
  { date: "Feb", revenue: 51000, orders: 220, "Marketplace A": 24000, "Marketplace B": 17000, "Marketplace C": 10000 },
  { date: "Mar", revenue: 47000, orders: 195, "Marketplace A": 22000, "Marketplace B": 15000, "Marketplace C": 10000 },
  { date: "Apr", revenue: 63000, orders: 280, "Marketplace A": 30000, "Marketplace B": 21000, "Marketplace C": 12000 },
  { date: "May", revenue: 58000, orders: 250, "Marketplace A": 27000, "Marketplace B": 19000, "Marketplace C": 12000 },
  { date: "Jun", revenue: 72000, orders: 320, "Marketplace A": 34000, "Marketplace B": 23000, "Marketplace C": 15000 },
];

const INV_DATA = [
  { date: "Jan", totalStock: 820, sold: 180, received: 200 },
  { date: "Feb", totalStock: 840, sold: 220, received: 240 },
  { date: "Mar", totalStock: 820, sold: 195, received: 175 },
  { date: "Apr", totalStock: 760, sold: 280, received: 220 },
  { date: "May", totalStock: 730, sold: 250, received: 220 },
  { date: "Jun", totalStock: 700, sold: 320, received: 290 },
];

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-medium text-gray-900">
            {p.name === "revenue" || p.name.includes("Marketplace") ? formatCurrency(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
}
function KPICard({ title, value, change, changeLabel, icon, color }: KPICardProps) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
          {change !== undefined && (
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        <p className="text-[32px] font-bold text-gray-900 tracking-tight leading-tight mb-1">{value}</p>
        <p className="text-[13px] font-medium text-gray-500">{title}</p>
        {changeLabel && <p className="text-[11px] font-medium text-gray-400 mt-1">{changeLabel}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { products, orders, logs } = useStore();

  const kpis = useMemo(() => {
    const totalInventoryValue = products.reduce((sum, p) => sum + p.totalStock * p.costPrice, 0);
    const activeOrders = orders.filter((o) => ["pending", "processing", "shipped"].includes(o.status)).length;
    const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);
    const lowStock = products.filter((p) => p.status === "low-stock" || p.status === "out-of-stock").length;
    return { totalInventoryValue, activeOrders, totalRevenue, lowStock };
  }, [products, orders]);

  const recentOrders = useMemo(() => [...orders].slice(0, 5), [orders]);
  const lowStockProducts = useMemo(() =>
    products.filter((p) => p.status !== "in-stock").slice(0, 5),
    [products]
  );
  const recentActivity = useMemo(() => logs.slice(0, 6), [logs]);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Inventory Value"
          value={formatCurrency(kpis.totalInventoryValue)}
          change={12}
          changeLabel="vs. last month"
          icon={<Layers className="w-5 h-5 text-blue-600" />}
          color="bg-blue-50"
        />
        <KPICard
          title="Active Orders"
          value={String(kpis.activeOrders)}
          change={-3}
          changeLabel="vs. last month"
          icon={<ShoppingCart className="w-5 h-5 text-amber-600" />}
          color="bg-amber-50"
        />
        <KPICard
          title="Total Revenue"
          value={formatCurrency(kpis.totalRevenue)}
          change={18}
          changeLabel="vs. last month"
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          color="bg-emerald-50"
        />
        <KPICard
          title="Low Stock Alerts"
          value={String(kpis.lowStock)}
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          color="bg-red-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales Overview */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sales Overview</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">Revenue by channel — last 6 months</p>
              </div>
              <Badge variant="purple">
                <TrendingUp className="w-3 h-3" /> +18.2%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={SALES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ecfa" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Area type="monotone" dataKey="Marketplace A" stroke="#7c3aed" strokeWidth={2} fill="url(#colorA)" dot={false} />
                <Area type="monotone" dataKey="Marketplace B" stroke="#3b82f6" strokeWidth={2} fill="url(#colorB)" dot={false} />
                <Area type="monotone" dataKey="Marketplace C" stroke="#10b981" strokeWidth={2} fill="url(#colorC)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Trend</CardTitle>
            <p className="text-sm text-gray-500 mt-0.5">Stock movement — 6 months</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={INV_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ecfa" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="received" fill="#ddd6fe" radius={[4, 4, 0, 0]} name="Received" />
                <Bar dataKey="sold" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Sold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row — Recent Orders (full width) + Low Stock (side) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <a href="/dashboard/orders" className="text-xs text-purple-600 hover:text-purple-700 font-medium">View all →</a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    {["Order", "Customer", "Channel", "Total", "Status"].map((h) => (
                      <th key={h} className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-[14px] font-semibold text-gray-900">{order.orderNumber}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[14px] text-gray-600">{order.customerName}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[13px] font-medium text-gray-500">{order.channel}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[14px] font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Low Stock</CardTitle>
              <a href="/dashboard/inventory" className="text-xs text-purple-600 hover:text-purple-700 font-medium">View all →</a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              {lowStockProducts.length === 0 ? (
                <p className="text-[14px] text-gray-500 text-center py-6">All products are well-stocked 🎉</p>
              ) : (
                lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-[12px] text-gray-500 font-mono mt-0.5">{p.sku}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <StockStatusBadge status={p.status} />
                      <span className="text-[12px] font-medium text-gray-500">{p.totalStock} left</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

