"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/app/lib/api";
import { useUnidadesLocais } from "@/app/hooks/useUnidadesLocais";

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
  professor?: { nome: string };
  _count?: { agendamentos: number };
  agendado?: boolean; // Se o aluno está agendado nesta aula
};

type Agendamento = {
  id: string;
  aulaId: string;
  alunoId: string;
  status: 'CONFIRMADO' | 'PENDENTE' | 'CANCELADO';
  aula?: Aula;
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

export default function AgendamentosAlunoPage() {
  const { unidades, locais } = useUnidadesLocais();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [meusAgendamentos, setMeusAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAgendamento, setIsLoadingAgendamento] = useState(false);

  // filtros
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [unidadeId, setUnidadeId] = useState<string>("");
  const [localId, setLocalId] = useState<string>("");
  const [modalidade, setModalidade] = useState<string>("");
  const [filtroAgendamento, setFiltroAgendamento] = useState<"todas" | "agendadas" | "disponiveis">("todas");

  // carregar aulas disponíveis e meus agendamentos
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setIsLoading(true);
        
        // Buscar aulas disponíveis
        const [aulasResponse, agendamentosResponse] = await Promise.all([
          api.get<{ items: Aula[] }>("/aulas", {
            params: { 
              dateStart: dateStart || new Date().toISOString().split('T')[0],
              dateEnd: dateEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
          }),
          api.get<Agendamento[]>("/agendamentos/aluno").catch(() => ({ data: [] }))
        ]);

        if (alive) {
          setAulas(aulasResponse.data.items);
          setMeusAgendamentos(agendamentosResponse.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [dateStart, dateEnd]);

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

  // Marcar aulas que o aluno está agendado
  const aulasComAgendamento = useMemo(() => {
    const agendamentosIds = new Set(meusAgendamentos.map(a => a.aulaId));
    return aulas.map(aula => ({
      ...aula,
      agendado: agendamentosIds.has(aula.id)
    }));
  }, [aulas, meusAgendamentos]);

  const filteredAulas = useMemo(() => {
    if (!aulasComAgendamento.length) return [];

    const start = dateStart ? startOfDay(new Date(dateStart)) : startOfDay(new Date());
    const end = dateEnd ? endOfDay(new Date(dateEnd)) : endOfDay(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

    return aulasComAgendamento
      .filter((a) => {
        const inicio = new Date(a.dataHoraInicio);
        if (inicio < start || inicio > end) return false;

        if (unidadeId && a.unidadeId !== unidadeId) return false;
        if (localId && a.localId !== localId) return false;

        if (modalidade) {
          const aMod = (a.modalidade || "").toUpperCase().trim();
          if (!aMod.includes(modalidade.toUpperCase().trim())) return false;
        }

        // Filtrar por status de agendamento
        if (filtroAgendamento === "agendadas" && !a.agendado) return false;
        if (filtroAgendamento === "disponiveis" && a.agendado) return false;

        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime()
      );
  }, [aulasComAgendamento, dateStart, dateEnd, unidadeId, localId, modalidade, filtroAgendamento]);

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

  // Função para agendar aula
  const agendarAula = async (aulaId: string) => {
    try {
      setIsLoadingAgendamento(true);
      await api.post("/agendamentos", { aulaId });
      
      // Recarregar agendamentos
      const response = await api.get<Agendamento[]>("/agendamentos/aluno");
      setMeusAgendamentos(response.data);
      
      // Atualizar status da aula
      setAulas(prev => prev.map(aula => 
        aula.id === aulaId ? { ...aula, agendado: true } : aula
      ));
      
    } catch (error: unknown) {
      console.error("Erro ao agendar aula:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao agendar aula";
      alert(errorMessage);
    } finally {
      setIsLoadingAgendamento(false);
    }
  };

  // Função para cancelar agendamento
  const cancelarAgendamento = async (aulaId: string) => {
    try {
      setIsLoadingAgendamento(true);
      
      // Encontrar o agendamento
      const agendamento = meusAgendamentos.find(a => a.aulaId === aulaId);
      if (!agendamento) return;
      
      await api.delete(`/agendamentos/${agendamento.id}`);
      
      // Recarregar agendamentos
      const response = await api.get<Agendamento[]>("/agendamentos/aluno");
      setMeusAgendamentos(response.data);
      
      // Atualizar status da aula
      setAulas(prev => prev.map(aula => 
        aula.id === aulaId ? { ...aula, agendado: false } : aula
      ));
      
    } catch (error: unknown) {
      console.error("Erro ao cancelar agendamento:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao cancelar agendamento";
      alert(errorMessage);
    } finally {
      setIsLoadingAgendamento(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-heading font-bold mb-4">Meus Agendamentos</h2>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <input
          type="date"
          value={dateStart}
          onChange={(e) => setDateStart(e.target.value)}
          className="border px-3 py-2 rounded"
          placeholder="Data inicial"
        />
        <input
          type="date"
          value={dateEnd}
          onChange={(e) => setDateEnd(e.target.value)}
          className="border px-3 py-2 rounded"
          placeholder="Data final"
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

        {unidadeId && locaisDaUnidade.length >= 2 && (
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
        )}

        <select
          className="border px-3 py-2 rounded bg-white"
          value={modalidade}
          onChange={(e) => setModalidade(e.target.value)}
        >
          <option value="">Todas modalidades</option>
          {modalidades.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          className="border px-3 py-2 rounded bg-white"
          value={filtroAgendamento}
          onChange={(e) => setFiltroAgendamento(e.target.value as "todas" | "agendadas" | "disponiveis")}
        >
          <option value="todas">Todas as aulas</option>
          <option value="agendadas">Minhas aulas agendadas</option>
          <option value="disponiveis">Aulas disponíveis</option>
        </select>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <div className="animate-spin h-5 w-5 border-b-2 border-primary rounded-full" />
          Carregando…
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Nenhuma aula encontrada com os filtros aplicados.</p>
          <p className="text-sm text-gray-400">
            {filtroAgendamento === "agendadas" 
              ? "Você ainda não tem aulas agendadas neste período."
              : "Não há aulas disponíveis neste período."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([dia, aulasDoDia]) => (
            <div key={dia} className="border rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 text-gray-700 font-medium">{dia}</div>
              <ul>
                {aulasDoDia.map((a) => {
                  const inscritos = a._count?.agendamentos ?? 0;
                  const lotacao = inscritos / a.vagasTotais;
                  let badgeColor = "bg-green-50 text-green-700";
                  if (lotacao >= 1) badgeColor = "bg-red-50 text-red-700"; // lotado
                  else if (lotacao >= 0.8) badgeColor = "bg-yellow-50 text-yellow-700"; // quase lotado

                  const isLotado = lotacao >= 1;
                  const isAgendado = a.agendado;

                  return (
                    <li
                      key={a.id}
                      className="px-4 py-3 flex items-center gap-3 border-t"
                    >
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          {a.modalidade}
                          {isAgendado && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Agendado
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {brTime(a.dataHoraInicio)} – {brTime(a.dataHoraFim)} •{" "}
                          {a.unidade?.nome || "Unidade"} / {a.local?.nome || "Local"}
                        </div>
                        {a.professor?.nome && (
                          <div className="text-xs text-gray-500">
                            Professor: {a.professor.nome}
                          </div>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${badgeColor}`}>
                        {inscritos}/{a.vagasTotais}
                      </span>
                      <button
                        className={`ml-2 text-sm px-3 py-1 rounded font-medium transition-colors ${
                          isAgendado
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : isLotado
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-primary text-white hover:opacity-90"
                        }`}
                        onClick={() => {
                          if (isAgendado) {
                            cancelarAgendamento(a.id);
                          } else if (!isLotado) {
                            agendarAula(a.id);
                          }
                        }}
                        disabled={isLoadingAgendamento || isLotado}
                      >
                        {isLoadingAgendamento ? (
                          <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                        ) : isAgendado ? (
                          "Cancelar"
                        ) : isLotado ? (
                          "Lotado"
                        ) : (
                          "Agendar"
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Resumo */}
      {meusAgendamentos.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Resumo dos Meus Agendamentos</h3>
          <p className="text-sm text-blue-700">
            Você tem <strong>{meusAgendamentos.length}</strong> aula(s) agendada(s) no total.
          </p>
        </div>
      )}
    </div>
  );
}
