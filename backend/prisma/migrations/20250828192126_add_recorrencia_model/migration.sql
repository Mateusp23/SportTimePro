-- AlterTable
ALTER TABLE "public"."Aula" ADD COLUMN     "isException" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seriesId" TEXT;

-- CreateTable
CREATE TABLE "public"."Recorrencia" (
    "id" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "localId" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "vagasTotais" INTEGER NOT NULL,
    "regra" JSONB NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recorrencia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Aula" ADD CONSTRAINT "Aula_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "public"."Recorrencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
