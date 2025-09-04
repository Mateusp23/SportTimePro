"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/app/lib/api";
import { useUser } from "@/app/hooks/useUser";
import { useUnidadesLocais } from "@/app/hooks/useUnidadesLocais";
import AlunosDrawer from "@/app/components/AlunosDrawer";
import AgendamentoAvulsaCard from "@/app/components/AgendamentoAvulsaCard";
import AgendamentoSerieCard from "@/app/components/AgendamentoSerieCard";
import AgendamentosFilters, { AgendamentoFilterOptions } from "@/app/components/AgendamentosFilters";
import { Calendar, Repeat, List, AlertCircle, History } from "lucide-react";

type Aula = {
  id: string;
  modalidade: string;
  dataHoraInicio: string; // ISO
  dataHoraFim: string;    // ISO
  vagasTotais: number;
  professorId: string;
  unidadeId: string;
  localId: string;
  unidade?: { nome: string };
  local?: { nome: string };
  _count?: { agendamentos: number };
  seriesId?: string;
  isException?: boolean;
  recorrencia?: {
    id: string;
    regra: any;
    ativa: boolean;
  };
};

type RecurringSeries = {
  id: string;
  modalidade: string;
  vagasTotais: number;
  professorId: string;
  unidadeId: string;
  localId: string;
  professor?: { nome: string };
  unidade?: { nome: string };
  local?: { nome: string };
  regra: {
    freq: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    byWeekday?: string[];
    until?: string;
  };
  ativa: boolean;
  proximasAulas: Aula[];
  totalAulas: number;
  criadoEm: string;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function toInputDate(d: Date) {
  // yyyy-mm-dd
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function brDay(dateISO: string) {
  return new Date(dateISO).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
}
function brTime(dateISO: string) {
  return new Date(dateISO).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export default function AgendamentosPage() {
  const { user: me } = useUser();
  const { unidades, locais } = useUnidadesLocais();
  const [drawer, setDrawer] = useState<{ open: boolean; aulaId: string | null }>({
    open: false,
    aulaId: null
  });
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [recorrencias, setRecorrencias] = useState<RecurringSeries[]>([]);
  const [aulasSemAgendamentos, setAulasSemAgendamentos] = useState<Aula[]>([]);
  const [recorrenciasSemAgendamentos, setRecorrenciasSemAgendamentos] = useState<RecurringSeries[]>([]);
  const [aulasPassadas, setAulasPassadas] = useState<Aula[]>([]);
  const [recorrenciasPassadas, setRecorrenciasPassadas] = useState<RecurringSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecorrencias, setIsLoadingRecorrencias] = useState(true);
  const [isLoadingEmpty, setIsLoadingEmpty] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'single' | 'recurring' | 'empty' | 'history'>('all');
  
  // filtros
  const [filters, setFilters] = useState<AgendamentoFilterOptions>({
    dateStart: "",
    dateEnd: "",
    unidadeId: "",
    localId: "",
    modalidade: "",
    onlyMine: false, // Não usado, backend já filtra por role
    showOnlyUpcoming: false // Não usado, backend já filtra apenas futuras
  });

  // carregar aulas e recorrências COM AGENDAMENTOS
  const fetchAulas = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get<{ items: Aula[] }>("/aulas/agendamentos");
      console.log("🔍 Aulas com agendamentos:", data.items);
      setAulas(data.items);
    } catch (error) {
      console.error("Erro ao carregar aulas com agendamentos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecorrencias = async () => {
    try {
      setIsLoadingRecorrencias(true);
      const { data } = await api.get<{ items: RecurringSeries[] }>("/aulas/agendamentos/recorrencias");
      console.log("🔍 Séries com agendamentos:", data.items);
      setRecorrencias(data.items);
    } catch (error) {
      console.error("Erro ao carregar recorrências com agendamentos:", error);
    } finally {
      setIsLoadingRecorrencias(false);
    }
  };

  const fetchAulasSemAgendamentos = async () => {
    try {
      setIsLoadingEmpty(true);
      const [aulasResponse, recorrenciasResponse] = await Promise.all([
        api.get<{ items: Aula[] }>("/aulas/sem-agendamentos"),
        api.get<{ items: RecurringSeries[] }>("/aulas/sem-agendamentos/recorrencias")
      ]);
      console.log("🔍 Aulas sem agendamentos:", aulasResponse.data.items);
      console.log("🔍 Séries sem agendamentos:", recorrenciasResponse.data.items);
      setAulasSemAgendamentos(aulasResponse.data.items);
      setRecorrenciasSemAgendamentos(recorrenciasResponse.data.items);
    } catch (error) {
      console.error("Erro ao carregar aulas sem agendamentos:", error);
    } finally {
      setIsLoadingEmpty(false);
    }
  };

  const fetchAulasPassadas = async () => {
    try {
      setIsLoadingHistory(true);
      const [aulasResponse, recorrenciasResponse] = await Promise.all([
        api.get<{ items: Aula[] }>("/aulas/historico"),
        api.get<{ items: RecurringSeries[] }>("/aulas/historico/recorrencias")
      ]);
      console.log("🔍 Aulas passadas:", aulasResponse.data.items);
      console.log("🔍 Séries passadas:", recorrenciasResponse.data.items);
      setAulasPassadas(aulasResponse.data.items);
      setRecorrenciasPassadas(recorrenciasResponse.data.items);
    } catch (error) {
      console.error("Erro ao carregar aulas passadas:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchAulas();
    fetchRecorrencias();
  }, []);

  // Carregar dados quando a aba muda
  const handleTabChange = (tab: 'all' | 'single' | 'recurring' | 'empty' | 'history') => {
    setActiveTab(tab);
    
    if (tab === 'empty' && aulasSemAgendamentos.length === 0 && recorrenciasSemAgendamentos.length === 0) {
      fetchAulasSemAgendamentos();
    }
    
    if (tab === 'history' && aulasPassadas.length === 0 && recorrenciasPassadas.length === 0) {
      fetchAulasPassadas();
    }
  };

  // handlers para ações dos cards
  const handleViewAlunos = (aulaId: string) => {
    setDrawer({ open: true, aulaId });
  };

  const handleSkipClass = async (aulaId: string) => {
    // TODO: Implementar lógica para faltar em uma aula específica da série
    console.log('Faltar na aula:', aulaId);
  };

  const handleUnskipClass = async (aulaId: string) => {
    // TODO: Implementar lógica para confirmar presença em uma aula da série
    console.log('Confirmar presença na aula:', aulaId);
  };

  // gerar lista de modalidades únicas (para o select)
  const modalidades = useMemo(() => {
    const set = new Set(aulas.map((a) => a.modalidade?.toUpperCase().trim()).filter(Boolean));
    return Array.from(set).sort();
  }, [aulas]);

  // Filtrar aulas avulsas (sem seriesId)
  const filteredAulas = useMemo(() => {
    if (!aulas.length) return [];

    let filtered = aulas.filter(a => !a.seriesId); // Apenas aulas avulsas

    // Aplicar filtros (backend já filtra apenas futuras e com agendamentos)
    if (filters.dateStart || filters.dateEnd) {
      const start = filters.dateStart ? startOfDay(new Date(filters.dateStart)) : new Date(0);
      const end = filters.dateEnd ? endOfDay(new Date(filters.dateEnd)) : new Date('2099-12-31');
      
      filtered = filtered.filter(a => {
        const inicio = new Date(a.dataHoraInicio);
        return inicio >= start && inicio <= end;
      });
    }

    if (filters.unidadeId) {
      filtered = filtered.filter(a => a.unidadeId === filters.unidadeId);
    }

    if (filters.localId) {
      filtered = filtered.filter(a => a.localId === filters.localId);
    }

    if (filters.modalidade) {
      const modalidadeFiltro = filters.modalidade.toUpperCase().trim();
      filtered = filtered.filter(a => {
        const aMod = (a.modalidade || "").toUpperCase().trim();
        return aMod.includes(modalidadeFiltro);
      });
    }

    // onlyMine já é aplicado no backend baseado no role do usuário

    return filtered.sort((a, b) => 
      new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime()
    );
  }, [aulas, filters]);

  // Filtrar séries recorrentes
  const filteredRecorrencias = useMemo(() => {
    let filtered = [...recorrencias];

    if (filters.modalidade) {
      const modalidadeFiltro = filters.modalidade.toUpperCase().trim();
      filtered = filtered.filter(s => {
        const sMod = (s.modalidade || "").toUpperCase().trim();
        return sMod.includes(modalidadeFiltro);
      });
    }

    if (filters.unidadeId) {
      filtered = filtered.filter(s => s.unidadeId === filters.unidadeId);
    }

    if (filters.localId) {
      filtered = filtered.filter(s => s.localId === filters.localId);
    }

    // onlyMine já é aplicado no backend baseado no role do usuário

    return filtered;
  }, [recorrencias, filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold">Agendamentos</h2>
        </div>
      </div>

      {/* Filtros */}
      <AgendamentosFilters 
        filters={filters}
        onFiltersChange={setFilters}
        unidades={unidades}
        locais={locais}
        modalidades={modalidades}
      />

      {/* Abas */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 px-6 overflow-x-auto">
            <button
              onClick={() => handleTabChange('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <List className="w-4 h-4 inline mr-2" />
              Todos ({filteredAulas.length + filteredRecorrencias.length})
            </button>
            <button
              onClick={() => handleTabChange('single')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'single'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Aulas Avulsas ({filteredAulas.length})
            </button>
            <button
              onClick={() => handleTabChange('recurring')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'recurring'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Repeat className="w-4 h-4 inline mr-2" />
              Séries Recorrentes ({filteredRecorrencias.length})
            </button>
            <button
              onClick={() => handleTabChange('empty')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'empty'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Sem Agendamentos ({aulasSemAgendamentos.filter(a => !a.seriesId).length + recorrenciasSemAgendamentos.length})
            </button>
            <button
              onClick={() => handleTabChange('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-gray-500 text-gray-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <History className="w-4 h-4 inline mr-2" />
              Histórico ({aulasPassadas.filter(a => !a.seriesId).length + recorrenciasPassadas.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Conteúdo das Abas */}
          {activeTab === 'single' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  <span className="ml-3 text-gray-600">Carregando aulas...</span>
                </div>
              ) : filteredAulas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">Nenhuma aula avulsa encontrada</p>
                  <p className="text-sm">Ajuste os filtros ou verifique se há aulas agendadas.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredAulas.map((aula) => (
                    <AgendamentoAvulsaCard
                      key={aula.id}
                      aula={aula}
                      onViewAlunos={handleViewAlunos}
                    />
                  ))}
                </div>
              )}
            </div>
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
                  <p className="text-sm mt-2">Você não está inscrito em nenhuma série recorrente.</p>
                </div>
              ) : (
                filteredRecorrencias.map((serie) => (
                  <AgendamentoSerieCard
                    key={serie.id}
                    series={serie}
                    onViewAlunos={handleViewAlunos}
                    onSkipClass={handleSkipClass}
                    onUnskipClass={handleUnskipClass}
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
                      <AgendamentoSerieCard
                        key={serie.id}
                        series={serie}
                        onViewAlunos={handleViewAlunos}
                        onSkipClass={handleSkipClass}
                        onUnskipClass={handleUnskipClass}
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredAulas.map((aula) => (
                      <AgendamentoAvulsaCard
                        key={aula.id}
                        aula={aula}
                        onViewAlunos={handleViewAlunos}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Estado vazio */}
              {filteredAulas.length === 0 && filteredRecorrencias.length === 0 && !isLoading && !isLoadingRecorrencias && (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">Nenhum agendamento encontrado</p>
                  <p className="text-sm">Ajuste os filtros ou verifique se há aulas agendadas.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'empty' && (
            <div className="space-y-6">
              {/* Séries sem agendamentos */}
              {recorrenciasSemAgendamentos.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-orange-700 mb-4 flex items-center gap-2">
                    <Repeat className="w-5 h-5" />
                    Séries sem Agendamentos
                  </h3>
                  <div className="space-y-4">
                    {recorrenciasSemAgendamentos.map((serie) => (
                      <div key={serie.id} className="relative">
                        <AgendamentoSerieCard
                          series={serie}
                          onViewAlunos={handleViewAlunos}
                          onSkipClass={handleSkipClass}
                          onUnskipClass={handleUnskipClass}
                        />
                        <div className="absolute top-4 right-4">
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                            Sem inscrições
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aulas avulsas sem agendamentos */}
              {aulasSemAgendamentos.filter(a => !a.seriesId).length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-orange-700 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Aulas Avulsas sem Agendamentos
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {aulasSemAgendamentos.filter(a => !a.seriesId).map((aula) => (
                      <div key={aula.id} className="relative">
                        <AgendamentoAvulsaCard
                          aula={aula}
                          onViewAlunos={handleViewAlunos}
                        />
                        <div className="absolute top-4 right-4">
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                            0/{aula.vagasTotais}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading */}
              {isLoadingEmpty && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
                  <span className="ml-3 text-gray-600">Carregando aulas vazias...</span>
                </div>
              )}

              {/* Estado vazio */}
              {!isLoadingEmpty && recorrenciasSemAgendamentos.length === 0 && aulasSemAgendamentos.filter(a => !a.seriesId).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">Nenhuma aula sem agendamentos</p>
                  <p className="text-sm">Todas as suas aulas futuras já têm alunos inscritos! 🎉</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Séries passadas */}
              {recorrenciasPassadas.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <Repeat className="w-5 h-5" />
                    Séries Finalizadas
                  </h3>
                  <div className="space-y-4">
                    {recorrenciasPassadas.map((serie) => (
                      <div key={serie.id} className="opacity-75">
                        <AgendamentoSerieCard
                          series={serie}
                          onViewAlunos={handleViewAlunos}
                          onSkipClass={handleSkipClass}
                          onUnskipClass={handleUnskipClass}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aulas avulsas passadas */}
              {aulasPassadas.filter(a => !a.seriesId).length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Aulas Avulsas Finalizadas
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {aulasPassadas.filter(a => !a.seriesId).map((aula) => (
                      <div key={aula.id} className="opacity-75">
                        <AgendamentoAvulsaCard
                          aula={aula}
                          onViewAlunos={handleViewAlunos}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading */}
              {isLoadingHistory && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600" />
                  <span className="ml-3 text-gray-600">Carregando histórico...</span>
                </div>
              )}

              {/* Estado vazio */}
              {!isLoadingHistory && recorrenciasPassadas.length === 0 && aulasPassadas.filter(a => !a.seriesId).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">Nenhuma aula no histórico</p>
                  <p className="text-sm">Ainda não há aulas finalizadas para mostrar.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drawer de Alunos */}
      <AlunosDrawer
        open={drawer.open}
        aulaId={drawer.aulaId}
        onClose={() => setDrawer({ open: false, aulaId: null })}
      />
    </div>
  );
}
