"use client";

import { useState } from "react";
import { Calendar, Clock, Users, MapPin, Eye, UserCheck } from "lucide-react";

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
}

interface AgendamentoAvulsaCardProps {
  aula: Aula;
  onViewAlunos: (aulaId: string) => void;
}

export default function AgendamentoAvulsaCard({ aula, onViewAlunos }: AgendamentoAvulsaCardProps) {
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

  const getOccupancyInfo = () => {
    const inscritos = aula._count?.agendamentos ?? 0;
    const lotacao = inscritos / aula.vagasTotais;
    
    let badgeColor = "bg-green-100 text-green-700";
    let statusText = "Disponível";
    
    if (lotacao >= 1) {
      badgeColor = "bg-red-100 text-red-700";
      statusText = "Lotado";
    } else if (lotacao >= 0.8) {
      badgeColor = "bg-yellow-100 text-yellow-700";
      statusText = "Quase Lotado";
    }

    return { inscritos, badgeColor, statusText };
  };

  const dateTime = formatDateTime(aula.dataHoraInicio);
  const timeRange = getTimeRange();
  const occupancy = getOccupancyInfo();

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

          {/* Ocupação e Ações */}
          <div className="flex items-center gap-3 ml-4">
            <div className="text-right">
              <div className={`px-3 py-1 text-sm font-medium rounded-full ${occupancy.badgeColor}`}>
                {occupancy.inscritos}/{aula.vagasTotais}
              </div>
              <div className="text-xs text-gray-500 mt-1">{occupancy.statusText}</div>
            </div>
            
            <button
              onClick={() => onViewAlunos(aula.id)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              title="Ver alunos inscritos"
            >
              <Eye className="w-4 h-4" />
              Ver Alunos
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
            <span>{aula.vagasTotais} vagas totais</span>
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

        {/* Barra de ocupação */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Ocupação</span>
            <span>{Math.round((occupancy.inscritos / aula.vagasTotais) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                occupancy.inscritos / aula.vagasTotais >= 1 
                  ? 'bg-red-500' 
                  : occupancy.inscritos / aula.vagasTotais >= 0.8 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((occupancy.inscritos / aula.vagasTotais) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
