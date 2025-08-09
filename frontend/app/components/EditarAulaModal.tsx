"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/api";
import { formatarDataInput } from "@/app/utils/date/dateFormatter";
import InputField from "./InputField";

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold mb-4">Editar Aula</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modalidade *
          </label>
          <InputField
            type="text"
            placeholder="Modalidade"
            value={modalidade}
            onChange={(e) => setModalidade(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data e Hora de Início *
          </label>
          <InputField
            type="datetime-local"
            placeholder="Data e Hora de Início"
            value={formatarDataInput(dataHoraInicio)}
            onChange={(e) => setDataHoraInicio(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data e Hora de Fim *
          </label>
          <InputField
            type="datetime-local"
            placeholder="Data e Hora de Fim"
            value={formatarDataInput(dataHoraFim)}
            onChange={(e) => setDataHoraFim(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Vagas *
          </label>
          <InputField
            type="number"
            placeholder="Número de Vagas"
            value={vagasTotais.toString()}
            onChange={(e) => setVagasTotais(Number(e.target.value))}
          />
        </div>

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
