"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Building, User } from "lucide-react";
import api from "@/app/lib/api";

interface Aula {
  id: string;
  nome: string;
  horario: string;
  data: string;
  local: {
    nome: string;
  };
  professor: {
    nome: string;
  };
}

export default function AulasAlunoPage() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarAulas();
  }, []);

  const carregarAulas = async () => {
    try {
      setLoading(true);
      const response = await api.get("/aulas/aluno");
      setAulas(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar aulas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2">
        <Calendar className="text-purple-600" size={24} />
        Minhas Aulas
      </h2>
      
      {aulas.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-500 mt-2">
            Você ainda não tem aulas agendadas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {aulas.map((aula) => (
            <div key={aula.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">{aula.nome}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{new Date(aula.horario).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{new Date(aula.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building size={16} />
                      <span>{aula.local.nome}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
