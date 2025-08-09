"use client";

import { useState } from "react";
import { useUnidadesLocais } from "@/app/hooks/useUnidadesLocais";
import Alert, { AlertType } from "@/app/components/Alert";
import { confirmAlert } from "@/app/utils/confirmAlert";

type UnidadeRow = { id: string; nome: string; cidade: string };

export default function UnidadesPage() {
  const {
    unidades,
    isLoading,
    isMutating,
    createUnidade,
    updateUnidade,
    deleteUnidade,
    refreshData,
  } = useUnidadesLocais();

  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");

  const [editTarget, setEditTarget] = useState<UnidadeRow | null>(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertCfg, setAlertCfg] = useState<{
    type: AlertType;
    title: string;
    message: string;
    buttonText?: string;
  }>({ type: "success", title: "", message: "" });

  // CREATE
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cidade.trim()) {
      setAlertCfg({
        type: "warning",
        title: "Campos obrigatórios",
        message: "Informe nome e cidade.",
        buttonText: "OK",
      });
      setShowAlert(true);
      return;
    }
    try {
      await createUnidade({ nome: nome.trim(), cidade: cidade.trim() });
      setNome("");
      setCidade("");
      setAlertCfg({
        type: "success",
        title: "Sucesso",
        message: "Unidade criada!",
        buttonText: "Fechar",
      });
      setShowAlert(true);
    } catch {
      setAlertCfg({
        type: "error",
        title: "Erro",
        message: "Não foi possível criar a unidade.",
        buttonText: "Tentar novamente",
      });
      setShowAlert(true);
    }
  };

  // DELETE
  const handleDelete = async (id: string) => {
    const ok = await confirmAlert({
      type: "warning",
      title: "Excluir unidade",
      message:
        "Tem certeza que deseja excluir esta unidade? Essa ação não pode ser desfeita.",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
    });
    if (!ok) return;

    try {
      await deleteUnidade(id);
      setAlertCfg({
        type: "success",
        title: "Excluída",
        message: "Unidade removida com sucesso.",
        buttonText: "Fechar",
      });
      setShowAlert(true);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Não foi possível excluir a unidade.';
      setAlertCfg({ type: 'error', title: 'Não foi possível excluir a unidade.', message: msg, buttonText: 'Entendi' });
      setShowAlert(true);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Unidades</h2>
        <button
          onClick={refreshData}
          className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Recarregar
        </button>
      </div>

      {/* Criar */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da unidade"
          className="border px-3 py-2 rounded w-64"
        />
        <input
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="Cidade"
          className="border px-3 py-2 rounded w-64"
        />
        <button
          type="submit"
          disabled={isMutating}
          className="bg-primary text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-60"
        >
          {isMutating ? "Salvando..." : "Criar"}
        </button>
      </form>

      {/* Lista */}
      {isLoading ? (
        <p className="text-gray-500">Carregando…</p>
      ) : unidades.length === 0 ? (
        <div className="text-gray-500">Nenhuma unidade cadastrada.</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">Cidade</th>
              <th className="p-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {unidades.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.nome}</td>
                <td className="p-3 text-gray-600">{u.cidade}</td>
                <td className="p-3">
                  <button
                    onClick={() =>
                      setEditTarget({ id: u.id, nome: u.nome, cidade: u.cidade })
                    }
                    className="text-yellow-600 hover:text-yellow-700 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de edição */}
      {editTarget && (
        <EditarUnidadeModal
          unidade={editTarget}
          isSaving={isMutating}
          onCancel={() => setEditTarget(null)}
          onSave={async (data) => {
            try {
              await updateUnidade(editTarget.id, data);
              setEditTarget(null);
              setAlertCfg({
                type: "success",
                title: "Atualizado",
                message: "Unidade atualizada com sucesso.",
                buttonText: "Fechar",
              });
              setShowAlert(true);
            } catch {
              setAlertCfg({
                type: "error",
                title: "Erro",
                message: "Não foi possível atualizar a unidade.",
                buttonText: "Tentar novamente",
              });
              setShowAlert(true);
            }
          }}
        />
      )}

      {showAlert && (
        <Alert
          type={alertCfg.type}
          title={alertCfg.title}
          message={alertCfg.message}
          buttonText={alertCfg.buttonText}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}

/* ========= Modal interno de edição ========= */

function EditarUnidadeModal({
  unidade,
  isSaving,
  onCancel,
  onSave,
}: {
  unidade: UnidadeRow;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (data: { nome: string; cidade: string }) => Promise<void>;
}) {
  const [nome, setNome] = useState(unidade.nome);
  const [cidade, setCidade] = useState(unidade.cidade);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
        <h3 className="text-xl font-heading font-bold mb-4">Editar Unidade</h3>

        <div className="space-y-3 mb-6">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome"
            className="border px-3 py-2 rounded w-full"
          />
          <input
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Cidade"
            className="border px-3 py-2 rounded w-full"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (!nome.trim() || !cidade.trim()) return;
              onSave({ nome: nome.trim(), cidade: cidade.trim() });
            }}
            className="px-4 py-2 rounded bg-primary text-white hover:opacity-90 disabled:opacity-60"
            disabled={isSaving}
          >
            {isSaving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
