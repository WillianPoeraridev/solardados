import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calcularSimulacao,
  arredondarKwp,
  calcularEconomia25Anos,
} from "../solar-calc";
import type { SimuladorInput } from "../../types";

describe("arredondarKwp", () => {
  it("arredonda pra cima em múltiplos de 0.5", () => {
    assert.equal(arredondarKwp(3.1), 3.5);
    assert.equal(arredondarKwp(3.5), 3.5);
    assert.equal(arredondarKwp(3.6), 4.0);
    assert.equal(arredondarKwp(4.0), 4.0);
    assert.equal(arredondarKwp(0.1), 0.5);
    assert.equal(arredondarKwp(7.01), 7.5);
  });
});

describe("calcularEconomia25Anos", () => {
  it("retorna menos que economia simples × 25 × 12 (por causa da degradação)", () => {
    const economiaMensal = 300;
    const semDegradacao = economiaMensal * 12 * 25;
    const comDegradacao = calcularEconomia25Anos(economiaMensal);

    assert.ok(
      comDegradacao < semDegradacao,
      `com degradação (${comDegradacao}) deveria ser menor que sem (${semDegradacao})`
    );
    // Degradação de 0.5% ao ano reduz ~6% no total
    assert.ok(comDegradacao > semDegradacao * 0.9);
  });
});

describe("calcularSimulacao", () => {
  it("São Paulo — conta de R$300/mês", () => {
    const input: SimuladorInput = {
      valorContaMensal: 300,
      tipoImovel: "casa_terrea",
      irradiacaoMedia: 4.43,
      tarifaResidencial: 0.72,
      custoKwpMinimo: 4200,
      custoKwpMedio: 5000,
      custoKwpMaximo: 6200,
    };

    const r = calcularSimulacao(input);

    // Consumo: 300 / 0.72 ≈ 417 kWh
    assert.ok(r.consumoEstimadoKwh >= 410 && r.consumoEstimadoKwh <= 420);
    // Sistema entre 3.5 e 5.0 kWp
    assert.ok(r.sistemaKwp >= 3.5 && r.sistemaKwp <= 5.0);
    // Payback entre 60 e 100 meses (~5-8 anos, realista para mercado BR)
    assert.ok(
      r.paybackMeses >= 60 && r.paybackMeses <= 100,
      `payback ${r.paybackMeses} fora do range 60-100`
    );
    // Economia mensal > R$200
    assert.ok(r.economiaMensal > 200);
    // Outputs positivos e coerentes
    assert.ok(r.quantidadePaineis > 0);
    assert.ok(r.co2EvitadoKgAno > 0);
    assert.ok(r.arvoresEquivalentes > 0);
    assert.ok(r.retornoInvestimento > 0);
  });

  it("Belo Horizonte — conta de R$500/mês", () => {
    const input: SimuladorInput = {
      valorContaMensal: 500,
      tipoImovel: "sobrado",
      irradiacaoMedia: 5.17,
      tarifaResidencial: 0.71,
      custoKwpMinimo: 4000,
      custoKwpMedio: 4700,
      custoKwpMaximo: 5600,
    };

    const r = calcularSimulacao(input);

    // Sistema entre 5.0 e 7.0 kWp (BH tem mais sol)
    assert.ok(
      r.sistemaKwp >= 5.0 && r.sistemaKwp <= 7.0,
      `sistemaKwp ${r.sistemaKwp} fora do range 5.0-7.0`
    );

    // Payback de BH deve ser menor que SP (mais sol + custo menor)
    const spInput: SimuladorInput = {
      valorContaMensal: 500,
      tipoImovel: "casa_terrea",
      irradiacaoMedia: 4.43,
      tarifaResidencial: 0.72,
      custoKwpMinimo: 4200,
      custoKwpMedio: 5000,
      custoKwpMaximo: 6200,
    };
    const sp = calcularSimulacao(spInput);

    assert.ok(
      r.paybackMeses < sp.paybackMeses,
      `BH payback (${r.paybackMeses}) deveria ser menor que SP (${sp.paybackMeses})`
    );
  });

  it("conta de R$80 (mínima) gera sistema válido", () => {
    const input: SimuladorInput = {
      valorContaMensal: 80,
      tipoImovel: "apartamento",
      irradiacaoMedia: 4.43,
      tarifaResidencial: 0.72,
      custoKwpMinimo: 4200,
      custoKwpMedio: 5000,
      custoKwpMaximo: 6200,
    };

    const r = calcularSimulacao(input);

    assert.ok(r.sistemaKwp >= 0.5);
    assert.ok(r.quantidadePaineis >= 1);
    assert.ok(r.paybackMeses > 0);
    assert.ok(r.economiaMensal > 0);
    assert.ok(r.custoEstimadoMin > 0);
  });

  it("conta de R$3000 (máxima) gera sistema válido", () => {
    const input: SimuladorInput = {
      valorContaMensal: 3000,
      tipoImovel: "casa_terrea",
      irradiacaoMedia: 5.17,
      tarifaResidencial: 0.71,
      custoKwpMinimo: 4000,
      custoKwpMedio: 4700,
      custoKwpMaximo: 5600,
    };

    const r = calcularSimulacao(input);

    assert.ok(r.sistemaKwp > 10);
    assert.ok(r.quantidadePaineis > 20);
    assert.ok(r.paybackMeses > 0 && r.paybackMeses < 120);
    assert.ok(r.economiaTotal25Anos > r.custoEstimadoMedio);
    assert.ok(r.geracaoAnualKwh > 0);
  });
});
