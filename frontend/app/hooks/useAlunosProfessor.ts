"use client";
import { useCallback, useEffect, useState } from "react";
import api from "@/app/lib/api";

export type Aluno = { id: string; nome: string; email: string };

type PageRes<T> = {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
};

export function useAlunosProfessor(professorId: string | undefined) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [data, setData] = useState<PageRes<Aluno>>({
    page: 1, pageSize, total: 0, items: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    if (!professorId) return;
    setLoading(true);
    try {
      const { data } = await api.get<PageRes<Aluno>>(
        `/professores/${professorId}/alunos`,
        { params: { q, page, pageSize } }
      );
      setData(data);
    } finally {
      setLoading(false);
    }
  }, [professorId, q, page, pageSize]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const unlink = useCallback(async (alunoId: string) => {
    if (!professorId) return;
    await api.delete(`/professores/${professorId}/alunos/${alunoId}`);
    await fetchList();
  }, [professorId, fetchList]);

  return { q, setQ, page, setPage, pageSize, data, loading, refresh: fetchList, unlink };
}
