import { useState, useEffect } from "react";
import { getUserFromToken } from "@/app/utils/jwt";
import api from "@/app/lib/api";

interface User {
  id: string;
  nome: string;
  email: string;
  roles: string[];
}

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => void;
}

export const useUser = (): UseUserReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Primeiro verifica se há token válido
      const tokenData = getUserFromToken();
      if (!tokenData || !tokenData.userId) {
        setError("Token inválido ou expirado");
        return;
      }

      // Faz requisição para obter dados completos do usuário
      const response = await api.get('/auth/me');
      const userData = response.data;
      
      if (userData) {
        setUser({
          id: userData.id,
          nome: userData.nome,
          email: userData.email,
          roles: userData.roles
        });
      } else {
        setError("Dados do usuário não encontrados");
      }
    } catch (err: any) {
      setError("Erro ao carregar dados do usuário");
      console.error("Erro ao buscar usuário:", err);
      // Se der erro de autenticação, limpa o token
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refreshUser = () => {
    fetchUser();
  };

  return {
    user,
    isLoading,
    error,
    refreshUser
  };
}; 