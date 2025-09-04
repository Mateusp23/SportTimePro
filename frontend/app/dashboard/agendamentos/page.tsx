"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/app/lib/api";
import { useUser } from "@/app/hooks/useUser";
import { useUnidadesLocais } from "@/app/hooks/useUnidadesLocais";
import AlunosDrawer from "@/app/components/AlunosDrawer";
import AgendamentoAvulsaCard from "@/app/components/AgendamentoAvulsaCard";
import AgendamentoSerieCard from "@/app/components/AgendamentoSerieCard";
import AgendamentosFilters, { AgendamentoFilterOptions } from "@/app/components/AgendamentosFilters";
import { Calendar, Repeat, List } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecorrencias, setIsLoadingRecorrencias] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'single' | 'recurring'>('all');
  
  // filtros
  const [filters, setFilters] = useState<AgendamentoFilterOptions>({
    dateStart: "",
    dateEnd: "",
    unidadeId: "",
    localId: "",
    modalidade: "",
    onlyMine: true,
    showOnlyUpcoming: true
  });

  // carregar aulas e recorrências
  const fetchAulas = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get<{ items: Aula[] }>("/aulas");
      setAulas(data.items);
    } catch (error) {
      console.error("Erro ao carregar aulas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecorrencias = async () => {
    try {
      setIsLoadingRecorrencias(true);
      const { data } = await api.get<{ items: RecurringSeries[] }>("/aulas/recorrencias");
      setRecorrencias(data.items);
    } catch (error) {
      console.error("Erro ao carregar recorrências:", error);
    } finally {
      setIsLoadingRecorrencias(false);
    }
  };

  useEffect(() => {
    fetchAulas();
    fetchRecorrencias();
  }, []);

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

    // Aplicar filtros
    if (filters.dateStart || filters.dateEnd) {
      const start = filters.dateStart ? startOfDay(new Date(filters.dateStart)) : new Date(0);
      const end = filters.dateEnd ? endOfDay(new Date(filters.dateEnd)) : new Date('2099-12-31');
      
      filtered = filtered.filter(a => {
        const inicio = new Date(a.dataHoraInicio);
        return inicio >= start && inicio <= end;
      });
    }

    if (filters.showOnlyUpcoming) {
      const now = new Date();
      filtered = filtered.filter(a => new Date(a.dataHoraInicio) > now);
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

    if (filters.onlyMine && me?.id) {
      filtered = filtered.filter(a => a.professorId === me.id);
    }

    return filtered.sort((a, b) => 
      new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime()
    );
  }, [aulas, filters, me?.id]);

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

    if (filters.onlyMine && me?.id) {
      filtered = filtered.filter(s => s.professorId === me.id);
    }

    return filtered;
  }, [recorrencias, filters, me?.id]);

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
              Todos ({filteredAulas.length + filteredRecorrencias.length})
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
