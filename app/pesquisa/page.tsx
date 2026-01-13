"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserAvatar from "../components/UserAvatar";
import LoginModal from "../components/modals/LoginModal";
import RegisterModal from "../components/modals/RegisterModal";
import EditProfileModal from "../components/modals/EditProfileModal";
import NotificacoesDropdown from "../components/NotificacoesDropdown";

export default function PesquisaPage() {
  const { data: session } = useSession();
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    categoria: "",
    marca: "",
    modelo: "",
    anoMin: "",
    anoMax: "",
    precoMin: "",
    precoMax: "",
    quilometragem: "",
    combustivel: "",
    caixa: "",
    localizacao: "",
    ordenacao: "mais_recentes",
  });
  const [filtrosFavoritos, setFiltrosFavoritos] = useState<any[]>([]);
  const [marcasFavoritas, setMarcasFavoritas] = useState<any[]>([]);
  const [mostrarModalFiltro, setMostrarModalFiltro] = useState(false);
  const [nomeFiltro, setNomeFiltro] = useState("");
  const [mostrarMarcasFavoritas, setMostrarMarcasFavoritas] = useState(false);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    carregarAnuncios();
  }, [filtros]);

  useEffect(() => {
    if (session?.user) {
      carregarFiltrosFavoritos();
      carregarMarcasFavoritas();
    }
  }, [session]);

  useEffect(() => {
  function handleClickOutside(e) {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  const carregarAnuncios = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/anuncios?${params.toString()}`);
      const data = await res.json();
      setAnuncios(data.anuncios || []);
    } catch (error) {
      console.error("Erro ao carregar anúncios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (key: string, value: string) => {
    setFiltros({ ...filtros, [key]: value });
  };

  const carregarFiltrosFavoritos = async () => {
    try {
      const res = await fetch(
        `/api/filtros-favoritos?userEmail=${session?.user?.email || ""}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.filtrosFavoritos) {
        setFiltrosFavoritos(data.filtrosFavoritos);
      }
    } catch (error) {
      console.error("Erro ao carregar filtros favoritos:", error);
    }
  };

  const carregarMarcasFavoritas = async () => {
    try {
      const res = await fetch(
        `/api/marcas-favoritas?userEmail=${session?.user?.email || ""}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.marcasFavoritas) {
        setMarcasFavoritas(data.marcasFavoritas);
      }
    } catch (error) {
      console.error("Erro ao carregar marcas favoritas:", error);
    }
  };

  const salvarFiltroFavorito = async () => {
    if (!nomeFiltro.trim()) {
      alert("Por favor, insira um nome para o filtro");
      return;
    }

    try {
      const res = await fetch("/api/filtros-favoritos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nome: nomeFiltro,
          filtros,
          userEmail: session?.user?.email || "",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Filtro salvo com sucesso!");
        setMostrarModalFiltro(false);
        setNomeFiltro("");
        carregarFiltrosFavoritos();
      } else {
        alert(data.error || "Erro ao salvar filtro");
      }
    } catch (error) {
      console.error("Erro ao salvar filtro favorito:", error);
      alert("Erro ao salvar filtro");
    }
  };

  const aplicarFiltroFavorito = (filtroFavorito: any) => {
    setFiltros({ ...filtroFavorito.filtros, ordenacao: filtros.ordenacao });
  };

  const removerFiltroFavorito = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este filtro favorito?")) {
      return;
    }

    try {
      const res = await fetch(
        `/api/filtros-favoritos/${id}?userEmail=${session?.user?.email || ""}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (data.success) {
        carregarFiltrosFavoritos();
      } else {
        alert(data.error || "Erro ao remover filtro");
      }
    } catch (error) {
      console.error("Erro ao remover filtro favorito:", error);
      alert("Erro ao remover filtro");
    }
  };

  const adicionarMarcaFavorita = async () => {
    if (!filtros.marca || filtros.marca.trim() === "") {
      alert("Por favor, insira uma marca primeiro");
      return;
    }

    try {
      const res = await fetch("/api/marcas-favoritas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          marca: filtros.marca,
          userEmail: session?.user?.email || "",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Marca adicionada aos favoritos!");
        carregarMarcasFavoritas();
      } else {
        alert(data.error || "Erro ao adicionar marca");
      }
    } catch (error) {
      console.error("Erro ao adicionar marca favorita:", error);
      alert("Erro ao adicionar marca");
    }
  };

  const removerMarcaFavorita = async (id: string) => {
    try {
      const res = await fetch(
        `/api/marcas-favoritas/${id}?userEmail=${session?.user?.email || ""}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (data.success) {
        carregarMarcasFavoritas();
      } else {
        alert(data.error || "Erro ao remover marca");
      }
    } catch (error) {
      console.error("Erro ao remover marca favorita:", error);
      alert("Erro ao remover marca");
    }
  };

  const isMarcaFavorita = (marca: string) => {
    return marcasFavoritas.some(
      (mf) => mf.marca.toLowerCase() === marca.toLowerCase()
    );
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans">
      {/* Header */}
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
        

      <div className="px-10 py-8">
        <h1 className="text-3xl font-bold mb-6">Pesquisar Veículos</h1>

        {/* Filtros */}
        <div className="bg-zinc-800 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Filtros</h2>
            {session?.user && (
              <div className="flex gap-2">
                <button
                  onClick={() => setMostrarModalFiltro(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition"
                >
                  Guardar Filtros
                </button>
                <button
                  onClick={() => setMostrarMarcasFavoritas(!mostrarMarcasFavoritas)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  {mostrarMarcasFavoritas ? "Ocultar" : "Ver"} Marcas Favoritas
                </button>
              </div>
            )}
          </div>

          {/* Marcas Favoritas */}
          {session?.user && mostrarMarcasFavoritas && (
            <div className="mb-4 p-4 bg-zinc-700 rounded-lg">
              <h3 className="font-semibold mb-2">Marcas Favoritas</h3>
              <div className="flex flex-wrap gap-2">
                {marcasFavoritas.map((mf) => (
                  <span
                    key={mf.id}
                    className="bg-zinc-600 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {mf.marca}
                    <button
                      onClick={() => removerMarcaFavorita(mf.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {marcasFavoritas.length === 0 && (
                  <span className="text-gray-400 text-sm">
                    Nenhuma marca favorita ainda
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Filtros Favoritos */}
          {session?.user && filtrosFavoritos.length > 0 && (
            <div className="mb-4 p-4 bg-zinc-700 rounded-lg">
              <h3 className="font-semibold mb-2">Filtros Favoritos</h3>
              <div className="flex flex-wrap gap-2">
                {filtrosFavoritos.map((ff) => (
                  <button
                    key={ff.id}
                    onClick={() => aplicarFiltroFavorito(ff)}
                    className="bg-zinc-600 hover:bg-zinc-500 px-3 py-1 rounded-full text-sm flex items-center gap-2 transition"
                  >
                    {ff.nome}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        removerFiltroFavorito(ff.id);
                      }}
                      className="text-red-400 hover:text-red-300 cursor-pointer ml-1"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          removerFiltroFavorito(ff.id);
                        }
                      }}
                    >
                      ×
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Categoria"
              value={filtros.categoria}
              onChange={(e) => handleFiltroChange("categoria", e.target.value)}
              className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
            />
            <div className="relative">
              <input
                type="text"
                placeholder="Marca"
                value={filtros.marca}
                onChange={(e) => handleFiltroChange("marca", e.target.value)}
                className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 w-full"
              />
              {session?.user && filtros.marca && (
                <button
                  onClick={adicionarMarcaFavorita}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-400 hover:text-yellow-300"
                  title={
                    isMarcaFavorita(filtros.marca)
                      ? "Marca já está nos favoritos"
                      : "Adicionar aos favoritos"
                  }
                  disabled={isMarcaFavorita(filtros.marca)}
                >
                  {isMarcaFavorita(filtros.marca) ? "★" : "☆"}
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Modelo"
              value={filtros.modelo}
              onChange={(e) => handleFiltroChange("modelo", e.target.value)}
              className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
            />
            <input
              type="number"
              placeholder="Ano Mín."
              value={filtros.anoMin}
              onChange={(e) => handleFiltroChange("anoMin", e.target.value)}
              className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
            />
            <input
              type="number"
              placeholder="Ano Máx."
              value={filtros.anoMax}
              onChange={(e) => handleFiltroChange("anoMax", e.target.value)}
              className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
            />
            <input
              type="number"
              placeholder="Preço Mín. (€)"
              value={filtros.precoMin}
              onChange={(e) => handleFiltroChange("precoMin", e.target.value)}
              className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
            />
            <input
              type="number"
              placeholder="Preço Máx. (€)"
              value={filtros.precoMax}
              onChange={(e) => handleFiltroChange("precoMax", e.target.value)}
              className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
            />
            <input
              type="number"
              placeholder="Quilometragem Máx."
              value={filtros.quilometragem}
              onChange={(e) => handleFiltroChange("quilometragem", e.target.value)}
              className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
            />
            <select
              value={filtros.combustivel}
              onChange={(e) => handleFiltroChange("combustivel", e.target.value)}
              className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Combustível</option>
              <option value="Gasolina">Gasolina</option>
              <option value="Diesel">Diesel</option>
              <option value="Elétrico">Elétrico</option>
              <option value="Híbrido">Híbrido</option>
            </select>
            <select
              value={filtros.caixa}
              onChange={(e) => handleFiltroChange("caixa", e.target.value)}
              className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Caixa</option>
              <option value="Manual">Manual</option>
              <option value="Automática">Automática</option>
            </select>
            <input
              type="text"
              placeholder="Localização"
              value={filtros.localizacao}
              onChange={(e) => handleFiltroChange("localizacao", e.target.value)}
              className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
            />
            <select
              value={filtros.ordenacao}
              onChange={(e) => handleFiltroChange("ordenacao", e.target.value)}
              className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="mais_recentes">Mais Recentes</option>
              <option value="preco_asc">Preço: Menor para Maior</option>
              <option value="preco_desc">Preço: Maior para Menor</option>
              <option value="quilometragem_asc">Quilometragem: Menor para Maior</option>
            </select>
          </div>
        </div>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-12">A carregar...</div>
        ) : anuncios.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Nenhum veículo encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {anuncios.map((anuncio: any) => (
              <Link
                key={anuncio.id}
                href={`/anuncio/${anuncio.id}`}
                className="bg-zinc-800 rounded-xl overflow-hidden hover:shadow-lg transition"
              >
                <div className="relative w-full h-48">
                  {anuncio.imagens && anuncio.imagens.length > 0 ? (
                    <Image
                      src={anuncio.imagens[0].url}
                      alt={anuncio.titulo}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                      <span className="text-gray-400">Sem imagem</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{anuncio.titulo}</h3>
                  <div className="text-sm text-gray-400 space-y-1">
                    {anuncio.marca && anuncio.modelo && (
                      <p>{anuncio.marca} {anuncio.modelo}</p>
                    )}
                    {anuncio.ano && <p>Ano: {anuncio.ano}</p>}
                    {anuncio.quilometragem && (
                      <p>{anuncio.quilometragem.toLocaleString()} km</p>
                    )}
                    {anuncio.preco && (
                      <p className="text-yellow-400 font-semibold text-lg">
                        {anuncio.preco.toLocaleString("pt-PT", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Modal para salvar filtro favorito */}
        <AnimatePresence>
          {mostrarModalFiltro && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setMostrarModalFiltro(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-zinc-800 rounded-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-semibold mb-4">
                  Guardar Filtros Favoritos
                </h3>
                <input
                  type="text"
                  placeholder="Nome do filtro (ex: Carros até 10k€)"
                  value={nomeFiltro}
                  onChange={(e) => setNomeFiltro(e.target.value)}
                  className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 w-full mb-4"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      salvarFiltroFavorito();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={salvarFiltroFavorito}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition flex-1"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setMostrarModalFiltro(false);
                      setNomeFiltro("");
                    }}
                    className="bg-zinc-600 hover:bg-zinc-500 text-white px-4 py-2 rounded-lg font-semibold transition flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}

        {showEditProfile && (
                <EditProfileModal onClose={() => setShowEditProfile(false)} />
              )}
      </div>
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
      <footer className="w-full bg-black text-gray-300 py-10">
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
    </div>
  );
}

