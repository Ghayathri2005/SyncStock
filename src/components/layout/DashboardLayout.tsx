"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, sidebarCollapsed } = useStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#fafafc]">
      <Sidebar />
      <Header />
      <main
        style={{
          marginLeft: sidebarCollapsed ? "68px" : "240px",
          paddingTop: "112px",
          minHeight: "100vh",
          transition: "margin-left 0.3s",
        }}
      >
        <div style={{ padding: "0 48px 48px 48px", maxWidth: "1400px", margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
