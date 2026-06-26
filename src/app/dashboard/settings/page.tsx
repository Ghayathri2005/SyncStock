"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { Card, CardHeader, CardContent, CardTitle, Button, Badge } from "@/components/ui";
import toast from "react-hot-toast";
import {
  User, Bell, Shield, Palette, Globe,
  Moon, Sun, Check, ChevronRight, Lock, Mail
} from "lucide-react";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export default function SettingsPage() {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({ name: currentUser.name, email: currentUser.email, role: currentUser.role, company: "SyncStock Inc.", phone: "+1 (555) 123-4567", timezone: "America/New_York" });
  const [notifications, setNotifications] = useState({ lowStock: true, newOrder: true, orderDelivered: false, weeklyReport: true, marketing: false, securityAlerts: true });
  const [theme, setTheme] = useState("light");
  const [density, setDensity] = useState("comfortable");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <Card className="shadow-sm border border-gray-200/60 sticky top-24">
            <CardContent className="p-3">
              <nav className="space-y-1">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === id ? "bg-purple-600 text-white shadow-md" : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"}`}
                  >
                    <Icon className={`w-5 h-5 ${activeTab === id ? "text-white" : "text-gray-400 group-hover:text-purple-500"}`} />
                    {label}
                    {activeTab !== id && <ChevronRight className="w-4 h-4 ml-auto text-gray-300" />}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-8">
          {/* Profile */}
          {activeTab === "profile" && (
            <Card className="shadow-sm border border-gray-200/60">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg">Profile Settings</CardTitle>
                <p className="text-sm font-medium text-gray-500 mt-1">Manage your personal information.</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-8 border-b border-gray-100">
                  <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-900">{profile.name}</h3>
                    <p className="text-sm font-medium text-gray-500 mt-0.5">{profile.role}</p>
                    <Button size="sm" variant="outline" className="mt-3">Change Photo</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Full Name", key: "name", type: "text" },
                    { label: "Email Address", key: "email", type: "email" },
                    { label: "Role", key: "role", type: "text" },
                    { label: "Company", key: "company", type: "text" },
                    { label: "Phone", key: "phone", type: "tel" },
                    { label: "Timezone", key: "timezone", type: "text" },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                      <input
                        type={type}
                        value={profile[key as keyof typeof profile]}
                        onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-8 pt-8 border-t border-gray-100">
                  <Button size="md" loading={saving} onClick={save}><Check className="w-4 h-4" /> Save Changes</Button>
                  <Button size="md" variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <Card className="shadow-sm border border-gray-200/60">
                <CardHeader className="pb-6">
                  <CardTitle className="text-lg">Account Settings</CardTitle>
                  <p className="text-sm font-medium text-gray-500 mt-1">Manage your account preferences.</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {[
                      { label: "Default Currency", value: "USD – US Dollar" },
                      { label: "Date Format", value: "MM/DD/YYYY" },
                      { label: "Language", value: "English (US)" },
                      { label: "Subscription Plan", value: "Enterprise", badge: true },
                    ].map(({ label, value, badge }) => (
                      <div key={label} className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-gray-50 last:border-0 gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{label}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {badge ? <Badge variant="purple" className="px-3 py-1 shadow-sm">{value}</Badge> : <span className="text-sm font-medium text-gray-600">{value}</span>}
                          <button className="text-sm text-purple-600 hover:text-purple-700 font-bold bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors">Change</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border border-red-200 bg-red-50/30">
                <CardContent className="pt-6 pb-6">
                  <h3 className="text-base font-bold text-red-700 mb-2">Danger Zone</h3>
                  <p className="text-sm font-medium text-red-600/80 mb-5">Permanently delete your account and all associated data. This action cannot be undone.</p>
                  <Button variant="danger" size="md" className="shadow-sm">Delete Account</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <p className="text-sm text-gray-500">Choose what you want to be notified about.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {[
                    { key: "lowStock", label: "Low Stock Alerts", desc: "Get notified when products fall below threshold." },
                    { key: "newOrder", label: "New Orders", desc: "Receive alerts when new orders are placed." },
                    { key: "orderDelivered", label: "Order Delivered", desc: "Notify when orders are marked as delivered." },
                    { key: "weeklyReport", label: "Weekly Summary Report", desc: "Get a weekly digest of your inventory & sales." },
                    { key: "marketing", label: "Marketing & Tips", desc: "Product updates and feature announcements." },
                    { key: "securityAlerts", label: "Security Alerts", desc: "Important security notifications (recommended)." },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors ${notifications[key as keyof typeof notifications] ? "bg-purple-600" : "bg-gray-200"}`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications[key as keyof typeof notifications] ? "translate-x-5" : ""}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <Button loading={saving} onClick={save}><Check className="w-3.5 h-3.5" /> Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <p className="text-sm text-gray-500">Manage your account security preferences.</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                      <input type="password" placeholder="Min. 8 characters" className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                      <input type="password" placeholder="Repeat new password" className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                    <Button loading={saving} onClick={save}><Lock className="w-3.5 h-3.5" /> Update Password</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-500 mt-0.5">Add extra security to your account.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">Not Enabled</Badge>
                      <Button size="sm" variant="secondary" onClick={() => toast.success("2FA setup coming soon!")}>Enable 2FA</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Active Sessions</CardTitle></CardHeader>
                <CardContent>
                  {[
                    { device: "Chrome on Windows", location: "New York, US", status: "Current", time: "Active now" },
                    { device: "Safari on iPhone", location: "New York, US", status: "", time: "2 hours ago" },
                  ].map(({ device, location, status, time }) => (
                    <div key={device} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{device}</p>
                          <p className="text-xs text-gray-500">{location} · {time}</p>
                        </div>
                      </div>
                      {status ? <Badge variant="success">{status}</Badge> : <button className="text-xs text-red-500 hover:text-red-600 font-medium">Revoke</button>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Appearance */}
          {activeTab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <p className="text-sm text-gray-500">Customize how SyncStock looks for you.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-3">Theme</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "light", label: "Light", icon: <Sun className="w-5 h-5" /> },
                        { value: "dark", label: "Dark", icon: <Moon className="w-5 h-5" /> },
                        { value: "system", label: "System", icon: <Palette className="w-5 h-5" /> },
                      ].map(({ value, label, icon }) => (
                        <button
                          key={value}
                          onClick={() => setTheme(value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === value ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-200"}`}
                        >
                          <div className={theme === value ? "text-purple-600" : "text-gray-400"}>{icon}</div>
                          <span className={`text-sm font-medium ${theme === value ? "text-purple-700" : "text-gray-600"}`}>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-3">Display Density</p>
                    <div className="grid grid-cols-3 gap-3">
                      {["compact", "comfortable", "spacious"].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDensity(d)}
                          className={`p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${density === d ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-600 hover:border-purple-200"}`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-3">Accent Color</p>
                    <div className="flex gap-3">
                      {["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"].map((color) => (
                        <button key={color} className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform" style={{ background: color }} title={color} />
                      ))}
                    </div>
                  </div>

                  <Button loading={saving} onClick={save}><Check className="w-3.5 h-3.5" /> Save Appearance</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
