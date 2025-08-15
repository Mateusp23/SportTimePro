"use client";

import { useAuthStore } from "@/app/store/authStore";
import DashboardUnificado from "@/app/components/DashboardUnificado";

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <DashboardUnificado />;
}
