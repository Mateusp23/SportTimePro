"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { Mail, Lock } from "lucide-react";
import InputField from "@/app/components/InputField";

export default function LoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const token = useAuthStore((state) => state.token);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    // Se já existe token, redireciona direto
    if (token) {
      router.push("/dashboard");
    }
  }, [token, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, senha });

      // 🔑 Salva token no LocalStorage e na store
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);

      router.push("/dashboard");
    } catch (err: any) {
      const message = err.response?.data?.message || "Credenciais inválidas";
      alert(message);

      if (message.includes("Confirme seu e-mail")) {
        setShowResend(true);
      }
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-confirmation", { email });
      alert("Novo link de confirmação enviado para o seu e-mail.");
      setShowResend(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao reenviar link");
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
          validate={(value) => (!value.includes("@") ? "E-mail inválido" : null)}
        />

        <InputField
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          icon={<Lock size={18} />}
          isPassword
          validate={(value) =>
            value.length < 6 ? "Senha deve ter no mínimo 6 caracteres" : null
          }
        />

        <button
          type="submit"
          className="bg-primary cursor-pointer text-white w-full py-3 rounded-lg hover:opacity-90 transition font-semibold text-lg shadow-md"
        >
          Entrar
        </button>

        {showResend && (
          <div className="text-center mt-3">
            <p className="text-sm text-gray-600">
              Não recebeu o e-mail de confirmação?
            </p>
            <button
              type="button"
              onClick={handleResend}
              className="text-primary underline font-medium mt-1"
            >
              Reenviar link
            </button>
          </div>
        )}

        <p className="text-center mt-2 text-sm text-texts">
          Não tem conta?{" "}
          <a href="/auth/register" className="text-primary underline">Registrar</a>
        </p>

        <p className="text-center mt-2 text-sm text-texts">
          É um professor ou dono de academia?{" "}
          <a href="/auth/register-client" className="text-secondary underline">Registrar Academia</a>
        </p>
      </form>
    </div>
  );
}
