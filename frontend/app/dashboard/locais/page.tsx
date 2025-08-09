"use client";
import { useMemo, useState } from "react";
import { useUnidadesLocais } from "@/app/hooks/useUnidadesLocais";
import Alert, { AlertType } from "@/app/components/Alert";

export default function LocaisPage() {
  const { unidades, locais, isLoading, isMutating, createLocal, refreshData, getLocaisByUnidade } = useUnidadesLocais();
  const [nome, setNome] = useState("");
  const [unidadeId, setUnidadeId] = useState("");

  const locaisAgrupados = useMemo(() => {
    return unidades.map(u => ({ unidade: u, locais: getLocaisByUnidade(u.id) }));
  }, [unidades, getLocaisByUnidade]);

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
    if (!nome.trim() || !unidadeId) {
      setAlertConfig({ type: "warning", title: "Campos obrigatórios", message: "Informe nome e unidade.", buttonText: "OK" });
      setShowAlert(true); return;
    }
    try {
      await createLocal({ nome: nome.trim(), unidadeId });
      setNome(""); setUnidadeId("");
      setAlertConfig({ type: "success", title: "Sucesso", message: "Local criado!", buttonText: "Fechar" });
      setShowAlert(true);
    } catch {
      setAlertConfig({ type: "error", title: "Erro", message: "Não foi possível criar o local.", buttonText: "Tentar novamente" });
      setShowAlert(true);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Locais</h2>
        <button onClick={refreshData} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">Recarregar</button>
      </div>

      <form onSubmit={handleCreate} className="mb-6 flex gap-3">
        <input
          value={nome} onChange={e => setNome(e.target.value)}
          placeholder="Nome do local"
          className="border px-3 py-2 rounded w-64"
        />
        <select
          value={unidadeId} onChange={e => setUnidadeId(e.target.value)}
          className="border px-3 py-2 rounded w-64 bg-white"
        >
          <option value="">Selecione a unidade</option>
          {unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}</option>)}
        </select>
        <button
          type="submit"
          disabled={isMutating}
          className="bg-primary text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-60"
        >
          {isMutating ? "Salvando…" : "Criar"}
        </button>
      </form>

      {isLoading ? (
        <p className="text-gray-500">Carregando…</p>
      ) : (
        <div className="space-y-4">
          {locaisAgrupados.map(grp => (
            <div key={grp.unidade.id} className="border rounded">
              <div className="px-3 py-2 bg-gray-50 font-medium">
                {grp.unidade.nome} — <span className="text-gray-500">{grp.unidade.cidade}</span>
              </div>
              {grp.locais.length === 0 ? (
                <div className="px-3 py-2 text-gray-500">Sem locais nesta unidade.</div>
              ) : (
                <ul className="px-3 py-2 divide-y">
                  {grp.locais.map(l => <li key={l.id} className="py-2">{l.nome}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {showAlert && <Alert {...alertConfig} onClose={() => setShowAlert(false)} />}
    </div>
  );
}
