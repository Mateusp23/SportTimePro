import { useState, useEffect, useCallback } from "react";
import api from "@/app/lib/api";

export interface UserInfo {
  id: string;
  nome: string;
  email: string;
  roles: string[];
  clienteId: string;
}

export function useUserInfo() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarInformacoesUsuario = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/auth/me");
      setUserInfo(response.data);
    } catch (error) {
      console.error("Erro ao carregar informações do usuário:", error);
      setError("Erro ao carregar informações do usuário");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUserInfo = useCallback(() => {
    carregarInformacoesUsuario();
  }, [carregarInformacoesUsuario]);

  useEffect(() => {
    carregarInformacoesUsuario();
  }, [carregarInformacoesUsuario]);

  return {
    userInfo,
    loading,
    error,
    refreshUserInfo,
    carregarInformacoesUsuario
  };
}
