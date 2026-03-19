/**
 * Seed Tier 2 — 22 cidades + 7 distribuidoras adicionais do SolarDados BR.
 * Executar com: pnpm db:seed-tier2
 *
 * Fontes: CRESESB/SunData (irradiação), ANEEL (tarifas, reajustes 2025-2026), IBGE (população).
 * Coletado em março/2026.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const distribuidoras = [
  {
    nome: "CELESC Distribuição",
    sigla: "CELESC",
    estados: ["SC"],
    tarifaResidencial: 0.696,
    dataUltimoReajuste: new Date("2025-08-22"),
    bandeiraTarifaria: "verde",
  },
  {
    nome: "Light",
    sigla: "LIGHT",
    estados: ["RJ"],
    tarifaResidencial: 0.84,
    dataUltimoReajuste: new Date("2026-03-15"),
    bandeiraTarifaria: "verde",
  },
  {
    nome: "Enel Rio",
    sigla: "ENEL_RIO",
    estados: ["RJ"],
    tarifaResidencial: 0.97,
    dataUltimoReajuste: new Date("2026-03-15"),
    bandeiraTarifaria: "verde",
  },
  {
    nome: "Neoenergia Elektro",
    sigla: "ELEKTRO",
    estados: ["SP"],
    tarifaResidencial: 0.74,
    dataUltimoReajuste: new Date("2025-10-01"),
    bandeiraTarifaria: "verde",
  },
  {
    nome: "CPFL Piratininga",
    sigla: "CPFL_PIRATININGA",
    estados: ["SP"],
    tarifaResidencial: 0.74,
    dataUltimoReajuste: new Date("2025-04-29"),
    bandeiraTarifaria: "verde",
  },
  {
    nome: "EDP Espírito Santo",
    sigla: "EDP_ES",
    estados: ["ES"],
    tarifaResidencial: 0.79,
    dataUltimoReajuste: new Date("2025-08-01"),
    bandeiraTarifaria: "verde",
  },
  {
    nome: "RGE Sul (CPFL)",
    sigla: "RGE_SUL",
    estados: ["RS"],
    tarifaResidencial: 0.73,
    dataUltimoReajuste: new Date("2025-06-01"),
    bandeiraTarifaria: "verde",
  },
] as const;

const municipios = [
  // SP — Enel SP (existente)
  { codigoIbge: "3518800", nome: "Guarulhos", slug: "guarulhos", estado: "SP", irradiacaoMedia: 4.43, distribuidoraSigla: "ENEL_SP", consumoMedioKwh: 240, populacao: 1379182, domicilios: 470000, custoKwpMinimo: 4200, custoKwpMedio: 5000, custoKwpMaximo: 6200 },
  { codigoIbge: "3534401", nome: "Osasco", slug: "osasco", estado: "SP", irradiacaoMedia: 4.43, distribuidoraSigla: "ENEL_SP", consumoMedioKwh: 230, populacao: 696850, domicilios: 235000, custoKwpMinimo: 4200, custoKwpMedio: 5000, custoKwpMaximo: 6200 },

  // SP — Neoenergia Elektro (nova)
  { codigoIbge: "3547809", nome: "Santo André", slug: "santo-andre", estado: "SP", irradiacaoMedia: 4.40, distribuidoraSigla: "ELEKTRO", consumoMedioKwh: 235, populacao: 720849, domicilios: 245000, custoKwpMinimo: 4000, custoKwpMedio: 4800, custoKwpMaximo: 6000 },
  { codigoIbge: "3548708", nome: "São Bernardo do Campo", slug: "sao-bernardo-do-campo", estado: "SP", irradiacaoMedia: 4.38, distribuidoraSigla: "ELEKTRO", consumoMedioKwh: 240, populacao: 843082, domicilios: 285000, custoKwpMinimo: 4000, custoKwpMedio: 4800, custoKwpMaximo: 6000 },
  { codigoIbge: "3548500", nome: "Santos", slug: "santos", estado: "SP", irradiacaoMedia: 4.30, distribuidoraSigla: "ELEKTRO", consumoMedioKwh: 220, populacao: 433311, domicilios: 185000, custoKwpMinimo: 4000, custoKwpMedio: 4800, custoKwpMaximo: 6000 },
  { codigoIbge: "3549904", nome: "São José dos Campos", slug: "sao-jose-dos-campos", estado: "SP", irradiacaoMedia: 4.52, distribuidoraSigla: "ELEKTRO", consumoMedioKwh: 235, populacao: 729644, domicilios: 245000, custoKwpMinimo: 3800, custoKwpMedio: 4600, custoKwpMaximo: 5800 },

  // SP — CPFL Piratininga (nova)
  { codigoIbge: "3552205", nome: "Sorocaba", slug: "sorocaba", estado: "SP", irradiacaoMedia: 4.42, distribuidoraSigla: "CPFL_PIRATININGA", consumoMedioKwh: 225, populacao: 695022, domicilios: 230000, custoKwpMinimo: 3800, custoKwpMedio: 4600, custoKwpMaximo: 5800 },
  { codigoIbge: "3525904", nome: "Jundiaí", slug: "jundiai", estado: "SP", irradiacaoMedia: 4.48, distribuidoraSigla: "CPFL_PIRATININGA", consumoMedioKwh: 230, populacao: 431443, domicilios: 148000, custoKwpMinimo: 3800, custoKwpMedio: 4600, custoKwpMaximo: 5800 },
  { codigoIbge: "3506003", nome: "Bauru", slug: "bauru", estado: "SP", irradiacaoMedia: 4.85, distribuidoraSigla: "CPFL_PIRATININGA", consumoMedioKwh: 210, populacao: 375374, domicilios: 133000, custoKwpMinimo: 3600, custoKwpMedio: 4400, custoKwpMaximo: 5500 },

  // SP — CPFL Paulista (existente)
  { codigoIbge: "3543402", nome: "Ribeirão Preto", slug: "ribeirao-preto", estado: "SP", irradiacaoMedia: 5.02, distribuidoraSigla: "CPFL_PAULISTA", consumoMedioKwh: 245, populacao: 712679, domicilios: 255000, custoKwpMinimo: 3600, custoKwpMedio: 4400, custoKwpMaximo: 5500 },

  // RJ — Light (nova)
  { codigoIbge: "3304557", nome: "Rio de Janeiro", slug: "rio-de-janeiro", estado: "RJ", irradiacaoMedia: 4.92, distribuidoraSigla: "LIGHT", consumoMedioKwh: 265, populacao: 6211223, domicilios: 2400000, custoKwpMinimo: 4500, custoKwpMedio: 5500, custoKwpMaximo: 7000 },

  // SC — CELESC (nova)
  { codigoIbge: "4205407", nome: "Florianópolis", slug: "florianopolis", estado: "SC", irradiacaoMedia: 4.43, distribuidoraSigla: "CELESC", consumoMedioKwh: 215, populacao: 537211, domicilios: 205000, custoKwpMinimo: 3800, custoKwpMedio: 4600, custoKwpMaximo: 5800 },
  { codigoIbge: "4209102", nome: "Joinville", slug: "joinville", estado: "SC", irradiacaoMedia: 4.12, distribuidoraSigla: "CELESC", consumoMedioKwh: 220, populacao: 619023, domicilios: 220000, custoKwpMinimo: 3800, custoKwpMedio: 4600, custoKwpMaximo: 5800 },
  { codigoIbge: "4202404", nome: "Blumenau", slug: "blumenau", estado: "SC", irradiacaoMedia: 4.21, distribuidoraSigla: "CELESC", consumoMedioKwh: 215, populacao: 374351, domicilios: 135000, custoKwpMinimo: 3800, custoKwpMedio: 4600, custoKwpMaximo: 5800 },
  { codigoIbge: "4204608", nome: "Criciúma", slug: "criciuma", estado: "SC", irradiacaoMedia: 4.31, distribuidoraSigla: "CELESC", consumoMedioKwh: 200, populacao: 235223, domicilios: 84000, custoKwpMinimo: 3600, custoKwpMedio: 4400, custoKwpMaximo: 5500 },

  // PR — COPEL (existente)
  { codigoIbge: "4113700", nome: "Londrina", slug: "londrina", estado: "PR", irradiacaoMedia: 4.93, distribuidoraSigla: "COPEL", consumoMedioKwh: 220, populacao: 558439, domicilios: 198000, custoKwpMinimo: 3600, custoKwpMedio: 4400, custoKwpMaximo: 5500 },
  { codigoIbge: "4115200", nome: "Maringá", slug: "maringa", estado: "PR", irradiacaoMedia: 5.02, distribuidoraSigla: "COPEL", consumoMedioKwh: 225, populacao: 430157, domicilios: 155000, custoKwpMinimo: 3600, custoKwpMedio: 4400, custoKwpMaximo: 5500 },

  // MG — CEMIG (existente)
  { codigoIbge: "3170206", nome: "Uberlândia", slug: "uberlandia", estado: "MG", irradiacaoMedia: 5.52, distribuidoraSigla: "CEMIG", consumoMedioKwh: 235, populacao: 706597, domicilios: 250000, custoKwpMinimo: 3500, custoKwpMedio: 4200, custoKwpMaximo: 5400 },
  { codigoIbge: "3136702", nome: "Juiz de Fora", slug: "juiz-de-fora", estado: "MG", irradiacaoMedia: 4.81, distribuidoraSigla: "CEMIG", consumoMedioKwh: 210, populacao: 573285, domicilios: 210000, custoKwpMinimo: 3500, custoKwpMedio: 4200, custoKwpMaximo: 5400 },
  { codigoIbge: "3118601", nome: "Contagem", slug: "contagem", estado: "MG", irradiacaoMedia: 4.92, distribuidoraSigla: "CEMIG", consumoMedioKwh: 225, populacao: 667688, domicilios: 238000, custoKwpMinimo: 3500, custoKwpMedio: 4200, custoKwpMaximo: 5400 },

  // ES — EDP ES (nova)
  { codigoIbge: "3205309", nome: "Vitória", slug: "vitoria", estado: "ES", irradiacaoMedia: 5.14, distribuidoraSigla: "EDP_ES", consumoMedioKwh: 225, populacao: 365855, domicilios: 145000, custoKwpMinimo: 3800, custoKwpMedio: 4600, custoKwpMaximo: 5800 },
  { codigoIbge: "3205150", nome: "Vila Velha", slug: "vila-velha", estado: "ES", irradiacaoMedia: 5.14, distribuidoraSigla: "EDP_ES", consumoMedioKwh: 220, populacao: 501325, domicilios: 185000, custoKwpMinimo: 3800, custoKwpMedio: 4600, custoKwpMaximo: 5800 },

  // RS — RGE Sul (nova) — Caxias do Sul inativa por padrão (validar tarifa)
  { codigoIbge: "4305108", nome: "Caxias do Sul", slug: "caxias-do-sul", estado: "RS", irradiacaoMedia: 3.92, distribuidoraSigla: "RGE_SUL", consumoMedioKwh: 200, populacao: 552878, domicilios: 195000, custoKwpMinimo: 3600, custoKwpMedio: 4400, custoKwpMaximo: 5500, ativa: false },
] as const;

async function main() {
  // 1. Upsert distribuidoras Tier 2 (+ buscar existentes para o mapa)
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

  // Buscar distribuidoras Tier 1 já existentes (ENEL_SP, CPFL_PAULISTA, CEMIG, COPEL, CEEE_D)
  const existentes = await prisma.distribuidora.findMany({
    where: { sigla: { in: ["ENEL_SP", "CPFL_PAULISTA", "CEMIG", "COPEL", "CEEE_D"] } },
    select: { id: true, sigla: true },
  });
  for (const e of existentes) {
    distMap.set(e.sigla, e.id);
  }

  // 2. Upsert municípios
  let countMunicipios = 0;
  for (const m of municipios) {
    const distribuidoraId = distMap.get(m.distribuidoraSigla);
    if (!distribuidoraId) {
      console.error(`❌ Distribuidora ${m.distribuidoraSigla} não encontrada para ${m.nome}`);
      continue;
    }

    const ativa = "ativa" in m ? m.ativa : true;

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
        ativa,
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
        ativa,
      },
    });
    countMunicipios++;
  }

  console.log(
    `✅ Seed Tier 2 concluído — ${distMap.size} distribuidoras (total), ${countMunicipios} municípios adicionados`
  );
}

main()
  .catch((error) => {
    console.error("❌ Erro no seed Tier 2:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
