"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { Mail, Lock } from "lucide-react";
import api from "@/app/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { setToken, token } = useAuthStore();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Se já existe token, redireciona direto
    if (token) {
      router.push("/dashboard");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/auth/login", { email, senha });
      
      // Salva token no LocalStorage e na store
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      
      router.push("/dashboard");
    } catch (err: any) {
      const message = err.response?.data?.message || "Credenciais inválidas";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-5 border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold text-texts">
            Bem-vindo de volta 👋
          </h1>
          <p className="text-gray-500 mt-2">Entre para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg hover:opacity-90 transition font-semibold text-lg shadow-md disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="text-center space-y-3">
          <p className="text-sm text-texts">
            É aluno?{" "}
            <a href="/auth/register" className="text-primary underline">Cadastre-se</a>
          </p>

          <p className="text-sm text-texts">
            É professor ou dono de academia?{" "}
            <a href="/auth/register-client" className="text-secondary underline">Registrar Academia</a>
          </p>
        </div>
      </div>
    </div>
  );
}
