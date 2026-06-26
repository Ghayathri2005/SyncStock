// ─── Core Types ────────────────────────────────────────────────────────────────

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type ChannelName = "Marketplace A" | "Marketplace B" | "Marketplace C";

export interface Channel {
  id: string;
  name: ChannelName;
  isActive: boolean;
  color: string;
  icon: string;
  salesCount: number;
  revenue: number;
}

export interface ChannelStock {
  channelId: string;
  channelName: ChannelName;
  allocated: number;
  sold: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  costPrice: number;
  totalStock: number;
  lowStockThreshold: number;
  status: StockStatus;
  channelStock: ChannelStock[];
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  channel: ChannelName;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: "product" | "order" | "inventory" | "channel" | "user";
  entityId: string;
  entityName: string;
  user: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface KPIData {
  totalProducts: number;
  totalInventoryValue: number;
  activeOrders: number;
  totalRevenue: number;
  lowStockAlerts: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
  "Marketplace A": number;
  "Marketplace B": number;
  "Marketplace C": number;
}

export interface InventoryDataPoint {
  date: string;
  totalStock: number;
  sold: number;
  received: number;
}

export type SortDirection = "asc" | "desc";
export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface FilterConfig {
  search: string;
  category?: string;
  status?: string;
  channel?: string;
  dateFrom?: string;
  dateTo?: string;
}
