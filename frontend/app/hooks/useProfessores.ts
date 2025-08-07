import { useState, useEffect } from "react";
import api from "@/app/lib/api";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  roles: string[];
}

interface UseProfessoresReturn {
  usuarios: Usuario[];
  isLoading: boolean;
  error: string | null;
  tornarProfessor: (id: string) => Promise<void>;
  refreshUsuarios: () => Promise<void>;
}

export const useProfessores = (): UseProfessoresReturn => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get("/users");
      // Traz todos os usuários para permitir promoção
      setUsuarios(response.data);
    } catch (err) {
      setError("Erro ao carregar usuários");
      console.error("Erro ao buscar usuários:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const tornarProfessor = async (id: string) => {
    try {
      const user = usuarios.find((u) => u.id === id);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      const novosRoles = Array.from(new Set([...user.roles, "PROFESSOR"]));
      await api.put(`/users/${id}/roles`, { roles: novosRoles });
      
      // Atualizar lista após sucesso
      await fetchUsuarios();
    } catch (err) {
      setError("Erro ao atualizar usuário");
      console.error("Erro ao tornar professor:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return {
    usuarios,
    isLoading,
    error,
    tornarProfessor,
    refreshUsuarios: fetchUsuarios
  };
}; 