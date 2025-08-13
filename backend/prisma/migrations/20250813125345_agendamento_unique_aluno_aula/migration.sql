/*
  Warnings:

  - A unique constraint covering the columns `[alunoId,aulaId]` on the table `Agendamento` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Agendamento_alunoId_aulaId_key" ON "public"."Agendamento"("alunoId", "aulaId");
