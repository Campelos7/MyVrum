"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ReservasVendedorPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todas" | "pendente" | "aprovado" | "recusado">("todas");
  const [reservaSelecionada, setReservaSelecionada] = useState<any>(null);
  const [showResponderModal, setShowResponderModal] = useState(false);
  const [dias, setDias] = useState(7);

  useEffect(() => {
    if (!session?.user) {
      router.push("/");
      return;
    }
    carregarReservas();
  }, [session]);

  const carregarReservas = async () => {
    setLoading(true);
    try {
      const userEmail = session?.user?.email || "";
      const res = await fetch(`/api/reservas/vendedor?userEmail=${encodeURIComponent(userEmail)}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setReservas(data.reservas || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Erro ao carregar reservas:", res.status, errorData);
      }
    } catch (error) {
      console.error("Erro ao carregar reservas:", error);
    } finally {
      setLoading(false);
    }
  };

  const responderReserva = async (reservaId: string, acao: "aprovar" | "recusar") => {
    try {
      const res = await fetch(`/api/reservas/${reservaId}/responder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acao,
          dias: acao === "aprovar" ? dias : undefined,
          userEmail: session?.user?.email || "",
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Resposta enviada com sucesso!");
        setShowResponderModal(false);
        setReservaSelecionada(null);
        carregarReservas();
      } else {
        alert(data.error || "Erro ao responder reserva");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao responder reserva");
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "text-yellow-400";
      case "aprovado":
        return "text-green-400";
      case "recusado":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente":
        return "⏳ Pendente";
      case "aprovado":
        return "✅ Aprovado";
      case "recusado":
        return "❌ Recusado";
      default:
        return status;
    }
  };

  const reservasFiltradas = filtro === "todas"
    ? reservas
    : reservas.filter((r) => r.status === filtro);

  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans">
      <header className="flex justify-between items-center px-10 py-6 bg-black shadow-sm">
        <Link href="/vender" className="text-lg font-semibold hover:underline">
          ← Voltar
        </Link>
        <h1 className="text-xl font-bold">Gestão de Reservas</h1>
        <div></div>
      </header>

      <div className="px-10 py-8">
        {/* Filtros */}
        <div className="flex gap-4 mb-6 border-b border-zinc-700">
          {["todas", "pendente", "aprovado", "recusado"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f as any)}
              className={`px-4 py-2 font-semibold capitalize ${
                filtro === f
                  ? "border-b-2 border-yellow-400 text-yellow-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {f === "todas" ? "Todas" : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "todas" && ` (${reservas.filter((r) => r.status === f).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">A carregar...</div>
        ) : reservasFiltradas.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Não tens reservas {filtro !== "todas" ? `no estado "${filtro}"` : ""}.
          </div>
        ) : (
          <div className="space-y-4">
            {reservasFiltradas.map((reserva) => (
              <div
                key={reserva.id}
                className="bg-zinc-800 rounded-xl p-6 hover:bg-zinc-700 transition"
              >
                <div className="flex gap-6">
                  {reserva.anuncio?.imagens?.[0] && (
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <Image
                        src={reserva.anuncio.imagens[0].url}
                        alt={reserva.anuncio.titulo}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">
                          {reserva.anuncio?.titulo || "Anúncio removido"}
                        </h3>
                        <p className={`text-sm font-semibold ${getStatusColor(reserva.status)}`}>
                          {getStatusLabel(reserva.status)}
                        </p>
                      </div>
                      {reserva.anuncio?.preco && (
                        <p className="text-yellow-400 font-semibold text-lg">
                          {reserva.anuncio.preco.toLocaleString("pt-PT", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </p>
                      )}
                    </div>

                    <div className="text-sm text-gray-300 space-y-1 mb-4">
                      <p>
                        <strong>Comprador:</strong> {reserva.user.firstName} {reserva.user.lastName}
                      </p>
                      <p>
                        <strong>Email:</strong> {reserva.user.email}
                      </p>
                      <p>
                        <strong>Telefone:</strong> {reserva.user.phone || "N/A"}
                      </p>
                      <p>
                        <strong>Pedido em:</strong> {formatarData(reserva.createdAt)}
                      </p>
                      {reserva.respondidoEm && (
                        <p>
                          <strong>Respondido em:</strong> {formatarData(reserva.respondidoEm)}
                        </p>
                      )}
                      {reserva.expiraEm && (
                        <p>
                          <strong>Expira em:</strong> {formatarData(reserva.expiraEm)}
                        </p>
                      )}
                    </div>

                    {reserva.status === "pendente" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setReservaSelecionada(reserva);
                            setShowResponderModal(true);
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition"
                        >
                          ✅ Aprovar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Tens a certeza que queres recusar este pedido?")) {
                              responderReserva(reserva.id, "recusar");
                            }
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition"
                        >
                          ❌ Recusar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Aprovar Reserva */}
      {showResponderModal && reservaSelecionada && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-xl p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Aprovar Reserva</h2>
            <p className="text-gray-700 mb-4">
              Aprovar reserva de <strong>{reservaSelecionada.user.firstName} {reservaSelecionada.user.lastName}</strong> para{" "}
              <strong>{reservaSelecionada.anuncio.titulo}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Prazo de expiração (dias):
              </label>
              <input
                type="number"
                value={dias}
                onChange={(e) => setDias(parseInt(e.target.value))}
                className="w-full border px-3 py-2 rounded-lg"
                min="1"
                max="30"
              />
              <p className="text-xs text-gray-500 mt-1">
                A reserva expirará em {dias} {dias === 1 ? "dia" : "dias"}.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResponderModal(false);
                  setReservaSelecionada(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={() => responderReserva(reservaSelecionada.id, "aprovar")}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 flex-1"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
