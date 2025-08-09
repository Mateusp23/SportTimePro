// types/types.ts
export type UserRole = "ADMIN" | "PROFESSOR" | "ALUNO" | "CLIENTE";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  roles: UserRole[];
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
}

export interface Local {
  id: string;
  nome: string;
  unidadeId: string;
}
