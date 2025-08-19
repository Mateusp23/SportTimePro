"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/app/lib/api";
import { Check, Clock, X } from "lucide-react";

type Props = {
  aulaId: string | null;
  open: boolean;
  onClose: () => void;
};

type Inscrito = {
  id: string;
  nome: string;
  email: string;
  agendamentoId: string;
  status: 'ATIVO' | 'CANCELADO' | 'PENDENTE';
  criadoEm: string;
};

type ApiResponse = {
  aula: {
    id: string;
    modalidade: string;
    dataHoraInicio: string;
    dataHoraFim: string;
    vagasTotais: number;
    professor?: { nome: string };
    unidade?: { nome: string };
    local?: { nome: string };
  };
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  data: Inscrito[];
};

export default function AlunosDrawer({ aulaId, open, onClose }: Props) {
  const [items, setItems] = useState<Inscrito[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aula, setAula] = useState<ApiResponse["aula"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // debounce simples para busca
  const [q, setQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQ(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  useEffect(() => {
    if (!open || !aulaId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("🔍 Buscando alunos da aula:", aulaId);
        
        const { data } = await api.get<ApiResponse>(
          `/agendamentos/${aulaId}/alunos`,
          {
            params: {
              page,
              pageSize,
              search: q || undefined,   // não manda vazio
              status: "ATIVO",          // pode expor um seletor depois
            },
          }
        );

        console.log("📋 Resposta da API:", data);

        setItems(Array.isArray(data?.data) ? data.data : []);
        setTotal(typeof data?.total === 'number' ? data.total : 0);
        setTotalPages(typeof data?.totalPages === 'number' ? data.totalPages : 1);
        setAula(data?.aula || null);
      } catch (e) {
        console.error("❌ Erro ao buscar alunos:", e);
        setError("Erro ao carregar alunos");
        setItems([]); // Garante que a mensagem de "nenhum aluno" apareça em caso de erro
        setTotal(0);
        setTotalPages(1);
        setAula(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [open, aulaId, page, pageSize, q]);

  // resetar pagina quando abrir ou mudar aula
  useEffect(() => {
    if (open) setPage(1);
  }, [open, aulaId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return <Check className="text-green-600" size={16} />;
      case 'PENDENTE':
        return <Clock className="text-yellow-600" size={16} />;
      case 'CANCELADO':
        return <X className="text-red-600" size={16} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'Confirmado';
      case 'PENDENTE':
        return 'Pendente';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">Alunos inscritos</h3>
            {aula && (
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${items.length >= aula.vagasTotais
                      ? "bg-red-50 text-red-700"
                      : items.length >= aula.vagasTotais * 0.8
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-green-50 text-green-700"
                    }`}
                >
                  {items.length}/{aula.vagasTotais}
                </span>
                <span className="text-xs text-gray-500">
                  {aula.modalidade}
                </span>
              </div>
            )}
          </div>
          <button
            className="rounded p-2 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Informações da aula */}
        {aula && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <div><strong>Professor:</strong> {aula.professor?.nome || 'N/A'}</div>
              <div><strong>Local:</strong> {aula.unidade?.nome || 'N/A'} / {aula.local?.nome || 'N/A'}</div>
              <div><strong>Data:</strong> {formatDate(aula.dataHoraInicio)}</div>
            </div>
          </div>
        )}

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Search */}
        <div className="mb-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Buscar por nome ou e-mail"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-500">Carregando alunos...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">👥</div>
              <p className="text-gray-500">Nenhum aluno inscrito para essa aula.</p>
              {search && (
                <p className="text-sm text-gray-400 mt-1">
                  Tente ajustar os termos de busca.
                </p>
              )}
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((aluno) => (
                <li key={aluno.agendamentoId} className="py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{aluno.nome}</div>
                      <div className="text-sm text-gray-600">{aluno.email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Inscrito em: {formatDate(aluno.criadoEm)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {getStatusIcon(aluno.status)}
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(aluno.status)}`}>
                        {getStatusText(aluno.status)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Paginação */}
        {total > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm border-t pt-4">
            <span className="text-gray-600">
              Total: {total} — Página {page} de {totalPages}
            </span>
            <div className="space-x-2">
              <button
                className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!canPrev || isLoading}
              >
                Anterior
              </button>
              <button
                className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
                onClick={() => setPage((p) => p + 1)}
                disabled={!canNext || isLoading}
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
