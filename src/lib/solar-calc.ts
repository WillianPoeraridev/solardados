import type { SimuladorInput, SimuladorOutput } from "@/types";
import {
  PERFORMANCE_RATIO,
  DEGRADACAO_ANUAL,
  VIDA_UTIL_SISTEMA,
  FATOR_COMPENSACAO,
  POTENCIA_PAINEL_W,
  AREA_PAINEL_M2,
  FATOR_CO2_KG_POR_KWH,
  CO2_POR_ARVORE_KG_ANO,
} from "./constants";

/**
 * Arredonda kWp para cima em múltiplos de 0.5
 * (kits solares são vendidos nessas faixas no mercado BR)
 */
export function arredondarKwp(kwp: number): number {
  return Math.ceil(kwp * 2) / 2;
}

/**
 * Calcula economia total em 25 anos considerando degradação anual dos painéis.
 * Retorna o valor acumulado em R$.
 */
export function calcularEconomia25Anos(
  economiaMensalAno1: number,
  degradacaoAnual: number = DEGRADACAO_ANUAL
): number {
  let total = 0;
  let economiaAnual = economiaMensalAno1 * 12;

  for (let ano = 0; ano < VIDA_UTIL_SISTEMA; ano++) {
    total += economiaAnual;
    economiaAnual *= 1 - degradacaoAnual;
  }

  return Math.round(total * 100) / 100;
}

/** Arredonda para a centena mais próxima */
function arredondarCentena(valor: number): number {
  return Math.round(valor / 100) * 100;
}

/**
 * Simulador de ROI solar — função principal.
 * Recebe dados do usuário + dados da cidade e retorna análise completa.
 */
export function calcularSimulacao(input: SimuladorInput): SimuladorOutput {
  const {
    valorContaMensal,
    irradiacaoMedia,
    tarifaResidencial,
    custoKwpMinimo,
    custoKwpMedio,
    custoKwpMaximo,
  } = input;

  // 1. Consumo estimado
  const consumoEstimadoKwh = valorContaMensal / tarifaResidencial;

  // 2. Geração por kWp/mês
  const geracaoPorKwpMes = irradiacaoMedia * 30 * PERFORMANCE_RATIO;

  // 3. Potência do sistema
  const sistemaKwpBruto = consumoEstimadoKwh / geracaoPorKwpMes;
  const sistemaKwp = arredondarKwp(sistemaKwpBruto);

  // 4. Painéis e área
  const quantidadePaineis = Math.ceil((sistemaKwp * 1000) / POTENCIA_PAINEL_W);
  const areaEstimadaM2 = quantidadePaineis * AREA_PAINEL_M2;

  // 5. Custos
  const custoEstimadoMin = arredondarCentena(sistemaKwp * custoKwpMinimo);
  const custoEstimadoMax = arredondarCentena(sistemaKwp * custoKwpMaximo);
  const custoEstimadoMedio = arredondarCentena(sistemaKwp * custoKwpMedio);

  // 6. Economia
  const economiaMensal =
    consumoEstimadoKwh * tarifaResidencial * FATOR_COMPENSACAO;
  const economiaAnual = economiaMensal * 12;
  const economiaTotal25Anos = calcularEconomia25Anos(economiaMensal);

  // 7. Payback
  const paybackMeses = Math.ceil(custoEstimadoMedio / economiaMensal);
  const paybackAnos = Math.round((paybackMeses / 12) * 10) / 10;

  // 8. Retorno sobre investimento
  const retornoInvestimento =
    Math.round(
      ((economiaTotal25Anos - custoEstimadoMedio) / custoEstimadoMedio) *
        100 *
        10
    ) / 10;

  // 9. Geração
  const geracaoMensalKwh = sistemaKwp * geracaoPorKwpMes;
  const geracaoAnualKwh = geracaoMensalKwh * 12;

  // 10. Impacto ambiental
  const co2EvitadoKgAno = geracaoAnualKwh * FATOR_CO2_KG_POR_KWH;
  const arvoresEquivalentes = Math.round(
    co2EvitadoKgAno / CO2_POR_ARVORE_KG_ANO
  );

  return {
    consumoEstimadoKwh: Math.round(consumoEstimadoKwh * 10) / 10,
    sistemaKwp,
    quantidadePaineis,
    areaEstimadaM2: Math.round(areaEstimadaM2 * 10) / 10,
    custoEstimadoMin,
    custoEstimadoMax,
    custoEstimadoMedio,
    economiaMensal: Math.round(economiaMensal * 100) / 100,
    economiaAnual: Math.round(economiaAnual * 100) / 100,
    economiaTotal25Anos,
    paybackMeses,
    paybackAnos,
    retornoInvestimento,
    co2EvitadoKgAno: Math.round(co2EvitadoKgAno * 10) / 10,
    arvoresEquivalentes,
    geracaoMensalKwh: Math.round(geracaoMensalKwh * 10) / 10,
    geracaoAnualKwh: Math.round(geracaoAnualKwh * 10) / 10,
  };
}
