"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/api";
import { useRouter } from "next/navigation";
import InputField from "@/app/components/InputField";
import { Mail, Lock, User, Building, ChevronDown } from "lucide-react";
import { useSearchAcademias } from "@/app/hooks/useSearchAcademias";

export default function RegisterPage() {
  const router = useRouter();
  const { academias, loading: loadingAcademias, searchAcademias } = useSearchAcademias();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [academiaSelecionada, setAcademiaSelecionada] = useState("");
  const [professorSelecionado, setProfessorSelecionado] = useState("");
  const [showAcademiaSelect, setShowAcademiaSelect] = useState(false);
  const [showProfessorSelect, setShowProfessorSelect] = useState(false);
  const [loading, setLoading] = useState(false);

  // Carregar academias ao montar o componente
  useEffect(() => {
    searchAcademias();
  }, [searchAcademias]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem");
      return;
    }

    if (!academiaSelecionada || !professorSelecionado) {
      alert("Por favor, selecione uma academia e um professor");
      return;
    }

    try {
      setLoading(true);
      
      // Registrar o aluno com a academia selecionada
      const response = await api.post("/auth/register", { 
        nome, 
        email, 
        senha, 
        academiaId: academiaSelecionada 
      });
      
      // Se o cadastro foi bem-sucedido, fazer login automático
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        
        // Agora que temos o token, criar a solicitação de vínculo
        try {
          await api.post("/solicitacoes-vinculo", {
            professorId: professorSelecionado,
            mensagem: "Solicitação automática de vínculo após cadastro"
          });
          
          alert("Cadastro realizado com sucesso! Sua solicitação de vínculo foi enviada e será analisada pelo professor.");
        } catch (vinculoError: any) {
          console.error("Erro ao criar solicitação de vínculo:", vinculoError);
          alert("Cadastro realizado com sucesso! Mas houve um problema ao enviar a solicitação de vínculo. Você pode tentar novamente após fazer login.");
        }
        
        router.push("/dashboard");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Erro ao registrar, tente novamente.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const academiaAtual = academias.find(a => a.academiaId === academiaSelecionada);
  const professoresDisponiveis = academiaAtual?.professores || [];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-5 border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold text-texts">
            Criar conta
          </h1>
          <p className="text-gray-500 mt-2">Preencha seus dados</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <InputField
            placeholder="Nome"
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

          {/* Seleção de Academia */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academia
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAcademiaSelect(!showAcademiaSelect)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <div className="flex items-center gap-2">
                  <Building size={18} className="text-gray-400" />
                  <span className={academiaSelecionada ? "text-gray-900" : "text-gray-500"}>
                    {academiaSelecionada 
                      ? academias.find(a => a.academiaId === academiaSelecionada)?.academiaNome 
                      : "Selecione uma academia"
                    }
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showAcademiaSelect && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {loadingAcademias ? (
                    <div className="p-3 text-center text-gray-500">
                      Carregando academias...
                    </div>
                  ) : academias.length === 0 ? (
                    <div className="p-3 text-center text-gray-500">
                      Nenhuma academia encontrada
                    </div>
                  ) : (
                    academias.map((academia) => (
                      <button
                        key={academia.academiaId}
                        type="button"
                        onClick={() => {
                          setAcademiaSelecionada(academia.academiaId);
                          setProfessorSelecionado(""); // Reset professor selection
                          setShowAcademiaSelect(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{academia.academiaNome}</div>
                        <div className="text-sm text-gray-500">
                          {academia.professores.length} professor(es) disponível(is)
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Seleção de Professor */}
          {academiaSelecionada && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professor
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfessorSelect(!showProfessorSelect)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-gray-400" />
                    <span className={professorSelecionado ? "text-gray-900" : "text-gray-500"}>
                      {professorSelecionado 
                        ? professoresDisponiveis.find(p => p.id === professorSelecionado)?.nome 
                        : "Selecione um professor"
                      }
                    </span>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {showProfessorSelect && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {professoresDisponiveis.length === 0 ? (
                      <div className="p-3 text-center text-gray-500">
                        Nenhum professor disponível nesta academia
                      </div>
                    ) : (
                      professoresDisponiveis.map((professor) => (
                        <button
                          key={professor.id}
                          type="button"
                          onClick={() => {
                            setProfessorSelecionado(professor.id);
                            setShowProfessorSelect(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{professor.nome}</div>
                          <div className="text-sm text-gray-500">{professor.email}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !academiaSelecionada || !professorSelecionado}
            className="w-full bg-primary text-white py-3 rounded-lg hover:opacity-90 transition font-semibold text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Criando conta..." : "Registrar"}
          </button>
        </form>

        <p className="text-center mt-3 text-sm text-gray-600">
          Já possui conta?{" "}
          <a href="/auth/login" className="text-primary underline">Entrar</a>
        </p>
      </div>
    </div>
  );
}
