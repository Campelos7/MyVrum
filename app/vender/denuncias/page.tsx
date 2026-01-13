"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function DenunciasRecebidasPage() {
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
        ? `/api/denuncias?tipo=recebidas&userEmail=${encodeURIComponent(userEmail)}` 
        : `/api/denuncias?tipo=recebidas&estado=${filtroEstado}&userEmail=${encodeURIComponent(userEmail)}`;
      
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        // A API já retorna apenas denúncias recebidas (denunciado OU anúncios do utilizador)
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

  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans">
      <header className="flex justify-between items-center px-10 py-6 bg-black shadow-sm">
        <Link href="/vender" className="text-lg font-semibold hover:underline">
          ← Voltar para Vender
        </Link>
        <Link href="/" className="text-white hover:underline">
          MyVrum
        </Link>
      </header>

      <div className="px-10 py-8">
        <h1 className="text-3xl font-bold mb-6">Denúncias Recebidas</h1>

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
        ) : denuncias.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Não tens denúncias recebidas.
          </div>
        ) : (
          <div className="space-y-4">
            {denuncias.map((denuncia) => (
              <div
                key={denuncia.id}
                className="bg-zinc-800 rounded-xl p-6 hover:bg-zinc-700 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {denuncia.tipo === "anuncio" 
                        ? "🚨 Denúncia sobre o Teu Anúncio" 
                        : "🚨 Denúncia sobre Ti (Utilizador)"}
                    </h3>
                    <p className={`font-semibold ${getEstadoColor(denuncia.estado)}`}>
                      Estado: {denuncia.estado.replace("_", " ").toUpperCase()}
                    </p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {formatarData(denuncia.createdAt)}
                  </span>
                </div>

                {denuncia.anuncio && (
                  <div className="mb-4 p-4 bg-zinc-700 rounded-lg">
                    <p className="font-semibold mb-2">Anúncio:</p>
                    <div className="flex gap-4">
                      {denuncia.anuncio.imagens?.[0] && (
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Image
                            src={denuncia.anuncio.imagens[0].url}
                            alt={denuncia.anuncio.titulo}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{denuncia.anuncio.titulo}</p>
                        <Link
                          href={`/anuncio/${denuncia.anuncio.id}`}
                          className="text-yellow-400 hover:underline text-sm"
                        >
                          Ver anúncio →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <p className="font-semibold mb-2">Motivo:</p>
                  <p className="text-gray-300">{denuncia.motivo}</p>
                </div>

                {denuncia.descricao && (
                  <div className="mb-4">
                    <p className="font-semibold mb-2">Descrição:</p>
                    <p className="text-gray-300">{denuncia.descricao}</p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="font-semibold mb-2">Denunciante:</p>
                  <p className="text-gray-300">
                    {denuncia.denunciante?.firstName} {denuncia.denunciante?.lastName} ({denuncia.denunciante?.email})
                  </p>
                </div>

                {denuncia.acoes && denuncia.acoes.length > 0 && (
                  <div className="mt-4 p-4 bg-zinc-700 rounded-lg">
                    <p className="font-semibold mb-2">Histórico de Ações:</p>
                    <div className="space-y-2">
                      {denuncia.acoes.map((acao: any, idx: number) => (
                        <div key={idx} className="text-sm text-gray-300">
                          <p>
                            <span className="font-semibold">
                              {acao.admin?.firstName} {acao.admin?.lastName}
                            </span>
                            : {acao.descricao || acao.tipo}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatarData(acao.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {denuncia.estado === "encerrada" && denuncia.resultado && (
                  <div className="mt-4 p-4 bg-zinc-700 rounded-lg">
                    <p className="font-semibold mb-2">Resultado:</p>
                    <p className={denuncia.resultado === "procedente" ? "text-red-400" : "text-green-400"}>
                      {denuncia.resultado === "procedente" ? "Procedente" : "Não Procedente"}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

