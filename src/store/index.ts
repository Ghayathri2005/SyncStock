"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Product,
  Order,
  ActivityLog,
  Channel,
  ChannelName,
  OrderStatus,
} from "@/types";
import { generateId, getStockStatus } from "@/lib/utils";

// ─── Seed Data ────────────────────────────────────────────────────────────────

const CHANNELS: Channel[] = [
  {
    id: "ch-a",
    name: "Marketplace A",
    isActive: true,
    color: "#7c3aed",
    icon: "ShoppingBag",
    salesCount: 842,
    revenue: 67340,
  },
  {
    id: "ch-b",
    name: "Marketplace B",
    isActive: true,
    color: "#3b82f6",
    icon: "Store",
    salesCount: 631,
    revenue: 51200,
  },
  {
    id: "ch-c",
    name: "Marketplace C",
    isActive: true,
    color: "#10b981",
    icon: "Globe",
    salesCount: 419,
    revenue: 34870,
  },
];

const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    name: "Wireless Noise-Cancelling Headphones",
    sku: "WNC-HP-001",
    category: "Electronics",
    description: "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and Bluetooth 5.2.",
    price: 299.99,
    costPrice: 120.00,
    totalStock: 85,
    lowStockThreshold: 15,
    status: "in-stock",
    channelStock: [
      { channelId: "ch-a", channelName: "Marketplace A", allocated: 40, sold: 23 },
      { channelId: "ch-b", channelName: "Marketplace B", allocated: 30, sold: 15 },
      { channelId: "ch-c", channelName: "Marketplace C", allocated: 15, sold: 8 },
    ],
    tags: ["electronics", "audio", "wireless"],
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-06-01T14:30:00Z",
  },
  {
    id: "prod-002",
    name: "Ergonomic Office Chair",
    sku: "ERG-CHR-002",
    category: "Furniture",
    description: "Fully adjustable ergonomic chair with lumbar support, mesh back, and 5-year warranty.",
    price: 549.00,
    costPrice: 210.00,
    totalStock: 12,
    lowStockThreshold: 15,
    status: "low-stock",
    channelStock: [
      { channelId: "ch-a", channelName: "Marketplace A", allocated: 6, sold: 41 },
      { channelId: "ch-b", channelName: "Marketplace B", allocated: 4, sold: 28 },
      { channelId: "ch-c", channelName: "Marketplace C", allocated: 2, sold: 19 },
    ],
    tags: ["furniture", "office", "ergonomic"],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-06-10T11:00:00Z",
  },
  {
    id: "prod-003",
    name: "Smart Fitness Tracker Band",
    sku: "SFT-BND-003",
    category: "Wearables",
    description: "Advanced fitness band with heart rate monitor, GPS, sleep tracking, and 7-day battery.",
    price: 149.99,
    costPrice: 48.00,
    totalStock: 0,
    lowStockThreshold: 10,
    status: "out-of-stock",
    channelStock: [
      { channelId: "ch-a", channelName: "Marketplace A", allocated: 0, sold: 89 },
      { channelId: "ch-b", channelName: "Marketplace B", allocated: 0, sold: 64 },
      { channelId: "ch-c", channelName: "Marketplace C", allocated: 0, sold: 47 },
    ],
    tags: ["wearables", "fitness", "smart"],
    createdAt: "2024-02-01T08:00:00Z",
    updatedAt: "2024-06-15T09:00:00Z",
  },
  {
    id: "prod-004",
    name: "4K Ultra HD Monitor 27\"",
    sku: "MON-4K-004",
    category: "Electronics",
    description: "IPS panel, 144Hz refresh rate, 1ms response time, HDR400, USB-C connectivity.",
    price: 799.00,
    costPrice: 320.00,
    totalStock: 34,
    lowStockThreshold: 10,
    status: "in-stock",
    channelStock: [
      { channelId: "ch-a", channelName: "Marketplace A", allocated: 18, sold: 12 },
      { channelId: "ch-b", channelName: "Marketplace B", allocated: 10, sold: 7 },
      { channelId: "ch-c", channelName: "Marketplace C", allocated: 6, sold: 3 },
    ],
    tags: ["electronics", "monitor", "display"],
    createdAt: "2024-02-10T12:00:00Z",
    updatedAt: "2024-06-05T16:00:00Z",
  },
  {
    id: "prod-005",
    name: "Standing Desk Converter",
    sku: "SDC-DSK-005",
    category: "Furniture",
    description: "Height-adjustable desk converter, dual-monitor support, smooth pneumatic lift.",
    price: 349.00,
    costPrice: 130.00,
    totalStock: 8,
    lowStockThreshold: 10,
    status: "low-stock",
    channelStock: [
      { channelId: "ch-a", channelName: "Marketplace A", allocated: 4, sold: 29 },
      { channelId: "ch-b", channelName: "Marketplace B", allocated: 3, sold: 18 },
      { channelId: "ch-c", channelName: "Marketplace C", allocated: 1, sold: 11 },
    ],
    tags: ["furniture", "office", "standing-desk"],
    createdAt: "2024-02-20T10:00:00Z",
    updatedAt: "2024-06-12T14:00:00Z",
  },
  {
    id: "prod-006",
    name: "Mechanical Keyboard TKL",
    sku: "KB-MEC-006",
    category: "Electronics",
    description: "Tenkeyless mechanical keyboard with Cherry MX switches, RGB backlight, aluminum frame.",
    price: 189.99,
    costPrice: 65.00,
    totalStock: 67,
    lowStockThreshold: 12,
    status: "in-stock",
    channelStock: [
      { channelId: "ch-a", channelName: "Marketplace A", allocated: 35, sold: 18 },
      { channelId: "ch-b", channelName: "Marketplace B", allocated: 20, sold: 11 },
      { channelId: "ch-c", channelName: "Marketplace C", allocated: 12, sold: 6 },
    ],
    tags: ["electronics", "keyboard", "mechanical"],
    createdAt: "2024-03-01T09:00:00Z",
    updatedAt: "2024-06-08T11:00:00Z",
  },
  {
    id: "prod-007",
    name: "Portable SSD 1TB",
    sku: "SSD-PRT-007",
    category: "Electronics",
    description: "NVMe portable SSD, read speeds up to 1050 MB/s, USB-C 3.2, shock-resistant.",
    price: 129.99,
    costPrice: 45.00,
    totalStock: 145,
    lowStockThreshold: 20,
    status: "in-stock",
    channelStock: [
      { channelId: "ch-a", channelName: "Marketplace A", allocated: 70, sold: 34 },
      { channelId: "ch-b", channelName: "Marketplace B", allocated: 50, sold: 22 },
      { channelId: "ch-c", channelName: "Marketplace C", allocated: 25, sold: 15 },
    ],
    tags: ["electronics", "storage", "ssd"],
    createdAt: "2024-03-15T08:00:00Z",
    updatedAt: "2024-06-03T13:00:00Z",
  },
  {
    id: "prod-008",
    name: "Yoga Mat Premium",
    sku: "YGM-PRM-008",
    category: "Sports",
    description: "6mm thick non-slip yoga mat, eco-friendly TPE material, alignment lines, carry strap.",
    price: 79.99,
    costPrice: 22.00,
    totalStock: 220,
    lowStockThreshold: 25,
    status: "in-stock",
    channelStock: [
      { channelId: "ch-a", channelName: "Marketplace A", allocated: 100, sold: 67 },
      { channelId: "ch-b", channelName: "Marketplace B", allocated: 80, sold: 45 },
      { channelId: "ch-c", channelName: "Marketplace C", allocated: 40, sold: 28 },
    ],
    tags: ["sports", "yoga", "fitness"],
    createdAt: "2024-03-20T07:00:00Z",
    updatedAt: "2024-06-01T10:00:00Z",
  },
];

