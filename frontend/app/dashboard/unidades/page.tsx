"use client";

import { useState } from "react";
import { useUnidadesLocais } from "@/app/hooks/useUnidadesLocais";
import Alert, { AlertType } from "@/app/components/Alert";
import { confirmAlert } from "@/app/utils/confirmAlert";
import Table from "@/app/components/Table";
import EditModal, { EditField } from "@/app/components/EditModal";
import { Edit, Trash2, Plus, RefreshCw } from "lucide-react";

type Unidade = { 
  id: string; 
  nome: string; 
  cidade: string; 
};

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
  const [editTarget, setEditTarget] = useState<Unidade | null>(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertCfg, setAlertCfg] = useState<{
    type: AlertType;
    title: string;
    message: string;
    buttonText?: string;
  }>({ type: "success", title: "", message: "" });

  // Configuração dos campos para o modal de edição
  const editFields: EditField[] = [
    {
      key: 'nome',
      label: 'Nome da Unidade',
      type: 'text',
      placeholder: 'Digite o nome da unidade',
      required: true,
      validation: (value) => {
        if (value.trim().length < 2) {
          return 'Nome deve ter pelo menos 2 caracteres';
        }
        if (value.trim().length > 50) {
          return 'Nome deve ter no máximo 50 caracteres';
        }
        return null;
      }
    },
    {
      key: 'cidade',
      label: 'Cidade',
      type: 'text',
      placeholder: 'Digite o nome da cidade',
      required: true,
      validation: (value) => {
        if (value.trim().length < 2) {
          return 'Cidade deve ter pelo menos 2 caracteres';
        }
        if (value.trim().length > 50) {
          return 'Cidade deve ter no máximo 50 caracteres';
        }
        return null;
      }
    }
  ];

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
  const handleDelete = async (unidade: Unidade) => {
    const ok = await confirmAlert({
      type: "error",
      title: "Excluir unidade",
      message:
        "Tem certeza que deseja excluir esta unidade? Essa ação não pode ser desfeita.",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
    });
    if (!ok) return;

    try {
      await deleteUnidade(unidade.id);
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

  // EDIT
  const handleEdit = (unidade: Unidade) => {
    setEditTarget(unidade);
  };

  // Salvar edição
  const handleSaveEdit = async (data: Record<string, string>) => {
    if (!editTarget) return;

    try {
      await updateUnidade(editTarget.id, {
        nome: data.nome,
        cidade: data.cidade
      });
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
  };

  // Configuração das colunas da tabela
  const columns = [
    {
      key: 'nome' as keyof Unidade,
      header: 'Nome',
      sortable: true,
    },
    {
      key: 'cidade' as keyof Unidade,
      header: 'Cidade',
      sortable: true,
    },
  ];

  // Configuração das ações da tabela
  const actions = [
    {
      icon: Edit,
      label: 'Editar unidade',
      onClick: handleEdit,
      variant: 'primary' as const,
    },
    {
      icon: Trash2,
      label: 'Excluir unidade',
      onClick: handleDelete,
      variant: 'danger' as const,
    },
  ];

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Unidades</h2>
        <button
          onClick={refreshData}
          className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
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
          className="bg-primary cursor-pointer text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isMutating ? "Salvando..." : "Criar"}
        </button>
      </form>

      {/* Tabela padronizada */}
      <Table
        data={unidades}
        columns={columns}
        actions={actions}
        loading={isLoading}
        emptyMessage="Nenhuma unidade cadastrada. Crie a primeira unidade usando o formulário acima."
        className="mt-6"
      />

      {/* Modal de edição genérico */}
      <EditModal
        isOpen={!!editTarget}
        title="Editar Unidade"
        item={editTarget}
        fields={editFields}
        isSaving={isMutating}
        onCancel={() => setEditTarget(null)}
        onSave={handleSaveEdit}
      />

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
