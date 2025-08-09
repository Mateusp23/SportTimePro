"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/api";
import { formatarDataInput } from "@/app/utils/date/dateFormatter";
import InputField from "./InputField";
import Alert from "./Alert";
import { Aula, Local, Unidade } from "../types/Aula";

interface EditarAulaModalProps {
  show: boolean;
  aula: Aula | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditarAulaModal({ show, aula, onClose, onUpdated }: EditarAulaModalProps) {
  if (!show || !aula) return null;

  const [modalidade, setModalidade] = useState(aula.modalidade || "");
  const [dataHoraInicio, setDataHoraInicio] = useState(aula.dataHoraInicio || "");
  const [dataHoraFim, setDataHoraFim] = useState(aula.dataHoraFim || "");
  const [vagasTotais, setVagasTotais] = useState(aula.vagasTotais || 0);
  const [isLoading, setIsLoading] = useState(false);

  const [unidadeId, setUnidadeId] = useState("");
  const [localId, setLocalId] = useState("");

  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);

  // carrega unidades ao abrir
  useEffect(() => {
    if (!show) return;
    (async () => {
      const res = await api.get<Unidade[]>("/unidades");
      setUnidades(res.data);
    })();
  }, [show]);

  // carrega locais quando a unidade mudar
  useEffect(() => {
    if (!show || !unidadeId) return;
    (async () => {
      const res = await api.get<Local[]>("/locais", { params: { unidadeId } });
      setLocais(res.data);
    })();
  }, [show, unidadeId]);

  // preenche os campos iniciais quando a aula chega/abre
  useEffect(() => {
    if (!show || !aula) return;
    setModalidade(aula.modalidade);
    setDataHoraInicio(formatarDataInput(aula.dataHoraInicio));
    setDataHoraFim(formatarDataInput(aula.dataHoraFim));
    setVagasTotais(aula.vagasTotais);
    setUnidadeId(aula.unidadeId);
    setLocalId(aula.localId);
  }, [show, aula]);

  const handleUpdate = async () => {
    if (!aula) return;
    if (!modalidade || !dataHoraInicio || !dataHoraFim || vagasTotais <= 0 || !unidadeId || !localId) {
      Alert({
        type: "error",
        title: "Erro ao atualizar aula",
        message: "Preencha todos os campos corretamente",
        onClose: () => {},
        buttonText: "OK"
      });
      return;
    }

    try {
      setIsLoading(true);

      await api.put(`/aulas/${aula.id}`, {
        modalidade: modalidade.toUpperCase(),
        unidadeId,
        localId,
        dataHoraInicio: new Date(dataHoraInicio).toISOString(),
        dataHoraFim: new Date(dataHoraFim).toISOString(),
        vagasTotais,
      });

      onUpdated();
      onClose();
    } catch (error) {
      Alert({
        type: "error",
        title: "Erro ao atualizar aula",
        message: "Erro ao atualizar aula",
        onClose: () => {},
        buttonText: "OK"
      });
      console.error(error);
    } finally {
      Alert({
        type: "success",
        title: "Sucesso",
        message: "Aula atualizada com sucesso",
        onClose: () => { },
        buttonText: "OK"
      });
      setIsLoading(false);
    }
  };

  if (!show || !aula) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold mb-4">Editar Aula</h2>

        {/* Unidade */}
        <div>
          <label className="block text-sm mb-1">Unidade</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
            value={unidadeId}
            onChange={(e) => {
              setUnidadeId(e.target.value);
              setLocalId(""); // resetar local ao trocar unidade
            }}
          >
            <option value="">Selecione a unidade</option>
            {unidades.map(u => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </select>
        </div>

        {/* Local depende da unidade */}
        <div>
          <label className="block text-sm mb-1">Local</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
            value={localId}
            onChange={(e) => setLocalId(e.target.value)}
            disabled={!unidadeId}
          >
            <option value="">Selecione o local</option>
            {locais.map(l => (
              <option key={l.id} value={l.id}>{l.nome}</option>
            ))}
          </select>
        </div>

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
            className="px-4 py-2 rounded cursor-pointer bg-primary text-white hover:opacity-90"
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
