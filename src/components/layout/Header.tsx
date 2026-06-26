"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/store";
import { cn, formatTime } from "@/lib/utils";
import { Search, Bell, ChevronDown, LogOut, Settings, Zap, Menu } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/products": "Products",
  "/dashboard/inventory": "Inventory",
  "/dashboard/orders": "Orders",
  "/dashboard/channels": "Channels",
  "/dashboard/analytics": "Analytics",
  "/dashboard/activity": "Activity Logs",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, notifications, markAllNotificationsRead, markNotificationRead, sidebarCollapsed, toggleSidebar } = useStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const title = PAGE_TITLES[pathname] || "SyncStock";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header
      className="fixed top-0 right-0 z-20 h-24 bg-white border-b border-gray-100 transition-all duration-300"
      style={{ left: sidebarCollapsed ? "68px" : "240px" }}
    >
      <div className="flex items-center h-full px-12 gap-4">

        {/* Left — Mobile toggle + Page Title */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight">{title}</h1>
        </div>

        {/* Center — Search */}
        <div className="flex-1 flex justify-start ml-6">
          <div className="relative hidden md:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search products, orders..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ paddingLeft: "36px" }}
              className="h-9 w-72 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right — Notification Bell + Profile */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="relative w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-[17px] h-[17px] text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-purple-600 rounded-full border-2 border-white" />
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllNotificationsRead} className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={cn(
                            "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors",
                            !n.read && "bg-purple-50/40"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {!n.read && (
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                            )}
                            <div className={cn("min-w-0", n.read && "ml-[18px]")}>
                              <p className="text-sm font-medium text-gray-900">{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatTime(n.createdAt)}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {/* Avatar — SyncStock logo style */}
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-semibold text-gray-900 leading-none">SyncStock</p>
                <p className="text-[11px] text-gray-400 leading-none mt-0.5">Administrator</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 hidden sm:block" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">SyncStock</p>
                        <p className="text-xs text-gray-500">Administrator</p>
                      </div>
                    </div>
                  </div>
                  <button
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => { router.push("/dashboard/settings"); setProfileOpen(false); }}
                  >
                    <Settings className="w-4 h-4 text-gray-400" /> Settings
                  </button>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
