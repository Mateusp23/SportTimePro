"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/api";
import NovaAulaModal from "@/app/components/NovaAulaModel";
import { useUser } from "@/app/hooks/useUser";
import EditarAulaModal from "@/app/components/EditarAulaModal";
import { Aula } from "@/app/types/types";
import { confirmAlert } from "@/app/utils/confirmAlert";
import Table from "@/app/components/Table";
import { Edit, Trash2, Plus } from "lucide-react";

export default function AulasPage() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [aulaSelecionada, setAulaSelecionada] = useState<Aula | null>(null);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAulas = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/aulas");
      setAulas(res.data.items);
    } catch (error) {
      console.error("Erro ao buscar aulas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAulas();
  }, []);

  const handleDelete = async (aula: Aula) => {
    const ok = await confirmAlert({
      type: "warning",
      title: "Excluir aula",
      message: "Tem certeza que deseja excluir esta aula? Essa ação não pode ser desfeita.",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
    });

    if (!ok) return;

    try {
      await api.delete(`/aulas/${aula.id}`);
      fetchAulas();
    } catch (error) {
      console.error("Erro ao excluir aula:", error);
    }
  };

  const handleEdit = (aula: Aula) => {
    setAulaSelecionada(aula);
    setShowEditarModal(true);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  // Configuração das colunas da tabela
  const columns = [
    {
      key: 'modalidade' as keyof Aula,
      header: 'Modalidade',
      sortable: true,
    },
    {
      key: 'dataHoraInicio' as keyof Aula,
      header: 'Data e Hora',
      sortable: true,
      accessor: (aula: Aula) => new Date(aula.dataHoraInicio).toLocaleString('pt-BR'),
    },
    {
      key: 'vagasTotais' as keyof Aula,
      header: 'Vagas',
      sortable: true,
    },
  ];

  // Configuração das ações da tabela
  const actions = [
    {
      icon: Edit,
      label: 'Editar aula',
      onClick: handleEdit,
      variant: 'primary' as const,
    },
    {
      icon: Trash2,
      label: 'Excluir aula',
      onClick: handleDelete,
      variant: 'danger' as const,
    },
  ];

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Aulas</h2>
        <button
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors cursor-pointer flex items-center gap-2"
          onClick={handleOpenModal}
        >
          <Plus className="w-4 h-4" />
          Nova Aula
        </button>
      </div>

      {showModal && (
        <NovaAulaModal
          onClose={() => setShowModal(false)}
          onCreated={fetchAulas}
        />
      )}

      {showEditarModal && (
        <EditarAulaModal
          show={showEditarModal}
          aula={aulaSelecionada}
          onClose={() => setShowEditarModal(false)}
          onUpdated={() => fetchAulas()}
        />
      )}

      {/* Tabela padronizada */}
      <Table
        data={aulas}
        columns={columns}
        actions={actions}
        loading={isLoading}
        emptyMessage="Nenhuma aula encontrada. Crie a primeira aula usando o botão 'Nova Aula'."
        className="mt-6"
      />
    </div>
  );
}
