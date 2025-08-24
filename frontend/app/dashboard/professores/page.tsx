// app/dashboard/professores/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useProfessores } from "@/app/hooks/useProfessores";
import { useAuthStore } from "@/app/store/authStore";
import Alert from "@/app/components/Alert";
import Table from "@/app/components/Table";
import { UserPlus, Crown, Shield } from "lucide-react";
import type { Usuario } from "@/app/types/types";

type FilterType = "all" | "admin" | "professor";

export default function ProfessoresPage() {
  const { usuarios, isLoading, isMutating, error, tornarProfessor, tornarMeProfessor } = useProfessores();
  const me = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState<FilterType>("all");

  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "success" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
    buttonText: "",
  });

  const onlyAdmins = me?.roles?.includes("ADMIN");

  const handleTornarProfessor = async (user: Usuario) => {
    try {
      await tornarProfessor(user.id);
      setAlertConfig({
        type: "success",
        title: "Sucesso!",
        message: "Usuário promovido a professor com sucesso!",
        buttonText: "Continuar",
      });
      setShowAlert(true);
    } catch {
      setAlertConfig({
        type: "error",
        title: "Erro",
        message: "Erro ao promover usuário a professor. Tente novamente.",
        buttonText: "Tentar Novamente",
      });
      setShowAlert(true);
    }
  };

  const handleTornarMeProfessor = async () => {
    if (!me) return;
    try {
      await tornarMeProfessor(me.id);
      setAlertConfig({
        type: "success",
        title: "Pronto!",
        message: "Você agora também é Professor e já pode criar aulas.",
        buttonText: "Ok",
      });
      setShowAlert(true);
    } catch {
      setAlertConfig({
        type: "error",
        title: "Ops",
        message: "Não foi possível concluir. Tente novamente.",
        buttonText: "Fechar",
      });
      setShowAlert(true);
    }
  };

  // filtro
  const filtered: Usuario[] = useMemo(() => {
    const base = usuarios;
    if (filter === "admin") return base.filter((u) => u.roles.includes("ADMIN"));
    if (filter === "professor") return base.filter((u) => u.roles.includes("PROFESSOR"));
    return base;
  }, [usuarios, filter]);

  // ordena com o usuário logado no topo
  const ordered = useMemo(() => {
    if (!me) return filtered;
    return [...filtered].sort((a, b) => (a.id === me.id ? -1 : b.id === me.id ? 1 : 0));
  }, [filtered, me]);

  const counts = useMemo(
    () => ({
      all: usuarios.length,
      admin: usuarios.filter((u) => u.roles.includes("ADMIN")).length,
      professor: usuarios.filter((u) => u.roles.includes("PROFESSOR")).length,
    }),
    [usuarios]
  );

  // Gate de permissão
  if (!onlyAdmins) {
    return (
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-heading font-bold mb-2">Acesso restrito</h2>
        <p className="text-gray-600">Apenas administradores podem gerenciar esta página.</p>
      </div>
    );
  }

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

  // Configuração das colunas da tabela
  const columns = [
    {
      key: 'nome' as keyof Usuario,
      header: 'Nome',
      sortable: true,
      accessor: (user: Usuario) => (
        <span className="font-medium">
          {user.nome} {me?.id === user.id && <span className="text-xs text-gray-400">(você)</span>}
        </span>
      ),
    },
    {
      key: 'email' as keyof Usuario,
      header: 'E-mail',
      sortable: true,
    },
    {
      key: 'roles' as keyof Usuario,
      header: 'Função',
      sortable: true,
      accessor: (user: Usuario) => (
        <div className="flex gap-1 flex-wrap">
          {user.roles.map((role) => (
            <span
              key={role}
              className={`px-2 py-1 text-xs rounded-full ${role === "ADMIN"
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
      ),
    },
  ];

  // Configuração das ações da tabela
  const actions = [
    {
      icon: UserPlus,
      label: 'Tornar Professor',
      onClick: handleTornarProfessor,
      variant: 'primary' as const,
      className: 'hidden', // Será controlado dinamicamente
    },
  ];

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Professores & Admins</h2>
        <div className="flex items-center gap-3">
          {/* Tornar-me Professor (se ainda não for) */}
          {me && !me.roles?.includes("PROFESSOR") && (
            <button
              onClick={handleTornarMeProfessor}
              disabled={isMutating}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 ${isMutating ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              <UserPlus className="w-4 h-4" />
              Tornar-me Professor
            </button>
          )}
          <div className="text-sm text-gray-600">
            Total: {ordered.length} de {usuarios.length} usuário(s)
          </div>
        </div>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Como funciona:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Admins podem se tornar professores para criar aulas</li>
          <li>• Você pode promover outros usuários a professores</li>
          <li>• Professores já têm permissão para criar aulas</li>
        </ul>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            <Shield className="w-4 h-4" />
            Todos ({counts.all})
          </button>
          <button
            onClick={() => setFilter("admin")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${filter === "admin" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            <Crown className="w-4 h-4" />
            Admins ({counts.admin})
          </button>
          <button
            onClick={() => setFilter("professor")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${filter === "professor" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            <UserPlus className="w-4 h-4" />
            Professores ({counts.professor})
          </button>
        </div>
      </div>

      {/* Tabela padronizada */}
      <Table
        data={ordered}
        columns={columns}
        actions={actions}
        loading={isLoading}
        emptyMessage="Nenhum usuário encontrado com o filtro selecionado."
        className="mt-6"
      />

      {showAlert && (
        <Alert
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          buttonText={alertConfig.buttonText}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}
