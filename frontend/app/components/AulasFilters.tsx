"use client";

import { Filter, Calendar, Repeat, Eye } from "lucide-react";

export interface FilterOptions {
  showOnlyUpcoming: boolean;
  groupRecurring: boolean;
  showOnlyActive: boolean;
  dateRange: 'all' | 'week' | 'month';
}

interface AulasFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export default function AulasFilters({ filters, onFiltersChange }: AulasFiltersProps) {
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Período
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => updateFilter('dateRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">Todas as datas</option>
            <option value="week">Próximos 7 dias</option>
            <option value="month">Próximos 30 dias</option>
          </select>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.showOnlyUpcoming}
              onChange={(e) => updateFilter('showOnlyUpcoming', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Eye className="w-4 h-4 text-gray-500" />
            Apenas futuras
          </label>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.groupRecurring}
              onChange={(e) => updateFilter('groupRecurring', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Repeat className="w-4 h-4 text-gray-500" />
            Agrupar recorrências
          </label>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.showOnlyActive}
              onChange={(e) => updateFilter('showOnlyActive', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></span>
            Apenas ativas
          </label>
        </div>
      </div>

      {/* Indicadores de filtros ativos */}
      <div className="flex flex-wrap gap-2 mt-4">
        {filters.dateRange !== 'all' && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            {filters.dateRange === 'week' ? 'Próximos 7 dias' : 'Próximos 30 dias'}
          </span>
        )}
        {filters.showOnlyUpcoming && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            Apenas futuras
          </span>
        )}
        {filters.groupRecurring && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
            Agrupadas
          </span>
        )}
        {filters.showOnlyActive && (
          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
            Apenas ativas
          </span>
        )}
      </div>
    </div>
  );
}
