"use client";

import { useState } from "react";
import api from "@/app/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { nome, email, senha });
      alert("Conta criada! Verifique seu e-mail para confirmar.");
      router.push("/auth/login");
    } catch (err) {
      alert("Erro ao registrar");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-heading font-bold mb-4 text-center">Registrar</h1>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border border-gray-300 rounded w-full p-2 mb-3"
          required
        />
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
          Registrar
        </button>
        <p className="text-center mt-3 text-sm">
          Já tem conta? <a href="/auth/login" className="text-primary underline">Entrar</a>
        </p>
      </form>
    </div>
  );
}
