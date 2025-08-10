"use client";

import { useAgendamentos } from "@/app/hooks/useAgendamentos";
import { useUnidadesLocais } from "@/app/hooks/useUnidadesLocais";
import AlunosDrawer from "@/app/components/AlunosDrawer";
import { useMemo, useState } from "react";

export default function AgendamentosPage() {
  const { unidades, locais } = useUnidadesLocais();
  const { groupedByDay, filtros, setFiltros, isLoading, error } = useAgendamentos({
    onlyMine: true, // começa mostrando "minhas aulas"; pode mudar no toggle
  });

  const [drawerAulaId, setDrawerAulaId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const dias = useMemo(() => [...groupedByDay.entries()], [groupedByDay]);

  const openAlunos = (id: string) => {
    setDrawerAulaId(id);
    setDrawerOpen(true);
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Agendamentos</h2>
        <div className="flex gap-2 items-center">
          {/* Período */}
          <input
            type="date"
            value={filtros.from.slice(0, 10)}
            onChange={(e) =>
              setFiltros((f) => ({
                ...f,
                from: new Date(`${e.target.value}T00:00:00`).toISOString(),
              }))
            }
            className="border px-3 py-2 rounded"
          />
          <input
            type="date"
            value={filtros.to.slice(0, 10)}
            onChange={(e) =>
              setFiltros((f) => ({
                ...f,
                to: new Date(`${e.target.value}T23:59:59`).toISOString(),
              }))
            }
            className="border px-3 py-2 rounded"
          />

          {/* Unidade / Local */}
          <select
            className="border px-3 py-2 rounded bg-white"
            value={filtros.unidadeId ?? ""}
            onChange={(e) =>
              setFiltros((f) => ({
                ...f,
                unidadeId: e.target.value || undefined,
                localId: undefined,
              }))
            }
          >
            <option value="">Todas unidades</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>

          <select
            className="border px-3 py-2 rounded bg-white"
            value={filtros.localId ?? ""}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, localId: e.target.value || undefined }))
            }
          >
            <option value="">Todos locais</option>
            {locais
              .filter((l) => !filtros.unidadeId || l.unidadeId === filtros.unidadeId)
              .map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
          </select>

          {/* Modalidade */}
          <input
            className="border px-3 py-2 rounded"
            placeholder="Modalidade"
            value={filtros.modalidade ?? ""}
            onChange={(e) =>
              setFiltros((f) => ({
                ...f,
                modalidade: e.target.value || undefined,
              }))
            }
          />

          {/* Somente minhas */}
          <label className="flex items-center gap-2 text-sm ml-2">
            <input
              type="checkbox"
              checked={!!filtros.onlyMine}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, onlyMine: e.target.checked }))
              }
            />
            Somente minhas aulas
          </label>
        </div>
      </div>

      {/* Estado */}
      {isLoading && <p className="text-gray-500">Carregando…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Lista por dia */}
      {!isLoading && !error && (
        <div className="space-y-6">
          {dias.length === 0 && (
            <div className="text-gray-500">Nenhuma aula no período.</div>
          )}

          {dias.map(([day, list]) => (
            <div key={day} className="border rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 font-medium">
                {new Date(day).toLocaleDateString()}
              </div>

              <ul className="divide-y">
                {list.map((aula) => {
                  const ini = new Date(aula.dataHoraInicio);
                  const fim = new Date(aula.dataHoraFim);
                  const lotada = aula.inscritosCount >= aula.vagasTotais;

                  return (
                    <li
                      key={aula.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold">{aula.modalidade}</div>
                        <div className="text-sm text-gray-600">
                          {ini.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" – "}
                          {fim.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" • "}
                          {aula.unidade?.nome} / {aula.local?.nome}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${lotada
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                            }`}
                          title="Inscritos / Vagas"
                        >
                          {aula.inscritosCount}/{aula.vagasTotais}
                        </span>

                        <button
                          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => openAlunos(aula.id)}
                        >
                          Ver alunos
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      <AlunosDrawer
        aulaId={drawerAulaId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
