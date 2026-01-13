"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function MensagensPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const anuncioId = searchParams.get("anuncioId");
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [anuncio, setAnuncio] = useState<any>(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const mensagensEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.user) {
      router.push("/");
      return;
    }
    if (anuncioId) {
      carregarDados();
    }
  }, [session, anuncioId]);

  useEffect(() => {
    // Scroll para o final quando novas mensagens chegarem
    mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const carregarDados = async () => {
    if (!anuncioId) {
      console.error("anuncioId não encontrado");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [resMensagens, resAnuncio] = await Promise.all([
        fetch(`/api/mensagens?anuncioId=${anuncioId}&userEmail=${encodeURIComponent(session?.user?.email || "")}`, {
          credentials: "include",
        }),
        fetch(`/api/anuncios/${anuncioId}`, {
          credentials: "include",
        }),
      ]);

      if (resMensagens.ok) {
        const dataMensagens = await resMensagens.json();
        setMensagens(dataMensagens.mensagens || []);
      } else {
        let errorData: any = {};
        try {
          const text = await resMensagens.text();
          errorData = text ? JSON.parse(text) : {};
        } catch (e) {
          console.error("Erro ao parsear resposta:", e);
          errorData = { error: "Erro ao processar resposta do servidor" };
        }
        
        console.error("Erro ao carregar mensagens:", resMensagens.status, errorData);
        
        if (resMensagens.status === 500) {
          const errorMsg = errorData.error || errorData.detalhes || "Erro desconhecido no servidor";
          if (errorMsg.includes("modelo") || errorMsg.includes("Prisma") || errorMsg.includes("npx prisma generate") || errorMsg.includes("pare o servidor")) {
            alert(errorMsg);
          } else {
            alert(`Erro ao carregar mensagens: ${errorMsg}`);
          }
        }
      }

      if (resAnuncio.ok) {
        const dataAnuncio = await resAnuncio.json();
        if (dataAnuncio.anuncio) {
          setAnuncio(dataAnuncio.anuncio);
        } else {
          console.error("Anúncio não encontrado nos dados:", dataAnuncio);
        }
      } else {
        const errorData = await resAnuncio.json().catch(() => ({}));
        console.error("Erro ao carregar anúncio:", resAnuncio.status, errorData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !anuncio || !anuncioId) {
      alert("Dados incompletos. Por favor, recarregue a página.");
      return;
    }

    setEnviando(true);
    try {
      const destinatarioId = typeof anuncio.userId === "number" 
        ? anuncio.userId 
        : parseInt(anuncio.userId);
      
      if (isNaN(destinatarioId)) {
        alert("Erro: ID do destinatário inválido");
        setEnviando(false);
        return;
      }

      const res = await fetch("/api/mensagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          anuncioId: anuncioId.toString(),
          destinatarioId: destinatarioId,
          conteudo: novaMensagem,
          userEmail: session?.user?.email || "",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(errorData.error || `Erro ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setNovaMensagem("");
        carregarDados(); // Recarregar mensagens
      } else {
        alert(data.error || "Erro ao enviar mensagem");
      }
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      alert(error.message || "Erro ao enviar mensagem. Verifique a consola para mais detalhes.");
    } finally {
      setEnviando(false);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const destinatario = anuncio.user;
  const isVendedor = (session?.user as any)?.id === anuncio.userId;

  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans flex flex-col">
      <header className="flex justify-between items-center px-10 py-6 bg-black shadow-sm">
        <Link href={`/anuncio/${anuncioId}`} className="text-lg font-semibold hover:underline">
          ← Voltar ao Anúncio
        </Link>
        <h1 className="text-xl font-semibold">Mensagens</h1>
        <div className="w-24"></div>
      </header>

      {/* Info do anúncio */}
      <div className="px-10 py-4 bg-zinc-800 border-b border-zinc-700">
        <div className="flex gap-4">
          {anuncio.imagens?.[0] && (
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src={anuncio.imagens[0].url}
                alt={anuncio.titulo}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}
          <div>
            <h2 className="font-semibold text-lg">{anuncio.titulo}</h2>
            <p className="text-sm text-gray-400">
              {isVendedor ? "Conversa com comprador" : `Conversa com ${destinatario?.firstName} ${destinatario?.lastName}`}
            </p>
          </div>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-10 py-6 space-y-4">
        {mensagens.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Ainda não há mensagens. Envia a primeira!
          </div>
        ) : (
          mensagens.map((mensagem) => {
            const isMine = mensagem.remetenteId === (session?.user as any)?.id;
            return (
              <div
                key={mensagem.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md rounded-lg p-4 ${
                    isMine
                      ? "bg-yellow-500 text-black"
                      : "bg-zinc-800 text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {!isMine && mensagem.remetente?.image && (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={mensagem.remetente.image}
                          alt={mensagem.remetente.firstName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <span className="font-semibold text-sm">
                      {isMine
                        ? "Tu"
                        : `${mensagem.remetente?.firstName} ${mensagem.remetente?.lastName}`}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{mensagem.conteudo}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {formatarData(mensagem.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={mensagensEndRef} />
      </div>

      {/* Input de mensagem */}
      <div className="px-10 py-4 bg-zinc-800 border-t border-zinc-700">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviarMensagem();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            placeholder="Escreve uma mensagem..."
            className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
            disabled={enviando}
          />
          <button
            type="submit"
            disabled={!novaMensagem.trim() || enviando}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}

