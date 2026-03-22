import { calcularSimulacao } from "@/lib/solar-calc";

interface TabelaCenariosProps {
  cidade: string;
  estado: string;
  irradiacaoMedia: number;
  tarifaResidencial: number;
  custoKwpMinimo: number;
  custoKwpMedio: number;
  custoKwpMaximo: number;
}

const FAIXAS_CONTA = [200, 300, 500, 800];

function fmt(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function TabelaCenarios(props: TabelaCenariosProps) {
  const cenarios = FAIXAS_CONTA.map((conta) => {
    const r = calcularSimulacao({
      valorContaMensal: conta,
      tipoImovel: "casa_terrea",
      irradiacaoMedia: props.irradiacaoMedia,
      tarifaResidencial: props.tarifaResidencial,
      custoKwpMinimo: props.custoKwpMinimo,
      custoKwpMedio: props.custoKwpMedio,
      custoKwpMaximo: props.custoKwpMaximo,
    });
    const paybackAnos = Math.floor(r.paybackMeses / 12);
    const paybackMesesRest = r.paybackMeses % 12;
    const paybackTexto =
      paybackAnos > 0
        ? `${paybackAnos} anos${paybackMesesRest > 0 ? ` e ${paybackMesesRest}m` : ""}`
        : `${r.paybackMeses} meses`;

    return { conta, ...r, paybackTexto };
  });

  return (
    <div>
      {/* Desktop: tabela */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-3 px-4 font-medium">Conta de luz</th>
              <th className="py-3 px-4 font-medium">Sistema</th>
              <th className="py-3 px-4 font-medium">Custo estimado</th>
              <th className="py-3 px-4 font-medium">Economia mensal</th>
              <th className="py-3 px-4 font-medium">Payback</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {cenarios.map((c) => (
              <tr
                key={c.conta}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-4 font-semibold text-gray-900">
                  {fmt(c.conta)}/mês
                </td>
                <td className="py-4 px-4 text-gray-700">
                  {c.sistemaKwp.toFixed(1).replace(".", ",")} kWp
                </td>
                <td className="py-4 px-4 text-gray-700">
                  {fmt(c.custoEstimadoMin)} – {fmt(c.custoEstimadoMax)}
                </td>
                <td className="py-4 px-4 font-semibold text-yellow-700">
                  {fmt(c.economiaMensal)}/mês
                </td>
                <td className="py-4 px-4 text-gray-700">{c.paybackTexto}</td>
                <td className="py-4 px-4">
                  <a
                    href="#simulador"
                    className="text-sm font-medium text-yellow-600 hover:text-yellow-700"
                  >
                    Simular com meu valor &rarr;
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="sm:hidden space-y-4">
        {cenarios.map((c) => (
          <div
            key={c.conta}
            className="rounded-xl border border-gray-200 bg-white p-5 space-y-3"
          >
            <p className="text-lg font-bold text-gray-900">
              Conta de {fmt(c.conta)}/mês
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Sistema</p>
                <p className="font-medium text-gray-900">
                  {c.sistemaKwp.toFixed(1).replace(".", ",")} kWp
                </p>
              </div>
              <div>
                <p className="text-gray-500">Economia mensal</p>
                <p className="font-semibold text-yellow-700">
                  {fmt(c.economiaMensal)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Custo estimado</p>
                <p className="font-medium text-gray-900">
                  {fmt(c.custoEstimadoMin)} – {fmt(c.custoEstimadoMax)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Payback</p>
                <p className="font-medium text-gray-900">{c.paybackTexto}</p>
              </div>
            </div>
            <a
              href="#simulador"
              className="block text-center text-sm font-medium text-yellow-600 hover:text-yellow-700 pt-2 border-t border-gray-100"
            >
              Simular com meu valor &rarr;
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
