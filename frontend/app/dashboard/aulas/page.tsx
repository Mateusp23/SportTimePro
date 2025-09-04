"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/app/lib/api";
import NovaAulaModal from "@/app/components/NovaAulaModel";
import { useUser } from "@/app/hooks/useUser";
import EditarAulaModal from "@/app/components/EditarAulaModal";
import { Aula, RecurringSeries } from "@/app/types/types";
import { confirmAlert } from "@/app/utils/confirmAlert";
import Table from "@/app/components/Table";
import RecurringSeriesCard from "@/app/components/RecurringSeriesCard";
import AulasFilters, { FilterOptions } from "@/app/components/AulasFilters";
import { Edit, Trash2, Plus, Calendar, Repeat, List } from "lucide-react";

export default function AulasPage() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [recorrencias, setRecorrencias] = useState<RecurringSeries[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [aulaSelecionada, setAulaSelecionada] = useState<Aula | null>(null);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecorrencias, setIsLoadingRecorrencias] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'single' | 'recurring'>('all');
  const [filters, setFilters] = useState<FilterOptions>({
    showOnlyUpcoming: false,
    groupRecurring: true,
    showOnlyActive: true,
    dateRange: 'all'
  });

  const { user, isLoading: isLoadingUser } = useUser();

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

  const fetchRecorrencias = async () => {
    try {
      setIsLoadingRecorrencias(true);
      const res = await api.get("/aulas/recorrencias");
      setRecorrencias(res.data.items);
    } catch (error) {
      console.error("Erro ao buscar recorrências:", error);
    } finally {
      setIsLoadingRecorrencias(false);
    }
  };

  useEffect(() => {
    fetchAulas();
    fetchRecorrencias();
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
    if (!user || isLoadingUser) return;
    setShowModal(true);
  };

  const handleDeleteRecorrencia = async (seriesId: string) => {
    try {
      await api.delete(`/aulas/recorrencias/${seriesId}`);
      fetchRecorrencias();
      fetchAulas(); // Atualiza também as aulas individuais
    } catch (error) {
      console.error("Erro ao excluir recorrência:", error);
    }
  };

  const handleEditRecorrencia = (seriesId: string) => {
    // TODO: Implementar modal de edição de série
    console.log("Editar série:", seriesId);
  };

  const handleEditInstance = (aulaId: string) => {
    const aula = aulas.find(a => a.id === aulaId);
    if (aula) {
      handleEdit(aula);
    }
  };

  const handleDeleteInstance = async (aulaId: string) => {
    const aula = aulas.find(a => a.id === aulaId);
    if (aula) {
      await handleDelete(aula);
    }
  };

  // Filtrar aulas baseado nos filtros ativos e contexto de exibição
  const filteredAulas = useMemo(() => {
    let filtered = [...aulas];

    // SEMPRE remover aulas recorrentes da lista de "aulas avulsas"
    // Aulas avulsas são apenas aquelas que NÃO pertencem a uma série recorrente
    filtered = filtered.filter(aula => !aula.seriesId);

    // Filtrar apenas futuras
    if (filters.showOnlyUpcoming) {
      const now = new Date();
      filtered = filtered.filter(aula => new Date(aula.dataHoraInicio) > now);
    }

    // Filtrar por período
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const days = filters.dateRange === 'week' ? 7 : 30;
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(aula => {
        const aulaDate = new Date(aula.dataHoraInicio);
        return aulaDate >= now && aulaDate <= futureDate;
      });
    }

    return filtered;
  }, [aulas, filters]);

  // Filtrar todas as aulas (incluindo instâncias de recorrentes) para a aba "Todas"
  const allAulasForDisplay = useMemo(() => {
    let filtered = [...aulas];

    // Filtrar apenas futuras
    if (filters.showOnlyUpcoming) {
      const now = new Date();
      filtered = filtered.filter(aula => new Date(aula.dataHoraInicio) > now);
    }

    // Filtrar por período
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const days = filters.dateRange === 'week' ? 7 : 30;
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(aula => {
        const aulaDate = new Date(aula.dataHoraInicio);
        return aulaDate >= now && aulaDate <= futureDate;
      });
    }

    // Remover instâncias de recorrentes se agrupamento está ativo
    if (filters.groupRecurring) {
      filtered = filtered.filter(aula => !aula.seriesId);
    }

    return filtered;
  }, [aulas, filters]);

  // Filtrar recorrências
  const filteredRecorrencias = useMemo(() => {
    let filtered = [...recorrencias];

    // Filtrar apenas ativas
    if (filters.showOnlyActive) {
      filtered = filtered.filter(serie => serie.ativa);
    }

    return filtered;
  }, [recorrencias, filters]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold">Aulas</h2>
          <button
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors cursor-pointer flex items-center gap-2"
            onClick={handleOpenModal}
            disabled={isLoadingUser || !user}
          >
            <Plus className="w-4 h-4" />
            Nova Aula
          </button>
        </div>
      </div>

      {/* Filtros */}
      <AulasFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      {/* Abas */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <List className="w-4 h-4 inline mr-2" />
              Todas ({allAulasForDisplay.length + filteredRecorrencias.length})
            </button>
            <button
              onClick={() => setActiveTab('single')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'single'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Aulas Avulsas ({filteredAulas.length})
            </button>
            <button
              onClick={() => setActiveTab('recurring')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recurring'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Repeat className="w-4 h-4 inline mr-2" />
              Séries Recorrentes ({filteredRecorrencias.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Conteúdo das Abas */}
          {activeTab === 'single' && (
            <Table
              data={filteredAulas}
              columns={columns}
              actions={actions}
              loading={isLoading}
              emptyMessage="Nenhuma aula avulsa encontrada."
            />
          )}

          {activeTab === 'recurring' && (
            <div className="space-y-4">
              {isLoadingRecorrencias ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  <span className="ml-3 text-gray-600">Carregando séries...</span>
                </div>
              ) : filteredRecorrencias.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Repeat className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma série recorrente encontrada.</p>
                  <p className="text-sm mt-2">Crie uma nova aula e marque como recorrente.</p>
                </div>
              ) : (
                filteredRecorrencias.map((serie) => (
                  <RecurringSeriesCard
                    key={serie.id}
                    series={serie}
                    onEdit={handleEditRecorrencia}
                    onDelete={handleDeleteRecorrencia}
                    onEditInstance={handleEditInstance}
                    onDeleteInstance={handleDeleteInstance}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'all' && (
            <div className="space-y-6">
              {/* Séries Recorrentes */}
              {filteredRecorrencias.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Repeat className="w-5 h-5" />
                    Séries Recorrentes
                  </h3>
                  <div className="space-y-4">
                    {filteredRecorrencias.map((serie) => (
                      <RecurringSeriesCard
                        key={serie.id}
                        series={serie}
                        onEdit={handleEditRecorrencia}
                        onDelete={handleDeleteRecorrencia}
                        onEditInstance={handleEditInstance}
                        onDeleteInstance={handleDeleteInstance}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Aulas Avulsas */}
              {filteredAulas.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Aulas Avulsas
                  </h3>
                  <Table
                    data={filteredAulas}
                    columns={columns}
                    actions={actions}
                    loading={isLoading}
                    emptyMessage="Nenhuma aula avulsa encontrada."
                  />
                </div>
              )}

              {/* Estado vazio */}
              {filteredAulas.length === 0 && filteredRecorrencias.length === 0 && !isLoading && !isLoadingRecorrencias && (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">Nenhuma aula encontrada</p>
                  <p className="text-sm">Crie sua primeira aula usando o botão "Nova Aula".</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && user && (
        <NovaAulaModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            fetchAulas();
            fetchRecorrencias();
          }}
        />
      )}

      {showEditarModal && (
        <EditarAulaModal
          show={showEditarModal}
          aula={aulaSelecionada}
          onClose={() => setShowEditarModal(false)}
          onUpdated={() => {
            fetchAulas();
            fetchRecorrencias();
          }}
        />
      )}
    </div>
  );
}
