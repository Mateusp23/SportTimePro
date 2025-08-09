// app/hooks/useUnidadesLocais.ts
"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import api from "@/app/lib/api";
import { Unidade, Local } from "@/app/types/types";

interface UseUnidadesLocaisReturn {
  unidades: Unidade[];
  locais: Local[];
  isLoading: boolean;
  error: string | null;
  isMutating: boolean;
  createUnidade: (data: { nome: string; cidade: string }) => Promise<Unidade>;
  createLocal: (data: { nome: string; unidadeId: string }) => Promise<Local>;
  refreshData: () => Promise<void>;
  getLocaisByUnidade: (unidadeId: string) => Local[];
}

export const useUnidadesLocais = (): UseUnidadesLocaisReturn => {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [unidadesRes, locaisRes] = await Promise.all([
        api.get<Unidade[]>("/unidades"),
        api.get<Local[]>("/locais"),
      ]);
      if (!mounted.current) return;
      setUnidades(unidadesRes.data);
      setLocais(locaisRes.data);
    } catch (err) {
      if (!mounted.current) return;
      setError("Erro ao carregar dados");
      console.error("Erro ao buscar unidades/locais:", err);
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    return () => { mounted.current = false; };
  }, [fetchData]);

  const createUnidade = async (data: { nome: string; cidade: string }): Promise<Unidade> => {
    setIsMutating(true);
    try {
      const { data: nova } = await api.post<Unidade>("/unidades", data);
      setUnidades(prev => [...prev, nova]);
      return nova;
    } catch (err) {
      console.error("Erro ao criar unidade:", err);
      throw new Error("Erro ao criar unidade");
    } finally {
      setIsMutating(false);
    }
  };

  const createLocal = async (data: { nome: string; unidadeId: string }): Promise<Local> => {
    setIsMutating(true);
    try {
      const { data: novo } = await api.post<Local>("/locais", data);
      setLocais(prev => [...prev, novo]);
      return novo;
    } catch (err) {
      console.error("Erro ao criar local:", err);
      throw new Error("Erro ao criar local");
    } finally {
      setIsMutating(false);
    }
  };

  const getLocaisByUnidade = useCallback(
    (unidadeId: string) => locais.filter(l => l.unidadeId === unidadeId),
    [locais]
  );

  const refreshData = async () => fetchData();

  return {
    unidades,
    locais,
    isLoading,
    error,
    isMutating,
    createUnidade,
    createLocal,
    refreshData,
    getLocaisByUnidade,
  };
};
