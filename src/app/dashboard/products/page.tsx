"use client";
import { useState, useMemo } from "react";
import { useStore } from "@/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Product } from "@/types";
import {
  Button, Badge, Input, Select, Card, EmptyState,
  ConfirmDialog, Modal, StockStatusBadge, Skeleton,
} from "@/components/ui";
import toast from "react-hot-toast";
import {
  Plus, Search, Filter, ArrowUpDown, Download, Package,
  Edit2, Trash2, Eye, ChevronLeft, ChevronRight,
} from "lucide-react";

const CATEGORIES = ["Electronics", "Furniture", "Wearables", "Sports", "Clothing", "Beauty", "Books", "Home"];

// ─── Product Form ──────────────────────────────────────────────────────────────
interface ProductFormProps {
  initial?: Partial<Product>;
  onSave: (data: Omit<Product, "id" | "createdAt" | "updatedAt" | "status">) => void;
  onClose: () => void;
  loading?: boolean;
}
function ProductForm({ initial, onSave, onClose, loading }: ProductFormProps) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    sku: initial?.sku || "",
    category: initial?.category || "Electronics",
    description: initial?.description || "",
    price: initial?.price ?? 0,
    costPrice: initial?.costPrice ?? 0,
    totalStock: initial?.totalStock ?? 0,
    lowStockThreshold: initial?.lowStockThreshold ?? 10,
    tags: (initial?.tags || []).join(", "),
    channelStock: initial?.channelStock || [
      { channelId: "ch-a", channelName: "Marketplace A" as const, allocated: 0, sold: 0 },
      { channelId: "ch-b", channelName: "Marketplace B" as const, allocated: 0, sold: 0 },
      { channelId: "ch-c", channelName: "Marketplace C" as const, allocated: 0, sold: 0 },
    ],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.sku.trim()) e.sku = "SKU is required";
    if (form.price <= 0) e.price = "Price must be greater than 0";
    if (form.totalStock < 0) e.totalStock = "Stock cannot be negative";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
  };

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input label="Product Name" placeholder="e.g. Wireless Headphones" value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
        </div>
        <Input label="SKU" placeholder="e.g. WNC-HP-001" value={form.sku} onChange={(e) => set("sku", e.target.value)} error={errors.sku} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="Product description..."
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>
        <Input label="Selling Price ($)" type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", parseFloat(e.target.value) || 0)} error={errors.price} />
        <Input label="Cost Price ($)" type="number" min="0" step="0.01" value={form.costPrice} onChange={(e) => set("costPrice", parseFloat(e.target.value) || 0)} />
        <Input label="Total Stock" type="number" min="0" value={form.totalStock} onChange={(e) => set("totalStock", parseInt(e.target.value) || 0)} error={errors.totalStock} />
        <Input label="Low Stock Threshold" type="number" min="0" value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", parseInt(e.target.value) || 0)} />
        <div className="col-span-2">
          <Input label="Tags (comma-separated)" placeholder="e.g. electronics, wireless, audio" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading}>{initial?.id ? "Save Changes" : "Add Product"}</Button>
      </div>
    </form>
  );
}

