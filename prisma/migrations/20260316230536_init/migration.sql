-- CreateTable
CREATE TABLE "Distribuidora" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "sigla" TEXT,
    "estados" TEXT[],
    "tarifaResidencial" DOUBLE PRECISION NOT NULL,
    "dataUltimoReajuste" TIMESTAMP(3),
    "bandeiraTarifaria" TEXT NOT NULL DEFAULT 'verde',
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Distribuidora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Municipio" (
    "id" SERIAL NOT NULL,
    "codigoIbge" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "irradiacaoMedia" DOUBLE PRECISION NOT NULL,
    "distribuidoraId" INTEGER NOT NULL,
    "consumoMedioKwh" DOUBLE PRECISION,
    "populacao" INTEGER,
    "domicilios" INTEGER,
    "custoKwpMinimo" DOUBLE PRECISION,
    "custoKwpMedio" DOUBLE PRECISION,
    "custoKwpMaximo" DOUBLE PRECISION,
    "ativa" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Municipio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instaladora" (
    "id" SERIAL NOT NULL,
    "cnpj" TEXT,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "municipioId" INTEGER,
    "distribuidoraId" INTEGER,
    "googleRating" DOUBLE PRECISION,
    "googleReviews" INTEGER,
    "reclameAquiScore" DOUBLE PRECISION,
    "anosMercado" INTEGER,
    "telefone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "googlePlaceId" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "leadParceira" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instaladora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Simulacao" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "municipioId" INTEGER NOT NULL,
    "consumoKwh" DOUBLE PRECISION NOT NULL,
    "valorConta" DOUBLE PRECISION NOT NULL,
    "tipoImovel" TEXT NOT NULL,
    "areaDisponivel" DOUBLE PRECISION,
    "sistemaKwp" DOUBLE PRECISION NOT NULL,
    "custoEstimadoMin" DOUBLE PRECISION NOT NULL,
    "custoEstimadoMax" DOUBLE PRECISION NOT NULL,
    "economiaMensal" DOUBLE PRECISION NOT NULL,
    "economiaAnual25" DOUBLE PRECISION NOT NULL,
    "paybackMeses" INTEGER NOT NULL,
    "co2EvitadoKgAno" DOUBLE PRECISION,
    "quantidadePaineis" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Simulacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "simulacaoId" TEXT,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "municipioId" INTEGER NOT NULL,
    "consumoKwh" DOUBLE PRECISION NOT NULL,
    "valorConta" DOUBLE PRECISION NOT NULL,
    "casaPropria" BOOLEAN,
    "optinContato" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'novo',
    "instaladoraNotificadaId" INTEGER,
    "enviadoEm" TIMESTAMP(3),
    "aceitoEm" TIMESTAMP(3),
    "motivoDevolucao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoLead" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "instaladoraId" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Municipio_codigoIbge_key" ON "Municipio"("codigoIbge");

-- CreateIndex
CREATE UNIQUE INDEX "Municipio_slug_key" ON "Municipio"("slug");

-- CreateIndex
CREATE INDEX "Municipio_estado_idx" ON "Municipio"("estado");

-- CreateIndex
CREATE INDEX "Municipio_slug_idx" ON "Municipio"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Instaladora_cnpj_key" ON "Instaladora"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Instaladora_googlePlaceId_key" ON "Instaladora"("googlePlaceId");

-- CreateIndex
CREATE INDEX "Instaladora_estado_idx" ON "Instaladora"("estado");

-- CreateIndex
CREATE INDEX "Instaladora_municipioId_idx" ON "Instaladora"("municipioId");

-- CreateIndex
CREATE INDEX "Simulacao_municipioId_idx" ON "Simulacao"("municipioId");

-- CreateIndex
CREATE INDEX "Simulacao_createdAt_idx" ON "Simulacao"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_simulacaoId_key" ON "Lead"("simulacaoId");

-- CreateIndex
CREATE INDEX "Lead_municipioId_idx" ON "Lead"("municipioId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "EventoLead_leadId_idx" ON "EventoLead"("leadId");

-- CreateIndex
CREATE INDEX "EventoLead_createdAt_idx" ON "EventoLead"("createdAt");

-- AddForeignKey
ALTER TABLE "Municipio" ADD CONSTRAINT "Municipio_distribuidoraId_fkey" FOREIGN KEY ("distribuidoraId") REFERENCES "Distribuidora"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instaladora" ADD CONSTRAINT "Instaladora_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instaladora" ADD CONSTRAINT "Instaladora_distribuidoraId_fkey" FOREIGN KEY ("distribuidoraId") REFERENCES "Distribuidora"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulacao" ADD CONSTRAINT "Simulacao_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_simulacaoId_fkey" FOREIGN KEY ("simulacaoId") REFERENCES "Simulacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_instaladoraNotificadaId_fkey" FOREIGN KEY ("instaladoraNotificadaId") REFERENCES "Instaladora"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoLead" ADD CONSTRAINT "EventoLead_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoLead" ADD CONSTRAINT "EventoLead_instaladoraId_fkey" FOREIGN KEY ("instaladoraId") REFERENCES "Instaladora"("id") ON DELETE SET NULL ON UPDATE CASCADE;
