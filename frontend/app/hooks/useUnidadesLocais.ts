import { useState, useEffect } from "react";
import api from "@/app/lib/api";

interface Unidade {
  id: string;
  nome: string;
  cidade: string;
}

interface Local {
  id: string;
  nome: string;
  unidadeId: string;
}

interface UseUnidadesLocaisReturn {
  unidades: Unidade[];
  locais: Local[];
  isLoading: boolean;
  error: string | null;
  createUnidade: (data: { nome: string; cidade: string }) => Promise<Unidade>;
  createLocal: (data: { nome: string; unidadeId: string }) => Promise<Local>;
  refreshData: () => Promise<void>;
}

export const useUnidadesLocais = (): UseUnidadesLocaisReturn => {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [unidadesRes, locaisRes] = await Promise.all([
        api.get("/unidades"),
        api.get("/locais")
      ]);

      setUnidades(unidadesRes.data);
      setLocais(locaisRes.data);
    } catch (err) {
      setError("Erro ao carregar dados");
      console.error("Erro ao buscar dados:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createUnidade = async (data: { nome: string; cidade: string }): Promise<Unidade> => {
    try {
      const response = await api.post("/unidades", data);
      const novaUnidade = response.data;
      
      setUnidades(prev => [...prev, novaUnidade]);
      return novaUnidade;
    } catch (err) {
      throw new Error("Erro ao criar unidade");
    }
  };

  const createLocal = async (data: { nome: string; unidadeId: string }): Promise<Local> => {
    try {
      const response = await api.post("/locais", data);
      const novoLocal = response.data;
      
      setLocais(prev => [...prev, novoLocal]);
      return novoLocal;
    } catch (err) {
      throw new Error("Erro ao criar local");
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  return {
    unidades,
    locais,
    isLoading,
    error,
    createUnidade,
    createLocal,
    refreshData
  };
}; 