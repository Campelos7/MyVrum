"use client";

export default function PoliticaPrivacidade() {
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
          Política de Privacidade
        </h1>
        
        <div className="bg-zinc-900 rounded-2xl p-8 shadow-xl space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              1. Introdução
            </h2>
            <p>
              A MyVrum valoriza a privacidade dos seus utilizadores e compromete-se a proteger os dados pessoais recolhidos através da plataforma. Esta Política de Privacidade explica como recolhemos, utilizamos, armazenamos e protegemos as suas informações.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              2. Dados Recolhidos
            </h2>
            <p>
              A MyVrum pode recolher os seguintes tipos de dados pessoais:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Nome completo e apelido</li>
              <li>Endereço de e-mail</li>
              <li>Fotografia de perfil (opcional)</li>
              <li>Informações sobre veículos anunciados</li>
              <li>Dados de navegação e utilização da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              3. Finalidade do Tratamento de Dados
            </h2>
            <p>
              Os dados pessoais recolhidos são utilizados para as seguintes finalidades:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Criação e gestão de contas de utilizador</li>
              <li>Publicação e gestão de anúncios de veículos</li>
              <li>Comunicação entre compradores e vendedores</li>
              <li>Melhoramento da experiência do utilizador na plataforma</li>
              <li>Envio de notificações relacionadas com a atividade na conta</li>
              <li>Cumprimento de obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              4. Partilha de Dados
            </h2>
            <p>
              A MyVrum não vende, aluga ou partilha dados pessoais dos utilizadores com terceiros, exceto nas seguintes situações:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Quando necessário para facilitar transações entre utilizadores</li>
              <li>Quando exigido por lei ou por ordem judicial</li>
              <li>Para proteção dos direitos e segurança da MyVrum e dos seus utilizadores</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              5. Segurança dos Dados
            </h2>
            <p>
              A MyVrum implementa medidas de segurança técnicas e organizacionais adequadas para proteger os dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum sistema é totalmente seguro, pelo que não podemos garantir segurança absoluta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              6. Cookies e Tecnologias Semelhantes
            </h2>
            <p>
              A plataforma MyVrum utiliza cookies e tecnologias semelhantes para melhorar a experiência do utilizador, analisar o uso da plataforma e personalizar conteúdos. O utilizador pode gerir as preferências de cookies através das configurações do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              7. Direitos dos Utilizadores
            </h2>
            <p>
              De acordo com o Regulamento Geral de Proteção de Dados (RGPD), os utilizadores têm os seguintes direitos:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Direito de acesso aos seus dados pessoais</li>
              <li>Direito de retificação de dados incorretos ou incompletos</li>
              <li>Direito ao apagamento dos dados ("direito ao esquecimento")</li>
              <li>Direito à limitação do tratamento</li>
              <li>Direito à portabilidade dos dados</li>
              <li>Direito de oposição ao tratamento de dados</li>
            </ul>
            <p className="mt-2">
              Para exercer qualquer destes direitos, contacte-nos através da nossa página de{" "}
              <a href="/contactos" className="text-blue-400 hover:underline">
                Contactos
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              8. Retenção de Dados
            </h2>
            <p>
              Os dados pessoais são conservados apenas pelo período necessário para as finalidades para as quais foram recolhidos, ou conforme exigido por lei. Após este período, os dados serão eliminados ou anonimizados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              9. Alterações à Política de Privacidade
            </h2>
            <p>
              A MyVrum reserva-se o direito de atualizar esta Política de Privacidade a qualquer momento. As alterações serão publicadas nesta página e a data da última atualização será indicada no final do documento. Recomendamos que consulte regularmente esta página.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              10. Contacto
            </h2>
            <p>
              Para questões relacionadas com a privacidade e proteção de dados, pode contactar-nos através da nossa página de{" "}
              <a href="/contactos" className="text-blue-400 hover:underline">
                Contactos
              </a>
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