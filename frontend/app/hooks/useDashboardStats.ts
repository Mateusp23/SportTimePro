import { useState, useCallback } from "react";
import api from "@/app/lib/api";

export interface DashboardStats {
  aulasAtivas: number;
  totalAlunos: number;
  solicitacoesPendentes: number;
  proximasAulas?: number; // Para alunos
  professorVinculado?: string; // Para alunos
  academiaVinculada?: string; // Para alunos
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarEstatisticas = useCallback(async (professorId?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados em paralelo para melhor performance
      const [aulasResponse, alunosResponse, solicitacoesResponse] = await Promise.all([
        // Buscar aulas ativas (futuras)
        api.get("/aulas", {
          params: {
            onlyMine: true,
            dateStart: new Date().toISOString().split('T')[0], // Hoje
            dateEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +30 dias
          }
        }),
        // Buscar apenas alunos vinculados ao professor
        professorId 
          ? api.get(`/professores/${professorId}/alunos`, { params: { pageSize: 1000 } })
          : Promise.resolve({ data: { total: 0 } }),
        // Buscar solicitações pendentes
        api.get("/solicitacoes-vinculo")
      ]);

      const aulasAtivas = aulasResponse.data.items?.length || 0;
      const totalAlunos = alunosResponse.data.total || 0; // Usar total em vez de length
      const solicitacoesPendentes = solicitacoesResponse.data.filter((s: any) => s.status === 'PENDENTE').length || 0;

      setStats({
        aulasAtivas,
        totalAlunos,
        solicitacoesPendentes
      });

    } catch (err: any) {
      console.error("Erro ao carregar estatísticas:", err);
      setError("Erro ao carregar estatísticas do dashboard");
      
      // Fallback com valores padrão
      setStats({
        aulasAtivas: 0,
        totalAlunos: 0,
        solicitacoesPendentes: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarEstatisticasAluno = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados específicos para alunos
      const [aulasResponse, vinculoResponse] = await Promise.all([
        // Buscar próximas aulas do aluno
        api.get("/aulas/aluno"),
        // Verificar status do vínculo
        api.get("/solicitacoes-vinculo/status").catch(() => ({ data: null })) // Pode não ter vínculo ainda
      ]);

      const proximasAulas = aulasResponse.data?.length || 0;
      const vinculo = vinculoResponse.data;

      setStats({
        aulasAtivas: 0, // Não aplicável para alunos
        totalAlunos: 0, // Não aplicável para alunos
        solicitacoesPendentes: 0, // Não aplicável para alunos
        proximasAulas,
        professorVinculado: vinculo?.professorNome || undefined,
        academiaVinculada: vinculo?.academiaNome || undefined
      });

    } catch (err: any) {
      console.error("Erro ao carregar estatísticas do aluno:", err);
      setError("Erro ao carregar dados do aluno");
      
      // Fallback com valores padrão
      setStats({
        aulasAtivas: 0,
        totalAlunos: 0,
        solicitacoesPendentes: 0,
        proximasAulas: 0,
        professorVinculado: undefined,
        academiaVinculada: undefined
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback((professorId?: string) => {
    carregarEstatisticas(professorId);
  }, [carregarEstatisticas]);

  const refreshStatsAluno = useCallback(() => {
    carregarEstatisticasAluno();
  }, [carregarEstatisticasAluno]);

  return {
    stats,
    loading,
    error,
    carregarEstatisticas,
    carregarEstatisticasAluno,
    refreshStats,
    refreshStatsAluno
  };
}
