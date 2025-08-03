/*
  Warnings:

  - The values [CONFIRMADO] on the enum `StatusAgendamento` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `atualizadoEm` to the `Agendamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `atualizadoEm` to the `Aula` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `modalidade` on the `Aula` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."StatusAgendamento_new" AS ENUM ('ATIVO', 'CANCELADO', 'CONCLUIDO');
ALTER TABLE "public"."Agendamento" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Agendamento" ALTER COLUMN "status" TYPE "public"."StatusAgendamento_new" USING ("status"::text::"public"."StatusAgendamento_new");
ALTER TYPE "public"."StatusAgendamento" RENAME TO "StatusAgendamento_old";
ALTER TYPE "public"."StatusAgendamento_new" RENAME TO "StatusAgendamento";
DROP TYPE "public"."StatusAgendamento_old";
ALTER TABLE "public"."Agendamento" ALTER COLUMN "status" SET DEFAULT 'ATIVO';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Agendamento" ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ATIVO';

-- AlterTable
ALTER TABLE "Aula" 
ADD COLUMN IF NOT EXISTS "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Se a coluna 'modalidade' já existe, não recriar
ALTER TABLE "Aula" ALTER COLUMN "modalidade" TYPE TEXT USING "modalidade"::TEXT;
