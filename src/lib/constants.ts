/** Fator de performance típico de sistemas fotovoltaicos */
export const PERFORMANCE_RATIO = 0.75;

/** Degradação anual média dos painéis (%) */
export const DEGRADACAO_ANUAL = 0.005;

/** Horas de sol pico médias por região (kWh/m²/dia) */
export const IRRADIACAO_MEDIA_BRASIL = {
  norte: 4.5,
  nordeste: 5.5,
  centroOeste: 5.0,
  sudeste: 4.8,
  sul: 4.2,
} as const;

/** Range de preço por Wp instalado (R$) */
export const PRECO_POR_WP = {
  min: 3.5,
  max: 6.5,
} as const;

/** Vida útil estimada do sistema em anos */
export const VIDA_UTIL_SISTEMA = 25;

/** Fator de compensação — Fio B da Lei 14.300/2022 */
export const FATOR_COMPENSACAO = 0.85;

/** Potência padrão dos painéis solares no mercado BR (W) */
export const POTENCIA_PAINEL_W = 550;

/** Área ocupada por cada painel no telhado (m²) */
export const AREA_PAINEL_M2 = 2.2;

/** Fator de emissão do grid brasileiro (kg CO₂/kWh — fonte: MCTI) */
export const FATOR_CO2_KG_POR_KWH = 0.0817;

/** CO₂ absorvido por árvore por ano (kg) */
export const CO2_POR_ARVORE_KG_ANO = 22;
