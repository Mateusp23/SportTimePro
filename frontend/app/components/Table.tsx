import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { TableColumn, TableAction, TableProps } from '../types/table';

function Table<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  emptyMessage = 'Nenhum item encontrado',
  className = ''
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const handleSort = (key: keyof T) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const getActionVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return 'text-red-600 hover:bg-red-50';
      case 'warning':
        return 'text-yellow-600 hover:bg-yellow-50';
      case 'primary':
        return 'text-blue-600 hover:bg-blue-50';
      default:
        return 'text-gray-600 hover:bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando...</span>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    } ${column.className || ''}`}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`w-3 h-3 ${sortConfig.key === column.key && sortConfig.direction === 'asc'
                              ? 'text-gray-900'
                              : 'text-gray-300'
                            }`}
                        />
                        <ChevronDown
                          className={`w-3 h-3 -mt-1 ${sortConfig.key === column.key && sortConfig.direction === 'desc'
                              ? 'text-gray-900'
                              : 'text-gray-300'
                            }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.accessor ? column.accessor(item) : String(item[column.key] || '')}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(item)}
                            className={`p-2 rounded-full cursor-pointer transition-colors ${getActionVariantClasses(
                              action.variant
                            )} ${action.className || ''}`}
                            title={action.label}
                          >
                            <action.icon className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {sortedData.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">{emptyMessage}</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="space-y-3">
                  {columns.map((column) => (
                    <div key={String(column.key)} className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-500">{column.header}:</span>
                      <span className="text-sm text-gray-900 text-right ml-4">
                        {column.accessor ? column.accessor(item) : String(item[column.key] || '')}
                      </span>
                    </div>
                  ))}
                  {actions.length > 0 && (
                    <div className="flex justify-end items-center space-x-2 pt-3 border-t border-gray-100">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={() => action.onClick(item)}
                          className={`p-2 rounded-full transition-colors ${getActionVariantClasses(
                            action.variant
                          )} ${action.className || ''}`}
                          title={action.label}
                        >
                          <action.icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Table;