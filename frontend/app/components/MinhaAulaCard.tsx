"use client";

import { useState } from "react";
import { Calendar, Clock, Users, MapPin, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { confirmAlert } from "@/app/utils/confirmAlert";

interface MinhaAulaCardProps {
  agendamento: {
    id: string;
    status: string;
    aula: {
      id: string;
      modalidade: string;
      dataHoraInicio: string;
      dataHoraFim: string;
      vagasTotais: number;
      professor?: { nome: string; email?: string };
      unidade?: { nome: string };
      local?: { nome: string };
      _count?: { agendamentos: number };
    };
  };
  onCancelar: (agendamentoId: string) => void;
  isLoading?: boolean;
}

export default function MinhaAulaCard({ 
  agendamento, 
  onCancelar, 
  isLoading = false 
}: MinhaAulaCardProps) {
  const { aula } = agendamento;
  
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

    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    return {
      dayName,
      date: `${day} ${month} ${year}`,
      time,
      fullDate: date.toLocaleDateString('pt-BR'),
      isToday: date.toDateString() === now.toDateString(),
      isPast: date < now,
      isUpcoming: diffHours > 0 && diffHours <= 24, // Próximas 24 horas
      isThisWeek: date <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && date > now
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

  const getStatusInfo = () => {
    const dateTime = formatDateTime(aula.dataHoraInicio);
    
    if (agendamento.status === 'CANCELADO') {
      return {
        color: 'bg-red-100 text-red-700 border-l-red-500',
        badge: 'bg-red-100 text-red-700',
        text: 'Cancelado',
        icon: XCircle,
        canCancel: false
      };
    }
    
    if (dateTime.isPast) {
      return {
        color: 'bg-gray-100 text-gray-700 border-l-gray-500',
        badge: 'bg-gray-100 text-gray-600',
        text: 'Finalizada',
        icon: CheckCircle,
        canCancel: false
      };
    }
    
    if (dateTime.isUpcoming) {
      return {
        color: 'bg-orange-100 text-orange-700 border-l-orange-500',
        badge: 'bg-orange-100 text-orange-700',
        text: 'Hoje/Amanhã',
        icon: AlertCircle,
        canCancel: true
      };
    }
    
    return {
      color: 'bg-green-100 text-green-700 border-l-green-500',
      badge: 'bg-green-100 text-green-700',
      text: 'Agendado',
      icon: CheckCircle,
      canCancel: true
    };
  };

  const handleCancelar = async () => {
    const ok = await confirmAlert({
      type: "warning",
      title: "Cancelar Agendamento",
      message: `Tem certeza que deseja cancelar sua inscrição na aula de ${aula.modalidade}?`,
      confirmText: "Sim, cancelar",
      cancelText: "Manter agendamento",
    });

    if (ok) {
      onCancelar(agendamento.id);
    }
  };

  const dateTime = formatDateTime(aula.dataHoraInicio);
  const timeRange = getTimeRange();
  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}>
      {/* Header com status */}
      <div className={`px-6 py-4 border-l-4 ${statusInfo.color}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Modalidade e Status */}
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{aula.modalidade}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${statusInfo.badge}`}>
                <StatusIcon className="w-3 h-3" />
                {statusInfo.text}
              </span>
              {dateTime.isToday && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  Hoje
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
          {statusInfo.canCancel && (
            <div className="ml-4">
              <button
                onClick={handleCancelar}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Corpo com detalhes */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          {/* Professor */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Prof. {aula.professor?.nome || 'N/A'}</span>
          </div>

          {/* Ocupação */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              {aula._count?.agendamentos || 0}/{aula.vagasTotais} inscritos
            </span>
          </div>

          {/* Local */}
          <div className="flex items-center gap-2 md:col-span-2">
            <MapPin className="w-4 h-4" />
            <span>{aula.unidade?.nome || 'Unidade'} - {aula.local?.nome || 'Local'}</span>
          </div>
        </div>

        {/* Informações adicionais baseadas no status */}
        {dateTime.isUpcoming && agendamento.status === 'ATIVO' && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Sua aula está próxima! Não se esqueça de comparecer.
              </span>
            </div>
          </div>
        )}

        {agendamento.status === 'CANCELADO' && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Agendamento cancelado
              </span>
            </div>
          </div>
        )}

        {dateTime.isPast && agendamento.status === 'ATIVO' && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Aula finalizada com sucesso!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
