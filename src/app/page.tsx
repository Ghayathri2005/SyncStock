"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useStore();
  useEffect(() => {
    router.push(isAuthenticated ? "/dashboard" : "/login");
  }, [isAuthenticated, router]);
  return null;
}
