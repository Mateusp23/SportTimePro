"use client";

import { Aula } from "@/app/types/types";
import { Calendar, Clock, Users, MapPin, Edit, Trash2 } from "lucide-react";
import { confirmAlert } from "@/app/utils/confirmAlert";

interface AulaAvulsaCardProps {
  aula: Aula;
  onEdit: (aula: Aula) => void;
  onDelete: (aula: Aula) => void;
}

export default function AulaAvulsaCard({ aula, onEdit, onDelete }: AulaAvulsaCardProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    
    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return {
      dayName,
      date: `${day} ${month} ${year}`,
      time,
      fullDate: date.toLocaleDateString('pt-BR'),
      isToday: date.toDateString() === new Date().toDateString(),
      isPast: date < new Date()
    };
  };

  const getTimeRange = () => {
    const start = new Date(aula.dataHoraInicio);
    const end = new Date(aula.dataHoraFim);
    
    const startTime = start.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const endTime = end.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return `${startTime} - ${endTime}`;
  };

  const handleDelete = async () => {
    const dateTime = formatDateTime(aula.dataHoraInicio);
    const ok = await confirmAlert({
      type: "warning",
      title: "Excluir aula",
      message: `Tem certeza que deseja excluir a aula de ${aula.modalidade} do dia ${dateTime.fullDate}?`,
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
    });

    if (ok) {
      onDelete(aula);
    }
  };

  const dateTime = formatDateTime(aula.dataHoraInicio);
  const timeRange = getTimeRange();

  return (
    <div className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
      dateTime.isPast ? 'opacity-75' : ''
    }`}>
      {/* Header com data destacada */}
      <div className={`px-6 py-4 border-l-4 ${
        dateTime.isToday 
          ? 'border-l-green-500 bg-green-50' 
          : dateTime.isPast 
            ? 'border-l-gray-400 bg-gray-50'
            : 'border-l-blue-500 bg-blue-50'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Modalidade e Status */}
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{aula.modalidade}</h3>
              <span className="px-2 py-1 text-xs font-medium bg-white text-gray-700 rounded-full border">
                Aula Avulsa
              </span>
              {dateTime.isToday && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  Hoje
                </span>
              )}
              {dateTime.isPast && (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  Finalizada
                </span>
              )}
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4" />
                <div>
                  <span className="font-medium">{dateTime.dayName}</span>
                  <span className="ml-2 text-gray-600">{dateTime.date}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{timeRange}</span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => onEdit(aula)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar aula"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Excluir aula"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Corpo com detalhes */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          {/* Vagas */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{aula.vagasTotais} vagas disponíveis</span>
          </div>

          {/* Local */}
          {(aula.unidade || aula.local) && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>
                {aula.unidade?.nome && aula.local?.nome 
                  ? `${aula.unidade.nome} - ${aula.local.nome}`
                  : aula.unidade?.nome || aula.local?.nome || 'Local não informado'
                }
              </span>
            </div>
          )}
        </div>

        {/* Professor */}
        {aula.professor && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Professor:</span> {aula.professor.nome}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
