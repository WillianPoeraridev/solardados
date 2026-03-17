"use client";

import { useRef, useState } from "react";
import { calcularSimulacao } from "@/lib/solar-calc";
import { trackEvent, getDispositivo } from "@/lib/analytics";
import FormularioLead from "@/components/FormularioLead";
import type { SimuladorOutput, TipoImovel } from "@/types";

interface SimuladorProps {
  cidade: string;
  estado: string;
  distribuidora: string;
  municipioId: number;
  irradiacaoMedia: number;
  tarifaResidencial: number;
  custoKwpMinimo: number;
  custoKwpMedio: number;
  custoKwpMaximo: number;
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatarDecimal(valor: number, casas = 1): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export default function SimuladorSolar(props: SimuladorProps) {
  const [valorConta, setValorConta] = useState("");
  const [tipoImovel, setTipoImovel] = useState<TipoImovel>("casa_terrea");
  const [resultado, setResultado] = useState<SimuladorOutput | null>(null);
  const iniciouDigitacao = useRef(false);

  function ctx() {
    return {
      cidade: props.cidade,
      estado: props.estado,
      distribuidora: props.distribuidora,
      dispositivo: getDispositivo(),
    };
  }

  function handleValorChange(value: string) {
    setValorConta(value);
    if (!iniciouDigitacao.current && value.length > 0) {
      iniciouDigitacao.current = true;
      trackEvent("simulador_iniciado", ctx());
    }
  }

  function handleValorBlur() {
    const valor = parseFloat(valorConta);
    if (valor > 0) {
      trackEvent("simulador_etapa_1", { ...ctx(), valor_conta: valor });
    }
  }

  function handleTipoChange(tipo: TipoImovel) {
    setTipoImovel(tipo);
    trackEvent("simulador_etapa_2", { ...ctx(), tipo_imovel: tipo });
  }

  function handleCalcular() {
    const valor = parseFloat(valorConta);
    if (!valor || valor <= 0) return;

    trackEvent("simulador_cta_clicado", { ...ctx(), valor_conta: valor });

    const output = calcularSimulacao({
      valorContaMensal: valor,
      tipoImovel,
      irradiacaoMedia: props.irradiacaoMedia,
      tarifaResidencial: props.tarifaResidencial,
      custoKwpMinimo: props.custoKwpMinimo,
      custoKwpMedio: props.custoKwpMedio,
      custoKwpMaximo: props.custoKwpMaximo,
    });

    setResultado(output);
    trackEvent("simulador_resultado_visualizado", {
      ...ctx(),
      sistema_kwp: output.sistemaKwp,
      payback_meses: output.paybackMeses,
    });
    trackEvent("lead_formulario_aberto", ctx());
  }

  const paybackAnos = resultado ? Math.floor(resultado.paybackMeses / 12) : 0;
  const paybackMesesRestante = resultado ? resultado.paybackMeses % 12 : 0;

  return (
    <section id="simulador" className="py-12 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Simule seu sistema solar em {props.cidade}
        </h2>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="valor-conta"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Valor da conta de luz (R$)
              </label>
              <input
                id="valor-conta"
                type="number"
                inputMode="numeric"
                placeholder="Ex: 300"
                min="1"
                value={valorConta}
                onChange={(e) => handleValorChange(e.target.value)}
                onBlur={handleValorBlur}
                onKeyDown={(e) => e.key === "Enter" && handleCalcular()}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="tipo-imovel"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tipo de imóvel
              </label>
              <select
                id="tipo-imovel"
                value={tipoImovel}
                onChange={(e) =>
                  handleTipoChange(e.target.value as TipoImovel)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none bg-white"
              >
                <option value="casa_terrea">Casa térrea</option>
                <option value="sobrado">Sobrado</option>
                <option value="apartamento">Apartamento</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleCalcular}
            disabled={!valorConta || parseFloat(valorConta) <= 0}
            className="mt-6 w-full rounded-lg bg-yellow-500 px-6 py-3 text-lg font-semibold text-white hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Calcular meu sistema solar
          </button>
        </div>

        {resultado && (
          <div className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-sm text-gray-500">Sistema recomendado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarDecimal(resultado.sistemaKwp)} kWp
                </p>
                <p className="text-sm text-gray-600">
                  {resultado.quantidadePaineis} painéis &middot;{" "}
                  {formatarDecimal(resultado.areaEstimadaM2)} m²
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-sm text-gray-500">Custo estimado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarMoeda(resultado.custoEstimadoMin)} a{" "}
                  {formatarMoeda(resultado.custoEstimadoMax)}
                </p>
                <p className="text-sm text-gray-600">
                  Médio: {formatarMoeda(resultado.custoEstimadoMedio)}
                </p>
              </div>

              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
                <p className="text-sm text-gray-500">Economia mensal</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {formatarMoeda(resultado.economiaMensal)}/mês
                </p>
                <p className="text-sm text-gray-600">
                  {formatarMoeda(resultado.economiaAnual)}/ano
                </p>
              </div>

              <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                <p className="text-sm text-gray-500">Payback</p>
                <p className="text-2xl font-bold text-green-700">
                  {paybackAnos} anos
                  {paybackMesesRestante > 0 &&
                    ` e ${paybackMesesRestante} meses`}
                </p>
                <p className="text-sm text-gray-600">
                  Retorno de{" "}
                  {formatarDecimal(resultado.retornoInvestimento, 0)}% em 25
                  anos
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-sm text-gray-500">Economia em 25 anos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarMoeda(resultado.economiaTotal25Anos)}
                </p>
                <p className="text-sm text-gray-600">
                  Considerando degradação de 0,5%/ano
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-sm text-gray-500">Impacto ambiental</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarDecimal(resultado.co2EvitadoKgAno, 0)} kg CO₂/ano
                </p>
                <p className="text-sm text-gray-600">
                  Equivale a {resultado.arvoresEquivalentes} árvores plantadas
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">
              Calculado com dados de irradiação do CRESESB para {props.cidade} e
              tarifa da {props.distribuidora}: R${" "}
              {formatarDecimal(props.tarifaResidencial, 2)}/kWh. Valores
              estimados — consulte instaladoras locais para orçamento
              definitivo.
            </p>

            {/* CTA + Formulário de lead */}
            <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-6">
              <p className="text-gray-900 font-medium text-center mb-1">
                Seu sistema ideal custaria entre{" "}
                {formatarMoeda(resultado.custoEstimadoMin)} e{" "}
                {formatarMoeda(resultado.custoEstimadoMax)} com payback de{" "}
                {paybackAnos > 0 ? `${paybackAnos} anos` : ""}
                {paybackAnos > 0 && paybackMesesRestante > 0 ? " e " : ""}
                {paybackMesesRestante > 0
                  ? `${paybackMesesRestante} meses`
                  : ""}
                .
              </p>
              <p className="text-sm text-gray-600 text-center mb-6">
                Quer receber propostas de instaladoras verificadas em{" "}
                {props.cidade}? É gratuito e sem compromisso.
              </p>

              <FormularioLead
                dadosSimulacao={resultado}
                valorContaMensal={parseFloat(valorConta)}
                tipoImovel={tipoImovel}
                municipioId={props.municipioId}
                nomeCidade={props.cidade}
                estado={props.estado}
                nomeDistribuidora={props.distribuidora}
                irradiacaoMedia={props.irradiacaoMedia}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
