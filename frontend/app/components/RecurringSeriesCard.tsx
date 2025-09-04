"use client";

import { useState } from "react";
import { RecurringSeries } from "@/app/types/types";
import { ChevronDown, ChevronUp, Edit, Trash2, Calendar, Clock, Users, Repeat } from "lucide-react";
import { confirmAlert } from "@/app/utils/confirmAlert";

interface RecurringSeriesCardProps {
  series: RecurringSeries;
  onEdit: (seriesId: string) => void;
  onDelete: (seriesId: string) => void;
  onEditInstance: (aulaId: string) => void;
  onDeleteInstance: (aulaId: string) => void;
}

export default function RecurringSeriesCard({ 
  series, 
  onEdit, 
  onDelete, 
  onEditInstance, 
  onDeleteInstance 
}: RecurringSeriesCardProps) {
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

  const handleDeleteSeries = async () => {
    const ok = await confirmAlert({
      type: "warning",
      title: "Excluir série recorrente",
      message: `Tem certeza que deseja excluir toda a série "${series.modalidade}"? Isso cancelará todas as aulas futuras desta série.`,
      confirmText: "Sim, excluir série",
      cancelText: "Cancelar",
    });

    if (ok) {
      onDelete(series.id);
    }
  };

  const handleDeleteInstance = async (aulaId: string, dataHora: string) => {
    const ok = await confirmAlert({
      type: "warning",
      title: "Cancelar aula individual",
      message: `Tem certeza que deseja cancelar apenas a aula de ${dataHora}?`,
      confirmText: "Sim, cancelar esta aula",
      cancelText: "Cancelar",
    });

    if (ok) {
      onDeleteInstance(aulaId);
    }
  };

  const nextClass = getNextClass();
  const upcomingClasses = series.proximasAulas
    .filter(aula => new Date(aula.dataHoraInicio) > new Date())
    .sort((a, b) => new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header do Card */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">{series.modalidade}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  Série Recorrente
                </span>
                {!series.ativa && (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                    Inativa
                  </span>
                )}
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
            <button
              onClick={() => onEdit(series.id)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar série"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteSeries}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Excluir série"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
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
          <h4 className="text-sm font-medium text-gray-700 mb-3">Próximas aulas:</h4>
          <div className="space-y-2">
            {upcomingClasses.map((aula) => (
              <div key={aula.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {new Date(aula.dataHoraInicio).toLocaleString('pt-BR')}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({aula.vagasTotais} vagas)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditInstance(aula.id)}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    title="Editar esta aula"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteInstance(aula.id, new Date(aula.dataHoraInicio).toLocaleString('pt-BR'))}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="Cancelar esta aula"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {series.totalAulas > upcomingClasses.length && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              ... e mais {series.totalAulas - upcomingClasses.length} aulas
            </p>
          )}
        </div>
      )}
    </div>
  );
}
