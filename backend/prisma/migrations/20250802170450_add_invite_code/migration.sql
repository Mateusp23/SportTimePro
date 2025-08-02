/*
  Warnings:

  - A unique constraint covering the columns `[inviteCode]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Cliente" ADD COLUMN     "inviteCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_inviteCode_key" ON "public"."Cliente"("inviteCode");
