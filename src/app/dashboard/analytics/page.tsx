"use client";
import { useMemo } from "react";
import { useStore } from "@/store";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle, Badge } from "@/components/ui";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, Package, ShoppingCart, DollarSign } from "lucide-react";

const REVENUE_DATA = [
  { month: "Jan", revenue: 42000, target: 45000 },
  { month: "Feb", revenue: 51000, target: 48000 },
  { month: "Mar", revenue: 47000, target: 50000 },
  { month: "Apr", revenue: 63000, target: 55000 },
  { month: "May", revenue: 58000, target: 60000 },
  { month: "Jun", revenue: 72000, target: 65000 },
  { month: "Jul", revenue: 68000, target: 70000 },
  { month: "Aug", revenue: 81000, target: 75000 },
  { month: "Sep", revenue: 79000, target: 78000 },
  { month: "Oct", revenue: 94000, target: 85000 },
  { month: "Nov", revenue: 102000, target: 90000 },
  { month: "Dec", revenue: 118000, target: 100000 },
];

const MONTHLY_GROWTH = [
  { month: "Jan", growth: 0 },
  { month: "Feb", growth: 21.4 },
  { month: "Mar", growth: -7.8 },
  { month: "Apr", growth: 34.0 },
  { month: "May", growth: -7.9 },
  { month: "Jun", growth: 24.1 },
  { month: "Jul", growth: -5.6 },
  { month: "Aug", growth: 19.1 },
  { month: "Sep", growth: -2.5 },
  { month: "Oct", growth: 18.9 },
  { month: "Nov", growth: 8.5 },
  { month: "Dec", growth: 15.7 },
];

const CHANNEL_PIE = [
  { name: "Marketplace A", value: 44, color: "#7c3aed" },
  { name: "Marketplace B", value: 33, color: "#3b82f6" },
  { name: "Marketplace C", value: 23, color: "#10b981" },
];

const FORECAST_DATA = [
  { month: "Jul", actual: 68000, forecast: 68000 },
  { month: "Aug", actual: 81000, forecast: 81000 },
  { month: "Sep", actual: 79000, forecast: 79000 },
  { month: "Oct", actual: 94000, forecast: 94000 },
  { month: "Nov", actual: 102000, forecast: 102000 },
  { month: "Dec", actual: null, forecast: 118000 },
  { month: "Jan", actual: null, forecast: 125000 },
  { month: "Feb", actual: null, forecast: 134000 },
];

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
            {typeof p.value === "number" && p.name !== "growth" ? formatCurrency(p.value) : `${p.value}%`}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { products, orders } = useStore();

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const aSold = a.channelStock.reduce((s, c) => s + c.sold, 0);
        const bSold = b.channelStock.reduce((s, c) => s + c.sold, 0);
        return bSold - aSold;
      })
      .slice(0, 6)
      .map((p) => ({
        name: p.name.length > 20 ? p.name.slice(0, 20) + "…" : p.name,
        sold: p.channelStock.reduce((s, c) => s + c.sold, 0),
        revenue: p.channelStock.reduce((s, c) => s + c.sold, 0) * p.price,
      }));
  }, [products]);

  const totalRevenue = REVENUE_DATA.reduce((s, d) => s + d.revenue, 0);
  const avgGrowth = MONTHLY_GROWTH.filter((d) => d.growth !== 0).reduce((s, d) => s + d.growth, 0) / (MONTHLY_GROWTH.length - 1);

  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Annual Revenue", value: formatCurrency(totalRevenue), change: "+18.2%", icon: <DollarSign className="w-6 h-6 text-purple-600" />, color: "bg-purple-50" },
          { label: "Avg Monthly Growth", value: `${avgGrowth.toFixed(1)}%`, change: "YoY", icon: <TrendingUp className="w-6 h-6 text-emerald-600" />, color: "bg-emerald-50" },
          { label: "Top Product Revenue", value: formatCurrency(topProducts[0]?.revenue || 0), change: "All time", icon: <Package className="w-6 h-6 text-blue-600" />, color: "bg-blue-50" },
          { label: "Total Orders (YTD)", value: orders.length.toString(), change: "+24.5%", icon: <ShoppingCart className="w-6 h-6 text-amber-600" />, color: "bg-amber-50" },
        ].map(({ label, value, change, icon, color }) => (
          <Card key={label} className="flex flex-col justify-center border-slate-100 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
                <Badge variant="purple" className="px-2 py-0.5 text-[11px]">{change}</Badge>
              </div>
              <p className="text-[32px] font-bold tracking-tight text-gray-900 leading-tight">{value}</p>
              <p className="text-[13px] font-medium text-gray-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Trend */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue Trend</CardTitle>
              <p className="text-[13px] text-gray-500 mt-0.5">Actual vs Target — 12 months</p>
            </div>
            <Badge variant="success" className="text-[11px] px-2.5 py-1">On Track</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ecfa" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
              <Area type="monotone" dataKey="target" name="Target" stroke="#d8b4fe" strokeWidth={1.5} strokeDasharray="5 3" fill="none" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales by Channel */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-4">
            <CardTitle>Sales by Channel</CardTitle>
            <p className="text-[13px] text-gray-500 mt-0.5">Revenue distribution</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={CHANNEL_PIE} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {CHANNEL_PIE.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {CHANNEL_PIE.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="text-gray-600">{c.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="xl:col-span-2 shadow-sm border-slate-100">
          <CardHeader className="pb-4">
            <CardTitle>Top Products by Sales</CardTitle>
            <p className="text-[13px] text-gray-500 mt-0.5">Units sold across all channels</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ecfa" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={110} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sold" name="Units Sold" fill="#7c3aed" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Growth + Forecast */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-4">
            <CardTitle>Monthly Growth Rate</CardTitle>
            <p className="text-[13px] text-gray-500 mt-0.5">Month-over-month revenue change</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={MONTHLY_GROWTH} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ecfa" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => [`${v}%`, "Growth"]} />
                <Bar dataKey="growth" radius={[4, 4, 0, 0]}>
                  {MONTHLY_GROWTH.map((entry, index) => (
                    <Cell key={index} fill={entry.growth >= 0 ? "#7c3aed" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Inventory Forecast</CardTitle>
                <p className="text-[13px] text-gray-500 mt-0.5">Projected revenue next 3 months</p>
              </div>
              <Badge variant="info" className="text-[11px] px-2.5 py-1">AI Forecast</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={FORECAST_DATA} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="foreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ecfa" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="actual" name="Actual" stroke="#7c3aed" strokeWidth={2} fill="none" dot={false} connectNulls={false} />
                <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" fill="url(#foreGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