const SEED_ORDERS: Order[] = [
  {
    id: "ord-001",
    orderNumber: "SS-2024-0001",
    customerId: "cust-001",
    customerName: "Emma Richardson",
    customerEmail: "emma.r@example.com",
    channel: "Marketplace A",
    status: "delivered",
    items: [
      { productId: "prod-001", productName: "Wireless Noise-Cancelling Headphones", sku: "WNC-HP-001", quantity: 2, price: 299.99 },
    ],
    subtotal: 599.98,
    tax: 60.00,
    shipping: 0,
    total: 659.98,
    shippingAddress: "123 Maple St, New York, NY 10001",
    createdAt: "2024-06-01T10:00:00Z",
    updatedAt: "2024-06-05T14:00:00Z",
  },
  {
    id: "ord-002",
    orderNumber: "SS-2024-0002",
    customerId: "cust-002",
    customerName: "James Thornton",
    customerEmail: "j.thornton@example.com",
    channel: "Marketplace B",
    status: "processing",
    items: [
      { productId: "prod-004", productName: "4K Ultra HD Monitor 27\"", sku: "MON-4K-004", quantity: 1, price: 799.00 },
      { productId: "prod-006", productName: "Mechanical Keyboard TKL", sku: "KB-MEC-006", quantity: 1, price: 189.99 },
    ],
    subtotal: 988.99,
    tax: 99.00,
    shipping: 15.00,
    total: 1102.99,
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90001",
    createdAt: "2024-06-10T09:00:00Z",
    updatedAt: "2024-06-11T11:00:00Z",
  },
  {
    id: "ord-003",
    orderNumber: "SS-2024-0003",
    customerId: "cust-003",
    customerName: "Sophia Martinez",
    customerEmail: "sophia.m@example.com",
    channel: "Marketplace A",
    status: "shipped",
    items: [
      { productId: "prod-007", productName: "Portable SSD 1TB", sku: "SSD-PRT-007", quantity: 3, price: 129.99 },
    ],
    subtotal: 389.97,
    tax: 39.00,
    shipping: 0,
    total: 428.97,
    shippingAddress: "789 Pine Rd, Chicago, IL 60601",
    createdAt: "2024-06-12T15:00:00Z",
    updatedAt: "2024-06-13T08:00:00Z",
  },
  {
    id: "ord-004",
    orderNumber: "SS-2024-0004",
    customerId: "cust-004",
    customerName: "Liam Chen",
    customerEmail: "liam.c@example.com",
    channel: "Marketplace C",
    status: "pending",
    items: [
      { productId: "prod-008", productName: "Yoga Mat Premium", sku: "YGM-PRM-008", quantity: 5, price: 79.99 },
    ],
    subtotal: 399.95,
    tax: 40.00,
    shipping: 20.00,
    total: 459.95,
    shippingAddress: "321 Birch Blvd, Houston, TX 77001",
    createdAt: "2024-06-14T11:00:00Z",
    updatedAt: "2024-06-14T11:00:00Z",
  },
  {
    id: "ord-005",
    orderNumber: "SS-2024-0005",
    customerId: "cust-005",
    customerName: "Olivia Park",
    customerEmail: "olivia.p@example.com",
    channel: "Marketplace B",
    status: "cancelled",
    items: [
      { productId: "prod-002", productName: "Ergonomic Office Chair", sku: "ERG-CHR-002", quantity: 1, price: 549.00 },
    ],
    subtotal: 549.00,
    tax: 55.00,
    shipping: 30.00,
    total: 634.00,
    shippingAddress: "654 Cedar Ln, Phoenix, AZ 85001",
    createdAt: "2024-06-08T13:00:00Z",
    updatedAt: "2024-06-09T10:00:00Z",
  },
  {
    id: "ord-006",
    orderNumber: "SS-2024-0006",
    customerId: "cust-006",
    customerName: "Noah Williams",
    customerEmail: "noah.w@example.com",
    channel: "Marketplace A",
    status: "processing",
    items: [
      { productId: "prod-005", productName: "Standing Desk Converter", sku: "SDC-DSK-005", quantity: 2, price: 349.00 },
    ],
    subtotal: 698.00,
    tax: 70.00,
    shipping: 0,
    total: 768.00,
    shippingAddress: "987 Elm St, San Antonio, TX 78201",
    createdAt: "2024-06-15T08:00:00Z",
    updatedAt: "2024-06-15T12:00:00Z",
  },
];

