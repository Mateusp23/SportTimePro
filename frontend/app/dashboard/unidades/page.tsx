"use client";
import { useState } from "react";
import { useUnidadesLocais } from "@/app/hooks/useUnidadesLocais";
import Alert, { AlertType } from "@/app/components/Alert";

export default function UnidadesPage() {
  const { unidades, isLoading, isMutating, createUnidade, refreshData } = useUnidadesLocais();
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    type: AlertType;
    title: string;
    message: string;
    buttonText: string;
  }>({
    type: "success",
    title: "",
    message: "",
    buttonText: ""
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cidade.trim()) {
      setAlertConfig({ type: "warning", title: "Campos obrigatórios", message: "Preencha nome e cidade.", buttonText: "OK" });
      setShowAlert(true);
      return;
    }
    try {
      await createUnidade({ nome: nome.trim(), cidade: cidade.trim() });
      setNome(""); setCidade("");
      setAlertConfig({ type: "success", title: "Sucesso", message: "Unidade criada!", buttonText: "Fechar" });
      setShowAlert(true);
    } catch {
      setAlertConfig({ type: "error", title: "Erro", message: "Não foi possível criar a unidade.", buttonText: "Tentar novamente" });
      setShowAlert(true);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Unidades</h2>
        <button onClick={refreshData} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">Recarregar</button>
      </div>

      <form onSubmit={handleCreate} className="mb-6 flex gap-3">
        <input
          value={nome} onChange={e => setNome(e.target.value)}
          placeholder="Nome da unidade"
          className="border px-3 py-2 rounded w-64"
        />
        <input
          value={cidade} onChange={e => setCidade(e.target.value)}
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

      {isLoading ? (
        <p className="text-gray-500">Carregando…</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">Cidade</th>
            </tr>
          </thead>
          <tbody>
            {unidades.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.nome}</td>
                <td className="p-3 text-gray-600">{u.cidade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAlert && (
        <Alert {...alertConfig} onClose={() => setShowAlert(false)} />
      )}
    </div>
  );
}
