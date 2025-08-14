"use client";

import { useAuthStore } from "@/app/store/authStore";
import DashboardAluno from "@/app/components/DashboardAluno";
import DashboardProfessor from "@/app/components/DashboardProfessor";

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Renderizar dashboard baseado no tipo de usuário
  if (user.roles.includes('ALUNO')) {
    return <DashboardAluno />;
  }

  if (user.roles.includes('PROFESSOR') || user.roles.includes('ADMIN')) {
    return <DashboardProfessor />;
  }

  // Fallback para outros tipos de usuário
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Bem-vindo, {user.nome}! 👋
        </h1>
        <p className="text-gray-600">Dashboard do SportTimePro</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <p className="text-gray-600">Tipo de usuário não reconhecido.</p>
      </div>
    </div>
  );
}
