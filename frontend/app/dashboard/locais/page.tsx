// app/dashboard/locais/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { useUnidadesLocais } from "@/app/hooks/useUnidadesLocais";
import Alert, { AlertType } from "@/app/components/Alert";
import { confirmAlert } from "@/app/utils/confirmAlert";
import Table from "@/app/components/Table";
import EditModal, { EditField } from "@/app/components/EditModal";
import { Edit, Trash2, Plus } from "lucide-react";

type Local = {
  id: string;
  nome: string;
  unidadeId: string;
  unidade?: {
    nome: string;
    cidade: string;
  };
};

export default function LocaisPage() {
  const {
    unidades,
    locais,
    isLoading,
    isMutating,
    createLocal,
    updateLocal,
    deleteLocal,
    refreshData,
    getLocaisByUnidade,
  } = useUnidadesLocais();

  const [nome, setNome] = useState("");
  const [unidadeId, setUnidadeId] = useState("");
  const [editTarget, setEditTarget] = useState<Local | null>(null);

  // alert
  const [showAlert, setShowAlert] = useState(false);
  const [alertCfg, setAlertCfg] = useState<{
    type: AlertType;
    title: string;
    message: string;
    buttonText: string;
  }>({ type: "success", title: "", message: "", buttonText: "" });

  // Preparar dados para a tabela
  const tableData = useMemo(() => {
    return locais.map(local => ({
      ...local,
      unidade: unidades.find(u => u.id === local.unidadeId)
    }));
  }, [locais, unidades]);

  // Configuração dos campos para o modal de edição
  const editFields: EditField[] = [
    {
      key: 'nome',
      label: 'Nome do Local',
      type: 'text',
      placeholder: 'Digite o nome do local',
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
      key: 'unidadeId',
      label: 'Unidade',
      type: 'select',
      required: true,
      options: unidades.map(u => ({
        value: u.id,
        label: `${u.nome} — ${u.cidade}`
      }))
    }
  ];

  // criar
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !unidadeId) {
      setAlertCfg({
        type: "warning",
        title: "Campos obrigatórios",
        message: "Informe nome e unidade.",
        buttonText: "OK",
      });
      setShowAlert(true);
      return;
    }
    try {
      await createLocal({ nome: nome.trim(), unidadeId });
      setNome("");
      setUnidadeId("");
      setAlertCfg({
        type: "success",
        title: "Sucesso",
        message: "Local criado!",
        buttonText: "Fechar",
      });
      setShowAlert(true);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || "Não foi possível criar o local.";
      setAlertCfg({
        type: "error",
        title: "Erro",
        message: msg,
        buttonText: "Tentar novamente",
      });
      setShowAlert(true);
    }
  };

  // editar
  const handleUpdate = async (local: Local) => {
    setEditTarget(local);
  };

  // Salvar edição
  const handleSaveEdit = async (data: Record<string, string>) => {
    if (!editTarget) return;

    try {
      await updateLocal(editTarget.id, {
        nome: data.nome,
        unidadeId: data.unidadeId
      });
      setEditTarget(null);
      setAlertCfg({
        type: "success",
        title: "Atualizado",
        message: "Local atualizado com sucesso.",
        buttonText: "Fechar",
      });
      setShowAlert(true);
    } catch (error: any) {
      console.error('Erro ao atualizar local:', error);
      setAlertCfg({
        type: "error",
        title: "Erro",
        message: error?.response?.data?.message || "Não foi possível atualizar o local.",
        buttonText: "Tentar novamente",
      });
      setShowAlert(true);
    }
  };

  // excluir
  const handleDelete = async (local: Local) => {
    const ok = await confirmAlert({
      type: "error",
      title: "Excluir local",
      message:
        "Tem certeza que deseja excluir este local? Essa ação não pode ser desfeita.",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
    });
    if (!ok) return;

    try {
      await deleteLocal(local.id);
      setAlertCfg({
        type: "success",
        title: "Excluído",
        message: "Local removido com sucesso.",
        buttonText: "Fechar",
      });
      setShowAlert(true);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || "Não foi possível excluir o local.";
      setAlertCfg({
        type: "error",
        title: "Não foi possível excluir o local.",
        message: msg,
        buttonText: "Entendi",
      });
      setShowAlert(true);
    }
  };

  // Configuração das colunas da tabela
  const columns = [
    {
      key: 'nome' as keyof Local,
      header: 'Nome',
      sortable: true,
    },
    {
      key: 'unidade' as keyof Local,
      header: 'Unidade',
      sortable: true,
      accessor: (local: Local) => local.unidade ? `${local.unidade.nome} — ${local.unidade.cidade}` : 'N/A',
    },
  ];

  // Configuração das ações da tabela
  const actions = [
    {
      icon: Edit,
      label: 'Editar local',
      onClick: handleUpdate,
      variant: 'primary' as const,
    },
    {
      icon: Trash2,
      label: 'Excluir local',
      onClick: handleDelete,
      variant: 'danger' as const,
    },
  ];

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Locais</h2>
        <button
          onClick={refreshData}
          className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Recarregar
        </button>
      </div>

      {/* Formulário */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do local"
          className="border px-3 py-2 rounded w-64"
        />
        <select
          value={unidadeId}
          onChange={(e) => setUnidadeId(e.target.value)}
          className="border px-3 py-2 rounded w-64 bg-white"
        >
          <option value="">Selecione a unidade</option>
          {unidades.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome} — {u.cidade}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isMutating}
          className="bg-primary text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isMutating ? "Salvando…" : "Criar"}
        </button>
      </form>

      {/* Tabela padronizada */}
      <Table
        data={tableData}
        columns={columns}
        actions={actions}
        loading={isLoading}
        emptyMessage="Nenhum local encontrado. Crie o primeiro local usando o formulário acima."
        className="mt-6"
      />

      {/* Modal de edição genérico */}
      <EditModal
        isOpen={!!editTarget}
        title="Editar Local"
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