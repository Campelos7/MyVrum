"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserAvatar from "../../components/UserAvatar";
import LoginModal from "../../components/modals/LoginModal";
import RegisterModal from "../../components/modals/RegisterModal";
import EditProfileModal from "../../components/modals/EditProfileModal";
import NotificacoesDropdown from "../../components/NotificacoesDropdown";

export default function AnuncioDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [anuncio, setAnuncio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imagemSelecionada, setImagemSelecionada] = useState(0);
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [showVisitaModal, setShowVisitaModal] = useState(false);
  const [showComprarModal, setShowComprarModal] = useState(false);
  const [showDenunciaModal, setShowDenunciaModal] = useState(false);
  
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    if (params?.id) {
      carregarAnuncio();
    }
      function handleClickOutside(e) {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [params?.id]);

  const carregarAnuncio = async () => {
    setLoading(true);
    try {
      const id = typeof params.id === 'string' ? params.id : params.id?.[0] || params.id;
      if (!id) {
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/anuncios/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Erro ao carregar anúncio:", res.status, errorData);
        throw new Error(errorData.error || 'Erro ao carregar anúncio');
      }
      const data = await res.json();
      if (data.anuncio) {
        setAnuncio(data.anuncio);
      } else {
        console.error("Anúncio não encontrado nos dados:", data);
        throw new Error("Anúncio não encontrado");
      }
    } catch (error) {
      console.error("Erro ao carregar anúncio:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReservar = async () => {
    if (!session) {
      alert("Precisa de estar autenticado para reservar");
      return;
    }
    // Implementar reserva
    setShowReservaModal(true);
  };

  const handleMarcarVisita = async () => {
    if (!session) {
      alert("Precisa de estar autenticado para marcar visita");
      return;
    }
    setShowVisitaModal(true);
  };

  const handleComprar = async () => {
    if (!session) {
      alert("Precisa de estar autenticado para comprar");
      return;
    }
    setShowComprarModal(true);
  };

  const handleDenunciar = async () => {
    if (!session) {
      alert("Precisa de estar autenticado para denunciar");
      return;
    }
    setShowDenunciaModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div>A carregar...</div>
      </div>
    );
  }

  if (!anuncio) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div>Anúncio não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6 bg-black shadow-sm relative z-20">
          <Link href="/pesquisa" className="text-lg font-semibold hover:underline"> ← Voltar à Pesquisa </Link>

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
      <div className="px-10 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galeria de Imagens */}
          <div>
            <div className="relative w-full h-96 rounded-xl overflow-hidden mb-4 bg-zinc-800">
              {anuncio.imagens && anuncio.imagens.length > 0 ? (
                <Image
                  src={anuncio.imagens[imagemSelecionada]?.url || anuncio.imagens[0].url}
                  alt={anuncio.titulo}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">Sem imagem</span>
                </div>
              )}
            </div>
            {anuncio.imagens && anuncio.imagens.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {anuncio.imagens.map((img: any, idx: number) => (
                  <button
                    key={img.id}
                    onClick={() => setImagemSelecionada(idx)}
                    className={`relative h-20 rounded-lg overflow-hidden ${
                      imagemSelecionada === idx ? "ring-2 ring-yellow-400" : ""
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Imagem ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{anuncio.titulo}</h1>
            {anuncio.preco && (
              <p className="text-4xl font-bold text-yellow-400 mb-6">
                {anuncio.preco.toLocaleString("pt-PT", {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>
            )}

            <div className="bg-zinc-800 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Detalhes</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {anuncio.marca && (
                  <div>
                    <span className="text-gray-400">Marca:</span> {anuncio.marca}
                  </div>
                )}
                {anuncio.modelo && (
                  <div>
                    <span className="text-gray-400">Modelo:</span> {anuncio.modelo}
                  </div>
                )}
                {anuncio.ano && (
                  <div>
                    <span className="text-gray-400">Ano:</span> {anuncio.ano}
                  </div>
                )}
                {anuncio.quilometragem && (
                  <div>
                    <span className="text-gray-400">Quilometragem:</span>{" "}
                    {anuncio.quilometragem.toLocaleString()} km
                  </div>
                )}
                {anuncio.combustivel && (
                  <div>
                    <span className="text-gray-400">Combustível:</span> {anuncio.combustivel}
                  </div>
                )}
                {anuncio.caixa && (
                  <div>
                    <span className="text-gray-400">Caixa:</span> {anuncio.caixa}
                  </div>
                )}
                {anuncio.localizacao && (
                  <div>
                    <span className="text-gray-400">Localização:</span> {anuncio.localizacao}
                  </div>
                )}
                {anuncio.categoria && (
                  <div>
                    <span className="text-gray-400">Categoria:</span> {anuncio.categoria}
                  </div>
                )}
              </div>
            </div>

            {anuncio.descricao && (
              <div className="bg-zinc-800 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Descrição</h2>
                <p className="text-gray-300 whitespace-pre-line">{anuncio.descricao}</p>
              </div>
            )}

            {/* Informações do Vendedor */}
            {anuncio.user && (
              <div className="bg-zinc-800 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Vendedor</h2>
                <p>
                  {anuncio.user.firstName} {anuncio.user.lastName}
                </p>
                {anuncio.user.phone && <p className="text-gray-400">{anuncio.user.phone}</p>}
              </div>
            )}

            {/* Ações */}
            {session && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleReservar}
                  className="bg-zinc-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-400 transition"
                >
                  Reservar Veículo
                </button>
                <button
                  onClick={handleMarcarVisita}
                  className="bg-zinc-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-400 transition"
                >
                  Marcar Visita
                </button>
                {anuncio.userId !== (session?.user as any)?.id && (
                  <Link
                    href={`/mensagens?anuncioId=${anuncio.id}`}
                    className="bg-zinc-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-400 transition text-center"
                  >
                    Enviar Mensagem ao Vendedor
                  </Link>
                )}
                <button
                  onClick={handleComprar}
                  className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-400 transition"
                >
                  Comprar Agora
                </button>
                <button
                  onClick={handleDenunciar}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-400 transition"
                >
                  Denunciar Anúncio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modais - serão implementados depois */}
      {showReservaModal && (
        <ReservaModal
          anuncioId={anuncio.id}
          onClose={() => setShowReservaModal(false)}
        />
      )}
      {showVisitaModal && (
        <VisitaModal
          anuncioId={anuncio.id}
          onClose={() => setShowVisitaModal(false)}
        />
      )}
      {showComprarModal && (
        <ComprarModal
          anuncioId={anuncio.id}
          preco={anuncio.preco}
          onClose={() => setShowComprarModal(false)}
        />
      )}
      {showDenunciaModal && (
        <DenunciaModal
          tipo="anuncio"
          anuncioId={anuncio.id}
          onClose={() => setShowDenunciaModal(false)}
        />
      )}

      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}

// Componentes de Modal (simplificados por agora)
function ReservaModal({ anuncioId, onClose }: { anuncioId: string; onClose: () => void }) {
  const { data: session } = useSession();

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anuncioId,
          userEmail: session?.user?.email || "",
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Pedido de reserva enviado com sucesso!\nO vendedor irá analisar e responder ao seu pedido.");
        onClose();
      } else {
        alert(data.error || "Erro ao enviar pedido de reserva");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao enviar pedido de reserva");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-xl p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">📝 Pedir Reserva de Veículo</h2>
        <div className="space-y-4">
          <p className="text-gray-700">
            Ao enviar este pedido, o vendedor será notificado e poderá aprovar ou recusar a reserva.
            Se aprovado, o veículo ficará reservado para si por um período determinado pelo vendedor.
          </p>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-yellow-500 rounded-lg hover:bg-yellow-400"
          >
            Enviar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}

function VisitaModal({ anuncioId, onClose }: { anuncioId: string; onClose: () => void }) {
  const { data: session } = useSession();
  const [dataHora, setDataHora] = useState("");

  const handleSubmit = async () => {
    try {
      if (!dataHora) {
        alert("Por favor, selecione uma data e hora");
        return;
      }
      const res = await fetch("/api/visitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anuncioId,
          dataHora,
          userEmail: session?.user?.email || "",
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        alert("Visita marcada com sucesso!");
        onClose();
      } else {
        alert(data.error || "Erro ao marcar visita");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao marcar visita");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-xl p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Marcar Visita</h2>
        <div className="space-y-4">
          <div>
            <label>Data e Hora:</label>
            <input
              type="datetime-local"
              value={dataHora}
              onChange={(e) => setDataHora(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg mt-1"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

function ComprarModal({
  anuncioId,
  preco,
  onClose,
}: {
  anuncioId: string;
  preco?: number;
  onClose: () => void;
}) {
  const { data: session } = useSession();

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/encomendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anuncioId,
          userEmail: session?.user?.email || "",
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        alert("Compra realizada com sucesso!");
        onClose();
      } else {
        alert(data.error || "Erro ao realizar compra");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao realizar compra");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-xl p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Confirmar Compra</h2>
        {preco && (
          <p className="text-2xl font-bold mb-4">
            {preco.toLocaleString("pt-PT", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
        )}
        <p className="text-gray-600 mb-6">
          Esta é uma simulação de checkout. O pagamento será processado.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400"
          >
            Confirmar Compra
          </button>
        </div>
      </div>
    </div>
  );
}

function DenunciaModal({
  tipo,
  anuncioId,
  onClose,
}: {
  tipo: string;
  anuncioId?: string;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const [motivo, setMotivo] = useState("");
  const [descricao, setDescricao] = useState("");

  const handleSubmit = async () => {
    try {
      if (!motivo || motivo.trim() === "") {
        alert("Por favor, selecione um motivo");
        return;
      }
      const res = await fetch("/api/denuncias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          anuncioId,
          motivo,
          descricao,
          userEmail: session?.user?.email || "",
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        alert("Denúncia enviada com sucesso!");
        onClose();
      } else {
        alert(data.error || "Erro ao enviar denúncia");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao enviar denúncia");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-xl p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Denunciar</h2>
        <div className="space-y-4">
          <div>
            <label>Motivo:</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg mt-1"
            >
              <option value="">Selecione...</option>
              <option value="enganoso">Anúncio Enganoso</option>
              <option value="informacoes_incorretas">Informações Incorretas</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label>Descrição:</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg mt-1"
              rows={4}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400"
          >
            Enviar Denúncia
          </button>
        </div>
      </div>
    </div>
  );
}

