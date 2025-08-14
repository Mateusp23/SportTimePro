"use client";
import { useState } from "react";
import api from "@/app/lib/api";

interface RegisterAlunoData {
  nome: string;
  email: string;
  senha: string;
  inviteCode: string;
  professorId: string;
}

interface ValidateInviteData {
  inviteCode: string;
  professorId: string;
}

interface ValidateInviteResponse {
  valid: boolean;
  professorNome?: string;
  clienteId?: string;
  message?: string;
}

export const useAlunoRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateInvite = async (data: ValidateInviteData): Promise<ValidateInviteResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<ValidateInviteResponse>("/validate-invite", {
        params: data
      });
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erro ao validar convite";
      setError(errorMessage);
      return { valid: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const registerAluno = async (data: RegisterAlunoData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await api.post("/auth/register-aluno", data);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erro ao registrar aluno";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    validateInvite,
    registerAluno,
    clearError: () => setError(null)
  };
};
