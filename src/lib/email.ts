import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface NotificacaoLeadData {
  leadId: string;
  nomeCliente: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  consumoKwh: number;
  valorConta: number;
  sistemaKwp: number;
  custoEstimadoMedio: number;
  paybackMeses: number;
  score: number;
}

export async function notificarNovoLead(dados: NotificacaoLeadData) {
  const paybackAnos = Math.floor(dados.paybackMeses / 12);
  const paybackMesesRest = dados.paybackMeses % 12;
  const paybackTexto =
    paybackAnos > 0
      ? `${paybackAnos} anos${paybackMesesRest > 0 ? ` e ${paybackMesesRest} meses` : ""}`
      : `${dados.paybackMeses} meses`;

  const dataHora = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d97706; border-bottom: 2px solid #fef3c7; padding-bottom: 8px;">
        Novo lead — ${dados.cidade}/${dados.estado}
      </h2>

      <h3 style="margin-top: 20px;">Dados do contato</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #666;">Nome</td><td style="padding: 6px 0; font-weight: bold;">${dados.nomeCliente}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Telefone</td><td style="padding: 6px 0; font-weight: bold;">${dados.telefone}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">E-mail</td><td style="padding: 6px 0; font-weight: bold;">${dados.email}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Cidade</td><td style="padding: 6px 0;">${dados.cidade}, ${dados.estado}</td></tr>
      </table>

      <h3 style="margin-top: 20px;">Dados da simulação</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #666;">Consumo estimado</td><td style="padding: 6px 0;">${Math.round(dados.consumoKwh)} kWh/mês</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Valor da conta</td><td style="padding: 6px 0;">R$ ${dados.valorConta.toFixed(0)}/mês</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Sistema recomendado</td><td style="padding: 6px 0;">${dados.sistemaKwp.toFixed(1)} kWp</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Custo estimado médio</td><td style="padding: 6px 0;">R$ ${dados.custoEstimadoMedio.toLocaleString("pt-BR")}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Payback</td><td style="padding: 6px 0;">${paybackTexto}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Score do lead</td><td style="padding: 6px 0; font-weight: bold;">${dados.score}/10</td></tr>
      </table>

      <p style="margin-top: 24px; padding: 12px; background: #fef3c7; border-radius: 8px; font-size: 14px;">
        Este lead completou a simulação em solardados.com.br e autorizou contato.
      </p>

      <p style="margin-top: 16px; font-size: 12px; color: #999;">
        Lead ID: ${dados.leadId} &middot; ${dataHora} (BRT)
      </p>
    </div>
  `;

  await resend.emails.send({
    from: "SolarDados <onboarding@resend.dev>",
    to: process.env.LEAD_NOTIFICATION_EMAIL || "admin@solardados.com.br",
    subject: `Novo lead em ${dados.cidade}/${dados.estado} — ${dados.nomeCliente}`,
    html,
  });
}
