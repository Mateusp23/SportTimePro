"use client";

import { useEffect, useMemo, useState } from "react";
import { useAlunosProfessor } from "@/app/hooks/useAlunosProfessor";
import { useAuthStore } from "@/app/store/authStore";
import api from "@/app/lib/api";
import Table from "@/app/components/Table";
import { Copy, RefreshCw, Unlink } from "lucide-react";

type Aluno = {
  id: string;
  nome: string;
  email: string;
};

export default function AlunosPage() {
  const { user: me } = useAuthStore();
  const profId = me?.id;
  const { q, setQ, page, setPage, data, loading, unlink, refresh } =
    useAlunosProfessor(profId);

  const [inviteCode, setInviteCode] = useState<string>("");
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);
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
        setInviteCode(data.inviteCode);
      } catch (error) {
        console.error("Erro ao buscar código de convite:", error);
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

  const handleUnlink = async (aluno: Aluno) => {
    if (!confirm("Remover vínculo com este aluno?")) return;
    await unlink(aluno.id);
  };

  // Configuração das colunas da tabela
  const columns = [
    {
      key: 'nome' as keyof Aluno,
      header: 'Nome',
      sortable: true,
    },
    {
      key: 'email' as keyof Aluno,
      header: 'E-mail',
      sortable: true,
    },
  ];

  // Configuração das ações da tabela
  const actions = [
    {
      icon: Unlink,
      label: 'Desvincular aluno',
      onClick: handleUnlink,
      variant: 'danger' as const,
    },
  ];

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
            className="bg-primary text-white px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
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
        <button onClick={refresh} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Recarregar
        </button>
      </div>

      {/* Tabela padronizada */}
      <Table
        data={data.items}
        columns={columns}
        actions={actions}
        loading={loading}
        emptyMessage="Nenhum aluno encontrado. Compartilhe o link de convite para vincular alunos."
        className="mt-6"
      />

      {/* Paginação */}
      {data.items.length > 0 && (
        <div className="flex items-center gap-3 mt-4">
          <span className="text-sm text-gray-600">
            Total: {data.total} — Página {data.page}
          </span>
          <div className="ml-auto flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50 hover:bg-gray-200"
            >
              Anterior
            </button>
            <button
              disabled={data.page * data.pageSize >= data.total}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50 hover:bg-gray-200"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
