"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/app/lib/api";
import { useUnidadesLocais } from "@/app/hooks/useUnidadesLocais";
import Alert from '@/app/components/Alert';
import AulaDisponivelCard from "@/app/components/AulaDisponivelCard";
import MinhaAulaCard from "@/app/components/MinhaAulaCard";
import SerieRecorrenteAlunoCard from "@/app/components/SerieRecorrenteAlunoCard";
import AulasAlunoFilters, { AlunoFilterOptions } from "@/app/components/AulasAlunoFilters";
import { Calendar, BookOpen, Repeat, Search, Users, AlertCircle } from "lucide-react";

type Aula = {
  id: string;
  modalidade: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  vagasTotais: number;
  professorId: string;
  unidadeId: string;
  localId: string;
  unidade?: { nome: string };
  local?: { nome: string };
  professor?: { nome: string; email: string };
  _count?: { agendamentos: number };
  agendado?: boolean;
  seriesId?: string;
  isException?: boolean;
};

type Agendamento = {
  id: string;
  status: string;
  criadoEm: string;
  aula: Aula;
};

type ProfessorVinculado = {
  id: string;
  nome: string;
  email: string;
};

export default function AgendamentosAlunoPage() {
  const { unidades, locais } = useUnidadesLocais();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [meusAgendamentos, setMeusAgendamentos] = useState<Agendamento[]>([]);
  const [seriesRecorrentes, setSeriesRecorrentes] = useState<any[]>([]);
  const [professoresVinculados, setProfessoresVinculados] = useState<ProfessorVinculado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [activeTab, setActiveTab] = useState<'disponiveis' | 'minhas' | 'recorrentes'>('disponiveis');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  // Filtros
  const [filters, setFilters] = useState<AlunoFilterOptions>({
    dateStart: "",
    dateEnd: "",
    unidadeId: "",
    localId: "",
    modalidade: "",
    periodo: 'semana', // Padrão: próximos 7 dias
    status: 'todos'
  });

  // Inicializar filtro de período padrão
  useEffect(() => {
    const hoje = new Date();
    const proximaSemana = new Date(hoje);
    proximaSemana.setDate(hoje.getDate() + 7);
    
    setFilters(prev => ({
      ...prev,
      dateStart: hoje.toISOString().split('T')[0],
      dateEnd: proximaSemana.toISOString().split('T')[0]
    }));
  }, []);

  // Carregar dados
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        dateStart: filters.dateStart || new Date().toISOString().split('T')[0],
        dateEnd: filters.dateEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        unidadeId: filters.unidadeId || undefined,
        localId: filters.localId || undefined,
        modalidade: filters.modalidade || undefined
      };

      const [aulasResponse, agendamentosResponse, seriesResponse] = await Promise.all([
        api.get<{ 
          items: Aula[]; 
          professoresVinculados: ProfessorVinculado[];
          message?: string;
        }>("/aulas/professores-vinculados", { params }),
        api.get<Agendamento[]>("/agendamentos/aluno").catch(() => ({ data: [] })),
        api.get<{ items: any[]; professoresVinculados: ProfessorVinculado[] }>("/aulas/recorrencias-disponiveis").catch(() => ({ data: { items: [] } }))
      ]);

      setAulas(aulasResponse.data.items || []);
      setProfessoresVinculados(aulasResponse.data.professoresVinculados || []);
      setMeusAgendamentos(agendamentosResponse.data);
      setSeriesRecorrentes(seriesResponse.data.items || []);
      
      if (aulasResponse.data.message) {
        setError(aulasResponse.data.message);
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      setError("Erro ao carregar dados. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (filters.dateStart && filters.dateEnd) {
      fetchData();
    }
  }, [filters.dateStart, filters.dateEnd, filters.unidadeId, filters.localId, filters.modalidade]);

  // Ações
  const handleAgendar = async (aulaId: string) => {
    try {
      setIsLoadingAction(true);
      await api.post("/agendamentos", { aulaId });
      
      setFeedback({
        type: "success",
        title: "Sucesso!",
        message: "Aula agendada com sucesso!"
      });
      
      await fetchData();
    } catch (error: any) {
      setFeedback({
        type: "error",
        title: "Erro",
        message: error.response?.data?.message || "Erro ao agendar aula"
      });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleCancelarAgendamento = async (agendamentoId: string) => {
    try {
      setIsLoadingAction(true);
      await api.delete(`/agendamentos/${agendamentoId}`);
      
      setFeedback({
        type: "success",
        title: "Cancelado",
        message: "Agendamento cancelado com sucesso!"
      });
      
      await fetchData();
    } catch (error: any) {
      setFeedback({
        type: "error",
        title: "Erro",
        message: error.response?.data?.message || "Erro ao cancelar agendamento"
      });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleAgendarSerie = async (serieId: string) => {
    try {
      setIsLoadingAction(true);
      const response = await api.post("/agendamentos/serie-recorrente", { serieId });
      
      setFeedback({
        type: "success",
        title: "Inscrito na Série!",
        message: response.data.message || "Você foi inscrito na série recorrente com sucesso!"
      });
      
      await fetchData();
    } catch (error: any) {
      setFeedback({
        type: "error",
        title: "Erro",
        message: error.response?.data?.message || "Erro ao se inscrever na série"
      });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleCancelarSerie = async (serieId: string) => {
    try {
      setIsLoadingAction(true);
      const response = await api.delete(`/agendamentos/serie-recorrente/${serieId}`);
      
      setFeedback({
        type: "success",
        title: "Série Cancelada",
        message: response.data.message || "Inscrição na série cancelada com sucesso!"
      });
      
      await fetchData();
    } catch (error: any) {
      setFeedback({
        type: "error",
        title: "Erro",
        message: error.response?.data?.message || "Erro ao cancelar série"
      });
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Dados filtrados
  const modalidades = useMemo(() => {
    const set = new Set(aulas.map(a => a.modalidade?.toUpperCase().trim()).filter(Boolean));
    return Array.from(set).sort();
  }, [aulas]);

  const aulasDisponiveis = useMemo(() => {
    return aulas.filter(aula => {
      const agora = new Date();
      const dataAula = new Date(aula.dataHoraInicio);
      
      // Verificar se é aula futura
      if (dataAula <= agora) return false;
      
      // Verificar se há vagas disponíveis
      const vagasOcupadas = aula._count?.agendamentos || 0;
      const temVagas = vagasOcupadas < aula.vagasTotais;
      if (!temVagas) return false;
      
      // Verificar se o aluno já está agendado nesta aula
      if (aula.agendado) return false;
      
      // Aplicar filtros de modalidade se definido
      if (filters.modalidade && !aula.modalidade.toLowerCase().includes(filters.modalidade.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [aulas, filters.modalidade]);

  const meusAgendamentosFiltrados = useMemo(() => {
    let filtered = [...meusAgendamentos];
    
    if (filters.status === 'agendadas') {
      filtered = filtered.filter(ag => ag.status === 'ATIVO');
    } else if (filters.status === 'canceladas') {
      filtered = filtered.filter(ag => ag.status === 'CANCELADO');
    }
    
    // Aplicar filtros de modalidade se definido
    if (filters.modalidade) {
      filtered = filtered.filter(ag => 
        ag.aula?.modalidade?.toLowerCase().includes(filters.modalidade.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => 
      new Date(b.aula.dataHoraInicio).getTime() - new Date(a.aula.dataHoraInicio).getTime()
    );
  }, [meusAgendamentos, filters.status, filters.modalidade]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-bold flex items-center gap-3">
              <BookOpen className="text-blue-600" />
              Meus Agendamentos
            </h2>
            {professoresVinculados.length > 0 && (
              <p className="text-gray-600 mt-1">
                Você está vinculado a {professoresVinculados.length} professor{professoresVinculados.length !== 1 ? 'es' : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Professores vinculados */}
      {professoresVinculados.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Professores Vinculados ({professoresVinculados.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {professoresVinculados.map((prof) => (
              <span key={prof.id} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                {prof.nome}
              </span>
            ))}
          </div>
          <p className="text-blue-600 text-sm mt-2">
            Você pode se agendar nas aulas destes professores.
          </p>
        </div>
      )}

      {/* Filtros */}
      <AulasAlunoFilters
        filters={filters}
        onFiltersChange={setFilters}
        unidades={unidades}
        locais={locais}
        modalidades={modalidades}
        showStatusFilter={activeTab === 'minhas'}
      />

      {/* Abas */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('disponiveis')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'disponiveis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Aulas Disponíveis ({aulasDisponiveis.length})
            </button>
            <button
              onClick={() => setActiveTab('minhas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'minhas'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Minhas Aulas ({meusAgendamentos.length})
            </button>
            <button
              onClick={() => setActiveTab('recorrentes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'recorrentes'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Repeat className="w-4 h-4 inline mr-2" />
              Séries Recorrentes ({seriesRecorrentes.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Conteúdo das Abas */}
          {activeTab === 'disponiveis' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  <span className="ml-3 text-gray-600">Carregando aulas disponíveis...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2 text-gray-600">{error}</p>
                  <p className="text-sm text-gray-500">
                    Solicite ao administrador para vincular você a um professor.
                  </p>
                </div>
              ) : aulasDisponiveis.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">Nenhuma aula disponível</p>
                  <p className="text-sm">Ajuste os filtros ou verifique com seu professor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {aulasDisponiveis.map((aula) => (
                    <AulaDisponivelCard
                      key={aula.id}
                      aula={aula}
                      onAgendar={handleAgendar}
                      onCancelar={() => {}} // Não usado nesta aba
                      isLoading={isLoadingAction}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'minhas' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                  <span className="ml-3 text-gray-600">Carregando seus agendamentos...</span>
                </div>
              ) : meusAgendamentosFiltrados.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">Nenhum agendamento encontrado</p>
                  <p className="text-sm">
                    {filters.status === 'todos' 
                      ? 'Você ainda não tem aulas agendadas.'
                      : `Nenhuma aula ${filters.status === 'agendadas' ? 'agendada' : 'cancelada'} encontrada.`
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {meusAgendamentosFiltrados.map((agendamento) => (
                    <MinhaAulaCard
                      key={agendamento.id}
                      agendamento={agendamento}
                      onCancelar={handleCancelarAgendamento}
                      isLoading={isLoadingAction}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'recorrentes' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                  <span className="ml-3 text-gray-600">Carregando séries recorrentes...</span>
                </div>
              ) : seriesRecorrentes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Repeat className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">Nenhuma série recorrente</p>
                  <p className="text-sm">Não há séries recorrentes disponíveis dos seus professores vinculados.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {seriesRecorrentes
                    .filter(serie => {
                      // Aplicar filtros de modalidade se definido
                      if (filters.modalidade && !serie.modalidade.toLowerCase().includes(filters.modalidade.toLowerCase())) {
                        return false;
                      }
                      return true;
                    })
                    .map((serie) => (
                      <SerieRecorrenteAlunoCard
                        key={serie.id}
                        serie={serie}
                        onInscrever={handleAgendarSerie}
                        onCancelarInscricao={handleCancelarSerie}
                        isLoading={isLoadingAction}
                      />
                    ))
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <Alert
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}
    </div>
  );
}