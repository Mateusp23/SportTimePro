"use client";
import { useState, useEffect } from "react";
import { useSolicitacaoVinculo } from "@/app/hooks/useSolicitacaoVinculo";
import { Check, X, Clock, User, Building } from "lucide-react";

interface Solicitacao {
  id: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
  mensagem?: string;
  resposta?: string;
  criadoEm: string;
  respondidoEm?: string;
  aluno: {
    id: string;
    nome: string;
    email: string;
  };
  professor: {
    id: string;
    nome: string;
    email: string;
  };
}

export default function SolicitacoesVinculo() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [resposta, setResposta] = useState("");
  const [respondendoId, setRespondendoId] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'PENDENTE' | 'APROVADA' | 'REJEITADA'>('TODOS');

  const { listarSolicitacoes, responderSolicitacao, error } = useSolicitacaoVinculo();

  useEffect(() => {
    carregarSolicitacoes();
  }, []);

  const carregarSolicitacoes = async () => {
    try {
      setLoading(true);
      const data = await listarSolicitacoes();
      setSolicitacoes(data);
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = async (id: string, status: 'APROVADA' | 'REJEITADA') => {
    try {
      setRespondendoId(id);
      await responderSolicitacao(id, {
        status,
        resposta: resposta.trim() || undefined
      });

      alert(`Solicitação ${status.toLowerCase()} com sucesso!`);
      setResposta("");
      setRespondendoId(null);
      await carregarSolicitacoes();
    } catch (error) {
      console.error("Erro ao responder solicitação:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return <Clock className="text-yellow-600" size={16} />;
      case 'APROVADA':
        return <Check className="text-green-600" size={16} />;
      case 'REJEITADA':
        return <X className="text-red-600" size={16} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APROVADA':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJEITADA':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando solicitações...</p>
      </div>
    );
  }

  if (solicitacoes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Nenhuma solicitação de vínculo encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Solicitações de Vínculo</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {solicitacoes.filter(s => s.status === 'PENDENTE').length} pendentes
          </div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="TODOS">Todos os status</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="APROVADA">Aprovadas</option>
            <option value="REJEITADA">Rejeitadas</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {solicitacoes
          .filter(solicitacao => filtroStatus === 'TODOS' || solicitacao.status === filtroStatus)
          .length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhuma solicitação encontrada para o filtro selecionado.</p>
          </div>
        ) : (
          solicitacoes
            .filter(solicitacao => filtroStatus === 'TODOS' || solicitacao.status === filtroStatus)
            .map((solicitacao) => (
          <div
            key={solicitacao.id}
            className="border border-gray-200 rounded-lg p-4 bg-white"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(solicitacao.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(solicitacao.status)}`}>
                    {solicitacao.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="text-blue-600" size={16} />
                    <div>
                      <p className="font-medium text-gray-800">{solicitacao.aluno.nome}</p>
                      <p className="text-sm text-gray-600">{solicitacao.aluno.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Building className="text-green-600" size={16} />
                    <div>
                      <p className="font-medium text-gray-800">{solicitacao.professor.nome}</p>
                      <p className="text-sm text-gray-600">{solicitacao.professor.email}</p>
                    </div>
                  </div>
                </div>

                {solicitacao.mensagem && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Mensagem do aluno:</strong> {solicitacao.mensagem}
                    </p>
                  </div>
                )}

                {solicitacao.resposta && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Sua resposta:</strong> {solicitacao.resposta}
                    </p>
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500">
                  Solicitado em: {new Date(solicitacao.criadoEm).toLocaleString('pt-BR')}
                  {solicitacao.respondidoEm && (
                    <span className="ml-4">
                      Respondido em: {new Date(solicitacao.respondidoEm).toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {solicitacao.status === 'PENDENTE' && (
              <div className="border-t pt-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resposta (opcional)
                  </label>
                  <textarea
                    value={resposta}
                    onChange={(e) => setResposta(e.target.value)}
                    placeholder="Digite uma resposta para o aluno..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleResponder(solicitacao.id, 'APROVADA')}
                    disabled={respondendoId === solicitacao.id}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    {respondendoId === solicitacao.id ? "Aprovando..." : "Aprovar"}
                  </button>
                  <button
                    onClick={() => handleResponder(solicitacao.id, 'REJEITADA')}
                    disabled={respondendoId === solicitacao.id}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    {respondendoId === solicitacao.id ? "Rejeitando..." : "Rejeitar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
        )}
      </div>
    </div>
  );
}
