"use client";

import { useState } from "react";
import api from "@/app/lib/api";

interface CriarUnidadeModalProps {
  onClose: () => void;
  onCreated: (unidade: any) => void;
}

export default function CriarUnidadeModal({ onClose, onCreated }: CriarUnidadeModalProps) {
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!nome.trim() || !cidade.trim()) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/unidades", {
        nome: nome.trim(),
        cidade: cidade.trim()
      });

      onCreated(response.data);
      onClose();
    } catch (error) {
      alert("Erro ao criar unidade. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Nova Unidade</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-1 text-sm">Crie uma nova unidade rapidamente</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Unidade *
              </label>
              <input
                type="text"
                placeholder="Ex: Clube da Sapt"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cidade *
              </label>
              <input
                type="text"
                placeholder="Ex: Torres"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Criando...
              </>
            ) : (
              "Criar Unidade"
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 