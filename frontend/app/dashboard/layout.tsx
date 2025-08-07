"use client";

import { useAuthStore } from "@/app/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LogOut, CalendarDays, Home, Users, GraduationCap } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!token) router.push("/auth/login");
  }, [token, router]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 text-2xl font-heading font-bold text-primary">SportTimePro</div>
        <nav className="flex-1 space-y-2 p-4 text-gray-700">
          <Link href="/dashboard" className="flex items-center gap-2 p-3 rounded hover:bg-primary/10 transition">
            <Home size={18} /> Início
          </Link>
          <Link href="/dashboard/aulas" className="flex items-center gap-2 p-3 rounded hover:bg-primary/10 transition">
            <CalendarDays size={18} /> Aulas
          </Link>
          <Link href="/dashboard/agendamentos" className="flex items-center gap-2 p-3 rounded hover:bg-primary/10 transition">
            <Users size={18} /> Agendamentos
          </Link>
          <Link href="/dashboard/professores" className="flex items-center gap-2 p-3 rounded hover:bg-primary/10 transition">
            <GraduationCap size={18} /> Professores
          </Link>
        </nav>
        <button
          onClick={logout}
          className="flex items-center gap-2 p-4 bg-red-500 text-white hover:bg-red-600 transition mt-auto"
        >
          <LogOut size={18} /> Sair
        </button>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
