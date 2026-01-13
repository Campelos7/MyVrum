"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut, signIn } from "next-auth/react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import UserAvatar from "../components/UserAvatar";
import EditProfileModal from "../components/modals/EditProfileModal";
import NotificacoesDropdown from "../components/NotificacoesDropdown";

export default function VenderPage() {
  const { data: session } = useSession();

  const [veiculos, setVeiculos] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos"); // todos, ativo, reservado, vendido, pausado

const [novoCarro, setNovoCarro] = useState({
    titulo: "",
    marca: "",
    modelo: "",
    categoria: "",
    ano: "",
    preco: "",
    quilometragem: "",
    combustivel: "",
    caixa: "",
    localizacao: "",
    descricao: "",
    estado: "ativo",
    imagens: [] as File[],
    });

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Carregar veiculos
  useEffect(() => {
    if (session?.user) {
      carregarAnuncios();
    }
  }, [session]);

  const carregarAnuncios = async () => {
    try {
      // Passar email como query param como fallback
      const email = session?.user?.email || "";
      const url = email ? `/api/anuncios/meus?email=${encodeURIComponent(email)}` : "/api/anuncios/meus";
      
      const res = await fetch(url, {
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Erro ao buscar anúncios:", res.status, errorData);
        return;
      }
      const data = await res.json();
      console.log("Anúncios carregados:", data.anuncios);
      setVeiculos(data.anuncios || []);
    } catch (error) {
      console.error("Erro ao carregar anúncios:", error);
    }
  };


  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 font-sans">

      {/* HEADER */}
      <header className="flex justify-between items-center px-10 py-6 bg-black text-white shadow-sm relative z-20">
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
          <div className="text-gray-300">Não autenticado</div>
        )}
      </header>

      {/* HERO */}
      <div className="relative w-full h-[380px] bg-zinc-900 overflow-hidden flex">
        <div className="absolute inset-0">
          <Image
            src="/imagens/car-pesq.png"
            alt="Carro amarelo"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 flex flex-col justify-center h-full px-12 max-w-xl text-white">
          <h1 className="text-4xl font-bold mb-4">
            Vender no MyVrum é simples e rápido
          </h1>
          <p className="text-sm text-gray-200 leading-relaxed">
            Cria os teus anúncios e adiciona-os à tua lista de veículos a publicar.
            Assim, podes gerir tudo num só lugar — editar, ativar ou pausar anúncios
            quando quiseres. Quando publicares, o teu carro fica visível para potenciais compradores.
          </p>
        </div>
      </div>

      {/* LISTA */}
      <div className="px-12 py-10 bg-gray-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">A tua lista:</h2>
          <div className="flex gap-2">
            <Link
              href="/vender/reservas"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              📋 Gerir Reservas
            </Link>
            <Link
              href="/vender/denuncias"
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Ver Denúncias Recebidas
            </Link>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-black"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="reservado">Reservados</option>
              <option value="vendido">Vendidos</option>
              <option value="pausado">Pausados</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          
          {/* Veículos existentes */}
          
          {veiculos
            .filter((v: any) => filtroEstado === "todos" || v.estado === filtroEstado)
            .map((v: any) => (
            <div
              key={v.id}
              className="border border-gray-300 rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white"
            >
              <div className="relative w-full h-40">
                {v.imagens && v.imagens.length > 0 ? (
                  <Image src={v.imagens[0].url} alt={v.titulo} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Sem imagem</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg">{v.titulo}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Estado: <span className="font-semibold">{v.estado}</span>
                </p>
                {v.preco && (
                  <p className="text-lg font-bold text-green-600 mt-2">
                    {v.preco.toLocaleString("pt-PT", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/vender/editar/${v.id}`}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        const novoEstado = v.estado === "ativo" ? "pausado" : "ativo";
                        const userEmail = (session?.user as any)?.email || "";
                        const res = await fetch(`/api/anuncios/${v.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ 
                            estado: novoEstado,
                            userEmail: userEmail 
                          }),
                          credentials: "include",
                        });
                        if (res.ok) {
                          carregarAnuncios();
                        } else {
                          const data = await res.json();
                          alert(data.error || "Erro ao alterar estado");
                        }
                      } catch (error) {
                        console.error("Erro:", error);
                        alert("Erro ao alterar estado");
                      }
                    }}
                    className="text-orange-600 text-sm hover:underline"
                  >
                    {v.estado === "ativo" ? "Pausar" : "Ativar"}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Botão adicionar */}
<button
  onClick={() => setShowCreateModal(true)}
  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-xl p-6 hover:bg-gray-100 transition cursor-pointer w-full"
>
  <div className="w-10 h-10 border-2 border-gray-600 rounded-full flex items-center justify-center mb-2">
    <span className="text-2xl font-bold text-gray-600">+</span>
  </div>
  <span className="mt-2 text-gray-600 font-medium">Adicionar</span>
</button>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-black text-gray-300 py-10 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-white">MyVrum</h3>
            <p className="text-sm text-white max-w-xs">
              A tua plataforma para comprar e vender carros com rapidez e confiança.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-white">Links Úteis</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/termos" className="hover:text-white transition">Termos e Condições</Link></li>
              <li><Link href="/privacidade" className="hover:text-white transition">Política de Privacidade</Link></li>
              <li><Link href="/contactos" className="hover:text-white transition">Contactos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-white">Segue-nos</h4>
            <ul className="flex gap-4 text-lg">
              <li><Link href="https://facebook.com" target="_blank" className="hover:text-white transition">🌐</Link></li>
              <li><Link href="https://instagram.com" target="_blank" className="hover:text-white transition">📸</Link></li>
              <li><Link href="https://x.com" target="_blank" className="hover:text-white transition">✖️</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-grey-400 mt-10 pt-4 text-center text-sm text-grey-400">
          © {new Date().getFullYear()} MyVrum. Todos os direitos reservados.
        </div>
      </footer>

{showCreateModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
    <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6 my-8">
      <h2 className="text-xl font-semibold mb-4">Criar Anúncio</h2>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
            const formData = new FormData();
            // Adicionar email do utilizador como fallback para autenticação
            if (session?.user?.email) {
              formData.append("userEmail", session.user.email);
            }
            formData.append("titulo", novoCarro.titulo);
            formData.append("marca", novoCarro.marca);
            formData.append("modelo", novoCarro.modelo);
            formData.append("categoria", novoCarro.categoria);
            formData.append("ano", novoCarro.ano);
            formData.append("preco", novoCarro.preco);
            formData.append("quilometragem", novoCarro.quilometragem);
            formData.append("combustivel", novoCarro.combustivel);
            formData.append("caixa", novoCarro.caixa);
            formData.append("localizacao", novoCarro.localizacao);
            formData.append("descricao", novoCarro.descricao);
            formData.append("estado", novoCarro.estado);
            novoCarro.imagens.forEach((img) => {
              formData.append("imagens", img);
            });

            const res = await fetch("/api/anuncios/create", {
              method: "POST",
              body: formData,
              credentials: "include",
            });

            const data = await res.json();

            if (res.ok) {
              alert("Anúncio criado com sucesso!");
              setShowCreateModal(false);
              setNovoCarro({
                titulo: "",
                marca: "",
                modelo: "",
                categoria: "",
                ano: "",
                preco: "",
                quilometragem: "",
                combustivel: "",
                caixa: "",
                localizacao: "",
                descricao: "",
                estado: "ativo",
                imagens: [],
              });
              // Aguardar um pouco antes de recarregar para garantir que o anúncio foi salvo
              setTimeout(() => {
                carregarAnuncios();
              }, 500);
            } else {
              alert(data.error || "Erro ao criar anúncio");
            }
          } catch (error: any) {
            console.error("Erro:", error);
            alert(error.message || "Erro ao criar anúncio");
          } finally {
            setLoading(false);
          }
        }}
        className="space-y-4"
      >
        <input
          type="text"
          placeholder="Título *"
          value={novoCarro.titulo}
          onChange={(e) => setNovoCarro({ ...novoCarro, titulo: e.target.value })}
          className="w-full border px-3 py-2 rounded-lg"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Marca"
            value={novoCarro.marca}
            onChange={(e) => setNovoCarro({ ...novoCarro, marca: e.target.value })}
            className="w-full border px-3 py-2 rounded-lg"
          />
          <input
            type="text"
            placeholder="Modelo"
            value={novoCarro.modelo}
            onChange={(e) => setNovoCarro({ ...novoCarro, modelo: e.target.value })}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Categoria"
            value={novoCarro.categoria}
            onChange={(e) => setNovoCarro({ ...novoCarro, categoria: e.target.value })}
            className="w-full border px-3 py-2 rounded-lg"
          />
          <input
            type="number"
            placeholder="Ano"
            value={novoCarro.ano}
            onChange={(e) => setNovoCarro({ ...novoCarro, ano: e.target.value })}
            className="w-full border px-3 py-2 rounded-lg"
          />
          <input
            type="number"
            placeholder="Preço (€)"
            value={novoCarro.preco}
            onChange={(e) => setNovoCarro({ ...novoCarro, preco: e.target.value })}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="Quilometragem"
            value={novoCarro.quilometragem}
            onChange={(e) => setNovoCarro({ ...novoCarro, quilometragem: e.target.value })}
            className="w-full border px-3 py-2 rounded-lg"
          />
          <select
            value={novoCarro.combustivel}
            onChange={(e) => setNovoCarro({ ...novoCarro, combustivel: e.target.value })}
            className="w-full border px-3 py-2 rounded-lg"
          >
            <option value="">Combustível</option>
            <option value="Gasolina">Gasolina</option>
            <option value="Diesel">Diesel</option>
            <option value="Elétrico">Elétrico</option>
            <option value="Híbrido">Híbrido</option>
          </select>
          <select
            value={novoCarro.caixa}
            onChange={(e) => setNovoCarro({ ...novoCarro, caixa: e.target.value })}
            className="w-full border px-3 py-2 rounded-lg"
          >
            <option value="">Caixa</option>
            <option value="Manual">Manual</option>
            <option value="Automática">Automática</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Localização"
          value={novoCarro.localizacao}
          onChange={(e) => setNovoCarro({ ...novoCarro, localizacao: e.target.value })}
          className="w-full border px-3 py-2 rounded-lg"
        />

        <textarea
          placeholder="Descrição"
          value={novoCarro.descricao}
          onChange={(e) => setNovoCarro({ ...novoCarro, descricao: e.target.value })}
          className="w-full border px-3 py-2 rounded-lg"
          rows={4}
        />

        <div>
          <label className="block mb-2">Imagens (múltiplas):</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setNovoCarro({ ...novoCarro, imagens: files });
            }}
            className="w-full border px-3 py-2 rounded-lg bg-gray-50"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setShowCreateModal(false);
              setNovoCarro({
                titulo: "",
                marca: "",
                modelo: "",
                categoria: "",
                ano: "",
                preco: "",
                quilometragem: "",
                combustivel: "",
                caixa: "",
                localizacao: "",
                descricao: "",
                estado: "ativo",
                imagens: [],
              });
            }}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "A criar..." : "Criar Anúncio"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Modal de Editar Perfil */}
      <AnimatePresence>
        {showEditProfile && (
          <EditProfileModal onClose={() => setShowEditProfile(false)} />
        )}
      </AnimatePresence>

    </div>
    
  );
}
