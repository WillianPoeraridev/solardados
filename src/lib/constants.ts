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