const SEED_LOGS: ActivityLog[] = [
  {
    id: "log-001",
    action: "Product Created",
    entity: "product",
    entityId: "prod-001",
    entityName: "Wireless Noise-Cancelling Headphones",
    user: "Admin",
    description: "New product 'Wireless Noise-Cancelling Headphones' was added to the catalog.",
    timestamp: "2024-01-10T09:05:00Z",
  },
  {
    id: "log-002",
    action: "Order Created",
    entity: "order",
    entityId: "ord-001",
    entityName: "SS-2024-0001",
    user: "System",
    description: "Order SS-2024-0001 placed by Emma Richardson via Marketplace A.",
    timestamp: "2024-06-01T10:05:00Z",
  },
  {
    id: "log-003",
    action: "Inventory Updated",
    entity: "inventory",
    entityId: "prod-003",
    entityName: "Smart Fitness Tracker Band",
    user: "Admin",
    description: "Stock for 'Smart Fitness Tracker Band' dropped to 0 – out of stock across all channels.",
    timestamp: "2024-06-15T09:10:00Z",
  },
  {
    id: "log-004",
    action: "Order Cancelled",
    entity: "order",
    entityId: "ord-005",
    entityName: "SS-2024-0005",
    user: "Support",
    description: "Order SS-2024-0005 cancelled at customer request. Stock restored.",
    timestamp: "2024-06-09T10:05:00Z",
  },
  {
    id: "log-005",
    action: "Product Updated",
    entity: "product",
    entityId: "prod-002",
    entityName: "Ergonomic Office Chair",
    user: "Admin",
    description: "Price updated from $499.00 to $549.00 for Ergonomic Office Chair.",
    timestamp: "2024-06-10T11:15:00Z",
  },
];

