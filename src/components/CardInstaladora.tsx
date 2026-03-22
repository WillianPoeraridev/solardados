interface CardInstaladoraProps {
  nome: string;
  googleRating: number | null;
  googleReviews: number | null;
  telefone: string | null;
  website: string | null;
  anosMercado: number | null;
  leadParceira: boolean;
}

function Estrelas({ rating }: { rating: number }) {
  const cheias = Math.floor(rating);
  const temMeia = rating - cheias >= 0.5;
  const vazias = 5 - cheias - (temMeia ? 1 : 0);

  return (
    <span className="text-yellow-500" aria-label={`${rating} de 5 estrelas`}>
      {"★".repeat(cheias)}
      {temMeia && "½"}
      {"☆".repeat(vazias)}
    </span>
  );
}

export default function CardInstaladora(props: CardInstaladoraProps) {
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow ${
        props.leadParceira
          ? "border-yellow-300 bg-yellow-50/30"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 text-base leading-tight">
          {props.nome}
        </h3>
        {props.leadParceira && (
          <span className="shrink-0 text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
            Parceira
          </span>
        )}
      </div>

      {props.googleRating != null && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <Estrelas rating={props.googleRating} />
          <span className="font-medium text-gray-900">
            {props.googleRating.toFixed(1).replace(".", ",")}
          </span>
          {props.googleReviews != null && (
            <span className="text-gray-500">
              ({props.googleReviews} avaliações)
            </span>
          )}
        </div>
      )}

      {props.anosMercado != null && (
        <p className="mt-2 text-sm text-gray-600">
          {props.anosMercado} anos de mercado
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        {props.telefone && (
          <a
            href={`tel:${props.telefone.replace(/\D/g, "")}`}
            className="text-yellow-600 hover:text-yellow-700 font-medium"
          >
            {props.telefone}
          </a>
        )}
        {props.website && (
          <a
            href={props.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Site
          </a>
        )}
      </div>
    </div>
  );
}
