// app/hooks/useProfessores.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import api from "@/app/lib/api";
import type { Usuario, UserRole } from "@/app/types/types";

interface UseProfessoresReturn {
  usuarios: Usuario[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  refreshUsuarios: () => Promise<void>;
  tornarProfessor: (id: string) => Promise<void>;
  removerProfessor: (id: string) => Promise<void>;
  toggleProfessor: (user: Usuario) => Promise<void>;
  tornarMeProfessor: (myId: string) => Promise<void>;
}

export const useProfessores = (): UseProfessoresReturn => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const filtrarStaff = useCallback((lista: Usuario[]) => {
    // mostra apenas ADMIN ou PROFESSOR
    return lista.filter(u => u.roles.includes("ADMIN") || u.roles.includes("PROFESSOR"));
  }, []);

  const fetchUsuarios = useCallback(async () => {
    try {
      if (!mounted.current) return;
      setIsLoading(true);
      setError(null);

      const { data } = await api.get<Usuario[]>("/users");
      const staff = filtrarStaff(data);
      if (mounted.current) setUsuarios(staff);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      if (mounted.current) setError("Erro ao carregar usuários");
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, [filtrarStaff]);

  const atualizarRoles = useCallback(
    async (id: string, roles: UserRole[]) => {
      try {
        setIsMutating(true);
        await api.put(`/users/${id}/roles`, { roles });
        await fetchUsuarios();
      } finally {
        setIsMutating(false);
      }
    },
    [fetchUsuarios]
  );

  const tornarProfessor = useCallback(
    async (id: string) => {
      const user = usuarios.find(u => u.id === id);
      if (!user) throw new Error("Usuário não encontrado");
      const novos = Array.from(new Set<UserRole>([...user.roles, "PROFESSOR"]));
      await atualizarRoles(id, novos);
    },
    [usuarios, atualizarRoles]
  );

  const removerProfessor = useCallback(
    async (id: string) => {
      const user = usuarios.find(u => u.id === id);
      if (!user) throw new Error("Usuário não encontrado");
      const novos = user.roles.filter(r => r !== "PROFESSOR") as UserRole[];
      await atualizarRoles(id, novos);
    },
    [usuarios, atualizarRoles]
  );

  const toggleProfessor = useCallback(
    async (user: Usuario) => {
      if (user.roles.includes("PROFESSOR")) {
        await removerProfessor(user.id);
      } else {
        await tornarProfessor(user.id);
      }
    },
    [removerProfessor, tornarProfessor]
  );

  const tornarMeProfessor = useCallback(
    async (myId: string) => {
      const me = usuarios.find(u => u.id === myId);
      if (!me) throw new Error("Usuário logado não encontrado");
      if (me.roles.includes("PROFESSOR")) return;
      const novos = Array.from(new Set<UserRole>([...me.roles, "PROFESSOR"]));
      await atualizarRoles(myId, novos);
    },
    [usuarios, atualizarRoles]
  );

  useEffect(() => {
    mounted.current = true;
    fetchUsuarios();
    return () => {
      mounted.current = false;
    };
  }, [fetchUsuarios]);

  return {
    usuarios,
    isLoading,
    isMutating,
    error,
    refreshUsuarios: fetchUsuarios,
    tornarProfessor,
    removerProfessor,
    toggleProfessor,
    tornarMeProfessor,
  };
};
