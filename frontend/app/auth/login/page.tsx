"use client";

import { useState } from "react";
import api from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { Mail, Lock } from "lucide-react";
import InputField from "@/app/components/InputField";

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

        <InputField
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={18} />}
          validate={(value) => {
            if (!value.includes("@")) return "E-mail inválido";
            return null;
          }}
        />

        <InputField
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          icon={<Lock size={18} />}
          isPassword
          validate={(value) => {
            if (value.length < 6) return "Senha deve ter no mínimo 6 caracteres";
            return null;
          }}
        />

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
