-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ALUNO', 'PROFESSOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."Modalidade" AS ENUM ('FUTEVOLEI', 'NATACAO', 'CT');

-- CreateEnum
CREATE TYPE "public"."StatusAssinatura" AS ENUM ('ATIVO', 'INATIVO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "public"."StatusAgendamento" AS ENUM ('CONFIRMADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "public"."Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'ALUNO',
    "clienteId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Plano" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "duracaoDias" INTEGER NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "clienteId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Assinatura" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "status" "public"."StatusAssinatura" NOT NULL,
    "renovacaoAutomatica" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Assinatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Unidade" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Unidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Local" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,

    CONSTRAINT "Local_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Aula" (
    "id" TEXT NOT NULL,
    "modalidade" "public"."Modalidade" NOT NULL,
    "professorId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "localId" TEXT NOT NULL,
    "dataHoraInicio" TIMESTAMP(3) NOT NULL,
    "dataHoraFim" TIMESTAMP(3) NOT NULL,
    "vagasTotais" INTEGER NOT NULL,

    CONSTRAINT "Aula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Agendamento" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "aulaId" TEXT NOT NULL,
    "status" "public"."StatusAgendamento" NOT NULL DEFAULT 'CONFIRMADO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IndisponibilidadeProfessor" (
    "id" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndisponibilidadeProfessor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "public"."Usuario"("email");

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Plano" ADD CONSTRAINT "Plano_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assinatura" ADD CONSTRAINT "Assinatura_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assinatura" ADD CONSTRAINT "Assinatura_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "public"."Plano"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Unidade" ADD CONSTRAINT "Unidade_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Local" ADD CONSTRAINT "Local_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "public"."Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Aula" ADD CONSTRAINT "Aula_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Aula" ADD CONSTRAINT "Aula_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "public"."Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Aula" ADD CONSTRAINT "Aula_localId_fkey" FOREIGN KEY ("localId") REFERENCES "public"."Local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Agendamento" ADD CONSTRAINT "Agendamento_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Agendamento" ADD CONSTRAINT "Agendamento_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "public"."Aula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IndisponibilidadeProfessor" ADD CONSTRAINT "IndisponibilidadeProfessor_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
