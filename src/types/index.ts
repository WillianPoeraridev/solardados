/** Tipos compartilhados do projeto SolarDados BR */

export type RegiaoBrasil =
  | "norte"
  | "nordeste"
  | "centroOeste"
  | "sudeste"
  | "sul";

export type TipoImovel = "casa_terrea" | "sobrado" | "apartamento";

export interface SimuladorInput {
  valorContaMensal: number;
  tipoImovel: TipoImovel;
  areaDisponivel?: number;
  irradiacaoMedia: number;
  tarifaResidencial: number;
  custoKwpMinimo: number;
  custoKwpMedio: number;
  custoKwpMaximo: number;
}

export interface SimuladorOutput {
  consumoEstimadoKwh: number;
  sistemaKwp: number;
  quantidadePaineis: number;
  areaEstimadaM2: number;
  custoEstimadoMin: number;
  custoEstimadoMax: number;
  custoEstimadoMedio: number;
  economiaMensal: number;
  economiaAnual: number;
  economiaTotal25Anos: number;
  paybackMeses: number;
  paybackAnos: number;
  retornoInvestimento: number;
  co2EvitadoKgAno: number;
  arvoresEquivalentes: number;
  geracaoMensalKwh: number;
  geracaoAnualKwh: number;
}
