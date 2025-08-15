"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/api";
import SolicitacoesVinculo from "@/app/components/SolicitacoesVinculo";

export default function SolicitacoesPage() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-heading font-bold mb-4">
        📋 Solicitações de Vínculo de Alunos
      </h2>
      <p className="text-gray-600 mb-6">
        Gerencie as solicitações de alunos que desejam se vincular à academia através do sistema de cadastro direto.
      </p>
      
      <SolicitacoesVinculo />
    </div>
  );
}
