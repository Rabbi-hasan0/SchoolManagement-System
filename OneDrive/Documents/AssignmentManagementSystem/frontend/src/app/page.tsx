"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role === "Admin") {
        router.push("/dashboard/admin");
      } else if (user.role === "Teacher") {
        router.push("/dashboard/teacher");
      } else {
        router.push("/dashboard/student");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-medium text-zinc-500">Redirecting to Dashboard...</p>
      </div>
    </div>
  );
}