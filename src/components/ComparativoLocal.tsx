interface ComparativoLocalProps {
  cidade: string;
  irradiacaoMedia: number;
  tarifaResidencial: number;
  paybackMedioCidade: number;
}

const MEDIA_NACIONAL = {
  irradiacao: 4.9,
  tarifa: 0.7,
  payback: 60,
};

function Badge({ bom }: { bom: boolean }) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
        bom
          ? "bg-green-100 text-green-700"
          : "bg-orange-100 text-orange-700"
      }`}
    >
      {bom ? "Acima da média" : "Abaixo da média"}
    </span>
  );
}

export default function ComparativoLocal(props: ComparativoLocalProps) {
  const cards = [
    {
      label: "Irradiação solar",
      local: `${props.irradiacaoMedia.toFixed(1).replace(".", ",")} kWh/m²/dia`,
      nacional: `${MEDIA_NACIONAL.irradiacao.toFixed(1).replace(".", ",")} kWh/m²/dia`,
      bom: props.irradiacaoMedia >= MEDIA_NACIONAL.irradiacao,
    },
    {
      label: "Tarifa residencial",
      local: `R$ ${props.tarifaResidencial.toFixed(2).replace(".", ",")}/kWh`,
      nacional: `R$ ${MEDIA_NACIONAL.tarifa.toFixed(2).replace(".", ",")}/kWh`,
      // Tarifa alta = ruim para o consumidor, mas bom para payback solar
      bom: props.tarifaResidencial <= MEDIA_NACIONAL.tarifa,
    },
    {
      label: "Payback estimado",
      local: `${Math.round(props.paybackMedioCidade)} meses`,
      nacional: `${MEDIA_NACIONAL.payback} meses`,
      // Payback baixo = bom
      bom: props.paybackMedioCidade <= MEDIA_NACIONAL.payback,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-gray-200 bg-white p-5 space-y-3"
        >
          <p className="text-sm font-medium text-gray-500">{c.label}</p>
          <div>
            <p className="text-xl font-bold text-gray-900">{c.local}</p>
            <p className="text-sm text-gray-500">
              Média nacional: {c.nacional}
            </p>
          </div>
          <Badge bom={c.bom} />
        </div>
      ))}
    </div>
  );
}
