// types/types.ts
export type UserRole = "ADMIN" | "PROFESSOR" | "ALUNO" | "CLIENTE";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  roles: UserRole[];
  telefone?: string;
  dataNascimento?: string;
  endereco?: string;
  avatarUrl?: string;
  preferencias?: {
    notificacoes?: boolean;
    idioma?: string;
    tema?: 'claro' | 'escuro';
    [key: string]: any;
  };
}

export interface Aula {
  id: string;
  modalidade: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  vagasTotais: number;
  professorId: string;
  unidadeId: string;
  localId: string;
  professor?: { nome: string };
  unidade?: { nome: string };
  local?: { nome: string };
}

export interface Unidade {
  id: string;
  nome: string;
  cidade: string;
}

export interface Local {
  id: string;
  nome: string;
  unidadeId: string;
}