// ─── Store ─────────────────────────────────────────────────────────────────────

interface SyncStockState {
  // Auth
  isAuthenticated: boolean;
  currentUser: { name: string; email: string; role: string; avatar?: string };
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // UI
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;

  // Channels
  channels: Channel[];
  updateChannel: (id: string, data: Partial<Channel>) => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt" | "status">) => Product;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  sellProduct: (productId: string, channelName: ChannelName, quantity: number) => boolean;

  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;

  // Activity Logs
  logs: ActivityLog[];
  addLog: (log: Omit<ActivityLog, "id" | "timestamp">) => void;

  // Notifications
  notifications: Array<{ id: string; title: string; message: string; read: boolean; createdAt: string }>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export const useStore = create<SyncStockState>()(
  persist(
    (set, get) => ({
      // ── Auth ──
      isAuthenticated: false,
      currentUser: { name: "SyncStock Admin", email: "admin@syncstock.io", role: "Administrator" },

      login: async (email: string, password: string) => {
        await new Promise((r) => setTimeout(r, 1200));
        if (email && password.length >= 6) {
          set({ isAuthenticated: true });
          get().addLog({
            action: "User Login",
            entity: "user",
            entityId: "user-1",
            entityName: email,
            user: email,
            description: `User ${email} signed in successfully.`,
          });
          return true;
        }
        return false;
      },

      logout: () => set({ isAuthenticated: false }),

      // ── UI ──
      sidebarCollapsed: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      // ── Channels ──
      channels: CHANNELS,
      updateChannel: (id, data) =>
        set((s) => ({
          channels: s.channels.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      // ── Products ──
      products: SEED_PRODUCTS,

      addProduct: (product) => {
        const newProduct: Product = {
          ...product,
          id: `prod-${generateId()}`,
          status: getStockStatus(product.totalStock, product.lowStockThreshold),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ products: [newProduct, ...s.products] }));
        get().addLog({
          action: "Product Created",
          entity: "product",
          entityId: newProduct.id,
          entityName: newProduct.name,
          user: get().currentUser.name,
          description: `New product '${newProduct.name}' (SKU: ${newProduct.sku}) added to catalog.`,
        });
        return newProduct;
      },

      updateProduct: (id, data) => {
        const product = get().products.find((p) => p.id === id);
        if (!product) return;
        const stock = data.totalStock ?? product.totalStock;
        const threshold = data.lowStockThreshold ?? product.lowStockThreshold;
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id
              ? { ...p, ...data, status: getStockStatus(stock, threshold), updatedAt: new Date().toISOString() }
              : p
          ),
        }));
        get().addLog({
          action: "Product Updated",
          entity: "product",
          entityId: id,
          entityName: product.name,
          user: get().currentUser.name,
          description: `Product '${product.name}' was updated.`,
        });
      },

      deleteProduct: (id) => {
        const product = get().products.find((p) => p.id === id);
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
        if (product) {
          get().addLog({
            action: "Product Deleted",
            entity: "product",
            entityId: id,
            entityName: product.name,
            user: get().currentUser.name,
            description: `Product '${product.name}' was permanently deleted.`,
          });
        }
      },

      sellProduct: (productId, channelName, quantity) => {
        const product = get().products.find((p) => p.id === productId);
        if (!product || product.totalStock < quantity) return false;
        const newStock = product.totalStock - quantity;
        set((s) => ({
          products: s.products.map((p) => {
            if (p.id !== productId) return p;
            const updatedChannelStock = p.channelStock.map((cs) =>
              cs.channelName === channelName
                ? { ...cs, allocated: Math.max(0, cs.allocated - quantity), sold: cs.sold + quantity }
                : cs
            );
            return {
              ...p,
              totalStock: newStock,
              channelStock: updatedChannelStock,
              status: getStockStatus(newStock, p.lowStockThreshold),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
        get().addLog({
          action: "Inventory Updated",
          entity: "inventory",
          entityId: productId,
          entityName: product.name,
          user: "System",
          description: `${quantity} unit(s) of '${product.name}' sold via ${channelName}. Stock: ${product.totalStock} → ${newStock}.`,
        });
        if (newStock <= product.lowStockThreshold) {
          set((s) => ({
            notifications: [
              {
                id: `notif-${generateId()}`,
                title: newStock === 0 ? "Out of Stock" : "Low Stock Alert",
                message: `'${product.name}' is ${newStock === 0 ? "out of stock" : `running low (${newStock} remaining)`}.`,
                read: false,
                createdAt: new Date().toISOString(),
              },
              ...s.notifications,
            ],
          }));
        }
        return true;
      },

      // ── Orders ──
      orders: SEED_ORDERS,

      addOrder: (orderData) => {
        const state = get();
        const orderNumber = `SS-${new Date().getFullYear()}-${String(state.orders.length + 1).padStart(4, "0")}`;
        const newOrder: Order = {
          ...orderData,
          id: `ord-${generateId()}`,
          orderNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ orders: [newOrder, ...s.orders] }));
        // Deduct stock
        orderData.items.forEach((item) => {
          state.sellProduct(item.productId, orderData.channel, item.quantity);
        });
        get().addLog({
          action: "Order Created",
          entity: "order",
          entityId: newOrder.id,
          entityName: newOrder.orderNumber,
          user: get().currentUser.name,
          description: `Order ${newOrder.orderNumber} created for ${newOrder.customerName} via ${newOrder.channel}.`,
        });
        return newOrder;
      },

      updateOrderStatus: (id, status) => {
        const order = get().orders.find((o) => o.id === id);
        if (!order) return;
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
          ),
        }));
        if (status === "cancelled" && order.status !== "cancelled") {
          order.items.forEach((item) => {
            set((s) => ({
              products: s.products.map((p) => {
                if (p.id !== item.productId) return p;
                const newStock = p.totalStock + item.quantity;
                return {
                  ...p,
                  totalStock: newStock,
                  status: getStockStatus(newStock, p.lowStockThreshold),
                  updatedAt: new Date().toISOString(),
                };
              }),
            }));
          });
        }
        get().addLog({
          action: "Order Updated",
          entity: "order",
          entityId: id,
          entityName: order.orderNumber,
          user: get().currentUser.name,
          description: `Order ${order.orderNumber} status changed to '${status}'.`,
        });
      },

      deleteOrder: (id) => {
        const order = get().orders.find((o) => o.id === id);
        set((s) => ({ orders: s.orders.filter((o) => o.id !== id) }));
        if (order) {
          get().addLog({
            action: "Order Deleted",
            entity: "order",
            entityId: id,
            entityName: order.orderNumber,
            user: get().currentUser.name,
            description: `Order ${order.orderNumber} was deleted.`,
          });
        }
      },

      // ── Logs ──
      logs: SEED_LOGS,
      addLog: (log) => {
        const newLog: ActivityLog = {
          ...log,
          id: `log-${generateId()}`,
          timestamp: new Date().toISOString(),
        };
        set((s) => ({ logs: [newLog, ...s.logs].slice(0, 200) }));
      },

      // ── Notifications ──
      notifications: [
        {
          id: "notif-001",
          title: "Low Stock Alert",
          message: "Ergonomic Office Chair is running low (12 remaining).",
          read: false,
          createdAt: "2024-06-10T11:00:00Z",
        },
        {
          id: "notif-002",
          title: "Out of Stock",
          message: "Smart Fitness Tracker Band is out of stock across all channels.",
          read: false,
          createdAt: "2024-06-15T09:00:00Z",
        },
        {
          id: "notif-003",
          title: "Order Delivered",
          message: "Order SS-2024-0001 has been delivered to Emma Richardson.",
          read: true,
          createdAt: "2024-06-05T14:00:00Z",
        },
      ],
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
    }),
    { name: "syncstock-data" }
  )
);
