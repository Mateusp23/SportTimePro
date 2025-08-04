"use client";

import { useState } from "react";
import api from "@/app/lib/api";
import { useRouter } from "next/navigation";
import InputField from "@/app/components/InputField";
import { Mail, Lock, Building, User } from "lucide-react";

export default function RegisterClientPage() {
  const router = useRouter();

  const [nomeCliente, setNomeCliente] = useState("");
  const [nomeAdmin, setNomeAdmin] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem");
      return;
    }
    try {
      await api.post("/auth/register-cliente", { nomeCliente, nomeAdmin, email, senha });
      alert("Academia e Admin criados com sucesso!");
      router.push("/auth/login");
    } catch (err) {
      alert("Erro ao registrar");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-5 border border-gray-100"
      >
        <h1 className="text-3xl font-heading font-bold text-center text-texts">
          Criar Academia
        </h1>
        <p className="text-center text-gray-500">Preencha os dados da academia</p>

        <InputField
          placeholder="Nome da Academia"
          value={nomeCliente}
          onChange={(e) => setNomeCliente(e.target.value)}
          icon={<Building size={18} />}
        />
        <InputField
          placeholder="Nome do Administrador"
          value={nomeAdmin}
          onChange={(e) => setNomeAdmin(e.target.value)}
          icon={<User size={18} />}
        />
        <InputField
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={18} />}
        />
        <InputField
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          icon={<Lock size={18} />}
          isPassword
        />
        <InputField
          type="password"
          placeholder="Confirmar Senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          icon={<Lock size={18} />}
          isPassword
        />

        <button
          type="submit"
          className="bg-primary cursor-pointer text-white w-full py-3 rounded-lg hover:opacity-90 transition font-semibold text-lg shadow-md"
        >
          Registrar Academia
        </button>

        <p className="text-center mt-3 text-sm text-gray-600">
          Já possui conta?{" "}
          <a
            href="/auth/login"
            className="text-primary font-medium hover:underline"
          >
            Entrar
          </a>
        </p>
      </form>
    </div>
  );
}
