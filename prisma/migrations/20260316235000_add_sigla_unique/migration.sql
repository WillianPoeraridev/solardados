-- AlterTable: make sigla required and unique
ALTER TABLE "Distribuidora" ALTER COLUMN "sigla" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Distribuidora_sigla_key" ON "Distribuidora"("sigla");
