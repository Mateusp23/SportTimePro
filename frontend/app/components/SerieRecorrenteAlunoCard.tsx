"use client";

import { useState } from "react";
import { Calendar, Clock, Users, MapPin, User, CheckCircle, XCircle, Repeat, ChevronDown, ChevronUp } from "lucide-react";
import { confirmAlert } from "@/app/utils/confirmAlert";

interface SerieRecorrenteAlunoCardProps {
  serie: {
    id: string;
    modalidade: string;
    vagasTotais: number;
    professor?: { nome: string; email?: string };
    unidade?: { nome: string };
    local?: { nome: string };
    regra: {
      freq: 'DAILY' | 'WEEKLY' | 'MONTHLY';
      byWeekday?: string[];
      until?: string;
    };
    proximasAulas: Array<{
      id: string;
      dataHoraInicio: string;
      dataHoraFim: string;
      _count?: { agendamentos: number };
    }>;
    totalAulas: number;
    inscrito: boolean;
  };
  onInscrever: (serieId: string) => void;
  onCancelarInscricao: (serieId: string) => void;
  isLoading?: boolean;
}

export default function SerieRecorrenteAlunoCard({ 
  serie, 
  onInscrever, 
  onCancelarInscricao, 
  isLoading = false 
}: SerieRecorrenteAlunoCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatFrequency = (regra: any) => {
    if (regra.freq === 'DAILY') return 'Diariamente';
    if (regra.freq === 'WEEKLY') {
      const days = regra.byWeekday?.map((day: string) => {
        const dayMap: { [key: string]: string } = {
          'MO': 'Seg', 'TU': 'Ter', 'WE': 'Qua', 'TH': 'Qui', 
          'FR': 'Sex', 'SA': 'Sáb', 'SU': 'Dom'
        };
        return dayMap[day] || day;
      }).join(', ') || '';
      return `Semanal (${days})`;
    }
    if (regra.freq === 'MONTHLY') return 'Mensalmente';
    return 'Personalizada';
  };

  const getNextClass = () => {
    const now = new Date();
    return serie.proximasAulas
      .filter(aula => new Date(aula.dataHoraInicio) > now)
      .sort((a, b) => new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime())[0];
  };

  const handleInscrever = async () => {
    const ok = await confirmAlert({
      type: "info",
      title: "Inscrever-se na Série",
      message: `Deseja se inscrever na série recorrente de ${serie.modalidade}? Você será inscrito em todas as aulas futuras disponíveis.`,
      confirmText: "Sim, inscrever",
      cancelText: "Cancelar",
    });

    if (ok) {
      onInscrever(serie.id);
    }
  };

  const handleCancelarInscricao = async () => {
    const ok = await confirmAlert({
      type: "warning",
      title: "Cancelar Inscrição na Série",
      message: `Tem certeza que deseja cancelar sua inscrição na série de ${serie.modalidade}? Todas as suas aulas futuras serão canceladas.`,
      confirmText: "Sim, cancelar série",
      cancelText: "Manter inscrição",
    });

    if (ok) {
      onCancelarInscricao(serie.id);
    }
  };

  const nextClass = getNextClass();
  const upcomingClasses = serie.proximasAulas
    .filter(aula => new Date(aula.dataHoraInicio) > new Date())
    .sort((a, b) => new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime())
    .slice(0, 5);

  return (
    <div className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
      serie.inscrito ? 'ring-2 ring-purple-200' : ''
    }`}>
      {/* Header do Card */}
      <div className={`px-6 py-4 border-l-4 ${
        serie.inscrito 
          ? 'border-l-purple-500 bg-purple-50' 
          : 'border-l-blue-500 bg-blue-50'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">{serie.modalidade}</h3>
                {serie.inscrito ? (
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Inscrito
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    Disponível
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatFrequency(serie.regra)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{serie.vagasTotais} vagas por aula</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {nextClass ? (
                  <span>Próxima: {new Date(nextClass.dataHoraInicio).toLocaleDateString('pt-BR')}</span>
                ) : (
                  <span className="text-gray-400">Nenhuma aula futura</span>
                )}
              </div>
            </div>

            {/* Professor e Local */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Prof. {serie.professor?.nome || 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{serie.unidade?.nome || 'Unidade'} - {serie.local?.nome || 'Local'}</span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-3 ml-4">
            <span className="text-sm text-gray-500">
              {serie.totalAulas} aulas futuras
            </span>
            
            {/* Botão de ação principal */}
            {serie.inscrito ? (
              <button
                onClick={handleCancelarInscricao}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Cancelar Série
              </button>
            ) : (
              <button
                onClick={handleInscrever}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Inscrever-se
              </button>
            )}
            
            {/* Botão expandir */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={expanded ? "Recolher" : "Expandir"}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Lista expandida das próximas aulas */}
      {expanded && upcomingClasses.length > 0 && (
        <div className="border-t border-gray-100 px-6 py-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Próximas aulas da série:</h4>
          <div className="space-y-3">
            {upcomingClasses.map((aula) => {
              const dateTime = new Date(aula.dataHoraInicio).toLocaleString('pt-BR');
              const ocupacao = aula._count?.agendamentos || 0;
              const vagasDisponiveis = serie.vagasTotais - ocupacao;
              
              return (
                <div key={aula.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      vagasDisponiveis > 0 ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        {dateTime}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ocupacao}/{serie.vagasTotais} inscritos
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs">
                    {vagasDisponiveis > 0 ? (
                      <span className="text-green-600 font-medium">
                        {vagasDisponiveis} vaga{vagasDisponiveis !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">Lotada</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {serie.totalAulas > upcomingClasses.length && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              ... e mais {serie.totalAulas - upcomingClasses.length} aulas na série
            </p>
          )}
        </div>
      )}

      {/* Informação adicional se inscrito */}
      {serie.inscrito && (
        <div className="px-6 py-3 bg-purple-50 border-t border-purple-100">
          <div className="flex items-center gap-2 text-purple-700">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Você está inscrito nesta série! Suas aulas aparecem na aba "Minhas Aulas".
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
