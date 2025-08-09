// app/dashboard/locais/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useUnidadesLocais } from "@/app/hooks/useUnidadesLocais";
import Alert, { AlertType } from "@/app/components/Alert";
import { confirmAlert } from "@/app/utils/confirmAlert";

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

  // agrupado por unidade, igual seu uso anterior
  const locaisAgrupados = useMemo(() => {
    return unidades.map(u => ({
      unidade: u,
      locais: getLocaisByUnidade(u.id),
    }));
  }, [unidades, getLocaisByUnidade]);

  // alert
  const [showAlert, setShowAlert] = useState(false);
  const [alertCfg, setAlertCfg] = useState<{
    type: AlertType;
    title: string;
    message: string;
    buttonText: string;
  }>({ type: "success", title: "", message: "", buttonText: "" });

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

  // editar (igual Unidades: usa valores do formulário superior)
  const handleUpdate = async (id: string) => {
    const ok = await confirmAlert({
      type: "warning",
      title: "Editar local",
      message:
        "Deseja aplicar ao local selecionado os valores informados nos campos acima?",
      confirmText: "Sim, editar",
      cancelText: "Cancelar",
    });
    if (!ok) return;

    if (!nome.trim() && !unidadeId) {
      setAlertCfg({
        type: "warning",
        title: "Nada para atualizar",
        message: "Preencha ao menos um campo (nome ou unidade).",
        buttonText: "OK",
      });
      setShowAlert(true);
      return;
    }

    try {
      const payload: { nome?: string; unidadeId?: string } = {};
      if (nome.trim()) payload.nome = nome.trim();
      if (unidadeId) payload.unidadeId = unidadeId;

      await updateLocal(id, { nome: nome.trim(), unidadeId });
      setAlertCfg({
        type: "success",
        title: "Atualizado",
        message: "Local atualizado com sucesso!",
        buttonText: "Fechar",
      });
      setShowAlert(true);
      // não limpo campos para facilitar múltiplas edições
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || "Não foi possível editar o local.";
      setAlertCfg({
        type: "error",
        title: "Erro",
        message: msg,
        buttonText: "Tentar novamente",
      });
      setShowAlert(true);
    }
  };

  // excluir
  const handleDelete = async (id: string) => {
    const ok = await confirmAlert({
      type: "warning",
      title: "Excluir local",
      message:
        "Tem certeza que deseja excluir este local? Essa ação não pode ser desfeita.",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
    });
    if (!ok) return;

    try {
      await deleteLocal(id);
      setAlertCfg({
        type: "success",
        title: "Excluído",
        message: "Local removido com sucesso.",
        buttonText: "Fechar",
      });
      setShowAlert(true);
    } catch (e: any) {
      // aqui você verá mensagens do back (ex.: “existem aulas vinculadas a este local”)
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

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Locais</h2>
        <button
          onClick={refreshData}
          className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Recarregar
        </button>
      </div>

      {/* Formulário (mesmo padrão da página Unidades) */}
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
          className="bg-primary text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-60"
        >
          {isMutating ? "Salvando…" : "Criar"}
        </button>
      </form>

      {/* Lista agrupada por unidade (com Ações Editar/Excluir) */}
      {isLoading ? (
        <p className="text-gray-500">Carregando…</p>
      ) : (
        <div className="space-y-4">
          {locaisAgrupados.map((grp) => (
            <div key={grp.unidade.id} className="border rounded overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 font-medium">
                {grp.unidade.nome} —{" "}
                <span className="text-gray-500">{grp.unidade.cidade}</span>
              </div>

              {grp.locais.length === 0 ? (
                <div className="px-3 py-2 text-gray-500">
                  Sem locais nesta unidade.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3">Nome</th>
                      <th className="text-left p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grp.locais.map((l) => (
                      <tr key={l.id} className="border-t">
                        <td className="p-3">{l.nome}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleUpdate(l.id)}
                            className="text-blue-600 hover:text-blue-800 mr-4"
                            title="Aplicar valores do formulário acima neste local"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(l.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
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
