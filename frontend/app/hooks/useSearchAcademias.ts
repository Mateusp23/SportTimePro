"use client";
import { useState, useCallback } from "react";
import api from "@/app/lib/api";

export interface Professor {
  id: string;
  nome: string;
  email: string;
  roles: string[];
}

export interface Academia {
  academiaId: string;
  academiaNome: string;
  professores: Professor[];
}

interface SearchAcademiasResponse {
  academias: Academia[];
  total: number;
}

export const useSearchAcademias = () => {
  const [academias, setAcademias] = useState<Academia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAcademias = useCallback(async (query: string = "") => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<SearchAcademiasResponse>("/search-academias", {
        params: { q: query }
      });
      
      setAcademias(response.data.academias);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erro ao buscar academias";
      setError(errorMessage);
      return { academias: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  return {
    academias,
    loading,
    error,
    searchAcademias,
    clearError
  };
};
