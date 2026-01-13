"use client";

import Link from "next/link";

export default function TermosCondicoes() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <header className="flex justify-between items-center px-10 py-6 bg-zinc-900 shadow-lg">
        <a href="/" className="text-lg font-semibold hover:underline">
          MyVrum
        </a>
      </header>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Termos e Condições
        </h1>
        
        <div className="bg-zinc-900 rounded-2xl p-8 shadow-xl space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              1. Aceitação dos Termos
            </h2>
            <p>
              Ao aceder e utilizar a plataforma MyVrum, o utilizador concorda com os presentes Termos e Condições. Se não concordar com qualquer parte destes termos, não deverá utilizar os nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              2. Utilização da Plataforma
            </h2>
            <p>
              A MyVrum é uma plataforma destinada à compra e venda de automóveis entre particulares e profissionais. O utilizador compromete-se a utilizar a plataforma de forma legal e respeitadora, não publicando conteúdo fraudulento, ofensivo ou que viole direitos de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              3. Registo e Conta de Utilizador
            </h2>
            <p>
              Para aceder a determinadas funcionalidades, o utilizador deve criar uma conta fornecendo informações verdadeiras e atualizadas. É da responsabilidade do utilizador manter a confidencialidade da sua palavra-passe e de todas as atividades realizadas na sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              4. Anúncios e Conteúdo
            </h2>
            <p>
              Os utilizadores são responsáveis pela veracidade e legalidade dos anúncios que publicam. A MyVrum reserva-se o direito de remover qualquer conteúdo que considere inadequado, enganoso ou que viole estes Termos e Condições.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              5. Transações
            </h2>
            <p>
              A MyVrum atua como intermediária, facilitando o contacto entre compradores e vendedores. A plataforma não é parte nas transações e não se responsabiliza por negócios realizados entre utilizadores. Recomendamos que todas as transações sejam realizadas de forma segura e verificada.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              6. Limitação de Responsabilidade
            </h2>
            <p>
              A MyVrum não garante a disponibilidade contínua da plataforma e não se responsabiliza por eventuais danos resultantes do uso ou da impossibilidade de uso dos nossos serviços. O utilizador utiliza a plataforma por sua conta e risco.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              7. Propriedade Intelectual
            </h2>
            <p>
              Todos os direitos de propriedade intelectual relacionados com a plataforma MyVrum, incluindo design, logótipos, textos e código, pertencem à MyVrum ou aos seus licenciadores. É proibida a reprodução ou utilização não autorizada destes elementos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              8. Modificações aos Termos
            </h2>
            <p>
              A MyVrum reserva-se o direito de modificar estes Termos e Condições a qualquer momento. As alterações entrarão em vigor imediatamente após a sua publicação na plataforma. A utilização continuada dos serviços após as modificações implica a aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              9. Lei Aplicável
            </h2>
            <p>
              Estes Termos e Condições são regidos pela legislação portuguesa. Qualquer litígio decorrente da utilização da plataforma será da competência dos tribunais portugueses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              10. Contacto
            </h2>
            <p>
              Para questões relacionadas com estes Termos e Condições, consulte a nossa página de{" "}
              <Link href="/contactos" className="text-blue-400 hover:underline">
                Contactos
              </Link>
              .
            </p>
          </section>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          Última atualização: Novembro de 2025
        </p>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 text-gray-300 py-10 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-100">
          {/* Coluna 1 */}
          <div>
            <h3 className="text-xl font-semibold mb-3 text-white">MyVrum</h3>
            <p className="text-sm text-white max-w-xs">
              A tua plataforma para comprar e vender carros com rapidez e confiança.
            </p>
          </div>

          {/* Coluna 2 */}
          <div>
            <h4 className="font-semibold mb-3 text-white">Links Úteis</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/termos" className="hover:text-white transition">
                  Termos e Condições
                </a>
              </li>
              <li>
                <a href="/privacidade" className="hover:text-white transition">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="/contactos" className="hover:text-white transition">
                  Contactos
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3 */}
          <div>
            <h4 className="font-semibold mb-3 text-white">Segue-nos</h4>
            <ul className="flex gap-4 text-lg">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  className="hover:text-white transition"
                >
                  🌐
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  className="hover:text-white transition"
                >
                  📸
                </a>
              </li>
              <li>
                <a
                  href="https://x.com"
                  target="_blank"
                  className="hover:text-white transition"
                >
                  ✖️
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-grey-400 mt-10 pt-4 text-center text-sm text-grey-400">
          © {new Date().getFullYear()} MyVrum. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}