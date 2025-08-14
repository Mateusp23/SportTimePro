"use client";

import { useEffect, useMemo, useState } from "react";
import { useAlunosProfessor } from "@/app/hooks/useAlunosProfessor";
import { useAuthStore } from "@/app/store/authStore"; // Mudança aqui
import api from "@/app/lib/api";

export default function AlunosPage() {
  const { user: me } = useAuthStore(); // Mudança aqui - usando useAuthStore em vez de useUser
  const profId = me?.id;
  const { q, setQ, page, setPage, data, loading, unlink, refresh } =
    useAlunosProfessor(profId);

  const [inviteCode, setInviteCode] = useState<string>("");
  const [isLoadingInvite, setIsLoadingInvite] = useState(false); // Novo estado para controlar loading
  const inviteUrl = useMemo(() => {
    if (!inviteCode || !me?.id) return "";
    const base =
      process.env.NEXT_PUBLIC_FRONTEND_URL ??
      (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/auth/register-aluno?invite=${inviteCode}&prof=${me.id}`;
  }, [inviteCode, me?.id]);

  useEffect(() => {
    (async () => {
      if (!me?.id) return;
      
      try {
        setIsLoadingInvite(true);
        const { data } = await api.get<{ inviteCode: string }>("/invite-code");
        console.log("Resposta da API invite-code:", data); // Log para debug
        setInviteCode(data.inviteCode);
      } catch (error) {
        console.error("Erro ao buscar código de convite:", error);
        // Opcional: mostrar erro para o usuário
      } finally {
        setIsLoadingInvite(false);
      }
    })();
  }, [me?.id]);

  const copy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      alert("Link copiado!");
    } catch (error) {
      console.error("Erro ao copiar:", error);
      // Fallback para navegadores mais antigos
      const textArea = document.createElement("textarea");
      textArea.value = inviteUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Link copiado!");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Meus Alunos</h2>
        <div className="flex items-center gap-2">
          <input
            value={inviteUrl}
            readOnly
            className="border px-3 py-2 rounded w-[420px]"
            placeholder={isLoadingInvite ? "Carregando código..." : "Link de convite"}
          />
          <button 
            onClick={copy} 
            disabled={!inviteUrl || isLoadingInvite}
            className="bg-primary text-white px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingInvite ? "Carregando..." : "Copiar"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Buscar por nome ou e-mail"
          className="border px-3 py-2 rounded w-80"
        />
        <button onClick={refresh} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">
          Recarregar
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Carregando…</div>
      ) : data.items.length === 0 ? (
        <div className="text-gray-500">Nenhum aluno encontrado.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">E-mail</th>
                <th className="p-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((aluno) => (
                <tr key={aluno.id} className="hover:bg-gray-50">
                  <td className="p-3">{aluno.nome}</td>
                  <td className="p-3 text-gray-600">{aluno.email}</td>
                  <td className="p-3">
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={async () => {
                        if (!confirm("Remover vínculo com este aluno?")) return;
                        await unlink(aluno.id);
                      }}
                    >
                      Desvincular
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* paginação simples */}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-sm text-gray-600">
              Total: {data.total} — Página {data.page}
            </span>
            <div className="ml-auto flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                disabled={data.page * data.pageSize >= data.total}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
