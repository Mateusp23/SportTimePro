"use client";

import { useState } from "react";
import api from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { Mail, Lock, Eye, EyeOff } from "lucide-react"; // ícones modernos

export default function LoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-5 border border-gray-100"
      >
        <h1 className="text-3xl font-heading font-bold text-center text-texts">
          Bem-vindo de volta 👋
        </h1>
        <p className="text-center text-gray-500">Entre para continuar</p>

        {/* Campo Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 border border-gray-300 text-texts rounded-lg w-full p-3 focus:ring-2 focus:ring-primary focus:outline-none transition"
            required
          />
        </div>

        {/* Campo Senha com toggle */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type={mostrarSenha ? "text" : "password"}
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="pl-10 pr-10 border border-gray-300 text-texts rounded-lg w-full p-3 focus:ring-2 focus:ring-primary focus:outline-none transition"
            required
          />
          <button
            type="button"
            onClick={() => setMostrarSenha(!mostrarSenha)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          className="bg-primary cursor-pointer text-white w-full py-3 rounded-lg hover:opacity-90 transition font-semibold text-lg shadow-md"
        >
          Entrar
        </button>

        <p className="text-center mt-3 text-sm text-gray-600">
          Não tem conta?{" "}
          <a
            href="/auth/register"
            className="text-primary font-medium hover:underline"
          >
            Registrar
          </a>
        </p>
      </form>
    </div>
  );
}
