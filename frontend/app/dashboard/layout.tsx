"use client";

import { ReactNode } from "react";
import { useAuthStore } from "@/app/store/authStore";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  if (!token) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-4 space-y-4">
        <h2 className="text-xl font-heading font-bold mb-6">SportTimePro</h2>
        <nav className="space-y-2">
          <a href="/dashboard" className="block py-2 px-3 rounded hover:bg-primary/10">🏠 Início</a>
          <a href="/dashboard/aulas" className="block py-2 px-3 rounded hover:bg-primary/10">📚 Aulas</a>
          <a href="/dashboard/agendamentos" className="block py-2 px-3 rounded hover:bg-primary/10">📅 Agendamentos</a>
          {/* Menus específicos por role */}
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
          <button
            onClick={() => {
              useAuthStore.getState().clearAuth();
              router.push("/auth/login");
            }}
            className="bg-error text-white px-4 py-2 rounded hover:opacity-90"
          >
            Sair
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}
