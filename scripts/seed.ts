/**
 * Seed — dados iniciais das 5 cidades Tier 1 do piloto SolarDados BR.
 * Executar com: pnpm db:seed
 *
 * Fontes: CRESESB/SunData (irradiação), ANEEL (tarifas, reajustes 2025), IBGE (população).
 * Coletado em março/2026.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const distribuidoras = [
  {
    nome: "Enel SP",
    sigla: "ENEL_SP",
    estados: ["SP"],
    tarifaResidencial: 0.72,
    dataUltimoReajuste: new Date("2025-07-04"),
    bandeiraTarifaria: "verde",
  },
  {
    nome: "CPFL Paulista",
    sigla: "CPFL_PAULISTA",
    estados: ["SP"],
    tarifaResidencial: 0.67,
    dataUltimoReajuste: new Date("2025-04-29"),
    bandeiraTarifaria: "verde",
  },
  {
    nome: "CEMIG",
    sigla: "CEMIG",
    estados: ["MG"],
    tarifaResidencial: 0.71,
    dataUltimoReajuste: new Date("2025-05-28"),
    bandeiraTarifaria: "verde",
  },
  {
    nome: "Copel",
    sigla: "COPEL",
    estados: ["PR"],
    tarifaResidencial: 0.57,
    dataUltimoReajuste: new Date("2025-06-24"),
    bandeiraTarifaria: "verde",
  },
  {
    nome: "CEEE-D (Equatorial)",
    sigla: "CEEE_D",
    estados: ["RS"],
    tarifaResidencial: 0.72,
    dataUltimoReajuste: new Date("2025-06-19"),
    bandeiraTarifaria: "verde",
  },
] as const;

const municipios = [
  {
    codigoIbge: "3550308",
    nome: "São Paulo",
    slug: "sao-paulo",
    estado: "SP",
    irradiacaoMedia: 4.43,
    distribuidoraSigla: "ENEL_SP",
    consumoMedioKwh: 250,
    populacao: 11451999,
    domicilios: 4300000,
    custoKwpMinimo: 4200,
    custoKwpMedio: 5000,
    custoKwpMaximo: 6200,
  },
  {
    codigoIbge: "4106902",
    nome: "Curitiba",
    slug: "curitiba",
    estado: "PR",
    irradiacaoMedia: 4.27,
    distribuidoraSigla: "COPEL",
    consumoMedioKwh: 220,
    populacao: 1963726,
    domicilios: 720000,
    custoKwpMinimo: 4000,
    custoKwpMedio: 4800,
    custoKwpMaximo: 5800,
  },
  {
    codigoIbge: "3106200",
    nome: "Belo Horizonte",
    slug: "belo-horizonte",
    estado: "MG",
    irradiacaoMedia: 5.17,
    distribuidoraSigla: "CEMIG",
    consumoMedioKwh: 230,
    populacao: 2530701,
    domicilios: 880000,
    custoKwpMinimo: 4000,
    custoKwpMedio: 4700,
    custoKwpMaximo: 5600,
  },
  {
    codigoIbge: "3509502",
    nome: "Campinas",
    slug: "campinas",
    estado: "SP",
    irradiacaoMedia: 4.63,
    distribuidoraSigla: "CPFL_PAULISTA",
    consumoMedioKwh: 240,
    populacao: 1223237,
    domicilios: 430000,
    custoKwpMinimo: 4100,
    custoKwpMedio: 4900,
    custoKwpMaximo: 6000,
  },
  {
    codigoIbge: "4314902",
    nome: "Porto Alegre",
    slug: "porto-alegre",
    estado: "RS",
    irradiacaoMedia: 4.18,
    distribuidoraSigla: "CEEE_D",
    consumoMedioKwh: 220,
    populacao: 1332570,
    domicilios: 520000,
    custoKwpMinimo: 4100,
    custoKwpMedio: 4900,
    custoKwpMaximo: 5900,
  },
] as const;

async function main() {
  // 1. Upsert distribuidoras
  const distMap = new Map<string, number>();

  for (const d of distribuidoras) {
    const record = await prisma.distribuidora.upsert({
      where: { sigla: d.sigla },
      update: {
        nome: d.nome,
        estados: [...d.estados],
        tarifaResidencial: d.tarifaResidencial,
        dataUltimoReajuste: d.dataUltimoReajuste,
        bandeiraTarifaria: d.bandeiraTarifaria,
      },
      create: {
        nome: d.nome,
        sigla: d.sigla,
        estados: [...d.estados],
        tarifaResidencial: d.tarifaResidencial,
        dataUltimoReajuste: d.dataUltimoReajuste,
        bandeiraTarifaria: d.bandeiraTarifaria,
      },
    });
    distMap.set(d.sigla, record.id);
  }

  // 2. Upsert municípios
  for (const m of municipios) {
    const distribuidoraId = distMap.get(m.distribuidoraSigla)!;
    await prisma.municipio.upsert({
      where: { codigoIbge: m.codigoIbge },
      update: {
        nome: m.nome,
        slug: m.slug,
        estado: m.estado,
        irradiacaoMedia: m.irradiacaoMedia,
        distribuidoraId,
        consumoMedioKwh: m.consumoMedioKwh,
        populacao: m.populacao,
        domicilios: m.domicilios,
        custoKwpMinimo: m.custoKwpMinimo,
        custoKwpMedio: m.custoKwpMedio,
        custoKwpMaximo: m.custoKwpMaximo,
        ativa: true,
      },
      create: {
        codigoIbge: m.codigoIbge,
        nome: m.nome,
        slug: m.slug,
        estado: m.estado,
        irradiacaoMedia: m.irradiacaoMedia,
        distribuidoraId,
        consumoMedioKwh: m.consumoMedioKwh,
        populacao: m.populacao,
        domicilios: m.domicilios,
        custoKwpMinimo: m.custoKwpMinimo,
        custoKwpMedio: m.custoKwpMedio,
        custoKwpMaximo: m.custoKwpMaximo,
        ativa: true,
      },
    });
  }

  console.log(
    `✅ Seed concluído — ${distMap.size} distribuidoras, ${municipios.length} municípios`
  );
}

main()
  .catch((error) => {
    console.error("❌ Erro no seed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
