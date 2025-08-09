"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/api";
import { formatarDataInput } from "@/app/utils/date/dateFormatter";

interface EditarAulaModalProps {
  aula: any;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditarAulaModal({ aula, onClose, onUpdated }: EditarAulaModalProps) {
  const [modalidade, setModalidade] = useState(aula.modalidade || "");
  const [dataHoraInicio, setDataHoraInicio] = useState(aula.dataHoraInicio || "");
  const [dataHoraFim, setDataHoraFim] = useState(aula.dataHoraFim || "");
  const [vagasTotais, setVagasTotais] = useState(aula.vagasTotais || 0);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!modalidade || !dataHoraInicio || !dataHoraFim || vagasTotais <= 0) {
      alert("Preencha todos os campos corretamente");
      return;
    }

    try {
      setIsLoading(true);

      await api.put(`/aulas/${aula.id}`, {
        modalidade: modalidade.toUpperCase(),
        dataHoraInicio: new Date(dataHoraInicio).toISOString(),
        dataHoraFim: new Date(dataHoraFim).toISOString(),
        vagasTotais,
      });

      onUpdated();
      onClose();
    } catch (error) {
      alert("Erro ao atualizar aula");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Editar Aula</h2>

        <input
          type="text"
          placeholder="Modalidade"
          className="w-full border px-3 py-2 mb-3 rounded"
          value={modalidade}
          onChange={(e) => setModalidade(e.target.value)}
        />

        <input
          type="datetime-local"
          className="w-full border px-3 py-2 mb-3 rounded"
          value={formatarDataInput(dataHoraInicio)}
          onChange={(e) => setDataHoraInicio(e.target.value)}
        />

        <input
          type="datetime-local"
          className="w-full border px-3 py-2 mb-3 rounded"
          value={formatarDataInput(dataHoraFim)}
          onChange={(e) => setDataHoraFim(e.target.value)}
        />

        <input
          type="number"
          placeholder="Número de Vagas"
          className="w-full border px-3 py-2 mb-3 rounded"
          value={vagasTotais}
          onChange={(e) => setVagasTotais(Number(e.target.value))}
        />

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>

          <button
            className="px-4 py-2 rounded bg-primary text-white hover:opacity-90"
            onClick={handleUpdate}
            disabled={isLoading}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
