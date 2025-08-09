"use client";

import { useState, useEffect, useMemo } from "react";
import api from "@/app/lib/api";
import CriarUnidadeModal from "./CriarUnidadeModal";
import CriarLocalModal from "./CriarLocalModal";
import { useUnidadesLocais } from "@/app/hooks/useUnidadesLocais";
import { useUser } from "@/app/hooks/useUser";
import InputField from "./InputField";

type NovaAulaModalProps = {
  onClose: () => void;
  onCreated: () => void;
};

export default function NovaAulaModal({ onClose, onCreated }: NovaAulaModalProps) {
  const [modalidade, setModalidade] = useState("");
  const [dataHoraInicio, setDataHoraInicio] = useState("");
  const [dataHoraFim, setDataHoraFim] = useState("");
  const [vagasTotais, setVagasTotais] = useState<number>(0);
  const [unidadeId, setUnidadeId] = useState("");
  const [localId, setLocalId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showUnidadeModal, setShowUnidadeModal] = useState(false);
  const [showLocalModal, setShowLocalModal] = useState(false);

  const { unidades, locais, isLoading: isLoadingData, createUnidade, createLocal } = useUnidadesLocais();
  const { user, isLoading: isLoadingUser } = useUser();

  // Locais filtrados pela unidade atual
  const locaisDaUnidade = useMemo(
    () => (unidadeId ? locais.filter((l) => l.unidadeId === unidadeId) : []),
    [locais, unidadeId]
  );

  // Seleciona a 1ª unidade quando carregar (se ainda não tiver uma selecionada)
  useEffect(() => {
    if (!unidadeId && unidades.length > 0) {
      setUnidadeId(unidades[0].id);
    }
  }, [unidades, unidadeId]);

  // Mantém o local coerente com a unidade (ou escolhe o primeiro disponível)
  useEffect(() => {
    if (!unidadeId) {
      setLocalId("");
      return;
    }
    if (!locaisDaUnidade.some((l) => l.id === localId)) {
      setLocalId(locaisDaUnidade[0]?.id ?? "");
    }
  }, [unidadeId, locaisDaUnidade, localId]);

  const handleCreate = async () => {
    // validações simples
    if (!modalidade || !dataHoraInicio || !dataHoraFim || vagasTotais <= 0) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    if (!unidadeId) {
      alert("Por favor, selecione uma unidade ou crie uma nova");
      return;
    }
    if (!localId) {
      alert("Por favor, selecione um local ou crie um novo");
      return;
    }
    if (!user) {
      alert("Erro: Dados do usuário não carregados");
      return;
    }
    if (!user.roles.includes("PROFESSOR") && !user.roles.includes("ADMIN")) {
      alert("Apenas professores e administradores podem criar aulas");
      return;
    }

    const inicio = new Date(dataHoraInicio);
    const fim = new Date(dataHoraFim);
    if (inicio >= fim) {
      alert("A data/hora de fim deve ser posterior à data/hora de início");
      return;
    }

    setIsLoading(true);
    try {
      const dataHoraInicioUTC = new Date(dataHoraInicio).toISOString();
      const dataHoraFimUTC = new Date(dataHoraFim).toISOString();

      await api.post("/aulas", {
        modalidade: modalidade.toUpperCase(),
        professorId: user.id,
        unidadeId,
        localId,
        dataHoraInicio: dataHoraInicioUTC,
        dataHoraFim: dataHoraFimUTC,
        vagasTotais,
      });

      onCreated();
      onClose();
    } catch (error: any) {
      console.error("Erro ao criar aula:", error);
      const message = error?.response?.data?.message || "Erro ao criar aula";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ao criar unidade dentro do modal
  const handleUnidadeCreated = (novaUnidade: { id: string }) => {
    setUnidadeId(novaUnidade.id);
    setLocalId(""); // deixa o efeito escolher um local válido (se houver)
    setShowUnidadeModal(false);
  };

  // ao criar local dentro do modal
  const handleLocalCreated = (novoLocal: { id: string; unidadeId: string }) => {
    // se criou local numa outra unidade, sincroniza unidade também
    if (novoLocal.unidadeId !== unidadeId) {
      setUnidadeId(novoLocal.unidadeId);
    }
    setLocalId(novoLocal.id);
    setShowLocalModal(false);
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
          {user && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Professor:</strong> {user.nome} ({user.roles.join(", ")})
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {isLoadingData || isLoadingUser ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span className="ml-3 text-gray-600">Carregando dados...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Unidade */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Unidade *</label>
                  <button
                    type="button"
                    onClick={() => setShowUnidadeModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nova Unidade
                  </button>
                </div>

                {unidades.length === 0 ? (
                  <div className="w-full px-4 py-3 border border-yellow-300 bg-yellow-50 rounded-xl text-yellow-800 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Nenhuma unidade cadastrada. Clique em "Nova Unidade" para criar.
                    </div>
                  </div>
                ) : (
                  <select
                    value={unidadeId}
                    onChange={(e) => {
                      const nova = e.target.value;
                      setUnidadeId(nova);
                      setLocalId(""); // limpa até o efeito selecionar um válido
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
                  >
                    <option value="">Selecione uma unidade</option>
                    {unidades.map((unidade) => (
                      <option key={unidade.id} value={unidade.id}>
                        {unidade.nome} - {unidade.cidade}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Local */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Local *</label>
                  <button
                    type="button"
                    onClick={() => setShowLocalModal(true)}
                    disabled={!unidadeId}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Novo Local
                  </button>
                </div>

                {!unidadeId ? (
                  <div className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-xl text-gray-500 text-sm">
                    Selecione uma unidade primeiro para ver os locais disponíveis
                  </div>
                ) : locaisDaUnidade.length === 0 ? (
                  <div className="w-full px-4 py-3 border border-yellow-300 bg-yellow-50 rounded-xl text-yellow-800 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Nenhum local cadastrado para esta unidade. Clique em "Novo Local" para criar.
                    </div>
                  </div>
                ) : (
                  <select
                    value={localId}
                    onChange={(e) => setLocalId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
                  >
                    <option value="">Selecione um local</option>
                    {locaisDaUnidade.map((local) => (
                      <option key={local.id} value={local.id}>
                        {local.nome}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Modalidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modalidade *</label>
                <InputField
                  type="text"
                  placeholder="Ex: Futebol, Natação, Tênis..."
                  value={modalidade}
                  onChange={(e) => setModalidade(e.target.value)}
                />
              </div>

              {/* Data e Hora de Início */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data e Hora de Início *</label>
                <InputField
                  type="datetime-local"
                  placeholder="Data e Hora de Início"
                  value={dataHoraInicio}
                  onChange={(e) => setDataHoraInicio(e.target.value)}
                />
              </div>

              {/* Data e Hora de Fim */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data e Hora de Fim *</label>
                <InputField
                  type="datetime-local"
                  placeholder="Data e Hora de Fim"
                  value={dataHoraFim}
                  onChange={(e) => setDataHoraFim(e.target.value)}
                />
              </div>

              {/* Vagas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número de Vagas *</label>
                <InputField
                  type="number"
                  placeholder="Ex: 20"
                  value={String(vagasTotais)}
                  onChange={(e) => setVagasTotais(Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 cursor-pointer text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={isLoading}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors cursor-pointer duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

      {/* Modais auxiliares */}
      {showUnidadeModal && (
        <CriarUnidadeModal
          onClose={() => setShowUnidadeModal(false)}
          onCreated={handleUnidadeCreated}
          createUnidade={createUnidade}
        />
      )}

      {showLocalModal && (
        <CriarLocalModal
          onClose={() => setShowLocalModal(false)}
          onCreated={handleLocalCreated}
          unidades={unidades}
          createLocal={createLocal}
        />
      )}
    </div>
  );
}
