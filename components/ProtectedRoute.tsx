"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!token) router.replace("/login");
  }, [router]);

  const token = typeof window !== "undefined" ? Cookies.get("accessToken") : null;
  if (!token) return null;

  return <>{children}</>;
}
