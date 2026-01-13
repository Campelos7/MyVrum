"use client";

import { useEffect, useRef } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserAvatar from "./components/UserAvatar";
import LoginModal from "./components/modals/LoginModal";
import RegisterModal from "./components/modals/RegisterModal";
import EditProfileModal from "./components/modals/EditProfileModal";
import NotificacoesDropdown from "./components/NotificacoesDropdown";


export default function HomePage() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
useEffect(() => {
  function handleClickOutside(e) {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* HERO SECTION */}
      <section className="relative flex flex-col justify-between h-screen bg-black text-white">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/imagens/car-hero.jpg"
            alt="Carro desportivo"
            fill
            className="object-cover opacity-70"
            priority
          />
        </div>

        {/* Navbar */}
        <header className="flex justify-between items-center px-10 py-6 bg-black shadow-sm relative z-20">
          <Link href="/" className="text-lg font-semibold hover:underline">
            MyVrum
          </Link>

          {session?.user ? (
            <div className="relative flex items-center gap-4">
              {/* Ícone de notificações */}
              <div className="relative group">
                <NotificacoesDropdown />
              </div>

{/* Dropdown Nome + Avatar */}
<div className="relative" ref={dropdownRef}>
  <button
    onClick={() => setOpen((prev) => !prev)}
    className="flex items-center gap-3 hover:opacity-80 transition"
  >
    <div className="flex flex-col text-right leading-tight">
      <span className="font-semibold text-white text-sm">{session.user.name}</span>
    </div>
    <UserAvatar name={session.user.name} image={session.user.image} />
  </button>

  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15 }}
        className="absolute right-0 mt-3 w-48 bg-zinc-900 border border-zinc-700 text-white rounded-xl shadow-xl overflow-hidden z-50"
      >
        <button
          className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-800 transition flex items-center gap-2"
          onClick={() => {
            setShowEditProfile(true);
            setOpen(false);
          }}
        >
          ✏️ Editar Perfil
        </button>

        <Link
          href="/minhas-reservas"
          className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-800 transition flex items-center gap-2"
          onClick={() => setOpen(false)}
        >
          📋 As Minhas Reservas
        </Link>
        <Link
          href="/minhas-denuncias"
          className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-800 transition flex items-center gap-2"
          onClick={() => setOpen(false)}
        >
          🚨 As Minhas Denúncias
        </Link>
        {(session.user as any).admin && (
          <Link
            href="/backoffice"
            className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-800 transition flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            🔧 Backoffice
          </Link>
        )}

        <button
          className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-800 transition flex items-center gap-2"
          onClick={() => signOut()}
        >
          🚪 Terminar Sessão
        </button>
      </motion.div>
    )}
  </AnimatePresence>
