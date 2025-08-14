-- CreateEnum
CREATE TYPE "public"."StatusSolicitacao" AS ENUM ('PENDENTE', 'APROVADA', 'REJEITADA');

-- CreateTable
CREATE TABLE "public"."SolicitacaoVinculo" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "status" "public"."StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
    "mensagem" TEXT,
    "resposta" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondidoEm" TIMESTAMP(3),

    CONSTRAINT "SolicitacaoVinculo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SolicitacaoVinculo_professorId_idx" ON "public"."SolicitacaoVinculo"("professorId");

-- CreateIndex
CREATE INDEX "SolicitacaoVinculo_alunoId_idx" ON "public"."SolicitacaoVinculo"("alunoId");

-- CreateIndex
CREATE INDEX "SolicitacaoVinculo_clienteId_idx" ON "public"."SolicitacaoVinculo"("clienteId");

-- CreateIndex
CREATE INDEX "SolicitacaoVinculo_status_idx" ON "public"."SolicitacaoVinculo"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitacaoVinculo_clienteId_alunoId_professorId_key" ON "public"."SolicitacaoVinculo"("clienteId", "alunoId", "professorId");

-- AddForeignKey
ALTER TABLE "public"."SolicitacaoVinculo" ADD CONSTRAINT "SolicitacaoVinculo_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SolicitacaoVinculo" ADD CONSTRAINT "SolicitacaoVinculo_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SolicitacaoVinculo" ADD CONSTRAINT "SolicitacaoVinculo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
