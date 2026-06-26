"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Globe,
  BarChart2,
  Activity,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/inventory", label: "Inventory", icon: Layers },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/channels", label: "Channels", icon: Globe },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/activity", label: "Activity Logs", icon: Activity },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full z-30 flex flex-col bg-white border-r border-gray-100 transition-all duration-300",
        sidebarCollapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-16 border-b border-gray-100 px-4 gap-3", sidebarCollapsed && "justify-center")}>
        <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <span className="text-[15px] font-bold text-gray-900 tracking-tight">SyncStock</span>
            <p className="text-[10px] text-purple-500 font-medium tracking-wider uppercase leading-none">Enterprise</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="flex flex-col gap-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={sidebarCollapsed ? label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 relative",
                    isActive
                      ? "text-purple-700 bg-purple-50/50"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-r-md" />}
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-purple-600" : "text-gray-400 group-hover:text-gray-600")} />
                  {!sidebarCollapsed && <span className="truncate">{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center h-8 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
