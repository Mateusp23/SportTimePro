-- AlterTable
ALTER TABLE "public"."Usuario" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "dataNascimento" TIMESTAMP(3),
ADD COLUMN     "endereco" TEXT,
ADD COLUMN     "preferencias" JSONB,
ADD COLUMN     "telefone" TEXT;
