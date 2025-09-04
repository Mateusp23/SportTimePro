"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, Clock, Users, MapPin, Eye, X, Check, Repeat } from "lucide-react";
import { confirmAlert } from "@/app/utils/confirmAlert";

interface Aula {
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
  _count?: { agendamentos: number };
  seriesId?: string;
  isException?: boolean;
}

interface AgendamentoSerieCardProps {
  series: {
    id: string;
    modalidade: string;
    vagasTotais: number;
    unidade?: { nome: string };
    local?: { nome: string };
    proximasAulas: Aula[];
    totalAulas: number;
    regra: {
      freq: 'DAILY' | 'WEEKLY' | 'MONTHLY';
      byWeekday?: string[];
      until?: string;
    };
  };
  onViewAlunos: (aulaId: string) => void;
  onSkipClass: (aulaId: string) => void;
  onUnskipClass: (aulaId: string) => void;
}

export default function AgendamentoSerieCard({ 
  series, 
  onViewAlunos, 
  onSkipClass, 
  onUnskipClass 
}: AgendamentoSerieCardProps) {
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
    return series.proximasAulas
      .filter(aula => new Date(aula.dataHoraInicio) > now)
      .sort((a, b) => new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime())[0];
  };

  const handleSkipClass = async (aulaId: string, dataHora: string) => {
    const ok = await confirmAlert({
      type: "warning",
      title: "Faltar nesta aula",
      message: `Tem certeza que deseja faltar na aula de ${dataHora}? Sua vaga ficará disponível para outros alunos.`,
      confirmText: "Sim, vou faltar",
      cancelText: "Cancelar",
    });

    if (ok) {
      onSkipClass(aulaId);
    }
  };

  const handleUnskipClass = async (aulaId: string, dataHora: string) => {
    const ok = await confirmAlert({
      type: "info",
      title: "Confirmar presença",
      message: `Deseja confirmar sua presença na aula de ${dataHora}?`,
      confirmText: "Sim, vou participar",
      cancelText: "Cancelar",
    });

    if (ok) {
      onUnskipClass(aulaId);
    }
  };

  const nextClass = getNextClass();
  const upcomingClasses = series.proximasAulas
    .filter(aula => new Date(aula.dataHoraInicio) > new Date())
    .sort((a, b) => new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime())
    .slice(0, 8);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header do Card */}
      <div className="p-6 border-l-4 border-l-purple-500 bg-purple-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">{series.modalidade}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                  Série Agendada
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatFrequency(series.regra)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{series.vagasTotais} vagas</span>
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

            {series.unidade && series.local && (
              <p className="text-sm text-gray-500 mt-2">
                📍 {series.unidade.nome} - {series.local.nome}
              </p>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-gray-500">
              {upcomingClasses.length} aulas futuras
            </span>
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
              const isSkipped = aula.isException; // Assumindo que isException indica que o aluno faltará
              const dateTime = new Date(aula.dataHoraInicio).toLocaleString('pt-BR');
              const occupancy = aula._count?.agendamentos ?? 0;
              
              return (
                <div key={aula.id} className={`flex items-center justify-between py-3 px-4 rounded-lg border ${
                  isSkipped ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      isSkipped ? 'bg-red-400' : 'bg-green-400'
                    }`} />
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        {dateTime}
                      </div>
                      <div className="text-xs text-gray-500">
                        {occupancy}/{aula.vagasTotais} inscritos
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewAlunos(aula.id)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Ver alunos desta aula"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {isSkipped ? (
                      <button
                        onClick={() => handleUnskipClass(aula.id, dateTime)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Confirmar presença"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSkipClass(aula.id, dateTime)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Faltar nesta aula"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {series.totalAulas > upcomingClasses.length && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              ... e mais {series.totalAulas - upcomingClasses.length} aulas na série
            </p>
          )}
        </div>
      )}
    </div>
  );
}
