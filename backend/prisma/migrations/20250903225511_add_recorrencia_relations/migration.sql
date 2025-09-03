/*
  Warnings:

  - Added the required column `clienteId` to the `Recorrencia` table without a default value. This is not possible if the table is not empty.

*/

-- Primeiro, adiciona a coluna como nullable
ALTER TABLE "public"."Recorrencia" ADD COLUMN "clienteId" TEXT;

-- Atualiza registros existentes com o clienteId do primeiro professor encontrado
UPDATE "public"."Recorrencia" 
SET "clienteId" = (
  SELECT u."clienteId" 
  FROM "public"."Usuario" u 
  WHERE u.id = "Recorrencia"."professorId" 
  LIMIT 1
) 
WHERE "clienteId" IS NULL;

-- Agora torna a coluna obrigatória
ALTER TABLE "public"."Recorrencia" ALTER COLUMN "clienteId" SET NOT NULL;

-- Adiciona a coluna janelaGeracaoDias
ALTER TABLE "public"."Recorrencia" ADD COLUMN "janelaGeracaoDias" INTEGER NOT NULL DEFAULT 60;

-- AddForeignKey
ALTER TABLE "public"."Recorrencia" ADD CONSTRAINT "Recorrencia_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recorrencia" ADD CONSTRAINT "Recorrencia_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "public"."Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recorrencia" ADD CONSTRAINT "Recorrencia_localId_fkey" FOREIGN KEY ("localId") REFERENCES "public"."Local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recorrencia" ADD CONSTRAINT "Recorrencia_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
