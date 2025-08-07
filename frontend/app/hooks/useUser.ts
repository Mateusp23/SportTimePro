import { useState, useEffect } from "react";
import { getUserFromToken } from "@/app/utils/jwt";

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

  const fetchUser = () => {
    try {
      setIsLoading(true);
      setError(null);

      const userData = getUserFromToken();
      if (userData) {
        setUser(userData);
      } else {
        setError("Token inválido ou expirado");
      }
    } catch (err) {
      setError("Erro ao carregar dados do usuário");
      console.error("Erro ao buscar usuário:", err);
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