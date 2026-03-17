import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | SolarDados BR",
  description:
    "Política de privacidade da plataforma SolarDados BR — como coletamos, usamos e protegemos seus dados.",
};

export default function PrivacidadePage() {
  return (
    <section className="py-12 px-4">
      <div className="mx-auto max-w-3xl prose prose-gray">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Política de Privacidade
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          Última atualização: março de 2026
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          1. Quais dados coletamos
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Coletamos os seguintes dados pessoais fornecidos voluntariamente pelo
          usuário no formulário de simulação: nome completo, endereço de e-mail,
          número de telefone e cidade. Também coletamos dados da simulação
          realizada, como consumo de energia estimado, tipo de imóvel e valor da
          conta de luz.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          2. Finalidade do tratamento
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Os dados coletados são utilizados para compartilhar suas informações
          com instaladoras parceiras cadastradas na plataforma, com o objetivo de
          envio de propostas comerciais de instalação de sistemas de energia
          solar fotovoltaica.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          3. Com quem compartilhamos
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Seus dados são compartilhados exclusivamente com instaladoras parceiras
          verificadas localizadas na sua cidade ou região. Cada lead é
          compartilhado com no máximo 3 instaladoras. Não vendemos, alugamos ou
          compartilhamos seus dados com terceiros para outras finalidades.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          4. Base legal
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          O tratamento dos seus dados pessoais é realizado com base no seu
          consentimento explícito (Art. 7º, inciso I da Lei Geral de Proteção de
          Dados — LGPD, Lei nº 13.709/2018), manifestado por meio do opt-in no
          formulário de contato.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          5. Retenção dos dados
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Seus dados pessoais são retidos por 12 meses após a coleta. Após esse
          período, os dados são anonimizados e não podem mais ser associados a
          você.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          6. Direitos do titular
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Conforme a LGPD, você tem direito a: acesso aos seus dados pessoais,
          correção de dados incompletos ou desatualizados, exclusão dos seus
          dados pessoais e revogação do consentimento a qualquer momento. Para
          exercer qualquer um desses direitos, entre em contato pelo canal
          indicado abaixo.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          7. Canal de contato
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Para dúvidas, solicitações ou exercício dos seus direitos como titular
          de dados, entre em contato pelo e-mail:{" "}
          <a
            href="mailto:privacidade@solardados.com.br"
            className="text-yellow-700 underline hover:text-yellow-800"
          >
            privacidade@solardados.com.br
          </a>
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          8. Sobre instaladoras listadas
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Os dados de instaladoras exibidos na plataforma são obtidos de fontes
          públicas. A listagem não constitui recomendação, endosso ou garantia de
          qualidade dos serviços prestados.
        </p>
      </div>
    </section>
  );
}
