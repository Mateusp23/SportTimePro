"use client";

import { useAuthStore } from "@/app/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  LogOut, 
  CalendarDays, 
  Home, 
  GraduationCap, 
  MapPin, 
  BookOpen,
  UserPlus,
  Building,
  Menu,
  X,
  Bell
} from "lucide-react";
import { useUserInfo } from "@/app/hooks/useUserInfo";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userInfo } = useUserInfo();

  useEffect(() => {
    if (!token) router.push("/auth/login");
  }, [token, router]);

  // Determinar quais itens do menu mostrar baseado no tipo de usuário
  const isAdmin = user?.roles.includes('ADMIN');
  const isProfessor = user?.roles.includes('PROFESSOR');
  const isAluno = user?.roles.includes('ALUNO');

  // Função para determinar se o item está ativo
  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-blue-600">SportTimePro</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {/* Menu para todos os usuários */}
          <Link 
            href="/dashboard" 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/dashboard') 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home size={20} /> Início
          </Link>
          
          {/* Menu para Professores e Admin */}
          {(isProfessor || isAdmin) && (
            <>
              <Link 
                href="/dashboard/aulas" 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive('/dashboard/aulas') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BookOpen size={20} /> Gerenciar Aulas
              </Link>
              <Link 
                href="/dashboard/agendamentos" 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive('/dashboard/agendamentos') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CalendarDays size={20} /> Gerenciar Agendamentos
              </Link>
              <Link 
                href="/dashboard/alunos" 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive('/dashboard/alunos') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserPlus size={20} /> Gerenciar Alunos
              </Link>
              <Link 
                href="/dashboard/solicitacoes" 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive('/dashboard/solicitacoes') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell size={20} /> Solicitações de Vínculo
              </Link>
            </>
          )}
          
          {/* Menu apenas para Admin */}
          {isAdmin && (
            <>
              <Link 
                href="/dashboard/professores" 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive('/dashboard/professores') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <GraduationCap size={20} /> Gerenciar Professores
              </Link>
              <Link 
                href="/dashboard/unidades" 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive('/dashboard/unidades') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Building size={20} /> Gerenciar Unidades
              </Link>
              <Link 
                href="/dashboard/locais" 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive('/dashboard/locais') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MapPin size={20} /> Gerenciar Locais
              </Link>
            </>
          )}

          {/* Menu para Alunos */}
          {isAluno && (
            <>
              <Link 
                href="/dashboard/aulas-aluno" 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive('/dashboard/aulas-aluno') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BookOpen size={20} /> Minhas Aulas
              </Link>
              <Link 
                href="/dashboard/agendamentos-aluno" 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive('/dashboard/agendamentos-aluno') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CalendarDays size={20} /> Meus Agendamentos
              </Link>
              <Link 
                href="/dashboard/solicitacoes-aluno" 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive('/dashboard/solicitacoes-aluno') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell size={20} /> Minhas Solicitações
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
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
                  {pathname === '/dashboard/aulas' && 'Gerenciar Aulas'}
                  {pathname === '/dashboard/alunos' && 'Gerenciar Alunos'}
                  {pathname === '/dashboard/agendamentos' && 'Gerenciar Agendamentos'}
                  {pathname === '/dashboard/professores' && 'Gerenciar Professores'}
                  {pathname === '/dashboard/unidades' && 'Gerenciar Unidades'}
                  {pathname === '/dashboard/locais' && 'Gerenciar Locais'}
                  {pathname === '/dashboard/solicitacoes' && 'Solicitações de Vínculo'}
                  {pathname === '/dashboard/aulas-aluno' && 'Minhas Aulas'}
                  {pathname === '/dashboard/agendamentos-aluno' && 'Meus Agendamentos'}
                  {pathname === '/dashboard/solicitacoes-aluno' && 'Minhas Solicitações'}
                  {pathname === '/dashboard' && 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Bem-vindo ao SportTimePro, {userInfo?.nome || 'Usuário'}! 👋
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
