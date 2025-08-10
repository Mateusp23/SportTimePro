"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/app/lib/api";

export type AulaResumo = {
  id: string;
  modalidade: string;
  unidadeId: string;
  localId: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  vagasTotais: number;
  inscritosCount: number;
  unidade?: { nome: string };
  local?: { nome: string };
  professor?: { id: string; nome: string };
};

export type FiltrosAgenda = {
  from: string; // ISO
  to: string;   // ISO
  unidadeId?: string;
  localId?: string;
  modalidade?: string;
  onlyMine?: boolean;
};

export function useAgendamentos(initial?: Partial<FiltrosAgenda>) {
  const defaultFrom = new Date();
  defaultFrom.setHours(0, 0, 0, 0);
  const defaultTo = new Date(defaultFrom.getTime() + 6 * 24 * 60 * 60 * 1000); // +6d

  const [filtros, setFiltros] = useState<FiltrosAgenda>({
    from: initial?.from ?? defaultFrom.toISOString(),
    to: initial?.to ?? new Date(defaultTo.setHours(23, 59, 59, 999)).toISOString(),
    unidadeId: initial?.unidadeId,
    localId: initial?.localId,
    modalidade: initial?.modalidade,
    onlyMine: initial?.onlyMine ?? false,
  });

  const [aulas, setAulas] = useState<AulaResumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await api.get<AulaResumo[]>("/aulas", { params: filtros });
        // ordena por data
        data.sort((a, b) => +new Date(a.dataHoraInicio) - +new Date(b.dataHoraInicio));
        setAulas(data);
      } catch {
        setError("Erro ao carregar agendamentos");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [filtros]);

  const groupedByDay = useMemo(() => {
    const map = new Map<string, AulaResumo[]>();
    for (const a of aulas) {
      const key = new Date(a.dataHoraInicio).toISOString().slice(0, 10); // YYYY-MM-DD
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return map;
  }, [aulas]);

  return { aulas, groupedByDay, filtros, setFiltros, isLoading, error };
}
