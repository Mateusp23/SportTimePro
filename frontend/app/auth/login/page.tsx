"use client";

import { useState } from "react";
import api from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, senha });
      setToken(res.data.token);
      router.push("/dashboard");
    } catch (err) {
      alert("Credenciais inválidas");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-heading font-bold mb-4 text-center">Login</h1>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded w-full p-2 mb-3"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="border border-gray-300 rounded w-full p-2 mb-3"
          required
        />
        <button
          type="submit"
          className="bg-primary text-white w-full py-2 rounded hover:opacity-90 transition"
        >
          Entrar
        </button>
        <p className="text-center mt-3 text-sm">
          Não tem conta? <a href="/auth/register" className="text-primary underline">Registrar</a>
        </p>
      </form>
    </div>
  );
}
