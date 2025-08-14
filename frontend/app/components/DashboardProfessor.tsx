"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/app/store/authStore";
import SolicitacoesVinculo from "@/app/components/SolicitacoesVinculo";
import api from "@/app/lib/api";

export default function DashboardProfessor() {
  const { user } = useAuthStore();
  const [userInfo, setUserInfo] = useState<any>(null);

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Bem-vindo, {userInfo?.nome || 'Professor'}! 👋
        </h1>
        <p className="text-gray-600">
          {user?.roles.includes('ADMIN') ? 'Dashboard Administrativo' : 'Dashboard do Professor'}
        </p>
      </div>

      {/* Seção de Solicitações de Vínculo */}
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📋 Solicitações de Vínculo de Alunos
          </h2>
          <p className="text-gray-600 mb-4">
            Gerencie as solicitações de alunos que desejam se vincular à academia através do sistema de cadastro direto.
          </p>
          <SolicitacoesVinculo />
        </div>
      </div>

      {/* Outras seções da dashboard podem ser adicionadas aqui */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Resumo</h3>
          <p className="text-gray-600">Bem-vindo ao seu painel de controle.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Ações Rápidas</h3>
          <p className="text-gray-600">Acesse as funcionalidades principais.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Estatísticas</h3>
          <p className="text-gray-600">Visualize seus dados e métricas.</p>
        </div>
      </div>
    </div>
  );
}
