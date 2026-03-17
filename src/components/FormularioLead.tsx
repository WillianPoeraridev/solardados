"use client";

import { useState, useTransition } from "react";
import { criarLead } from "@/app/actions/lead";
import {
  validarTelefone,
  validarEmail,
  formatarTelefone,
} from "@/lib/validators";
import { trackEvent, getDispositivo } from "@/lib/analytics";
import type { SimuladorOutput } from "@/types";

interface FormularioLeadProps {
  dadosSimulacao: SimuladorOutput;
  valorContaMensal: number;
  tipoImovel: string;
  municipioId: number;
  nomeCidade: string;
  estado: string;
  nomeDistribuidora: string;
  irradiacaoMedia: number;
}

export default function FormularioLead(props: FormularioLeadProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [casaPropria, setCasaPropria] = useState<string>("");
  const [optinContato, setOptinContato] = useState(false);

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroServidor, setErroServidor] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [isPending, startTransition] = useTransition();

  function validarFormulario(): boolean {
    const novosErros: Record<string, string> = {};

    if (nome.trim().length < 3) {
      novosErros.nome = "Nome deve ter pelo menos 3 caracteres";
    }

    const telResult = validarTelefone(telefone);
    if (!telResult.valido) {
      novosErros.telefone = telResult.erro!;
    }

    const emailResult = validarEmail(email);
    if (!emailResult.valido) {
      novosErros.email = emailResult.erro!;
    }

    if (!optinContato) {
      novosErros.optin = "Você precisa aceitar para continuar";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function handleSubmit() {
    setErroServidor("");
    if (!validarFormulario()) return;

    const casaPropriaValor =
      casaPropria === "sim" ? true : casaPropria === "nao" ? false : null;

    startTransition(async () => {
      const result = await criarLead({
        nome: nome.trim(),
        telefone,
        email: email.trim(),
        casaPropria: casaPropriaValor,
        optinContato: true,
        municipioId: props.municipioId,
        nomeCidade: props.nomeCidade,
        estado: props.estado,
        irradiacaoMedia: props.irradiacaoMedia,
        simulacao: {
          valorContaMensal: props.valorContaMensal,
          tipoImovel: props.tipoImovel,
          consumoEstimadoKwh: props.dadosSimulacao.consumoEstimadoKwh,
          sistemaKwp: props.dadosSimulacao.sistemaKwp,
          custoEstimadoMin: props.dadosSimulacao.custoEstimadoMin,
          custoEstimadoMax: props.dadosSimulacao.custoEstimadoMax,
          custoEstimadoMedio: props.dadosSimulacao.custoEstimadoMedio,
          economiaMensal: props.dadosSimulacao.economiaMensal,
          economiaTotal25Anos: props.dadosSimulacao.economiaTotal25Anos,
          paybackMeses: props.dadosSimulacao.paybackMeses,
          co2EvitadoKgAno: props.dadosSimulacao.co2EvitadoKgAno,
          quantidadePaineis: props.dadosSimulacao.quantidadePaineis,
          geracaoMensalKwh: props.dadosSimulacao.geracaoMensalKwh,
        },
      });

      const gaCtx = {
        cidade: props.nomeCidade,
        estado: props.estado,
        distribuidora: props.nomeDistribuidora,
        dispositivo: getDispositivo(),
      };

      if (result.success) {
        setEnviado(true);
        trackEvent("lead_submetido", gaCtx);
      } else {
        setErroServidor(result.error);
        trackEvent("lead_invalido_bloqueado", {
          ...gaCtx,
          motivo: result.error,
        });
      }
    });
  }

  if (enviado) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-800">
          Pronto! Em breve você receberá contato de instaladoras verificadas em{" "}
          {props.nomeCidade}.
        </p>
        <p className="mt-2 text-sm text-green-700">
          Fique de olho no seu telefone e e-mail.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Receba propostas gratuitas de instaladoras em {props.nomeCidade}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="lead-nome"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nome completo *
          </label>
          <input
            id="lead-nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome completo"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
          />
          {erros.nome && (
            <p className="mt-1 text-sm text-red-600">{erros.nome}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="lead-telefone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Telefone *
          </label>
          <input
            id="lead-telefone"
            type="tel"
            inputMode="numeric"
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            placeholder="(11) 99999-9999"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
          />
          {erros.telefone && (
            <p className="mt-1 text-sm text-red-600">{erros.telefone}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="lead-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            E-mail *
          </label>
          <input
            id="lead-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
          />
          {erros.email && (
            <p className="mt-1 text-sm text-red-600">{erros.email}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="lead-casa"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Casa própria?
          </label>
          <select
            id="lead-casa"
            value={casaPropria}
            onChange={(e) => setCasaPropria(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none bg-white"
          >
            <option value="">Prefiro não informar</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={optinContato}
              onChange={(e) => setOptinContato(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
            />
            <span className="text-sm text-gray-600">
              Aceito ser contatado por instaladoras parceiras da minha região
              para envio de propostas comerciais. Seus dados serão
              compartilhados conforme nossa{" "}
              <a
                href="/privacidade"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-yellow-700 hover:text-yellow-800"
              >
                Política de Privacidade
              </a>
              .
            </span>
          </label>
          {erros.optin && (
            <p className="mt-1 text-sm text-red-600">{erros.optin}</p>
          )}
        </div>
      </div>

      {erroServidor && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {erroServidor}
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400 text-center">
        Ao enviar, seus dados serão compartilhados com até 3 instaladoras
        verificadas em {props.nomeCidade}.
      </p>

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="mt-4 w-full rounded-lg bg-yellow-500 px-6 py-3 text-lg font-semibold text-white hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isPending ? "Enviando..." : "Quero receber propostas gratuitas"}
      </button>
    </div>
  );
}
