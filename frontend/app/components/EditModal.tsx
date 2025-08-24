"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export type EditField = {
  key: string;
  label: string;
  type: 'text' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: (value: string) => string | null; // retorna erro ou null se válido
};

export type EditModalProps<T> = {
  isOpen: boolean;
  title: string;
  item: T | null;
  fields: EditField[];
  isSaving: boolean;
  onCancel: () => void;
  onSave: (data: Record<string, string>) => Promise<void>;
  className?: string;
};

export default function EditModal<T extends Record<string, any>>({
  isOpen,
  title,
  item,
  fields,
  isSaving,
  onCancel,
  onSave,
  className = ""
}: EditModalProps<T>) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar dados do formulário quando o item mudar
  useEffect(() => {
    if (item) {
      const initialData: Record<string, string> = {};
      fields.forEach(field => {
        initialData[field.key] = String(item[field.key] || '');
      });
      setFormData(initialData);
      setErrors({});
    }
  }, [item, fields]);

  // Validar campo específico
  const validateField = (key: string, value: string): string | null => {
    const field = fields.find(f => f.key === key);
    if (!field) return null;

    // Validação de campo obrigatório
    if (field.required && !value.trim()) {
      return `${field.label} é obrigatório`;
    }

    // Validação customizada
    if (field.validation) {
      return field.validation(value);
    }

    return null;
  };

  // Validar todos os campos
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const value = formData[field.key] || '';
      const error = validateField(field.key, value);
      
      if (error) {
        newErrors[field.key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Atualizar valor do campo
  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  // Salvar formulário
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  // Renderizar campo baseado no tipo
  const renderField = (field: EditField) => {
    const value = formData[field.key] || '';
    const error = errors[field.key];
    const hasError = !!error;

    const baseClasses = "border px-3 py-2 rounded w-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500";
    const errorClasses = hasError ? "border-red-300 bg-red-50" : "border-gray-300 focus:border-blue-500";

    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={`${baseClasses} ${errorClasses} bg-white`}
          >
            <option value="">{field.placeholder || `Selecione ${field.label.toLowerCase()}`}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={`${baseClasses} ${errorClasses} resize-none`}
          />
        );

      default: // text
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseClasses} ${errorClasses}`}
          />
        );
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className={`bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-heading font-bold">{title}</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Formulário */}
        <div className="space-y-4 mb-6">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
              {errors[field.key] && (
                <p className="text-sm text-red-600 mt-1">{errors[field.key]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSaving}
          >
            {isSaving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
