"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function MinhasReservasPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [reservas, setReservas] = useState<any[]>([]);
  const [visitas, setVisitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState<"reservas" | "visitas">("reservas");

  useEffect(() => {
    if (!session?.user) {
      router.push("/");
      return;
    }
    carregarDados();
  }, [session]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const userEmail = session?.user?.email || "";
      const [resReservas, resVisitas] = await Promise.all([
        fetch(`/api/reservas?userEmail=${encodeURIComponent(userEmail)}`, { credentials: "include" }),
        fetch(`/api/visitas?userEmail=${encodeURIComponent(userEmail)}`, { credentials: "include" }),
      ]);

      if (resReservas.ok) {
        const dataReservas = await resReservas.json();
        setReservas(dataReservas.reservas || []);
      } else {
        const errorData = await resReservas.json().catch(() => ({}));
        console.error("Erro ao carregar reservas:", resReservas.status, errorData);
      }

      if (resVisitas.ok) {
        const dataVisitas = await resVisitas.json();
        setVisitas(dataVisitas.visitas || []);
      } else {
        const errorData = await resVisitas.json().catch(() => ({}));
        console.error("Erro ao carregar visitas:", resVisitas.status, errorData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
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

  const isExpirada = (expiraEm: string) => {
    return new Date(expiraEm) < new Date();
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans">
      <header className="flex justify-between items-center px-10 py-6 bg-black shadow-sm">
        <Link href="/" className="text-lg font-semibold hover:underline">
          MyVrum
        </Link>
        <Link href="/" className="text-white hover:underline">
          Voltar
        </Link>
      </header>

      <div className="px-10 py-8">
        <h1 className="text-3xl font-bold mb-6">As Minhas Reservas e Visitas</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-zinc-700">
          <button
            onClick={() => setAba("reservas")}
            className={`px-4 py-2 font-semibold ${
              aba === "reservas"
                ? "border-b-2 border-yellow-400 text-yellow-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Reservas ({reservas.length})
          </button>
          <button
            onClick={() => setAba("visitas")}
            className={`px-4 py-2 font-semibold ${
              aba === "visitas"
                ? "border-b-2 border-yellow-400 text-yellow-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Visitas ({visitas.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">A carregar...</div>
        ) : aba === "reservas" ? (
          <div className="space-y-4">
            {reservas.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                Não tens reservas ainda.
              </div>
            ) : (
              reservas.map((reserva) => (
                <Link
                  key={reserva.id}
                  href={`/anuncio/${reserva.anuncioId}`}
                  className="block bg-zinc-800 rounded-xl p-6 hover:bg-zinc-700 transition"
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
                      <h3 className="text-xl font-semibold mb-2">
                        {reserva.anuncio?.titulo || "Anúncio removido"}
                      </h3>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>
                          Reservado em: {formatarData(reserva.createdAt)}
                        </p>
                        <p>
                          Expira em: {formatarData(reserva.expiraEm)}
                        </p>
                        {isExpirada(reserva.expiraEm) && (
                          <p className="text-red-400 font-semibold">
                            ⚠️ Reserva expirada
                          </p>
                        )}
                        {reserva.anuncio?.preco && (
                          <p className="text-yellow-400 font-semibold text-lg mt-2">
                            {reserva.anuncio.preco.toLocaleString("pt-PT", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {visitas.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                Não tens visitas marcadas ainda.
              </div>
            ) : (
              visitas.map((visita) => (
                <Link
                  key={visita.id}
                  href={`/anuncio/${visita.anuncioId}`}
                  className="block bg-zinc-800 rounded-xl p-6 hover:bg-zinc-700 transition"
                >
                  <div className="flex gap-6">
                    {visita.anuncio?.imagens?.[0] && (
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <Image
                          src={visita.anuncio.imagens[0].url}
                          alt={visita.anuncio.titulo}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {visita.anuncio?.titulo || "Anúncio removido"}
                      </h3>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>
                          Visita marcada para: {formatarData(visita.dataHora)}
                        </p>
                        {new Date(visita.dataHora) < new Date() && (
                          <p className="text-gray-500">✓ Visita realizada</p>
                        )}
                        {visita.anuncio?.preco && (
                          <p className="text-yellow-400 font-semibold text-lg mt-2">
                            {visita.anuncio.preco.toLocaleString("pt-PT", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

