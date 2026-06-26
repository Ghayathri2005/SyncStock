"use client";
import { useState, useMemo } from "react";
import { useStore } from "@/store";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle, StockStatusBadge, Badge, Button, Modal, Input } from "@/components/ui";
import { ChannelName } from "@/types";
import toast from "react-hot-toast";
import { RefreshCw, TrendingDown, Package, AlertTriangle, Minus, Plus, ArrowRight } from "lucide-react";

// ─── Simulate Sale Modal ────────────────────────────────────────────────────────
interface SellModalProps {
  productId: string;
  productName: string;
  totalStock: number;
  onClose: () => void;
}
function SellModal({ productId, productName, totalStock, onClose }: SellModalProps) {
  const { sellProduct } = useStore();
  const [channel, setChannel] = useState<ChannelName>("Marketplace A");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSell = async () => {
    if (qty < 1) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const ok = sellProduct(productId, channel, qty);
    setLoading(false);
    if (ok) {
      toast.success(`Synced! ${qty} unit(s) sold via ${channel}. Stock updated across all channels.`);
      onClose();
    } else {
      toast.error("Insufficient stock for this operation.");
    }
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Product Info Section */}
      <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100">
        <p className="text-base font-semibold text-purple-900">{productName}</p>
        <p className="text-sm text-purple-700 mt-1">Current total stock: <strong>{totalStock}</strong> units</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Channel Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Marketplace Channel</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as ChannelName)}
            className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm cursor-pointer"
          >
            <option>Marketplace A</option>
            <option>Marketplace B</option>
            <option>Marketplace C</option>
          </select>
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity to Sell</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 transition-colors">
              <Minus className="w-5 h-5" />
            </button>
            <input
              type="number"
              min={1}
              max={totalStock}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(totalStock, parseInt(e.target.value) || 1)))}
              className="flex-1 h-12 text-center rounded-xl border border-gray-200 text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
            />
            <button onClick={() => setQty((q) => Math.min(totalStock, q + 1))} className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stock Preview */}
      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mt-2">
        <p className="text-sm font-medium text-emerald-800">Stock preview after sale:</p>
        <div className="flex items-center gap-3 mt-2 text-lg font-bold text-emerald-900">
          <span>{totalStock}</span>
          <ArrowRight className="w-5 h-5 text-emerald-600" />
          <span>{totalStock - qty} units</span>
        </div>
        <p className="text-xs text-emerald-600 mt-1">Automatically syncing to all connected channels...</p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t border-gray-100">
        <Button variant="outline" size="lg" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button size="lg" className="flex-1" loading={loading} onClick={handleSell}>
          <RefreshCw className="w-4 h-4" /> Simulate Sale & Sync
        </Button>
      </div>
    </div>
  );
}

