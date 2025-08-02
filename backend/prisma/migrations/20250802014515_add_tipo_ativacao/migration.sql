-- CreateEnum
CREATE TYPE "public"."TipoAtivacao" AS ENUM ('ONLINE', 'MANUAL');

-- AlterTable
ALTER TABLE "public"."Assinatura" ADD COLUMN     "tipoAtivacao" "public"."TipoAtivacao" NOT NULL DEFAULT 'ONLINE';
