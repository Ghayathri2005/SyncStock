"use client";
import { useState, useMemo } from "react";
import { useStore } from "@/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Order, OrderStatus, ChannelName } from "@/types";
import {
  Button, Card, EmptyState, ConfirmDialog, Modal,
  OrderStatusBadge, Badge
} from "@/components/ui";
import toast from "react-hot-toast";
import {
  Plus, Search, Download, ShoppingCart, Edit2,
  Trash2, Eye, ChevronLeft, ChevronRight, ArrowUpDown
} from "lucide-react";

const STATUS_OPTIONS: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

// ─── Order Form ────────────────────────────────────────────────────────────────
function OrderForm({ initial, onSave, onClose, loading }: {
  initial?: Partial<Order>;
  onSave: (data: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
  loading?: boolean;
}) {
  const { products } = useStore();
  const [form, setForm] = useState({
    customerName: initial?.customerName || "",
    customerEmail: initial?.customerEmail || "",
    customerId: initial?.customerId || `cust-${Date.now()}`,
    channel: (initial?.channel || "Marketplace A") as ChannelName,
    status: (initial?.status || "pending") as OrderStatus,
    shippingAddress: initial?.shippingAddress || "",
    notes: initial?.notes || "",
    productId: "",
    qty: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedProduct = products.find((p) => p.id === form.productId);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = "Customer name required";
    if (!form.customerEmail.trim() || !/\S+@\S+\.\S+/.test(form.customerEmail)) e.customerEmail = "Valid email required";
    if (!form.shippingAddress.trim()) e.shippingAddress = "Shipping address required";
    if (!form.productId) e.productId = "Select a product";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedProduct) return;
    const subtotal = selectedProduct.price * form.qty;
    const tax = Math.round(subtotal * 0.1);
    const shipping = subtotal > 500 ? 0 : 15;
    onSave({
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      customerId: form.customerId,
      channel: form.channel,
      status: form.status,
      shippingAddress: form.shippingAddress,
      notes: form.notes,
      items: [{ productId: selectedProduct.id, productName: selectedProduct.name, sku: selectedProduct.sku, quantity: form.qty, price: selectedProduct.price }],
      subtotal,
      tax,
      shipping,
      total: subtotal + tax + shipping,
    });
  };

  const f = (k: string, v: unknown) => setForm((x) => ({ ...x, [k]: v }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer Name</label>
          <input value={form.customerName} onChange={(e) => f("customerName", e.target.value)} placeholder="Full name" className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          {errors.customerName && <p className="text-xs text-red-600 mt-1">{errors.customerName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input type="email" value={form.customerEmail} onChange={(e) => f("customerEmail", e.target.value)} placeholder="email@example.com" className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          {errors.customerEmail && <p className="text-xs text-red-600 mt-1">{errors.customerEmail}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Channel</label>
          <select value={form.channel} onChange={(e) => f("channel", e.target.value as ChannelName)} className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>Marketplace A</option>
            <option>Marketplace B</option>
            <option>Marketplace C</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
          <select value={form.status} onChange={(e) => f("status", e.target.value as OrderStatus)} className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping Address</label>
          <input value={form.shippingAddress} onChange={(e) => f("shippingAddress", e.target.value)} placeholder="123 Main St, City, State ZIP" className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          {errors.shippingAddress && <p className="text-xs text-red-600 mt-1">{errors.shippingAddress}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Product</label>
          <select value={form.productId} onChange={(e) => f("productId", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Select product…</option>
            {products.filter((p) => p.totalStock > 0).map((p) => <option key={p.id} value={p.id}>{p.name} (Stock: {p.totalStock})</option>)}
          </select>
          {errors.productId && <p className="text-xs text-red-600 mt-1">{errors.productId}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
          <input type="number" min={1} max={selectedProduct?.totalStock || 999} value={form.qty} onChange={(e) => f("qty", parseInt(e.target.value) || 1)} className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
      </div>

      {selectedProduct && (
        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-sm">
          <div className="flex justify-between text-xs text-purple-700">
            <span>{selectedProduct.name} × {form.qty}</span>
            <span className="font-semibold">{formatCurrency(selectedProduct.price * form.qty)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading}>{initial?.id ? "Save Changes" : "Create Order"}</Button>
      </div>
    </form>
  );
}

// ─── Orders Page ───────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const { orders, addOrder, updateOrderStatus, deleteOrder } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const PAGE_SIZE = 8;

  const filtered = useMemo(() => {
    let list = [...orders];
    if (search) list = list.filter((o) => o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) list = list.filter((o) => o.status === statusFilter);
    if (channelFilter) list = list.filter((o) => o.channel === channelFilter);
    list.sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === "asc" ? diff : -diff;
    });
    return list;
  }, [orders, search, statusFilter, channelFilter, sortDir]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);

  const handleAdd = async (data: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    addOrder(data);
    setAddOpen(false);
    setSaving(false);
    toast.success("Order created and inventory updated!");
  };

  const handleStatusChange = (id: string, status: OrderStatus) => {
    updateOrderStatus(id, status);
    toast.success(`Order status updated to ${status}.`);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteOrder(deleteId);
    setDeleteId(null);
    toast.success("Order deleted.");
  };

  const exportCSV = () => {
    const headers = ["Order Number", "Customer", "Channel", "Status", "Total", "Date"];
    const rows = filtered.map((o) => [o.orderNumber, o.customerName, o.channel, o.status, o.total, formatDate(o.createdAt)]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "syncstock-orders.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Orders exported to CSV!");
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return counts;
  }, [orders]);

  return (
    <div className="space-y-8">
      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(statusFilter === s ? "" : s); setPage(1); }}
            className={`p-5 rounded-2xl border text-center transition-all ${statusFilter === s ? "border-purple-300 bg-purple-50 shadow-md scale-[1.02]" : "bg-white border-slate-100 shadow-sm hover:border-purple-200 hover:shadow-md"}`}
          >
            <p className="text-[32px] font-bold tracking-tight text-gray-900 leading-tight">{statusCounts[s] || 0}</p>
            <p className="text-[13px] font-medium text-gray-500 capitalize mt-1">{s}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center justify-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input placeholder="Search orders or customers…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-10 pl-10 pr-4 w-72 rounded-xl border border-slate-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm" />
          </div>
          <select value={channelFilter} onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all cursor-pointer">
            <option value="">All Channels</option>
            <option>Marketplace A</option>
            <option>Marketplace B</option>
            <option>Marketplace C</option>
          </select>
          <button onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="h-10 px-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-gray-600 hover:border-purple-200 shadow-sm transition-colors">
            <ArrowUpDown className="w-4 h-4" /> Date {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>
        <div className="flex gap-4 shrink-0">
          <Button variant="outline" size="md" onClick={exportCSV}><Download className="w-4 h-4" /> Export CSV</Button>
          <Button size="md" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Create Order</Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden shadow-sm border border-gray-200/60 mt-4">
        <div className="p-2 sm:p-4">
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {["Order", "Customer", "Channel", "Items", "Total", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr><td colSpan={8} className="py-8"><EmptyState icon={<ShoppingCart className="w-8 h-8" />} title="No orders found" description="Create your first order to get started." action={<Button size="md" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Create Order</Button>} /></td></tr>
              ) : paged.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-4">
                    <span className="text-[14px] font-semibold text-purple-700 tracking-tight">{order.orderNumber}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-[14px] font-semibold text-gray-900">{order.customerName}</p>
                      <p className="text-[12px] text-gray-500 mt-0.5">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="outline" className="text-[12px] font-medium bg-white px-2 py-0.5">{order.channel}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[14px] font-medium text-gray-600">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[14px] font-bold text-gray-900">{formatCurrency(order.total)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="h-8 px-2.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white cursor-pointer hover:border-gray-300 transition-all"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[13px] text-gray-500 font-medium">{formatDate(order.createdAt)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setViewOrder(order)} className="p-1.5 hover:bg-purple-50 text-gray-400 hover:text-purple-600 rounded-lg transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(order.id)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === page ? "bg-purple-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create Order" description="Fill in customer and product details." size="lg">
        <OrderForm onSave={handleAdd} onClose={() => setAddOpen(false)} loading={saving} />
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title="Order Details" size="lg">
        {viewOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Order Number", value: viewOrder.orderNumber },
                { label: "Channel", value: viewOrder.channel },
                { label: "Customer", value: viewOrder.customerName },
                { label: "Email", value: viewOrder.customerEmail },
                { label: "Shipping Address", value: viewOrder.shippingAddress },
                { label: "Order Date", value: formatDate(viewOrder.createdAt) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="font-medium text-gray-900 text-sm">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Status</p>
              <OrderStatusBadge status={viewOrder.status} />
            </div>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 text-xs font-medium text-gray-500 border-b border-gray-100">Items</div>
              {viewOrder.items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                    <p className="text-xs text-gray-500">SKU: {item.sku} × {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="px-4 py-3 bg-gray-50 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(viewOrder.subtotal)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Tax</span><span>{formatCurrency(viewOrder.tax)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{viewOrder.shipping === 0 ? "Free" : formatCurrency(viewOrder.shipping)}</span></div>
                <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200"><span>Total</span><span>{formatCurrency(viewOrder.total)}</span></div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog open={!!deleteId} title="Delete Order" description="This will permanently delete the order. Any inventory changes will not be automatically reversed." confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
