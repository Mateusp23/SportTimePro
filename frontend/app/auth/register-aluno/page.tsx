"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InputField from "@/app/components/InputField";
import { useAlunoRegistration } from "@/app/hooks/useAlunoRegistration";
import { Mail, Lock, User, GraduationCap } from "lucide-react";

export default function RegisterAlunoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, error, validateInvite, registerAluno, clearError } = useAlunoRegistration();
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [professorNome, setProfessorNome] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [inviteValid, setInviteValid] = useState(false);
  const [validatingInvite, setValidatingInvite] = useState(true);

  // Extrair parâmetros da URL
  useEffect(() => {
    const invite = searchParams.get("invite");
    const prof = searchParams.get("prof");
    
    if (invite && prof) {
      setInviteCode(invite);
      setProfessorId(prof);
      validateInviteCode(invite, prof);
    } else {
      setValidatingInvite(false);
      setInviteValid(false);
    }
  }, [searchParams]);

  const validateInviteCode = async (invite: string, prof: string) => {
    try {
      setValidatingInvite(true);
      const result = await validateInvite({ inviteCode: invite, professorId: prof });
      
      if (result.valid) {
        setProfessorNome(result.professorNome || "");
        setClienteNome(result.clienteNome || "");
        setInviteValid(true);
      } else {
        setInviteValid(false);
      }
    } catch (error) {
      console.error("Erro ao validar convite:", error);
      setInviteValid(false);
    } finally {
      setValidatingInvite(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem");
      return;
    }

    if (!inviteValid) {
      alert("Link de convite inválido");
      return;
    }

    clearError();
    
    const success = await registerAluno({
      nome,
      email,
      senha,
      inviteCode,
      professorId
    });
    
    if (success) {
      alert("Cadastro realizado com sucesso! Você já está vinculado ao seu professor.");
      router.push("/auth/login");
    }
  };

  if (validatingInvite) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Validando convite...</h2>
          <p className="text-gray-500 mt-2">Verificando se o link de convite é válido</p>
        </div>
      </div>
    );
  }

  if (!inviteValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <div className="text-red-500 mb-4">
            <GraduationCap size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Link Inválido</h2>
          <p className="text-gray-500 mb-4">
            Este link de convite não é válido ou expirou. 
            Entre em contato com seu professor para obter um novo convite.
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-5 border border-gray-100"
      >
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold text-texts">
            Cadastro de Aluno
          </h1>
          <p className="text-gray-500 mt-2">Complete seu cadastro</p>
          
          {professorNome && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Academia:</strong> {clienteNome}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                <strong>Professor:</strong> {professorNome}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Você será automaticamente vinculado a este professor
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <InputField
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          icon={<User size={18} />}
          validate={(value) => {
            if (value.trim().length < 3) return "Nome deve ter pelo menos 3 caracteres";
            return null;
          }}
        />

        <InputField
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={18} />}
          validate={(value) => {
            if (!/\S+@\S+\.\S+/.test(value)) return "E-mail inválido";
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

        <InputField
          type="password"
          placeholder="Confirmar Senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          icon={<Lock size={18} />}
          isPassword
          validate={(value) => {
            if (value !== senha) return "As senhas não coincidem";
            return null;
          }}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-primary cursor-pointer text-white w-full py-3 rounded-lg hover:opacity-90 transition font-semibold text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Cadastrando..." : "Cadastrar como Aluno"}
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
