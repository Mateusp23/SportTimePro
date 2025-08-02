/*
  Warnings:

  - Added the required column `clienteId` to the `Aula` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Aula" ADD COLUMN     "clienteId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Aula" ADD CONSTRAINT "Aula_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
