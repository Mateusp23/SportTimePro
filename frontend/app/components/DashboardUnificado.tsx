"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/app/store/authStore";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";

interface UserInfo {
  id: string;
  nome: string;
  email: string;
  roles: string[];
  clienteId: string;
}

export default function DashboardUnificado() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    carregarInformacoesUsuario();
  }, []);

  const carregarInformacoesUsuario = async () => {
    try {
      const response = await api.get("/auth/me");
      setUserInfo(response.data);
    } catch (error) {
      console.error("Erro ao carregar informações do usuário:", error);
    }
  };

  // Conteúdo específico para alunos
  const renderConteudoAluno = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              Olá, {userInfo?.nome || 'Aluno'}! 👋
            </h2>
            <p className="text-xl opacity-90">
              Bem-vindo ao seu dashboard personalizado
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Próximas Aulas</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-600">aulas agendadas</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Professor</h3>
            <p className="text-lg font-medium text-gray-800">Não definido</p>
            <p className="text-sm text-gray-600">Aguardando aprovação</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Academia</h3>
            <p className="text-lg font-medium text-gray-800">Não definida</p>
            <p className="text-sm text-gray-600">Aguardando aprovação</p>
          </div>
        </div>

        {/* Seção de Ações Rápidas para Alunos */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🚀 Ações Rápidas
          </h2>
          <p className="text-gray-600 mb-4">
            Acesse rapidamente as funcionalidades principais do sistema.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/dashboard/aulas-aluno')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left"
            >
              <h3 className="font-medium text-gray-800 mb-1">Minhas Aulas</h3>
              <p className="text-sm text-gray-600">Visualizar e gerenciar suas aulas</p>
            </button>
            <button
              onClick={() => router.push('/dashboard/agendamentos')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left"
            >
              <h3 className="font-medium text-gray-800 mb-1">Meus Agendamentos</h3>
              <p className="text-sm text-gray-600">Visualizar e gerenciar seus agendamentos</p>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Conteúdo específico para professores/admin
  const renderConteudoProfessor = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              Olá, {userInfo?.nome || 'Professor'}! 👋
            </h2>
            <p className="text-xl opacity-90">
              {user?.roles.includes('ADMIN') ? 'Dashboard Administrativo' : 'Dashboard do Professor'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Aulas Ativas</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-600">aulas programadas</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Alunos</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-600">alunos ativos</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Solicitações</h3>
            <p className="text-3xl font-bold text-orange-600">0</p>
            <p className="text-sm text-gray-600">pendentes</p>
          </div>
        </div>

        {/* Seção de Ações Rápidas */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🚀 Ações Rápidas
          </h2>
          <p className="text-gray-600 mb-4">
            Acesse rapidamente as funcionalidades principais do sistema.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/dashboard/aulas')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left"
            >
              <h3 className="font-medium text-gray-800 mb-1">Gerenciar Aulas</h3>
              <p className="text-sm text-gray-600">Criar, editar e gerenciar aulas</p>
            </button>
            <button
              onClick={() => router.push('/dashboard/alunos')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left"
            >
              <h3 className="font-medium text-gray-800 mb-1">Gerenciar Alunos</h3>
              <p className="text-sm text-gray-600">Visualizar e gerenciar alunos</p>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar conteúdo baseado no tipo de usuário
  if (user?.roles.includes('ALUNO')) {
    return renderConteudoAluno();
  }

  return renderConteudoProfessor();
}
