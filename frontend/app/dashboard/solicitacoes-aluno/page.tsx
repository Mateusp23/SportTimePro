"use client";

import { useState, useEffect } from "react";
import MinhasSolicitacoes from "@/app/components/MinhasSolicitacoes";

export default function SolicitacoesAlunoPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log("🚀 Página SolicitacoesAlunoPage carregada!");
  }, []);

  if (!isClient) {
    return (
      <div className="bg-white p-6 rounded shadow">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center mt-4 text-gray-600">Carregando página...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-heading font-bold mb-4">
        📋 Minhas Solicitações de Vínculo
      </h2>
      <p className="text-gray-600 mb-6">
        Acompanhe o status das suas solicitações de vínculo com professores e academias.
      </p>
      
      <MinhasSolicitacoes />
    </div>
  );
}
