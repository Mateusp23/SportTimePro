"use client";

import { useState } from "react";
import api from "@/app/lib/api";

export default function NovaAulaModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [modalidade, setModalidade] = useState("");
  const [dataHoraInicio, setDataHoraInicio] = useState("");
  const [dataHoraFim, setDataHoraFim] = useState("");
  const [vagasTotais, setVagasTotais] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!modalidade || !dataHoraInicio || !dataHoraFim || vagasTotais <= 0) {
      alert("Por favor, preencha todos os campos corretamente");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/aulas", {
        modalidade,
        dataHoraInicio,
        dataHoraFim,
        vagasTotais,
      });
      onCreated();
      onClose();
    } catch (error) {
      alert("Erro ao criar aula");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl transform transition-all duration-300 ease-out">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Nova Aula</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-2">Preencha os dados da nova aula</p>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <div className="space-y-6">
            {/* Modalidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modalidade *
              </label>
              <input
                type="text"
                placeholder="Ex: Futebol, Natação, Tênis..."
                value={modalidade}
                onChange={(e) => setModalidade(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Data e Hora Início */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data e Hora de Início *
              </label>
              <input
                type="datetime-local"
                value={dataHoraInicio}
                onChange={(e) => setDataHoraInicio(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
              />
            </div>

            {/* Data e Hora Fim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data e Hora de Fim *
              </label>
              <input
                type="datetime-local"
                value={dataHoraFim}
                onChange={(e) => setDataHoraFim(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
              />
            </div>

            {/* Vagas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Vagas *
              </label>
              <input
                type="number"
                min="1"
                placeholder="Ex: 20"
                value={vagasTotais}
                onChange={(e) => setVagasTotais(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Criando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Criar Aula
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
