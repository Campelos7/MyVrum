"use client";

import { Mail, Users, MessageSquare } from "lucide-react";

export default function Contactos() {
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
        <h1 className="text-4xl font-bold mb-8 text-center">Contactos</h1>

        <div className="bg-zinc-900 rounded-2xl p-8 shadow-xl space-y-8">
          {/* Introdução */}
          <section className="text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-300 leading-relaxed">
              Tem alguma questão, sugestão ou precisa de ajuda? Entre em contacto
              connosco! A equipa MyVrum está disponível para o ajudar.
            </p>
          </section>

          {/* Equipa */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-semibold text-white">
                Nossa Equipa
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* André */}
              <div className="bg-black rounded-xl p-6 text-center hover:bg-zinc-800 transition">
                <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                  A
                </div>
                <h3 className="text-xl font-semibold mb-2">André</h3>
                <a
                  href="mailto:al81545@alunos.utad.pt"
                  className="text-blue-400 hover:text-blue-300 text-sm break-all"
                >
                  al81545@alunos.utad.pt
                </a>
              </div>

              {/* Francisco */}
              <div className="bg-black rounded-xl p-6 text-center hover:bg-zinc-800 transition">
                <div className="w-20 h-20 bg-linear-to-br from-green-500 to-green-700 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                  F
                </div>
                <h3 className="text-xl font-semibold mb-2">Francisco</h3>
                <a
                  href="mailto:al82066@alunos.utad.pt"
                  className="text-blue-400 hover:text-blue-300 text-sm break-all"
                >
                  al82066@alunos.utad.pt
                </a>
              </div>

              {/* Tomás */}
              <div className="bg-black rounded-xl p-6 text-center hover:bg-zinc-800 transition">
                <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-purple-700 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                  T
                </div>
                <h3 className="text-xl font-semibold mb-2">Tomás</h3>
                <a
                  href="mailto:al82634@alunos.utad.pt"
                  className="text-blue-400 hover:text-blue-300 text-sm break-all"
                >
                  al82634@alunos.utad.pt
                </a>
              </div>
            </div>
          </section>

          {/* Informação Geral */}
          <section className="border-t border-gray-700 pt-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-semibold text-white">
                Informação Geral
              </h2>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2">
                  Horários de Suporte
                </h3>
                <p className="mb-2">
                  <span className="font-semibold">Segunda a Sexta:</span> 9:00 - 18:00
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Sábado:</span> 10:00 - 14:00
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Domingo:</span> Encerrado
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Tentamos responder a todos os pedidos no prazo de 24-48 horas
                  úteis. Para questões urgentes, por favor indique no assunto do
                  e-mail.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">
                  Tipos de Suporte
                </h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Ajuda com registo e gestão de conta</li>
                  <li>Questões sobre anúncios e veículos</li>
                  <li>Problemas técnicos na plataforma</li>
                  <li>Sugestões e feedback</li>
                  <li>Parcerias e colaborações</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">
                  Redes Sociais
                </h3>
                <p>
                  Também pode seguir-nos nas redes sociais para estar a par das
                  últimas novidades e promoções da MyVrum.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="bg-black rounded-xl p-6 text-center">
            <h3 className="text-xl font-semibold mb-3">
              Pronto para começar?
            </h3>
            <p className="text-gray-400 mb-4">
              Junta-te à comunidade MyVrum e acelere o seu próximo negócio!
            </p>
            <a
              href="/"
              className="inline-block bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
            >
              Ir para a Página Inicial
            </a>
          </section>
        </div>
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