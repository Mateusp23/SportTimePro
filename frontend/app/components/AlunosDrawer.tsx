"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/app/lib/api";

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
  status: string;
  criadoEm: string;
};

type ApiResponse = {
  aula: {
    id: string;
    modalidade: string;
    dataHoraInicio: string;
    dataHoraFim: string;
    vagasTotais: number;
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

        setItems(Array.isArray(data?.data) ? data.data : []);
        setTotal(typeof data?.total === 'number' ? data.total : 0);
        setTotalPages(typeof data?.totalPages === 'number' ? data.totalPages : 1);
      } catch (e) {
        setItems([]); // Garante que a mensagem de "nenhum aluno" apareça em caso de erro
        setTotal(0);
        setTotalPages(1);
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Alunos inscritos</h3>
          <button
            className="rounded p-2 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

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
        {items &&
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="text-gray-500">Carregando…</div>
            ) : items.length === 0 ? (
              <div className="text-gray-500">Nenhum aluno para essa aula.</div>
            ) : (
              <ul className="divide-y">
                {items.map((a) => (
                  <li key={a.agendamentoId} className="py-3">
                    <div className="font-medium">{a.nome}</div>
                    <div className="text-sm text-gray-600">{a.email}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        }
        
        {/* Paginação */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Total: {total} — Página {page} de {totalPages}
          </span>
          <div className="space-x-2">
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev || isLoading}
            >
              Anterior
            </button>
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => setPage((p) => p + 1)}
              disabled={!canNext || isLoading}
            >
              Próxima
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
