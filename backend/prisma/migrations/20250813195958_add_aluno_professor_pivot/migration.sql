-- CreateTable
CREATE TABLE "public"."AlunoProfessor" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlunoProfessor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlunoProfessor_professorId_idx" ON "public"."AlunoProfessor"("professorId");

-- CreateIndex
CREATE INDEX "AlunoProfessor_alunoId_idx" ON "public"."AlunoProfessor"("alunoId");

-- CreateIndex
CREATE INDEX "AlunoProfessor_clienteId_idx" ON "public"."AlunoProfessor"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "AlunoProfessor_clienteId_alunoId_professorId_key" ON "public"."AlunoProfessor"("clienteId", "alunoId", "professorId");

-- AddForeignKey
ALTER TABLE "public"."AlunoProfessor" ADD CONSTRAINT "AlunoProfessor_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AlunoProfessor" ADD CONSTRAINT "AlunoProfessor_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AlunoProfessor" ADD CONSTRAINT "AlunoProfessor_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
