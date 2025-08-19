"use client";
import { useState, useEffect } from "react";
import { Check, X, Clock, User, Building, RefreshCw, Send } from "lucide-react";
import api from "@/app/lib/api";

interface Solicitacao {
  id: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
  mensagem?: string;
  resposta?: string;
  criadoEm: string;
  respondidoEm?: string;
  professor: {
    id: string;
    nome: string;
    email: string;
  };
  cliente: {
    id: string;
    nome: string;
  };
}

interface Professor {
  id: string;
  nome: string;
  email: string;
}

export default function MinhasSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReenvio, setLoadingReenvio] = useState<string | null>(null);
  const [novaSolicitacao, setNovaSolicitacao] = useState({
    professorId: '',
    mensagem: ''
  });
  const [showNovaSolicitacao, setShowNovaSolicitacao] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      console.log("🔍 Carregando dados das solicitações...");
      
      // Carregar solicitações do aluno
      const [solicitacoesResponse, professoresResponse] = await Promise.all([
        api.get("/solicitacoes-vinculo/aluno"),
        api.get("/professores/academia")
      ]);
      
      console.log("📋 Resposta das solicitações:", solicitacoesResponse.data);
      console.log("👨‍🏫 Resposta dos professores:", professoresResponse.data);
      
      setSolicitacoes(solicitacoesResponse.data || []);
      setProfessores(professoresResponse.data || []);
    } catch (error: unknown) {
      console.error("❌ Erro ao carregar dados:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar dados";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReenviarSolicitacao = async (professorId: string, mensagem?: string) => {
    try {
      setLoadingReenvio(professorId);
      setError(null);
      setSuccess(null);
      
      await api.post("/solicitacoes-vinculo", {
        professorId,
        mensagem: mensagem || ''
      });

      setSuccess('Solicitação reenviada com sucesso!');
      setShowNovaSolicitacao(false);
      setNovaSolicitacao({ professorId: '', mensagem: '' });
      await carregarDados();
    } catch (error: unknown) {
      console.error("❌ Erro ao reenviar solicitação:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao reenviar solicitação";
      setError(errorMessage);
    } finally {
      setLoadingReenvio(null);
    }
  };

  const handleNovaSolicitacao = async () => {
    if (!novaSolicitacao.professorId) {
      setError('Selecione um professor');
      return;
    }

    try {
      setLoadingReenvio('nova');
      setError(null);
      setSuccess(null);
      
      await api.post("/solicitacoes-vinculo", {
        professorId: novaSolicitacao.professorId,
        mensagem: novaSolicitacao.mensagem
      });

      setSuccess('Solicitação enviada com sucesso!');
      setShowNovaSolicitacao(false);
      setNovaSolicitacao({ professorId: '', mensagem: '' });
      await carregarDados();
    } catch (error: unknown) {
      console.error("❌ Erro ao enviar solicitação:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao enviar solicitação";
      setError(errorMessage);
    } finally {
      setLoadingReenvio(null);
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'Aguardando resposta';
      case 'APROVADA':
        return 'Aprovado';
      case 'REJEITADA':
        return 'Recusado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando suas solicitações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Minhas Solicitações de Vínculo</h2>
        <button
          onClick={() => setShowNovaSolicitacao(!showNovaSolicitacao)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Send size={16} />
          Nova Solicitação
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">❌ {error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">✅ {success}</p>
        </div>
      )}

      {/* Formulário para nova solicitação */}
      {showNovaSolicitacao && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Nova Solicitação de Vínculo</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professor/Academia *
              </label>
              <select
                value={novaSolicitacao.professorId}
                onChange={(e) => setNovaSolicitacao(prev => ({ ...prev, professorId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione um professor</option>
                {professores.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.nome} ({professor.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Escolha o professor com quem deseja se vincular
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem (opcional)
              </label>
              <textarea
                value={novaSolicitacao.mensagem}
                onChange={(e) => setNovaSolicitacao(prev => ({ ...prev, mensagem: e.target.value }))}
                placeholder="Digite uma mensagem para o professor..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Explique por que deseja se vincular a este professor
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleNovaSolicitacao}
              disabled={loadingReenvio === 'nova' || !novaSolicitacao.professorId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Send size={16} />
              {loadingReenvio === 'nova' ? "Enviando..." : "Enviar Solicitação"}
            </button>
            <button
              onClick={() => {
                setShowNovaSolicitacao(false);
                setNovaSolicitacao({ professorId: '', mensagem: '' });
                setError(null);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de solicitações */}
      {solicitacoes.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md border border-gray-200">
          <User className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-500 mt-2">Você ainda não tem solicitações de vínculo.</p>
          <p className="text-sm text-gray-400">Use o botão acima para solicitar vínculo com um professor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitacoes.map((solicitacao) => (
            <div
              key={solicitacao.id}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(solicitacao.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(solicitacao.status)}`}>
                      {getStatusText(solicitacao.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <User className="text-blue-600" size={16} />
                      <div>
                        <p className="font-medium text-gray-800">{solicitacao.professor.nome}</p>
                        <p className="text-sm text-gray-600">{solicitacao.professor.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Building className="text-green-600" size={16} />
                      <div>
                        <p className="font-medium text-gray-800">{solicitacao.cliente.nome}</p>
                        <p className="text-sm text-gray-600">Academia</p>
                      </div>
                    </div>
                  </div>

                  {solicitacao.mensagem && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Sua mensagem:</strong> {solicitacao.mensagem}
                      </p>
                    </div>
                  )}

                  {solicitacao.resposta && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Resposta do professor:</strong> {solicitacao.resposta}
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

              {/* Botão de reenvio para solicitações rejeitadas */}
              {solicitacao.status === 'REJEITADA' && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Esta solicitação foi recusada. Você pode reenviar uma nova solicitação.
                    </p>
                    <button
                      onClick={() => handleReenviarSolicitacao(solicitacao.professor.id, solicitacao.mensagem)}
                      disabled={loadingReenvio === solicitacao.professor.id}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <RefreshCw size={16} />
                      {loadingReenvio === solicitacao.professor.id ? "Reenviando..." : "Reenviar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
