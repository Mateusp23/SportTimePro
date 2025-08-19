"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/app/store/authStore";
import { useRouter } from "next/navigation";
import { Calendar, Clock, User, Building, CheckCircle, AlertCircle, Home, BookOpen, Users, History, Menu, X, FileText } from "lucide-react";
import api from "@/app/lib/api";


interface Aula {
  id: string;
  nome: string;
  horario: string;
  data: string;
  local: {
    nome: string;
  };
  professor: {
    nome: string;
  };
}

interface StatusVinculo {
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
  professorNome: string;
  academiaNome: string;
  mensagem?: string;
  resposta?: string;
  criadoEm: string;
}

interface Professor {
  id: string;
  nome: string;
  email: string;
  roles: string[];
}

interface Agendamento {
  id: string;
  aula: {
    nome: string;
    dataHoraInicio: string;
    dataHoraFim: string;
    local: { nome: string };
    professor: { nome: string };
  };
  status: 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO';
  criadoEm: string;
}

type DashboardSection = 'inicio' | 'aulas' | 'professores' | 'agendamentos' | 'historico';

export default function DashboardAluno() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<DashboardSection>('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [userInfo, setUserInfo] = useState<{ nome: string; email: string } | null>(null);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [historico, setHistorico] = useState<Agendamento[]>([]);
  const [statusVinculo, setStatusVinculo] = useState<StatusVinculo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDadosAluno();
  }, []);

  const carregarDadosAluno = async () => {
    try {
      setLoading(true);
      
      // Carregar informações completas do usuário
      try {
        const userResponse = await api.get("/auth/me");
        setUserInfo(userResponse.data);
      } catch (error) {
        console.log("Erro ao carregar informações do usuário:", error);
      }
      
      // Carregar status do vínculo
      try {
        const vinculoResponse = await api.get("/solicitacoes-vinculo/status");
        setStatusVinculo(vinculoResponse.data);
      } catch (error) {
        console.log("Aluno ainda não tem vínculo aprovado");
      }
      
      // Carregar dados apenas se o vínculo estiver aprovado
      if (statusVinculo?.status === 'APROVADA') {
        await Promise.all([
          carregarAulas(),
          carregarProfessores(),
          carregarAgendamentos(),
          carregarHistorico()
        ]);
      }
      
    } catch (error) {
      console.error("Erro ao carregar dados do aluno:", error);
    } finally {
      setLoading(false);
    }
  };

  const carregarAulas = async () => {
    try {
      const response = await api.get("/aulas/aluno");
      setAulas(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar aulas:", error);
    }
  };

  const carregarProfessores = async () => {
    try {
      const response = await api.get("/professores/academia");
      setProfessores(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar professores:", error);
    }
  };

  const carregarAgendamentos = async () => {
    try {
      const response = await api.get("/agendamentos/aluno");
      setAgendamentos(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    }
  };

  const carregarHistorico = async () => {
    try {
      const response = await api.get("/agendamentos/aluno/historico");
      setHistorico(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDENTE': return <Clock className="text-yellow-600" size={20} />;
      case 'APROVADA': return <CheckCircle className="text-green-600" size={20} />;
      case 'REJEITADA': return <AlertCircle className="text-red-600" size={20} />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APROVADA': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJEITADA': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'Aguardando resposta';
      case 'APROVADA': return 'Aprovado';
      case 'REJEITADA': return 'Recusado';
      default: return status;
    }
  };

  const renderInicio = () => (
    <div className="space-y-6">
      {/* Mensagem de Boas-vindas */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">
            Olá, {userInfo?.nome || 'Aluno'}! 👋
          </h2>
          <p className="text-xl opacity-90">
            Bem-vindo ao seu dashboard personalizado
          </p>
          <p className="text-lg opacity-75 mt-2">
            Aqui você pode acompanhar suas aulas, professores e agendamentos
          </p>
        </div>
      </div>

      {/* Status do Vínculo */}
      {statusVinculo && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="text-blue-600" size={24} />
            Status do Vínculo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Building className="text-green-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Academia</p>
                <p className="font-medium text-gray-800">{statusVinculo.academiaNome}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <User className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Professor</p>
                <p className="font-medium text-gray-800">{statusVinculo.professorNome}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            {getStatusIcon(statusVinculo.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(statusVinculo.status)}`}>
              {statusVinculo.status === 'PENDENTE' && 'Aguardando Aprovação'}
              {statusVinculo.status === 'APROVADA' && 'Vínculo Aprovado'}
              {statusVinculo.status === 'REJEITADA' && 'Vínculo Rejeitado'}
            </span>
          </div>

          {statusVinculo.mensagem && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Sua mensagem:</strong> {statusVinculo.mensagem}
              </p>
            </div>
          )}

          {statusVinculo.resposta && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Resposta do professor:</strong> {statusVinculo.resposta}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-3">
            Solicitado em: {new Date(statusVinculo.criadoEm).toLocaleString('pt-BR')}
          </p>
        </div>
      )}

      {/* Seção de Solicitações de Vínculo */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="text-purple-600" size={24} />
            Solicitações de Vínculo
          </h2>
          <button
            onClick={() => router.push('/dashboard/solicitacoes-aluno')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <FileText size={16} />
            Gerenciar Solicitações
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          {statusVinculo ? (
            <>
              Você possui uma solicitação de vínculo com status: <strong>{getStatusText(statusVinculo.status)}</strong>
            </>
          ) : (
            "Você ainda não possui solicitações de vínculo. Clique no botão acima para criar sua primeira solicitação."
          )}
        </p>

        {statusVinculo && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  <strong>Professor:</strong> {statusVinculo.professorNome}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Academia:</strong> {statusVinculo.academiaNome}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong> {getStatusText(statusVinculo.status)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {new Date(statusVinculo.criadoEm).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cards de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="text-purple-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Próximas Aulas</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{aulas.length}</p>
          <p className="text-sm text-gray-600">aulas agendadas</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <User className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Professor</h3>
          </div>
          <p className="text-lg font-medium text-gray-800">
            {statusVinculo?.professorNome || "Não definido"}
          </p>
          <p className="text-sm text-gray-600">
            {statusVinculo?.status === 'APROVADA' ? "Vínculo ativo" : "Aguardando aprovação"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Building className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Academia</h3>
          </div>
          <p className="text-lg font-medium text-gray-800">
            {statusVinculo?.academiaNome || "Não definida"}
          </p>
          <p className="text-sm text-gray-600">
            {statusVinculo?.status === 'APROVADA' ? "Membro ativo" : "Aguardando aprovação"}
          </p>
        </div>
      </div>
    </div>
  );

  const renderAulas = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="text-purple-600" size={24} />
        Minhas Aulas
      </h2>
      
      {aulas.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-500 mt-2">
            {statusVinculo?.status === 'APROVADA' 
              ? "Você ainda não tem aulas agendadas."
              : "Aguarde a aprovação do seu vínculo para ver suas aulas."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {aulas.map((aula) => (
            <div key={aula.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">{aula.nome}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{new Date(aula.horario).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{new Date(aula.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building size={16} />
                      <span>{aula.local.nome}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfessores = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Users className="text-blue-600" size={24} />
        Professores da Academia
      </h2>
      
      {professores.length === 0 ? (
        <div className="text-center py-8">
          <Users className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-500 mt-2">
            {statusVinculo?.status === 'APROVADA' 
              ? "Nenhum professor encontrado."
              : "Aguarde a aprovação do seu vínculo para ver os professores."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professores.map((professor) => (
            <div key={professor.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
              <div className="flex items-center gap-3 mb-3">
                <User className="text-blue-600" size={20} />
                <div>
                  <h3 className="font-medium text-gray-800">{professor.nome}</h3>
                  <p className="text-sm text-gray-600">{professor.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {professor.roles.map((role) => (
                  <span key={role} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAgendamentos = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="text-green-600" size={24} />
        Meus Agendamentos
      </h2>
      
      {agendamentos.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-500 mt-2">
            {statusVinculo?.status === 'APROVADA' 
              ? "Você ainda não tem agendamentos."
              : "Aguarde a aprovação do seu vínculo para fazer agendamentos."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {agendamentos.map((agendamento) => (
            <div key={agendamento.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">{agendamento.aula.nome}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{new Date(agendamento.aula.dataHoraInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{new Date(agendamento.aula.dataHoraInicio).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building size={16} />
                      <span>{agendamento.aula.local.nome}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  agendamento.status === 'CONFIRMADO' ? 'bg-green-100 text-green-800 border-green-200' :
                  agendamento.status === 'CANCELADO' ? 'bg-red-100 text-red-800 border-red-200' :
                  'bg-blue-100 text-blue-800 border-blue-200'
                }`}>
                  {agendamento.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderHistorico = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <History className="text-orange-600" size={24} />
        Histórico de Agendamentos
      </h2>
      
      {historico.length === 0 ? (
        <div className="text-center py-8">
          <History className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-500 mt-2">
            {statusVinculo?.status === 'APROVADA' 
              ? "Nenhum histórico encontrado."
              : "Aguarde a aprovação do seu vínculo para ver o histórico."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {historico.map((agendamento) => (
            <div key={agendamento.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">{agendamento.aula.nome}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{new Date(agendamento.aula.dataHoraInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{new Date(agendamento.aula.dataHoraInicio).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building size={16} />
                      <span>{agendamento.aula.local.nome}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  agendamento.status === 'CONCLUIDO' ? 'bg-green-100 text-green-800 border-green-200' :
                  agendamento.status === 'CANCELADO' ? 'bg-red-100 text-red-800 border-red-200' :
                  'bg-blue-100 text-blue-800 border-blue-200'
                }`}>
                  {agendamento.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Agendado em: {new Date(agendamento.criadoEm).toLocaleString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return renderInicio();
      case 'aulas':
        return renderAulas();
      case 'professores':
        return renderProfessores();
      case 'agendamentos':
        return renderAgendamentos();
      case 'historico':
        return renderHistorico();
      default:
        return renderInicio();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Menu do Aluno</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveSection('inicio')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeSection === 'inicio' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home size={20} />
            Início
          </button>
          
          <button
            onClick={() => setActiveSection('aulas')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeSection === 'aulas' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BookOpen size={20} />
            Aulas
          </button>
          
          <button
            onClick={() => setActiveSection('professores')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeSection === 'professores' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users size={20} />
            Professores
          </button>
          
          <button
            onClick={() => setActiveSection('agendamentos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeSection === 'agendamentos' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar size={20} />
            Agendamentos
          </button>
          
          <button
            onClick={() => setActiveSection('historico')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeSection === 'historico' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <History size={20} />
            Histórico
          </button>
          
          <button
            onClick={() => router.push('/dashboard/solicitacoes-aluno')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-700 hover:bg-gray-100"
          >
            <FileText size={20} />
            Minhas Solicitações
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {activeSection === 'inicio' && 'Início'}
                  {activeSection === 'aulas' && 'Minhas Aulas'}
                  {activeSection === 'professores' && 'Professores da Academia'}
                  {activeSection === 'agendamentos' && 'Meus Agendamentos'}
                  {activeSection === 'historico' && 'Histórico de Agendamentos'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Bem-vindo ao seu dashboard, {userInfo?.nome || 'Aluno'}! 👋
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Bem-vindo,</p>
              <p className="font-medium text-gray-800">{userInfo?.nome || 'Aluno'}</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