// ─── Products Page ─────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof Product>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const PAGE_SIZE = 8;

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter) list = list.filter((p) => p.category === categoryFilter);
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    list.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(String(bv)) : (Number(av) - Number(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [products, search, categoryFilter, statusFilter, sortKey, sortDir]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: keyof Product) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleAdd = async (data: Omit<Product, "id" | "createdAt" | "updatedAt" | "status">) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    addProduct(data);
    setAddOpen(false);
    setSaving(false);
    toast.success("Product added successfully!");
  };

  const handleEdit = async (data: Omit<Product, "id" | "createdAt" | "updatedAt" | "status">) => {
    if (!editProduct) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    updateProduct(editProduct.id, data);
    setEditProduct(null);
    setSaving(false);
    toast.success("Product updated successfully!");
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteProduct(deleteId);
    setDeleteId(null);
    toast.success("Product deleted.");
  };

  const exportCSV = () => {
    const headers = ["Name", "SKU", "Category", "Price", "Cost", "Stock", "Status"];
    const rows = filtered.map((p) => [p.name, p.sku, p.category, p.price, p.costPrice, p.totalStock, p.status]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "syncstock-products.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Products exported to CSV!");
  };

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="space-y-10">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left: Search + Filters */}
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center justify-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              placeholder="Search by name or SKU…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-12 pl-14 pr-4 w-80 rounded-2xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="h-12 px-4 rounded-2xl border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-12 px-4 rounded-2xl border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
        {/* Right: Action Buttons */}
        <div className="flex items-center gap-4 shrink-0">
          <Button variant="outline" size="md" onClick={exportCSV}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button size="md" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border border-gray-200/60 shadow-md">
        <div className="p-2 sm:p-4">
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {[
                  { key: "name", label: "Product" },
                  { key: "sku", label: "SKU" },
                  { key: "category", label: "Category" },
                  { key: "price", label: "Price" },
                  { key: "totalStock", label: "Stock" },
                  { key: "status", label: "Status" },
                  { key: null, label: "Actions" },
                ].map(({ key, label }) => (
                  <th
                    key={label}
                    className={`text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-4 ${key ? "cursor-pointer hover:text-gray-700 select-none" : ""}`}
                    onClick={() => key && handleSort(key as keyof Product)}
                  >
                    <div className="flex items-center gap-1.5">
                      {label}
                      {key && <ArrowUpDown className="w-3 h-3 opacity-50" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={<Package className="w-6 h-6" />}
                      title="No products found"
                      description="Try adjusting your search or filter, or add your first product."
                      action={<Button size="sm" onClick={() => setAddOpen(true)}><Plus className="w-3.5 h-3.5" /> Add Product</Button>}
                    />
                  </td>
                </tr>
              ) : (
                paged.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                          <Package className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{product.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{product.tags.slice(0, 2).join(", ")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg font-mono tracking-wide">{product.sku}</code>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="outline">{product.category}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Cost: {formatCurrency(product.costPrice)}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className={`text-sm font-semibold ${product.totalStock === 0 ? "text-red-600" : product.totalStock <= product.lowStockThreshold ? "text-amber-600" : "text-gray-900"}`}>
                          {product.totalStock}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">Min: {product.lowStockThreshold}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StockStatusBadge status={product.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewProduct(product)}
                          className="p-2 hover:bg-purple-50 text-gray-400 hover:text-purple-600 rounded-xl transition-colors"
                          title="View"
                        ><Eye className="w-4 h-4" /></button>
                        <button
                          onClick={() => setEditProduct(product)}
                          className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl transition-colors"
                          title="Edit"
                        ><Edit2 className="w-4 h-4" /></button>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-colors"
                          title="Delete"
                        ><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === page ? "bg-purple-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Product" description="Fill in the details to add a new product." size="lg">
        <ProductForm onSave={handleAdd} onClose={() => setAddOpen(false)} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product" description="Update the product information." size="lg">
        {editProduct && <ProductForm initial={editProduct} onSave={handleEdit} onClose={() => setEditProduct(null)} loading={saving} />}
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewProduct} onClose={() => setViewProduct(null)} title="Product Details" size="lg">
        {viewProduct && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Name", value: viewProduct.name },
                { label: "SKU", value: viewProduct.sku },
                { label: "Category", value: viewProduct.category },
                { label: "Price", value: formatCurrency(viewProduct.price) },
                { label: "Cost Price", value: formatCurrency(viewProduct.costPrice) },
                { label: "Total Stock", value: viewProduct.totalStock },
                { label: "Low Stock Threshold", value: viewProduct.lowStockThreshold },
                { label: "Created", value: formatDate(viewProduct.createdAt) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="font-medium text-gray-900">{String(value)}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Description</p>
              <p className="text-sm text-gray-700">{viewProduct.description || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Status</p>
              <StockStatusBadge status={viewProduct.status} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-3">Channel Stock Distribution</p>
              <div className="space-y-2">
                {viewProduct.channelStock.map((cs) => (
                  <div key={cs.channelId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cs.channelName}</p>
                      <p className="text-xs text-gray-500">{cs.sold} sold</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{cs.allocated}</p>
                      <p className="text-xs text-gray-500">allocated</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button variant="outline" className="flex-1" onClick={() => { setViewProduct(null); setEditProduct(viewProduct); }}>
                <Edit2 className="w-3.5 h-3.5" /> Edit Product
              </Button>
              <Button variant="danger" size="md" onClick={() => { setDeleteId(viewProduct.id); setViewProduct(null); }}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Product"
        description="This action cannot be undone. The product and its inventory data will be permanently removed."
        confirmLabel="Delete Product"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
