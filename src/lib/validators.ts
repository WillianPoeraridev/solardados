const DDDS_VALIDOS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
  21, 22, 24, // RJ
  27, 28, // ES
  31, 32, 33, 34, 35, 37, 38, // MG
  41, 42, 43, 44, 45, 46, // PR
  47, 48, 49, // SC
  51, 53, 54, 55, // RS
  61, // DF
  62, 64, // GO
  63, // TO
  65, 66, // MT
  67, // MS
  68, // AC
  69, // RO
  71, 73, 74, 75, 77, // BA
  79, // SE
  81, 82, 83, 84, 85, 86, 87, 88, 89, // NE
  91, 92, 93, 94, 95, 96, 97, 98, 99, // N/NE
]);

const DOMINIOS_DESCARTAVEIS = new Set([
  "mailinator.com",
  "tempmail.com",
  "guerrillamail.com",
  "throwaway.email",
  "yopmail.com",
]);

export function validarTelefone(tel: string): {
  valido: boolean;
  erro?: string;
} {
  const digitos = tel.replace(/\D/g, "");

  if (digitos.length !== 11) {
    return { valido: false, erro: "Telefone deve ter 11 dígitos (DDD + número)" };
  }

  const ddd = parseInt(digitos.slice(0, 2), 10);
  if (!DDDS_VALIDOS.has(ddd)) {
    return { valido: false, erro: "DDD inválido" };
  }

  if (digitos[2] !== "9") {
    return { valido: false, erro: "Número de celular deve começar com 9" };
  }

  if (/^(\d)\1{10}$/.test(digitos)) {
    return { valido: false, erro: "Telefone inválido" };
  }

  return { valido: true };
}

export function validarEmail(email: string): {
  valido: boolean;
  erro?: string;
} {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    return { valido: false, erro: "E-mail inválido" };
  }

  const dominio = email.split("@")[1].toLowerCase();
  if (DOMINIOS_DESCARTAVEIS.has(dominio)) {
    return { valido: false, erro: "E-mail temporário não é aceito" };
  }

  return { valido: true };
}

export function formatarTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export function calcularScoreLead(dados: {
  valorConta: number;
  casaPropria: boolean | null;
  irradiacaoMedia: number;
  horaAtual?: number;
}): number {
  let score = 0;

  if (dados.valorConta > 400) score += 3;
  if (dados.casaPropria === true) score += 2;
  if (dados.irradiacaoMedia > 4.5) score += 2;
  if (dados.casaPropria !== null) score += 2;

  const hora = dados.horaAtual ?? new Date().getHours();
  if (hora >= 8 && hora < 20) score += 1;

  return Math.min(score, 10);
}
