"use server";

import { prisma } from "@/lib/db";
import {
  validarTelefone,
  validarEmail,
  calcularScoreLead,
} from "@/lib/validators";
import { notificarNovoLead } from "@/lib/email";

interface LeadInput {
  nome: string;
  telefone: string;
  email: string;
  casaPropria: boolean | null;
  optinContato: boolean;
  municipioId: number;
  nomeCidade: string;
  estado: string;
  irradiacaoMedia: number;
  simulacao: {
    valorContaMensal: number;
    tipoImovel: string;
    consumoEstimadoKwh: number;
    sistemaKwp: number;
    custoEstimadoMin: number;
    custoEstimadoMax: number;
    custoEstimadoMedio: number;
    economiaMensal: number;
    economiaTotal25Anos: number;
    paybackMeses: number;
    co2EvitadoKgAno: number;
    quantidadePaineis: number;
    geracaoMensalKwh: number;
  };
}

type LeadResult =
  | { success: true; leadId: string }
  | { success: false; error: string };

export async function criarLead(input: LeadInput): Promise<LeadResult> {
  // Validações server-side
  const nome = input.nome.trim();
  if (nome.length < 3) {
    return { success: false, error: "Nome deve ter pelo menos 3 caracteres" };
  }

  const telDigitos = input.telefone.replace(/\D/g, "");
  const telResult = validarTelefone(telDigitos);
  if (!telResult.valido) {
    return { success: false, error: telResult.erro! };
  }

  const email = input.email.trim().toLowerCase();
  const emailResult = validarEmail(email);
  if (!emailResult.valido) {
    return { success: false, error: emailResult.erro! };
  }

  if (!input.optinContato) {
    return {
      success: false,
      error: "É necessário aceitar o contato de instaladoras",
    };
  }

  const valorConta = input.simulacao.valorContaMensal;
  if (valorConta < 80 || valorConta > 3000) {
    return {
      success: false,
      error: "Valor da conta deve estar entre R$ 80 e R$ 3.000",
    };
  }

  // Anti-abuso: max 3 leads por e-mail em 30 dias
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

  const leadsRecentes = await prisma.lead.count({
    where: {
      email,
      createdAt: { gte: trintaDiasAtras },
    },
  });

  if (leadsRecentes >= 3) {
    return {
      success: false,
      error:
        "Você já solicitou propostas recentemente. Tente novamente em alguns dias.",
    };
  }

  // Calcular score
  const score = calcularScoreLead({
    valorConta,
    casaPropria: input.casaPropria,
    irradiacaoMedia: input.irradiacaoMedia,
  });

  const sim = input.simulacao;

  // Salvar simulação + lead + evento em transaction
  const lead = await prisma.$transaction(async (tx) => {
    const simulacao = await tx.simulacao.create({
      data: {
        municipioId: input.municipioId,
        consumoKwh: sim.consumoEstimadoKwh,
        valorConta: sim.valorContaMensal,
        tipoImovel: sim.tipoImovel,
        sistemaKwp: sim.sistemaKwp,
        custoEstimadoMin: sim.custoEstimadoMin,
        custoEstimadoMax: sim.custoEstimadoMax,
        economiaMensal: sim.economiaMensal,
        economiaAnual25: sim.economiaTotal25Anos,
        paybackMeses: sim.paybackMeses,
        co2EvitadoKgAno: sim.co2EvitadoKgAno,
        quantidadePaineis: sim.quantidadePaineis,
      },
    });

    const novoLead = await tx.lead.create({
      data: {
        simulacaoId: simulacao.id,
        nome,
        telefone: telDigitos,
        email,
        municipioId: input.municipioId,
        consumoKwh: sim.consumoEstimadoKwh,
        valorConta: sim.valorContaMensal,
        casaPropria: input.casaPropria,
        optinContato: true,
        score,
        status: "novo",
      },
    });

    await tx.eventoLead.create({
      data: {
        leadId: novoLead.id,
        tipo: "criado",
        metadata: { score, origem: "simulador-cidade" },
      },
    });

    return novoLead;
  });

  // Notificação por e-mail (não bloqueia o retorno do lead)
  try {
    await notificarNovoLead({
      leadId: lead.id,
      nomeCliente: nome,
      telefone: telDigitos,
      email,
      cidade: input.nomeCidade,
      estado: input.estado,
      consumoKwh: sim.consumoEstimadoKwh,
      valorConta: sim.valorContaMensal,
      sistemaKwp: sim.sistemaKwp,
      custoEstimadoMedio: sim.custoEstimadoMedio,
      paybackMeses: sim.paybackMeses,
      score,
    });
  } catch (err) {
    console.error("Falha ao enviar e-mail de notificação:", err);
  }

  return { success: true, leadId: lead.id };
}