</div>
            </div>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogin(true)}
                className="border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
              >
                Iniciar Sessão
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
              >
                Registar
              </button>
            </div>
          )}
        </header>

        {/* HERO TEXT */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-5xl font-bold mb-4">MyVrum</h1>
          <p className="text-xl text-gray-300">
            Mais Rápido. Mais Fácil. MyVrum.
          </p>
        </div>
      </section>

            {/* Secção Quem Somos */}
      <section className="flex flex-col md:flex-row items-start justify-center gap-10 px-10 py-20 bg-zinc-900 text-white">
        {/* Vídeo do YouTube */}
        <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden shadow-lg">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/XY8Qp_c6BQo"
            title="MyVrum Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>

        {/* Texto de descrição */}
        <div className="w-full md:w-1/2 text-zinc-300 leading-relaxed">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Vrum! É assim que fazemos
          </h2>
          <p className="mb-4">
            Aqui não há truques nem papeladas infinitas: tu anuncias, encontras e
            fechas negócio num piscar de olhos. Queres vender o teu carro? Dá
            upload às fotos, conta a história dele e deixa que os interessados te
            encontrem. À procura de uma nova máquina? Navega pelo nosso site,
            compara opções e encontra o carro certo ao melhor preço.
          </p>
          <p className="mb-4">
            Na MyVrum, o volante está nas tuas mãos. Junta-te à comunidade e
            acelera o teu próximo negócio!
          </p>
        </div>
      </section>

      {/* Segunda Secção */}
      <section className="flex flex-col md:flex-row items-center justify-between px-20 py-20 bg-zinc-900 text-white">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold mb-4">Diz-nos o que procuras</h2>
          <p className="text-zinc-400 mb-6">
            Filtra por marca, modelo, ano, combustível e preço num instante.
          </p>
          <Link
            href="/pesquisa"
            className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition"
          >
            Explorar
          </Link>
        </div>

        <div className="mt-10 md:mt-0 md:ml-10">
          <Image
            src="/imagens/buy-car.jpg"
            alt="Carro amarelo"
            width={500}
            height={300}
            className="rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* Secção "Pronto a vender?" */}
      <section className="flex flex-col md:flex-row items-center justify-between px-20 py-20 bg-zinc-900 text-white">
        {/* Imagem à esquerda */}
        <div className="mt-10 md:mt-0 md:mr-10 order-2 md:order-1">
          <Image
            src="/imagens/sell-car.png"
            alt="Vender carro"
            width={500}
            height={300}
            className="rounded-2xl shadow-lg"
          />
        </div>

        {/* Texto à direita */}
<div className="max-w-lg order-1 md:order-2">
  <h2 className="text-3xl font-bold mb-4">Pronto a vender?</h2>

  <p className="text-zinc-400 mb-6">
    Vende o teu carro de forma rápida, simples e segura. Em breve poderás
    anunciar o teu veículo diretamente na nossa plataforma!
  </p>

  {/* BOTÃO DEPENDENTE DO ESTADO DO USER */}
  {!session?.user ? (
    // ➤ Não autenticado
    <button
      disabled
      className="flex items-center gap-2 bg-gray-700 text-gray-300 px-6 py-3 rounded-lg cursor-not-allowed"
    >
      🔒 Exclusivo Vendedores
    </button>
  ) : !(session.user as any).vendedor ? (
    // ➤ Autenticado mas não é vendedor
    <button
      onClick={() => setShowEditProfile(true)}
      className="flex items-center gap-2 bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-400 transition"
    >
      🚀 Tornar-me Vendedor
    </button>
  ) : (
    // ➤ Já é vendedor
    <Link
      href="/vender"
      className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition"
    >
      Explorar
    </Link>
  )}
</div>
      </section>

      {/* Divisória animada */}
      <div className="relative w-full h-32 overflow-hidden bg-zinc-900">
        {/* Estrada */}
        <div className="absolute bottom-0 w-full h-8 bg-black"></div>

        {/* Carro animado */}
        <div className="absolute left-0 bottom-0 animate-car-move">
          <Image
            src="/imagens/car-anim.png"
            alt="Carro animado"
            width={100}
            height={50}
            className="animate-car-bounce"
          />
        </div>
      </div>

 {/* Footer */}
      <footer className="bg-black text-gray-300 py-10 px-10">
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
                <Link href="/termos" className="hover:text-white transition">
                  Termos e Condições
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-white transition">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/contactos" className="hover:text-white transition">
                  Contactos
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3 */}
          <div>
            <h4 className="font-semibold mb-3 text-white">Segue-nos</h4>
            <ul className="flex gap-4 text-lg">
              <li>
                <Link
                  href="https://facebook.com"
                  target="_blank"
                  className="hover:text-white transition"
                >
                  🌐
                </Link>
              </li>
              <li>
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  className="hover:text-white transition"
                >
                  📸
                </Link>
              </li>
              <li>
                <Link
                  href="https://x.com"
                  target="_blank"
                  className="hover:text-white transition"
                >
                  ✖️
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-grey-400 mt-10 pt-4 text-center text-sm text-grey-400">
          © {new Date().getFullYear()} MyVrum. Todos os direitos reservados.
        </div>
      </footer>

      {/* MODAIS */}
      <AnimatePresence>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
        {showEditProfile && (
          <EditProfileModal onClose={() => setShowEditProfile(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
