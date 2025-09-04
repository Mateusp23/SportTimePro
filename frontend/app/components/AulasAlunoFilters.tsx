"use client";

import { Filter, Calendar, Users, MapPin, Clock } from "lucide-react";

export interface AlunoFilterOptions {
  dateStart: string;
  dateEnd: string;
  unidadeId: string;
  localId: string;
  modalidade: string;
  periodo: 'todos' | 'hoje' | 'semana' | 'mes';
  status: 'todos' | 'disponiveis' | 'agendadas' | 'canceladas';
}

interface AulasAlunoFiltersProps {
  filters: AlunoFilterOptions;
  onFiltersChange: (filters: AlunoFilterOptions) => void;
  unidades: Array<{ id: string; nome: string }>;
  locais: Array<{ id: string; nome: string; unidadeId: string }>;
  modalidades: string[];
  showStatusFilter?: boolean;
}

export default function AulasAlunoFilters({ 
  filters, 
  onFiltersChange, 
  unidades, 
  locais, 
  modalidades,
  showStatusFilter = false
}: AulasAlunoFiltersProps) {
  const updateFilter = (key: keyof AlunoFilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const locaisDaUnidade = filters.unidadeId 
    ? locais.filter(l => l.unidadeId === filters.unidadeId) 
    : locais;

  // Auto-limpar local quando trocar unidade
  const handleUnidadeChange = (unidadeId: string) => {
    onFiltersChange({
      ...filters,
      unidadeId,
      localId: '' // Limpa o local
    });
  };

  // Função para definir período rápido
  const setPeriodoRapido = (periodo: 'todos' | 'hoje' | 'semana' | 'mes') => {
    const hoje = new Date();
    let dateStart = '';
    let dateEnd = '';

    switch (periodo) {
      case 'hoje':
        dateStart = dateEnd = hoje.toISOString().split('T')[0];
        break;
      case 'semana':
        dateStart = hoje.toISOString().split('T')[0];
        const proximaSemana = new Date(hoje);
        proximaSemana.setDate(hoje.getDate() + 7);
        dateEnd = proximaSemana.toISOString().split('T')[0];
        break;
      case 'mes':
        dateStart = hoje.toISOString().split('T')[0];
        const proximoMes = new Date(hoje);
        proximoMes.setMonth(hoje.getMonth() + 1);
        dateEnd = proximoMes.toISOString().split('T')[0];
        break;
      case 'todos':
      default:
        dateStart = dateEnd = '';
        break;
    }

    onFiltersChange({
      ...filters,
      periodo,
      dateStart,
      dateEnd
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-medium text-gray-800">Filtros</h3>
      </div>
      
      {/* Filtros rápidos de período */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="w-4 h-4 inline mr-1" />
          Período
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'hoje', label: 'Hoje' },
            { key: 'semana', label: 'Próximos 7 dias' },
            { key: 'mes', label: 'Próximo mês' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriodoRapido(key as any)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filters.periodo === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Período customizado */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 inline mr-1" />
            Data Início
          </label>
          <input
            type="date"
            value={filters.dateStart}
            onChange={(e) => updateFilter('dateStart', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 inline mr-1" />
            Data Fim
          </label>
          <input
            type="date"
            value={filters.dateEnd}
            onChange={(e) => updateFilter('dateEnd', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Unidade */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 inline mr-1" />
            Unidade
          </label>
          <select
            value={filters.unidadeId}
            onChange={(e) => handleUnidadeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={unidades.length === 0}
          >
            {unidades.length === 0 ? (
              <option value="">Carregando unidades...</option>
            ) : (
              <>
                <option value="">Todas unidades</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Local */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 inline mr-1" />
            Local
          </label>
          <select
            value={filters.localId}
            onChange={(e) => updateFilter('localId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={!filters.unidadeId || locaisDaUnidade.length === 0}
          >
            <option value="">
              {!filters.unidadeId ? 'Selecione uma unidade' : 'Todos locais'}
            </option>
            {locaisDaUnidade.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Modalidade */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Users className="w-4 h-4 inline mr-1" />
            Modalidade
          </label>
          <select
            value={filters.modalidade}
            onChange={(e) => updateFilter('modalidade', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Todas modalidades</option>
            {modalidades.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Status (apenas para aba "Minhas Aulas") */}
        {showStatusFilter && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="todos">Todos status</option>
              <option value="agendadas">Agendadas</option>
              <option value="canceladas">Canceladas</option>
            </select>
          </div>
        )}
      </div>

      {/* Indicadores de filtros ativos */}
      <div className="flex flex-wrap gap-2 mt-4">
        {filters.dateStart && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            Início: {new Date(filters.dateStart).toLocaleDateString('pt-BR')}
          </span>
        )}
        {filters.dateEnd && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            Fim: {new Date(filters.dateEnd).toLocaleDateString('pt-BR')}
          </span>
        )}
        {filters.modalidade && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
            {filters.modalidade}
          </span>
        )}
        {filters.unidadeId && unidades.find(u => u.id === filters.unidadeId) && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            {unidades.find(u => u.id === filters.unidadeId)?.nome}
          </span>
        )}
        {filters.localId && locais.find(l => l.id === filters.localId) && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            {locais.find(l => l.id === filters.localId)?.nome}
          </span>
        )}
        {showStatusFilter && filters.status !== 'todos' && (
          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
            {filters.status === 'agendadas' ? 'Agendadas' : 'Canceladas'}
          </span>
        )}
      </div>
    </div>
  );
}