// ─── Inventory Page ────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const { products, channels } = useStore();
  const [sellModalProduct, setSellModalProduct] = useState<{ id: string; name: string; stock: number } | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    return list;
  }, [products, search, statusFilter]);

  const stats = useMemo(() => ({
    inStock: products.filter((p) => p.status === "in-stock").length,
    lowStock: products.filter((p) => p.status === "low-stock").length,
    outOfStock: products.filter((p) => p.status === "out-of-stock").length,
    totalUnits: products.reduce((s, p) => s + p.totalStock, 0),
    totalValue: products.reduce((s, p) => s + p.totalStock * p.costPrice, 0),
  }), [products]);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Units", value: stats.totalUnits.toLocaleString(), color: "bg-purple-50", text: "text-purple-600" },
          { label: "Inventory Value", value: formatCurrency(stats.totalValue), color: "bg-blue-50", text: "text-blue-600" },
          { label: "In Stock", value: stats.inStock, color: "bg-emerald-50", text: "text-emerald-600" },
          { label: "Low Stock", value: stats.lowStock, color: "bg-amber-50", text: "text-amber-600" },
          { label: "Out of Stock", value: stats.outOfStock, color: "bg-red-50", text: "text-red-600" },
        ].map(({ label, value, color, text }) => (
          <Card key={label} className="flex flex-col justify-center border-slate-100">
            <CardContent className="pt-5 pb-5">
              <p className={`text-[32px] font-bold tracking-tight leading-tight ${text}`}>{value}</p>
              <p className="text-[13px] font-medium text-gray-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Channel Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {channels.map((ch) => {
          const totalAllocated = products.reduce((s, p) => s + (p.channelStock.find((c) => c.channelId === ch.id)?.allocated ?? 0), 0);
          const totalSold = products.reduce((s, p) => s + (p.channelStock.find((c) => c.channelId === ch.id)?.sold ?? 0), 0);
          return (
            <Card key={ch.id} className="border-slate-100">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: ch.color }} />
                    <span className="text-[14px] font-semibold text-gray-900">{ch.name}</span>
                  </div>
                  <Badge variant={ch.isActive ? "success" : "danger"}>{ch.isActive ? "Active" : "Inactive"}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2.5 bg-gray-50 rounded-xl">
                    <p className="text-lg font-bold text-gray-900">{totalAllocated}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Allocated</p>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl">
                    <p className="text-lg font-bold text-gray-900">{totalSold}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Sold</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Sell-through rate</span>
                    <span>{totalAllocated + totalSold > 0 ? Math.round((totalSold / (totalAllocated + totalSold)) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        background: ch.color,
                        width: `${totalAllocated + totalSold > 0 ? Math.round((totalSold / (totalAllocated + totalSold)) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Inventory Table */}
      <Card className="overflow-hidden shadow-sm border-slate-100">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Inventory Sync Control</CardTitle>
            <div className="flex gap-3">
              <input
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-4 pr-4 w-56 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all"
              >
                <option value="">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {["Product", "SKU", "Status", "Total Stock", "Mkt A", "Mkt B", "Mkt C", "Value", "Action"].map((h) => (
                  <th key={h} className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => {
                const csA = p.channelStock.find((c) => c.channelName === "Marketplace A");
                const csB = p.channelStock.find((c) => c.channelName === "Marketplace B");
                const csC = p.channelStock.find((c) => c.channelName === "Marketplace C");
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-purple-500" />
                        </div>
                        <p className="text-[14px] font-semibold text-gray-900 truncate max-w-[180px]">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4"><code className="text-[12px] text-gray-500 px-2 py-0.5 bg-gray-50 rounded-md border border-gray-100 font-mono">{p.sku}</code></td>
                    <td className="px-5 py-4"><StockStatusBadge status={p.status} /></td>
                    <td className="px-5 py-4">
                      <span className={`text-[14px] font-bold ${p.totalStock === 0 ? "text-red-600" : p.totalStock <= p.lowStockThreshold ? "text-amber-600" : "text-gray-900"}`}>
                        {p.totalStock}
                      </span>
                    </td>
                    {[csA, csB, csC].map((cs, i) => (
                      <td key={i} className="px-5 py-4">
                        <div className="text-[14px]">
                          <span className="font-semibold text-gray-900">{cs?.allocated ?? 0}</span>
                          <span className="text-gray-400 text-[12px] ml-1">/ {cs?.sold ?? 0}</span>
                        </div>
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <span className="text-[14px] font-semibold text-gray-900">{formatCurrency(p.totalStock * p.costPrice)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={p.totalStock === 0}
                        onClick={() => setSellModalProduct({ id: p.id, name: p.name, stock: p.totalStock })}
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Simulate
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Sell Modal */}
      <Modal size="lg" open={!!sellModalProduct} onClose={() => setSellModalProduct(null)} title="Simulate Sale & Sync Inventory" description="Selling through any channel instantly updates stock across all channels.">
        {sellModalProduct && (
          <SellModal
            productId={sellModalProduct.id}
            productName={sellModalProduct.name}
            totalStock={sellModalProduct.stock}
            onClose={() => setSellModalProduct(null)}
          />
        )}
      </Modal>
    </div>
  );
}
