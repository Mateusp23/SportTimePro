"use client";

import { useState } from "react";
import { useProfessores } from "@/app/hooks/useProfessores";

type FilterType = "all" | "admin" | "professor" | "cliente";

export default function ProfessoresPage() {
  const { usuarios, isLoading, error, tornarProfessor } = useProfessores();
  const [filter, setFilter] = useState<FilterType>("all");

  const handleTornarProfessor = async (id: string) => {
    try {
      await tornarProfessor(id);
      alert("Usuário promovido a professor com sucesso!");
    } catch (err) {
      alert("Erro ao promover usuário a professor");
    }
  };

  // Filtrar usuários baseado no filtro selecionado
  const filteredUsuarios = usuarios.filter((user) => {
    switch (filter) {
      case "admin":
        return user.roles.includes("ADMIN");
      case "professor":
        return user.roles.includes("PROFESSOR");
      case "cliente":
        return user.roles.includes("CLIENTE") && !user.roles.includes("ADMIN") && !user.roles.includes("PROFESSOR");
      default:
        return true; // all
    }
  });

  // Contadores para cada tipo
  const counts = {
    all: usuarios.length,
    admin: usuarios.filter(u => u.roles.includes("ADMIN")).length,
    professor: usuarios.filter(u => u.roles.includes("PROFESSOR")).length,
    cliente: usuarios.filter(u => u.roles.includes("CLIENTE") && !u.roles.includes("ADMIN") && !u.roles.includes("PROFESSOR")).length
  };

  if (error) {
    return (
      <div className="bg-white p-6 rounded shadow">
        <div className="text-red-600 text-center">
          <p>Erro: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Gerenciar Usuários</h2>
        <div className="text-sm text-gray-600">
          Total: {filteredUsuarios.length} de {usuarios.length} usuário(s)
        </div>
      </div>

      {/* Informações */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Como funciona:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Admins</strong> podem ser promovidos a professores para criar aulas</li>
          <li>• <strong>Clientes</strong> podem ser promovidos a professores</li>
          <li>• <strong>Professores</strong> já têm permissão para criar aulas</li>
        </ul>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todos ({counts.all})
          </button>
          <button
            onClick={() => setFilter("admin")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "admin"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Admins ({counts.admin})
          </button>
          <button
            onClick={() => setFilter("professor")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "professor"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Professores ({counts.professor})
          </button>
          <button
            onClick={() => setFilter("cliente")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "cliente"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Clientes ({counts.cliente})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Carregando usuários...</span>
        </div>
      ) : filteredUsuarios.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum usuário encontrado com o filtro selecionado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left font-medium text-gray-700 border-b">Nome</th>
                <th className="p-3 text-left font-medium text-gray-700 border-b">E-mail</th>
                <th className="p-3 text-left font-medium text-gray-700 border-b">Papéis</th>
                <th className="p-3 text-left font-medium text-gray-700 border-b">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 border-b font-medium">{user.nome}</td>
                  <td className="p-3 border-b text-gray-600">{user.email}</td>
                  <td className="p-3 border-b">
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className={`px-2 py-1 text-xs rounded-full ${
                            role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : role === "PROFESSOR"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 border-b">
                    {!user.roles.includes("PROFESSOR") ? (
                      <button
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                        onClick={() => handleTornarProfessor(user.id)}
                        title="Promover a professor"
                      >
                        {user.roles.includes("ADMIN") ? "Tornar Professor" : "Promover a Professor"}
                      </button>
                    ) : (
                      <span className="text-sm text-green-600 font-medium">
                        ✓ Professor
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
