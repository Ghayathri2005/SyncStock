"use client";
import { useStore } from "@/store";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { Globe, ShoppingBag, Store, TrendingUp, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  "Marketplace A": <ShoppingBag className="w-5 h-5" />,
  "Marketplace B": <Store className="w-5 h-5" />,
  "Marketplace C": <Globe className="w-5 h-5" />,
};

export default function ChannelsPage() {
  const { channels, products, orders, updateChannel } = useStore();

  const getChannelMetrics = (channelName: string) => {
    const channelOrders = orders.filter((o) => o.channel === channelName && o.status !== "cancelled");
    const revenue = channelOrders.reduce((s, o) => s + o.total, 0);
    const totalSold = products.reduce((s, p) => {
      const cs = p.channelStock.find((c) => c.channelName === channelName);
      return s + (cs?.sold ?? 0);
    }, 0);
    const totalAllocated = products.reduce((s, p) => {
      const cs = p.channelStock.find((c) => c.channelName === channelName);
      return s + (cs?.allocated ?? 0);
    }, 0);
    return { revenue, orders: channelOrders.length, totalSold, totalAllocated };
  };

  const toggleChannel = (id: string, name: string, current: boolean) => {
    updateChannel(id, { isActive: !current });
    toast.success(`${name} ${!current ? "activated" : "deactivated"}.`);
  };

  return (
    <div className="space-y-16 pb-12">
      {/* SECTION 1: KPI CARDS */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Channel Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Channels", value: channels.length, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Active Channels", value: channels.filter((c) => c.isActive).length, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Total Channel Revenue", value: formatCurrency(orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0)), color: "text-blue-600", bg: "bg-blue-50" },
          ].map(({ label, value, color, bg }) => (
            <Card key={label} className="border-gray-200/60 shadow-sm transition-all hover:shadow-md">
              <CardContent className="p-6">
                <p className={`text-3xl font-bold tracking-tight ${color} mb-1.5`}>{value}</p>
                <p className="text-sm font-medium text-gray-500">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 2: CHANNEL CARDS */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900">Active Integrations</h2>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {channels.map((channel) => {
            const metrics = getChannelMetrics(channel.name);
            const sellThrough = (metrics.totalAllocated + metrics.totalSold) > 0
              ? Math.round((metrics.totalSold / (metrics.totalAllocated + metrics.totalSold)) * 100)
              : 0;

            return (
              <Card key={channel.id} className="shadow-sm border border-gray-200/60 overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-5 sm:p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ background: channel.color + "15" }}>
                        <span style={{ color: channel.color }}>{CHANNEL_ICONS[channel.name]}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{channel.name}</h3>
                        <Badge variant={channel.isActive ? "success" : "danger"} className="px-2 py-0.5 text-xs font-medium">
                          {channel.isActive ? "Active Connection" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleChannel(channel.id, channel.name, channel.isActive)}
                      className="text-gray-400 hover:text-purple-600 transition-colors bg-gray-50 p-1.5 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50"
                      title={channel.isActive ? "Deactivate" : "Activate"}
                    >
                      {channel.isActive
                        ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                        : <ToggleLeft className="w-6 h-6 text-gray-400" />
                      }
                    </button>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                      { label: "Revenue", value: formatCurrency(metrics.revenue) },
                      { label: "Orders", value: metrics.orders },
                      { label: "Units Sold", value: metrics.totalSold },
                      { label: "Allocated", value: metrics.totalAllocated },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col items-start justify-center hover:bg-white hover:border-purple-100 transition-colors">
                        <p className="text-lg font-bold text-gray-900 mb-0.5">{value}</p>
                        <p className="text-xs font-medium text-gray-500">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Sell-through */}
                  <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-medium text-gray-500">Sell-through Rate</span>
                      <span className="text-sm font-bold text-gray-900">{sellThrough}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${sellThrough}%`, background: channel.color }}
                      />
                    </div>
                  </div>

                  {/* Products on channel */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Top Performing Products</p>
                    <div className="space-y-2">
                      {products.slice(0, 3).map((p) => {
                        const cs = p.channelStock.find((c) => c.channelName === channel.name);
                        return (
                          <div key={p.id} className="flex items-center justify-between text-sm py-1.5">
                            <span className="font-medium text-gray-700 truncate pr-4">{p.name}</span>
                            <span className="font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md shrink-0 text-xs">{cs?.sold ?? 0} sold</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: COMPARISON TABLE */}
      <section className="pt-2">
        <Card className="shadow-sm border border-gray-200/60 overflow-hidden">
          <CardHeader className="pb-5 pt-5 px-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-lg font-bold">Channel Performance Comparison</CardTitle>
            </div>
          </CardHeader>
          <div className="p-4 sm:p-6 bg-white">
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    {["Channel", "Status", "Revenue", "Orders", "Units Sold", "Sell-through", "Allocated Stock"].map((h) => (
                      <th key={h} className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {channels.map((ch) => {
                    const m = getChannelMetrics(ch.name);
                    const st = (m.totalAllocated + m.totalSold) > 0 ? Math.round((m.totalSold / (m.totalAllocated + m.totalSold)) * 100) : 0;
                    return (
                      <tr key={ch.id} className="hover:bg-gray-50/60 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: ch.color }} />
                            <span className="font-semibold text-gray-900 text-sm">{ch.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={ch.isActive ? "success" : "danger"} className="px-2.5 py-1 shadow-sm text-xs">
                            {ch.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 text-sm">{formatCurrency(m.revenue)}</td>
                        <td className="px-6 py-4 font-medium text-gray-700 text-sm">{m.orders}</td>
                        <td className="px-6 py-4 font-medium text-gray-700 text-sm">{m.totalSold}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-100 rounded-full h-2 shadow-inner">
                              <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${st}%`, background: ch.color }} />
                            </div>
                            <span className="text-xs font-bold text-gray-900">{st}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700 text-sm">{m.totalAllocated}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
