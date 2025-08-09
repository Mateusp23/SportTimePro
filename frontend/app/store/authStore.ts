import { create } from "zustand";
import type { AppUser, JwtClaims, Role } from "@/app/types/auth";

function decodeJwt<T = unknown>(token: string): T | null {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

type AuthState = {
  token: string | null;
  user: AppUser | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  hasRole: (role: Role) => boolean;
};

// Carrega token salvo (lado do cliente)
const initialToken =
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const initialUser = initialToken
  ? (() => {
    const claims = decodeJwt<JwtClaims>(initialToken);
    if (!claims) return null;
    return {
      id: claims.userId,
      clienteId: claims.clienteId,
      roles: claims.roles ?? [],
    } as AppUser;
  })()
  : null;

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialToken,
  user: initialUser,

  setToken: (token) => {
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("token", token);
      else localStorage.removeItem("token");
    }

    // Atualiza user a partir do token
    let user: AppUser | null = null;
    if (token) {
      const claims = decodeJwt<JwtClaims>(token);
      if (claims) {
        user = {
          id: claims.userId,
          clienteId: claims.clienteId,
          roles: claims.roles ?? [],
        };
      }
    }

    set({ token, user });
  },

  logout: () => {
    if (typeof window !== "undefined") localStorage.removeItem("token");
    set({ token: null, user: null });
  },

  hasRole: (role) => {
    const u = get().user;
    return !!u?.roles?.includes(role);
  },
}));
