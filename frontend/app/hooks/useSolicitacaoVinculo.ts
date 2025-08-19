"use client";
import { useState, useCallback } from "react";
import api from "@/app/lib/api";

interface CriarSolicitacaoData {
  professorId: string;
  mensagem?: string;
}

interface ResponderSolicitacaoData {
  status: 'APROVADA' | 'REJEITADA';
  resposta?: string;
}

export const useSolicitacaoVinculo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criarSolicitacao = useCallback(async (data: CriarSolicitacaoData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post("/solicitacoes-vinculo", data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar solicitação";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const listarSolicitacoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get("/solicitacoes-vinculo");
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao listar solicitações";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const listarSolicitacoesAluno = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get("/solicitacoes-vinculo/aluno");
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao listar solicitações do aluno";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const responderSolicitacao = useCallback(async (id: string, data: ResponderSolicitacaoData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/solicitacoes-vinculo/${id}/responder`, data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao responder solicitação";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  return {
    loading,
    error,
    criarSolicitacao,
    listarSolicitacoes,
    listarSolicitacoesAluno,
    responderSolicitacao,
    clearError
  };
};
