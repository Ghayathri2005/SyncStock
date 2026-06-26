"use client";
import { useMemo } from "react";
import { useStore } from "@/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle, Button, Badge, StockStatusBadge } from "@/components/ui";
import { Download, FileText, TrendingUp, Package, ShoppingCart, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const { products, orders, channels } = useStore();

  const reportData = useMemo(() => {
    const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
    const totalOrders = orders.length;
    const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / (totalOrders - cancelledOrders) : 0;
    const totalInventoryValue = products.reduce((s, p) => s + p.totalStock * p.costPrice, 0);
    const totalUnitsSold = products.reduce((s, p) => s + p.channelStock.reduce((cs, c) => cs + c.sold, 0), 0);
    return { totalRevenue, totalOrders, cancelledOrders, avgOrderValue, totalInventoryValue, totalUnitsSold };
  }, [products, orders]);

  const downloadReport = (type: string) => {
    const data = {
      "inventory-summary": {
        name: "Inventory Summary Report",
        headers: ["Product", "SKU", "Category", "Stock", "Status", "Cost Value", "Retail Value"],
        rows: products.map((p) => [p.name, p.sku, p.category, p.totalStock, p.status, formatCurrency(p.totalStock * p.costPrice), formatCurrency(p.totalStock * p.price)]),
      },
      "sales-report": {
        name: "Sales Report",
        headers: ["Order Number", "Customer", "Channel", "Status", "Total", "Date"],
        rows: orders.map((o) => [o.orderNumber, o.customerName, o.channel, o.status, formatCurrency(o.total), formatDate(o.createdAt)]),
      },
      "low-stock": {
        name: "Low Stock Report",
        headers: ["Product", "SKU", "Category", "Stock", "Threshold", "Status"],
        rows: products.filter((p) => p.status !== "in-stock").map((p) => [p.name, p.sku, p.category, p.totalStock, p.lowStockThreshold, p.status]),
      },
    };
    const report = data[type as keyof typeof data];
    if (!report) return;
    const csv = [report.headers, ...report.rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `syncstock-${type}-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`${report.name} downloaded!`);
  };

  const REPORT_TYPES = [
    { id: "inventory-summary", title: "Inventory Summary", description: "Complete stock levels, values, and status for all products.", icon: <Package className="w-5 h-5 text-purple-600" />, color: "bg-purple-50", records: products.length },
    { id: "sales-report", title: "Sales Report", description: "All orders with customer details, channel, and revenue data.", icon: <ShoppingCart className="w-5 h-5 text-blue-600" />, color: "bg-blue-50", records: orders.length },
    { id: "low-stock", title: "Low Stock Report", description: "Products that are running low or out of stock.", icon: <AlertTriangle className="w-5 h-5 text-amber-600" />, color: "bg-amber-50", records: products.filter((p) => p.status !== "in-stock").length },
  ];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatCurrency(reportData.totalRevenue), icon: <TrendingUp className="w-5 h-5 text-purple-600" />, color: "bg-purple-50" },
          { label: "Avg Order Value", value: formatCurrency(reportData.avgOrderValue), icon: <ShoppingCart className="w-5 h-5 text-blue-600" />, color: "bg-blue-50" },
          { label: "Inventory Value", value: formatCurrency(reportData.totalInventoryValue), icon: <Package className="w-5 h-5 text-emerald-600" />, color: "bg-emerald-50" },
          { label: "Units Sold (All Time)", value: reportData.totalUnitsSold.toLocaleString(), icon: <FileText className="w-5 h-5 text-amber-600" />, color: "bg-amber-50" },
        ].map(({ label, value, icon, color }) => (
          <Card key={label} className="flex flex-col justify-center border-slate-100 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>{icon}</div>
              <p className="text-[32px] font-bold tracking-tight text-gray-900 leading-tight">{value}</p>
              <p className="text-[13px] font-medium text-gray-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Available Reports */}
      <div>
        <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {REPORT_TYPES.map((r) => (
            <Card key={r.id} hover className="border-slate-100 shadow-sm">
              <CardContent className="pt-5 pb-5">
                <div className={`w-10 h-10 rounded-xl ${r.color} flex items-center justify-center mb-4`}>{r.icon}</div>
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1">{r.title}</h3>
                <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">{r.description}</p>
                <div className="flex items-center justify-between mt-5">
                  <span className="text-[12px] font-medium text-gray-400">{r.records} records</span>
                  <Button size="sm" variant="secondary" onClick={() => downloadReport(r.id)}>
                    <Download className="w-4 h-4" /> Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Inventory by Category */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-4">
          <CardTitle>Inventory by Category</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4">
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {["Category", "Products", "Total Stock", "Inventory Value", "Low Stock", "Out of Stock"].map((h) => (
                    <th key={h} className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Object.entries(
                  products.reduce<Record<string, { count: number; stock: number; value: number; low: number; out: number }>>((acc, p) => {
                    if (!acc[p.category]) acc[p.category] = { count: 0, stock: 0, value: 0, low: 0, out: 0 };
                    acc[p.category].count++;
                    acc[p.category].stock += p.totalStock;
                    acc[p.category].value += p.totalStock * p.costPrice;
                    if (p.status === "low-stock") acc[p.category].low++;
                    if (p.status === "out-of-stock") acc[p.category].out++;
                    return acc;
                  }, {})
                ).map(([cat, data]) => (
                  <tr key={cat} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-[14px] font-semibold text-gray-900">{cat}</td>
                    <td className="px-5 py-4 text-[14px] text-gray-600 font-medium">{data.count}</td>
                    <td className="px-5 py-4 text-[14px] text-gray-600 font-medium">{data.stock.toLocaleString()}</td>
                    <td className="px-5 py-4 text-[14px] font-bold text-gray-900">{formatCurrency(data.value)}</td>
                    <td className="px-5 py-4">
                      {data.low > 0 ? <Badge variant="warning" className="px-2 py-0.5 text-[11px]">{data.low}</Badge> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      {data.out > 0 ? <Badge variant="danger" className="px-2 py-0.5 text-[11px]">{data.out}</Badge> : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Low Stock Products */}
      {products.filter((p) => p.status !== "in-stock").length > 0 && (
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Low Stock Alert</CardTitle>
              <Button size="sm" variant="outline" onClick={() => downloadReport("low-stock")}><Download className="w-4 h-4" /> Export</Button>
            </div>
          </CardHeader>
          <div className="px-4 pb-4">
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    {["Product", "SKU", "Stock", "Threshold", "Status", "Value at Risk"].map((h) => (
                      <th key={h} className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.filter((p) => p.status !== "in-stock").map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-[14px] font-semibold text-gray-900">{p.name}</td>
                      <td className="px-5 py-4"><code className="text-[12px] font-mono bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md border border-gray-100">{p.sku}</code></td>
                      <td className="px-5 py-4">
                        <span className={`text-[14px] font-bold ${p.totalStock === 0 ? "text-red-600" : "text-amber-600"}`}>{p.totalStock}</span>
                      </td>
                      <td className="px-5 py-4 text-[14px] text-gray-600 font-medium">{p.lowStockThreshold}</td>
                      <td className="px-5 py-4"><StockStatusBadge status={p.status} /></td>
                      <td className="px-5 py-4 text-[14px] font-bold text-gray-900">{formatCurrency(p.totalStock * p.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
