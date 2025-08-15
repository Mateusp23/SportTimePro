export type Role = 'ADMIN' | 'PROFESSOR' | 'CLIENTE' | 'ALUNO';

export interface JwtClaims {
  userId: string;
  clienteId: string;
  roles: Role[];
  iat?: number;
  exp?: number;
}

export interface AppUser {
  id: string;
  clienteId: string;
  roles: Role[];
  nome: string;
}
