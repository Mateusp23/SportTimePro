"use client";

import { Filter, Calendar, Users, MapPin } from "lucide-react";

export interface AgendamentoFilterOptions {
  dateStart: string;
  dateEnd: string;
  unidadeId: string;
  localId: string;
  modalidade: string;
  onlyMine: boolean;
  showOnlyUpcoming: boolean;
}

interface AgendamentosFiltersProps {
  filters: AgendamentoFilterOptions;
  onFiltersChange: (filters: AgendamentoFilterOptions) => void;
  unidades: Array<{ id: string; nome: string }>;
  locais: Array<{ id: string; nome: string; unidadeId: string }>;
  modalidades: string[];
}

export default function AgendamentosFilters({ 
  filters, 
  onFiltersChange, 
  unidades, 
  locais, 
  modalidades 
}: AgendamentosFiltersProps) {
  const updateFilter = (key: keyof AgendamentoFilterOptions, value: any) => {
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-medium text-gray-800">Filtros</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Período */}
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

        {/* Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.onlyMine}
              onChange={(e) => updateFilter('onlyMine', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Somente minhas aulas
          </label>
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.showOnlyUpcoming}
              onChange={(e) => updateFilter('showOnlyUpcoming', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Apenas futuras
          </label>
        </div>
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
        {filters.onlyMine && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            Minhas aulas
          </span>
        )}
        {filters.showOnlyUpcoming && (
          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
            Apenas futuras
          </span>
        )}
      </div>
    </div>
  );
}
