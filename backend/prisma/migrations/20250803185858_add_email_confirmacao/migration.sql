-- AlterTable
ALTER TABLE "public"."Usuario" ADD COLUMN     "emailConfirmado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tokenConfirmacao" TEXT,
ADD COLUMN     "tokenExpiraEm" TIMESTAMP(3);
