import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SyncStock – Multi-Channel Inventory Management",
  description:
    "Enterprise-grade inventory management system for synchronizing stock across multiple sales channels in real time.",
  keywords: "inventory management, multi-channel, e-commerce, SaaS, stock sync",
  authors: [{ name: "SyncStock Team" }],
  robots: "index, follow",
  openGraph: {
    title: "SyncStock – Multi-Channel Inventory Management",
    description:
      "Manage and sync your inventory across all sales channels in one powerful dashboard.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full`}>
      <body className="min-h-full antialiased" style={{ fontFamily: "'Geist Mono', system-ui, sans-serif" }}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#ffffff",
              color: "#0f0a1e",
              borderRadius: "12px",
              boxShadow: "0 4px 16px 0 rgba(124,58,237,0.12), 0 2px 4px 0 rgba(0,0,0,0.06)",
              border: "1px solid #e8e3f4",
              padding: "12px 16px",
              fontSize: "14px",
              fontFamily: "'Geist Mono', sans-serif",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
