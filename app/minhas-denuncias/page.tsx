"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function MinhasDenunciasPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [denuncias, setDenuncias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  useEffect(() => {
    if (!session?.user) {
      router.push("/");
      return;
    }
    carregarDenuncias();
  }, [session, filtroEstado]);

  const carregarDenuncias = async () => {
    setLoading(true);
    try {
      const userEmail = session?.user?.email || "";
      const url = filtroEstado === "todos" 
        ? `/api/denuncias?userEmail=${encodeURIComponent(userEmail)}` 
        : `/api/denuncias?estado=${filtroEstado}&userEmail=${encodeURIComponent(userEmail)}`;
      
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        // A API já filtra apenas as denúncias do utilizador quando não é admin
        setDenuncias(data.denuncias || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Erro ao carregar denúncias:", res.status, errorData);
      }
    } catch (error) {
      console.error("Erro ao carregar denúncias:", error);
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

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "aberta":
        return "text-yellow-400";
      case "em_analise":
        return "text-blue-400";
      case "encerrada":
        return "text-gray-400";
      default:
        return "text-white";
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case "aberta":
        return "Aberta";
      case "em_analise":
        return "Em Análise";
      case "encerrada":
        return "Encerrada";
      default:
        return estado;
    }
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
        <h1 className="text-3xl font-bold mb-6">As Minhas Denúncias</h1>

        {/* Filtro */}
        <div className="mb-6">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2 text-white"
          >
            <option value="todos">Todos os Estados</option>
            <option value="aberta">Abertas</option>
            <option value="em_analise">Em Análise</option>
            <option value="encerrada">Encerradas</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">A carregar...</div>
        ) : (
          <div className="space-y-4">
            {denuncias.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                Não tens denúncias enviadas ainda.
              </div>
            ) : (
              denuncias.map((denuncia) => (
                <div
                  key={denuncia.id}
                  className="bg-zinc-800 rounded-xl p-6 hover:bg-zinc-700 transition"
                >
                  <div className="flex gap-6">
                    {denuncia.anuncio?.imagens?.[0] && (
                      <Link
                        href={`/anuncio/${denuncia.anuncioId}`}
                        className="relative w-32 h-32 flex-shrink-0"
                      >
                        <Image
                          src={denuncia.anuncio.imagens[0].url}
                          alt={denuncia.anuncio.titulo}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </Link>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            {denuncia.tipo === "anuncio" ? (
                              <Link
                                href={`/anuncio/${denuncia.anuncioId}`}
                                className="hover:underline"
                              >
                                {denuncia.anuncio?.titulo || "Anúncio removido"}
                              </Link>
                            ) : (
                              `Denúncia de Utilizador: ${denuncia.denunciado?.firstName || ""} ${denuncia.denunciado?.lastName || ""}`
                            )}
                          </h3>
                          <p className="text-sm text-gray-400 mb-1">
                            Criada em: {formatarData(denuncia.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(
                            denuncia.estado
                          )} bg-zinc-700`}
                        >
                          {getEstadoLabel(denuncia.estado)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <p>
                          <span className="font-semibold">Motivo:</span> {denuncia.motivo}
                        </p>
                        {denuncia.descricao && (
                          <p>
                            <span className="font-semibold">Descrição:</span> {denuncia.descricao}
                          </p>
                        )}
                        {denuncia.acoes && denuncia.acoes.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-zinc-700">
                            <p className="font-semibold mb-1">Histórico de Ações:</p>
                            {denuncia.acoes.map((acao: any, idx: number) => (
                              <p key={idx} className="text-xs text-gray-400">
                                {formatarData(acao.createdAt)} - {acao.acao} por{" "}
                                {acao.admin?.firstName} {acao.admin?.lastName}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

