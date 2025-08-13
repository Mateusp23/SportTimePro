"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/app/lib/api";
import { useUser } from "@/app/hooks/useUser";
import { useUnidadesLocais } from "@/app/hooks/useUnidadesLocais";
import AlunosDrawer from "@/app/components/AlunosDrawer";

type Aula = {
  id: string;
  modalidade: string;
  dataHoraInicio: string; // ISO
  dataHoraFim: string;    // ISO
  vagasTotais: number;
  professorId: string;
  unidadeId: string;
  localId: string;
  unidade?: { nome: string };
  local?: { nome: string };
  // opcional: _count?: { agendamentos: number };
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function toInputDate(d: Date) {
  // yyyy-mm-dd
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function brDay(dateISO: string) {
  return new Date(dateISO).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
}
function brTime(dateISO: string) {
  return new Date(dateISO).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export default function AgendamentosPage() {
  const { user: me } = useUser();
  const { unidades, locais } = useUnidadesLocais();
  const [drawer, setDrawer] = useState<{ open: boolean; aulaId: string | null }>({
    open: false,
    aulaId: null
  });
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // filtros
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [unidadeId, setUnidadeId] = useState<string>("");
  const [localId, setLocalId] = useState<string>("");
  const [modalidade, setModalidade] = useState<string>("");
  const [onlyMine, setOnlyMine] = useState<boolean>(true);

  // carregar aulas (sem filtros do backend por enquanto)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get<{ items: Aula[] }>("/aulas", {
          // se depois quiser enviar filtros ao backend:
          // params: { dateStart, dateEnd, unidadeId, localId, modalidade, onlyMine }
        });
        if (alive) setAulas(data.items);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // quando trocar unidade, limpar local
  useEffect(() => {
    setLocalId("");
  }, [unidadeId]);

  const locaisDaUnidade = useMemo(
    () => (unidadeId ? locais.filter((l) => l.unidadeId === unidadeId) : locais),
    [locais, unidadeId]
  );

  // gerar lista de modalidades únicas (para o select)
  const modalidades = useMemo(() => {
    const set = new Set(aulas.map((a) => a.modalidade?.toUpperCase().trim()).filter(Boolean));
    return Array.from(set).sort();
  }, [aulas]);

  const filteredAulas = useMemo(() => {
    if (!aulas.length) return [];

    const start = startOfDay(new Date(dateStart || ""));
    const end = endOfDay(new Date(dateEnd || ""));

    return aulas
      .filter((a) => {
        const inicio = new Date(a.dataHoraInicio);
        if (inicio < start || inicio > end) return false;

        if (unidadeId && a.unidadeId !== unidadeId) return false;
        if (localId && a.localId !== localId) return false;

        if (modalidade) {
          const aMod = (a.modalidade || "").toUpperCase().trim();
          if (!aMod.includes(modalidade.toUpperCase().trim())) return false;
        }

        if (onlyMine && me?.id && a.professorId !== me.id) return false;

        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime()
      );
  }, [aulas, dateStart, dateEnd, unidadeId, localId, modalidade, onlyMine, me?.id]);

  // agrupado por dia
  const grouped = useMemo(() => {
    const map = new Map<string, Aula[]>();
    for (const a of filteredAulas) {
      const key = brDay(a.dataHoraInicio);
      const arr = map.get(key) || [];
      arr.push(a);
      map.set(key, arr);
    }
    // volta como array ordenado por data
    return Array.from(map.entries()).sort(([d1], [d2]) => {
      const [dd1, mm1, yy1] = d1.split("/").map(Number);
      const [dd2, mm2, yy2] = d2.split("/").map(Number);
      return new Date(yy1!, mm1! - 1, dd1!).getTime() - new Date(yy2!, mm2! - 1, dd2!).getTime();
    });
  }, [filteredAulas]);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-heading font-bold mb-4">Agendamentos</h2>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <input
          type="date"
          value={dateStart}
          onChange={(e) => setDateStart(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={dateEnd}
          onChange={(e) => setDateEnd(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <select
          className="border px-3 py-2 rounded bg-white"
          value={unidadeId}
          onChange={(e) => setUnidadeId(e.target.value)}
          disabled={unidades.length === 0}
        >
          {unidades.length === 0 ? (
            <option value="">Carregando unidades...</option>
          ) : (
            <>
              <option value="">Todas unidades</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </>
          )}
        </select>

        {unidadeId && locaisDaUnidade.length >=2 &&
          <select
            className="border px-3 py-2 rounded bg-white"
            value={localId}
            onChange={(e) => setLocalId(e.target.value)}
            disabled={!unidadeId}
          >
            <option value="">{unidadeId ? "Todos locais" : "Selecione um local"}</option>
            {locaisDaUnidade.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </select>
        }

        <select
          className="border px-3 py-2 rounded bg-white"
          value={modalidade}
          onChange={(e) => setModalidade(e.target.value)}
        >
          <option value="">Modalidade</option>
          {modalidades.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-700 ml-auto">
          <input
            type="checkbox"
            className="accent-primary"
            checked={onlyMine}
            onChange={(e) => setOnlyMine(e.target.checked)}
          />
          Somente minhas aulas
        </label>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <div className="animate-spin h-5 w-5 border-b-2 border-primary rounded-full" />
          Carregando…
        </div>
      ) : grouped.length === 0 ? (
        <p className="text-gray-500">Nenhuma aula encontrada com os filtros aplicados.</p>
      ) : (
        <div className="space-y-4">
          {grouped.map(([dia, aulasDoDia]) => (
            <div key={dia} className="border rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 text-gray-700 font-medium">{dia}</div>
              <ul>
                {aulasDoDia.map((a) => {
                  // caso não tenha count no back ainda:
                  const inscritos = (a as any)?._count?.agendamentos ?? 0;
                  return (
                    <li
                      key={a.id}
                      className="px-4 py-3 flex items-center gap-3 border-t"
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{a.modalidade}</div>
                        <div className="text-sm text-gray-600">
                          {brTime(a.dataHoraInicio)} – {brTime(a.dataHoraFim)} •{" "}
                          {a.unidade?.nome || "Unidade"} / {a.local?.nome || "Local"}
                        </div>
                      </div>
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                        {inscritos}/{a.vagasTotais}
                      </span>
                      <button
                        className="ml-2 bg-primary text-white text-sm px-3 py-1 rounded hover:opacity-90 cursor-pointer"
                        onClick={() => setDrawer({ open: true, aulaId: a.id })}
                      >
                        Ver alunos
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
      <AlunosDrawer
        open={drawer.open}
        aulaId={drawer.aulaId}
        onClose={() => setDrawer({ open: false, aulaId: null })}
      />
    </div>
  );
}
