/*
  Warnings:

  - You are about to drop the column `role` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Usuario" DROP COLUMN "role",
ADD COLUMN     "roles" "public"."Role"[] DEFAULT ARRAY[]::"public"."Role"[];
