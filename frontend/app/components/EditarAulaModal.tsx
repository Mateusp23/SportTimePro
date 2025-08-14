"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/app/lib/api";
import { formatarDataInput } from "@/app/utils/date/dateFormatter";
import InputField from "./InputField";
import Alert from "./Alert";
import { Aula } from "../types/types";
import { useUnidadesLocais } from "@/app/hooks/useUnidadesLocais";

interface EditarAulaModalProps {
  show: boolean;
  aula: Aula | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditarAulaModal({
  show,
  aula,
  onClose,
  onUpdated,
}: EditarAulaModalProps) {
  console.log('🔍 EditarAulaModal - Props recebidas:', { show, aula });
  
  if (!show || !aula) {
    console.log('🔍 EditarAulaModal - Modal não deve ser renderizado');
    return null;
  }
  
  console.log('🔍 EditarAulaModal - Renderizando modal');

  // estados do formulário
  const [modalidade, setModalidade] = useState(aula.modalidade || "");
  const [dataHoraInicio, setDataHoraInicio] = useState(
    formatarDataInput(aula.dataHoraInicio)
  );
  const [dataHoraFim, setDataHoraFim] = useState(
    formatarDataInput(aula.dataHoraFim)
  );
  const [vagasTotais, setVagasTotais] = useState<number>(aula.vagasTotais || 0);

  const [unidadeId, setUnidadeId] = useState<string>(aula.unidadeId || "");
  const [localId, setLocalId] = useState<string>(aula.localId || "");
  const [isLoading, setIsLoading] = useState(false);

  // dados compartilhados (já limitados ao cliente pelo back)
  const { unidades, locais, isLoading: isLoadingData } = useUnidadesLocais();

  // locais filtrados pela unidade atual
  const locaisDaUnidade = useMemo(
    () => (unidadeId ? locais.filter((l) => l.unidadeId === unidadeId) : []),
    [locais, unidadeId]
  );

  // quando o modal abre/troca de aula, rehidrata os campos
  useEffect(() => {
    if (!show || !aula) return;
    setModalidade(aula.modalidade || "");
    setDataHoraInicio(formatarDataInput(aula.dataHoraInicio));
    setDataHoraFim(formatarDataInput(aula.dataHoraFim));
    setVagasTotais(aula.vagasTotais || 0);
    setUnidadeId(aula.unidadeId || "");
    setLocalId(aula.localId || "");
  }, [show, aula]);

  // mantém o local coerente com a unidade selecionada
  useEffect(() => {
    if (!unidadeId) {
      setLocalId("");
      return;
    }
    // se o local atual não pertence à unidade, escolhe o primeiro disponível
    if (!locaisDaUnidade.some((l) => l.id === localId)) {
      setLocalId(locaisDaUnidade[0]?.id ?? "");
    }
  }, [unidadeId, locaisDaUnidade, localId]);

  const handleUpdate = async () => {
    if (
      !modalidade ||
      !dataHoraInicio ||
      !dataHoraFim ||
      vagasTotais <= 0 ||
      !unidadeId ||
      !localId
    ) {
      Alert({
        type: "error",
        title: "Erro ao atualizar aula",
        message: "Preencha todos os campos corretamente.",
        onClose: () => { },
        buttonText: "OK",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const url = `/aulas/${aula!.id}`;
      console.log('🔍 EditarAulaModal - URL da requisição:', url);
      console.log('🔍 EditarAulaModal - Dados enviados:', {
        modalidade: modalidade.toUpperCase(),
        unidadeId,
        localId,
        dataHoraInicio: new Date(dataHoraInicio).toISOString(),
        dataHoraFim: new Date(dataHoraFim).toISOString(),
        vagasTotais,
      });

      await api.put(url, {
        modalidade: modalidade.toUpperCase(),
        unidadeId,
        localId,
        dataHoraInicio: new Date(dataHoraInicio).toISOString(),
        dataHoraFim: new Date(dataHoraFim).toISOString(),
        vagasTotais,
      });

      console.log('✅ Aula atualizada com sucesso!');
      console.log('🔍 Chamando onClose()...');
      
      // Fechar modal e atualizar lista
      onClose();
      
      console.log('🔍 Chamando onUpdated()...');
      onUpdated();
      
      console.log('🔍 Callbacks executados com sucesso!');
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Erro ao atualizar aula";
      console.error('❌ Erro ao atualizar aula:', error);
      
      // Mostrar alert apenas em caso de erro
      Alert({
        type: "error",
        title: "Erro ao atualizar aula",
        message: msg,
        onClose: () => { },
        buttonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold mb-4">Editar Aula</h2>

        {/* Unidade */}
        <div>
          <label className="block text-sm mb-1">Unidade *</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
            value={unidadeId}
            onChange={(e) => {
              setUnidadeId(e.target.value);
              setLocalId(""); // deixa o effect escolher um local válido
            }}
            disabled={isLoadingData}
          >
            <option value="">Selecione a unidade</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome} — {u.cidade}
              </option>
            ))}
          </select>
        </div>

        {/* Local depende da unidade */}
        <div>
          <label className="block text-sm mb-1">Local *</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
            value={localId}
            onChange={(e) => setLocalId(e.target.value)}
            disabled={!unidadeId || isLoadingData}
          >
            <option value="">Selecione o local</option>
            {locaisDaUnidade.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Modalidade */}
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

        {/* Data e Hora de Início */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data e Hora de Início *
          </label>
          <InputField
            type="datetime-local"
            placeholder="Data e Hora de Início"
            value={dataHoraInicio}
            onChange={(e) => setDataHoraInicio(e.target.value)}
          />
        </div>

        {/* Data e Hora de Fim */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data e Hora de Fim *
          </label>
          <InputField
            type="datetime-local"
            placeholder="Data e Hora de Fim"
            value={dataHoraFim}
            onChange={(e) => setDataHoraFim(e.target.value)}
          />
        </div>

        {/* Vagas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Vagas *
          </label>
          <InputField
            type="number"
            placeholder="Número de Vagas"
            value={String(vagasTotais)}
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
            className="px-4 py-2 rounded cursor-pointer bg-primary text-white hover:opacity-90 disabled:opacity-60"
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
