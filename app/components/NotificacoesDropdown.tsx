"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function NotificacoesDropdown() {
  const { data: session } = useSession();
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [mostrar, setMostrar] = useState(false);
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    if (session?.user) {
      carregarNotificacoes();
      // Atualizar a cada 30 segundos
      const interval = setInterval(carregarNotificacoes, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const carregarNotificacoes = async () => {
    if (!session?.user?.email) {
      return; // Não tentar carregar se não houver sessão
    }
    try {
      const res = await fetch(
        `/api/notificacoes?userEmail=${encodeURIComponent(session.user.email)}&naoLidas=true`,
        { 
          credentials: "include",
          cache: "no-store"
        }
      );
      if (res.ok) {
        const data = await res.json();
        setNotificacoes(data.notificacoes || []);
        setNaoLidas(data.notificacoes?.length || 0);
      } else {
        // Não mostrar erro se for 401 (não autenticado) - é normal durante o carregamento
        if (res.status !== 401) {
          console.error("Erro ao carregar notificações:", res.status);
        }
      }
    } catch (error: any) {
      // Ignorar erros de rede durante o carregamento inicial
      if (error.message && !error.message.includes("fetch")) {
        console.error("Erro ao carregar notificações:", error);
      }
    }
  };

  const marcarComoLida = async (id: string) => {
    try {
      await fetch("/api/notificacoes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id,
          lida: true,
          userEmail: session?.user?.email || "",
        }),
      });
      carregarNotificacoes();
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const formatarData = (data: string) => {
    const agora = new Date();
    const notifData = new Date(data);
    const diffMs = agora.getTime() - notifData.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return notifData.toLocaleDateString("pt-PT");
  };

  if (!session?.user) return null;

  return (
    <div className="relative group">
      <button
        className="p-2 rounded-full hover:bg-gray-800 transition relative"
        title="Notificações"
        onClick={() => setMostrar(!mostrar)}
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {naoLidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {mostrar && (
        <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <p className="font-semibold">Notificações</p>
              {naoLidas > 0 && (
                <button
                  onClick={async () => {
                    try {
                      await fetch("/api/notificacoes", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                          lida: true,
                          userEmail: session?.user?.email || "",
                        }),
                      });
                      carregarNotificacoes();
                    } catch (error) {
                      console.error("Erro:", error);
                    }
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
          </div>
          <div>
            {notificacoes.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Sem notificações
              </div>
            ) : (
              notificacoes.map((notif) => (
                <Link
                  key={notif.id}
                  href={
                    notif.anuncioId
                      ? `/anuncio/${notif.anuncioId}`
                      : notif.tipo === "mensagem_nova"
                      ? `/mensagens?anuncioId=${notif.anuncioId}`
                      : "#"
                  }
                  onClick={() => {
                    if (!notif.lida) {
                      marcarComoLida(notif.id);
                    }
                    setMostrar(false);
                  }}
                  className={`block p-4 border-b hover:bg-gray-50 transition ${
                    !notif.lida ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {notif.anuncio?.imagens?.[0] && (
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={notif.anuncio.imagens[0].url}
                          alt={notif.anuncio.titulo}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm mb-1">{notif.titulo}</p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {notif.mensagem}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatarData(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.lida && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

