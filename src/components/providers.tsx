"use client";
import { useEffect } from "react";
import { Toaster, toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function Providers({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    const message = sessionStorage.getItem("booknook:auth-success-toast");
    if (!message) return;
    sessionStorage.removeItem("booknook:auth-success-toast");
    if (!session) return;

    toast.success(message === "register" ? "Welcome to BookNook!" : "Welcome back.");
  }, [isPending, session]);

  return <>{children}<Toaster position="top-right" richColors closeButton /></>;
}
