"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function BackofficePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [aba, setAba] = useState("estatisticas");
  const [estatisticas, setEstatisticas] = useState<any>(null);
  const [utilizadores, setUtilizadores] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarCriarAdmin, setMostrarCriarAdmin] = useState(false);
  const [filtroDenunciaEstado, setFiltroDenunciaEstado] = useState<string>("todos");
  const [utilizadorSelecionado, setUtilizadorSelecionado] = useState<any>(null);
  const [formAdmin, setFormAdmin] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    country: "+351",
    address: "",
  });

  useEffect(() => {
    // Aguardar um pouco para a sessão carregar completamente
    const timer = setTimeout(() => {
      if (session?.user) {
        console.log("Session user:", session.user);
        console.log("Admin status na sessão:", (session.user as any)?.admin);
        verificarAdmin();
      } else if (session === null) {
        // Se session é null após carregar, significa que não está autenticado
        console.log("Sem sessão - redirecionando");
        router.push("/");
      }
    }, 500); // Aguardar 500ms para a sessão carregar
    
    return () => clearTimeout(timer);
  }, [session]);

  // Verificar também quando a página carrega
  useEffect(() => {
    if (!session) {
      // Aguardar um pouco para a sessão carregar
      const timer = setTimeout(() => {
        if (!session) {
          router.push("/");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const verificarAdmin = async () => {
    try {
      // Primeiro, verificar se a sessão tem admin
      const sessionAdmin = (session?.user as any)?.admin;
      const sessionEmail = session?.user?.email;
      console.log("Admin na sessão do cliente:", sessionAdmin);
      console.log("Email na sessão do cliente:", sessionEmail);
      
      // Passar o email como query parameter como fallback
      const url = sessionEmail 
        ? `/api/admin/verificar?userEmail=${encodeURIComponent(sessionEmail)}`
        : "/api/admin/verificar";
      
      const res = await fetch(url, { 
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Erro ao verificar admin:", res.status, errorData);
        
        if (res.status === 401) {
          const resposta = confirm(
            "Não estás autenticado ou a sessão expirou.\n\n" +
            "Se acabaste de ser promovido a admin, precisas fazer logout e login novamente.\n\n" +
            "Queres fazer logout agora?"
          );
          if (resposta) {
            await signOut({ callbackUrl: "/" });
          } else {
            router.push("/");
          }
        } else if (res.status === 403) {
          const resposta = confirm(
            "Não tens permissões de administrador.\n\n" +
            "Se acabaste de ser promovido a admin, precisas fazer logout e login novamente.\n\n" +
            "Queres fazer logout agora?"
          );
          if (resposta) {
            await signOut({ callbackUrl: "/" });
          } else {
            router.push("/");
          }
        } else {
          alert(`Erro: ${errorData.error || "Desconhecido"}`);
          router.push("/");
        }
      } else {
        carregarDados();
      }
    } catch (error: any) {
      console.error("Erro ao verificar admin:", error);
      if (error.message?.includes("fetch")) {
        alert("Erro de ligação. Verifica se o servidor está a correr.");
      } else {
        const resposta = confirm(
          "Erro ao verificar permissões.\n\n" +
          "Se acabaste de ser promovido a admin, precisas fazer logout e login novamente.\n\n" +
          "Queres fazer logout agora?"
        );
        if (resposta) {
          await signOut({ callbackUrl: "/" });
        } else {
          router.push("/");
        }
      }
    }
  };

  const carregarDados = async () => {
    if (aba === "estatisticas") {
      carregarEstatisticas();
    } else if (aba === "utilizadores") {
      carregarUtilizadores();
    } else if (aba === "anuncios") {
      carregarAnuncios();
    } else if (aba === "denuncias") {
      carregarDenuncias();
    }
  };

  useEffect(() => {
    if (session) {
      carregarDados();
    }
  }, [aba, session, filtroDenunciaEstado]);

  const carregarEstatisticas = async () => {
    setLoading(true);
    try {
      const userEmail = session?.user?.email || "";
      const url = userEmail 
        ? `/api/admin/estatisticas?userEmail=${encodeURIComponent(userEmail)}`
        : "/api/admin/estatisticas";
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setEstatisticas(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Erro ao carregar estatísticas:", res.status, errorData);
        alert(`Erro ao carregar estatísticas: ${errorData.error || "Desconhecido"}`);
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      alert("Erro ao carregar estatísticas");
    } finally {
      setLoading(false);
    }
  };

  const carregarUtilizadores = async () => {
    setLoading(true);
    try {
      const userEmail = session?.user?.email || "";
      const url = userEmail 
        ? `/api/admin/utilizadores?userEmail=${encodeURIComponent(userEmail)}`
        : "/api/admin/utilizadores";
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUtilizadores(data.utilizadores || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Erro ao carregar utilizadores:", res.status, errorData);
        alert(`Erro ao carregar utilizadores: ${errorData.error || "Desconhecido"}`);
      }
    } catch (error) {
      console.error("Erro ao carregar utilizadores:", error);
      alert("Erro ao carregar utilizadores");
    } finally {
      setLoading(false);
    }
  };

  const carregarAnuncios = async () => {
    setLoading(true);
    try {
      const userEmail = session?.user?.email || "";
      const url = userEmail 
        ? `/api/admin/anuncios?userEmail=${encodeURIComponent(userEmail)}`
        : "/api/admin/anuncios";
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAnuncios(data.anuncios || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Erro ao carregar anúncios:", res.status, errorData);
        alert(`Erro ao carregar anúncios: ${errorData.error || "Desconhecido"}`);
      }
    } catch (error) {
      console.error("Erro ao carregar anúncios:", error);
      alert("Erro ao carregar anúncios");
    } finally {
      setLoading(false);
    }
  };

  const carregarDenuncias = async () => {
    setLoading(true);
    try {
      const userEmail = session?.user?.email || "";
      const baseUrl = filtroDenunciaEstado === "todos" 
        ? "/api/denuncias" 
        : `/api/denuncias?estado=${filtroDenunciaEstado}`;
      const url = userEmail 
        ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}userEmail=${encodeURIComponent(userEmail)}`
        : baseUrl;
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDenuncias(data.denuncias || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Erro ao carregar denúncias:", res.status, errorData);
        alert(`Erro ao carregar denúncias: ${errorData.error || "Desconhecido"}`);
      }
    } catch (error) {
      console.error("Erro ao carregar denúncias:", error);
      alert("Erro ao carregar denúncias");
    } finally {
      setLoading(false);
    }
  };

  const bloquearUtilizador = async (userId: number, motivo: string) => {
    if (!motivo) {
      alert("Por favor, indique o motivo do bloqueio");
      return;
    }
    try {
      const res = await fetch(`/api/admin/utilizadores/${userId}/bloquear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          motivo,
          userEmail: session?.user?.email || "",
        }),
      });
      if (res.ok) {
        alert("Utilizador bloqueado com sucesso");
        carregarUtilizadores();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Erro ao bloquear utilizador");
      }
    } catch (error) {
      console.error("Erro ao bloquear utilizador:", error);
      alert("Erro ao bloquear utilizador");
    }
  };

  const aprovarVendedor = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/utilizadores/${userId}/aprovar-vendedor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userEmail: session?.user?.email || "",
        }),
      });
      if (res.ok) {
        alert("Vendedor aprovado com sucesso");
        carregarUtilizadores();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Erro ao aprovar vendedor");
      }
    } catch (error) {
      console.error("Erro ao aprovar vendedor:", error);
      alert("Erro ao aprovar vendedor");
    }
  };

  const ativarUtilizador = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/utilizadores/${userId}/bloquear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          motivo: null, 
          ativar: true,
          userEmail: session?.user?.email || "",
        }),
      });
      if (res.ok) {
        alert("Utilizador ativado com sucesso");
        carregarUtilizadores();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Erro ao ativar utilizador");
      }
    } catch (error) {
      console.error("Erro ao ativar utilizador:", error);
      alert("Erro ao ativar utilizador");
    }
  };

  const promoverAdmin = async (userId: number) => {
    if (!confirm("Tens a certeza que queres promover este utilizador a administrador?")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/utilizadores/${userId}/promover-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userEmail: session?.user?.email || "",
        }),
      });
      if (res.ok) {
        alert("Utilizador promovido a administrador com sucesso");
        carregarUtilizadores();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Erro ao promover utilizador");
      }
    } catch (error) {
      console.error("Erro ao promover utilizador:", error);
      alert("Erro ao promover utilizador");
    }
  };

  const moderarAnuncio = async (anuncioId: string, acao: string) => {
    try {
      const res = await fetch(`/api/admin/anuncios/${anuncioId}/moderar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          acao,
          userEmail: session?.user?.email || "",
        }),
      });
      if (res.ok) {
        alert("Ação realizada com sucesso");
        carregarAnuncios();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Erro ao moderar anúncio");
      }
    } catch (error) {
      console.error("Erro ao moderar anúncio:", error);
      alert("Erro ao moderar anúncio");
    }
  };

  const analisarDenuncia = async (denunciaId: string, acao: string, resultado?: string) => {
    try {
      const res = await fetch(`/api/admin/denuncias/${denunciaId}/analisar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          acao, 
          resultado,
          userEmail: session?.user?.email || "",
        }),
      });
      if (res.ok) {
        alert("Ação realizada com sucesso");
        carregarDenuncias();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Erro ao analisar denúncia");
      }
    } catch (error) {
      console.error("Erro ao analisar denúncia:", error);
      alert("Erro ao analisar denúncia");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans">
      <header className="flex justify-between items-center px-10 py-6 bg-black shadow-sm">
        <Link href="/" className="text-lg font-semibold hover:underline">
          MyVrum - Backoffice
        </Link>
        <Link href="/" className="text-white hover:underline">
          Voltar ao Site
        </Link>
      </header>

      <div className="px-10 py-8">
        <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-zinc-700">
          {["estatisticas", "utilizadores", "anuncios", "denuncias"].map((tab) => (
            <button
              key={tab}
              onClick={() => setAba(tab)}
              className={`px-4 py-2 font-semibold capitalize ${
                aba === tab
                  ? "border-b-2 border-yellow-400 text-yellow-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab === "estatisticas" ? "Estatísticas" : tab}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="text-center py-12">A carregar...</div>
        ) : (
          <>
            {aba === "estatisticas" && (
              estatisticas ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2">Compradores</h3>
                    <p className="text-3xl font-bold text-yellow-400">
                      {estatisticas.totalCompradores}
                    </p>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2">Vendedores</h3>
                    <p className="text-3xl font-bold text-yellow-400">
                      {estatisticas.totalVendedores}
                    </p>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2">Anúncios Ativos</h3>
                    <p className="text-3xl font-bold text-yellow-400">
                      {estatisticas.anunciosAtivos}
                    </p>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2">Vendas (30 dias)</h3>
                    <p className="text-3xl font-bold text-yellow-400">
                      {estatisticas.vendas30Dias}
                    </p>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2">Top Marca</h3>
                    <p className="text-xl font-bold text-yellow-400">
                      {estatisticas.topMarca || "N/A"}
                    </p>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2">Top Modelo</h3>
                    <p className="text-xl font-bold text-yellow-400">
                      {estatisticas.topModelo || "N/A"}
                    </p>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2">Denúncias Abertas</h3>
                    <p className="text-3xl font-bold text-yellow-400">
                      {estatisticas.denunciasAbertas}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  A carregar estatísticas...
                </div>
              )
            )}

            {aba === "utilizadores" && (
              <div className="bg-zinc-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Gestão de Utilizadores</h2>
                  <button
                    onClick={() => setMostrarCriarAdmin(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition"
                  >
                    + Criar Administrador
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-700">
                        <th className="text-left p-3">Nome</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Tipo</th>
                        <th className="text-left p-3">Estado</th>
                        <th className="text-left p-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {utilizadores.map((u: any) => (
                        <tr key={u.id} className="border-b border-zinc-700">
                          <td className="p-3">
                            {u.firstName} {u.lastName}
                          </td>
                          <td className="p-3">{u.email}</td>
                          <td className="p-3">
                            {u.admin ? "Admin" : u.vendedor ? "Vendedor" : "Comprador"}
                          </td>
                          <td className="p-3">
                            {u.bloqueado ? (
                              <div>
                                <span className="text-red-400 block">Bloqueado</span>
                                {u.motivoBloqueio && (
                                  <span className="text-xs text-gray-400 block mt-1">
                                    Motivo: {u.motivoBloqueio}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-green-400">Ativo</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => setUtilizadorSelecionado(u)}
                                className="text-blue-400 hover:underline text-sm"
                              >
                                Ver Detalhes
                              </button>
                              {!u.admin && (
                                <button
                                  onClick={() => promoverAdmin(u.id)}
                                  className="text-yellow-400 hover:underline text-sm"
                                >
                                  Promover a Admin
                                </button>
                              )}
                              {u.vendedor && !u.aprovadoPor && (
                                <button
                                  onClick={() => aprovarVendedor(u.id)}
                                  className="text-green-400 hover:underline text-sm"
                                >
                                  Aprovar
                                </button>
                              )}
                              {u.bloqueado ? (
                                <button
                                  onClick={() => ativarUtilizador(u.id)}
                                  className="text-green-400 hover:underline text-sm"
                                >
                                  Ativar
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    const motivo = prompt("Motivo do bloqueio:");
                                    if (motivo) bloquearUtilizador(u.id, motivo);
                                  }}
                                  className="text-red-400 hover:underline text-sm"
                                >
                                  Bloquear
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {aba === "anuncios" && (
              <div className="bg-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Moderação de Anúncios</h2>
                <div className="space-y-4">
                  {anuncios.map((a: any) => (
                    <div
                      key={a.id}
                      className="border border-zinc-700 rounded-lg p-4 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-semibold">{a.titulo}</h3>
                        <p className="text-sm text-gray-400">
                          Estado: {a.estado} | Vendedor: {a.user.firstName} {a.user.lastName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {a.estado === "pausado" ? (
                          <button
                            onClick={() => moderarAnuncio(a.id, "ativar")}
                            className="px-3 py-1 bg-green-500 rounded hover:bg-green-400 text-sm"
                          >
                            Ativar
                          </button>
                        ) : (
                          <button
                            onClick={() => moderarAnuncio(a.id, "pausar")}
                            className="px-3 py-1 bg-orange-500 rounded hover:bg-orange-400 text-sm"
                          >
                            Pausar
                          </button>
                        )}
                        <button
                          onClick={() => moderarAnuncio(a.id, "remover")}
                          className="px-3 py-1 bg-red-500 rounded hover:bg-red-400 text-sm"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aba === "denuncias" && (
              <div className="bg-zinc-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Gestão de Denúncias</h2>
                  <select
                    value={filtroDenunciaEstado}
                    onChange={(e) => setFiltroDenunciaEstado(e.target.value)}
                    className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="todos">Todos os Estados</option>
                    <option value="aberta">Abertas</option>
                    <option value="em_analise">Em Análise</option>
                    <option value="encerrada">Encerradas</option>
                  </select>
                </div>
                {denuncias.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    Não há denúncias para gerir.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {denuncias.map((d: any) => (
                      <div
                        key={d.id}
                        className="border border-zinc-700 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              Denúncia de {d.tipo === "anuncio" ? "Anúncio" : "Utilizador"}
                            </h3>
                            <p className="text-sm text-gray-400">
                              Estado: <span className="font-semibold">{d.estado}</span> | Motivo: {d.motivo}
                            </p>
                            {d.descricao && (
                              <p className="text-sm text-gray-300 mt-2">{d.descricao}</p>
                            )}
                            <div className="mt-2 text-xs text-gray-400 space-y-1">
                              {d.denunciante && (
                                <p>Denunciante: {d.denunciante.firstName} {d.denunciante.lastName} ({d.denunciante.email})</p>
                              )}
                              {d.denunciado && (
                                <p>Denunciado: {d.denunciado.firstName} {d.denunciado.lastName} ({d.denunciado.email})</p>
                              )}
                              {d.anuncio && (
                                <p>Anúncio: {d.anuncio.titulo}</p>
                              )}
                              {d.acoes && d.acoes.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-zinc-700">
                                  <p className="font-semibold mb-1">Histórico de Ações:</p>
                                  {d.acoes.map((acao: any, idx: number) => (
                                    <p key={idx} className="text-xs">
                                      {new Date(acao.createdAt).toLocaleString("pt-PT")} - {acao.admin?.firstName} {acao.admin?.lastName}: {acao.descricao || acao.tipo}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {d.resultado && (
                                <p className="mt-2 font-semibold">
                                  Resultado: <span className={d.resultado === "procedente" ? "text-red-400" : "text-green-400"}>
                                    {d.resultado === "procedente" ? "Procedente" : "Não Procedente"}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {d.estado === "aberta" && (
                              <>
                                <button
                                  onClick={() => analisarDenuncia(d.id, "em_analise")}
                                  className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-400 text-sm"
                                >
                                  Em Análise
                                </button>
                              </>
                            )}
                            {d.estado === "em_analise" && (
                              <>
                                <button
                                  onClick={() => analisarDenuncia(d.id, "encerrar", "procedente")}
                                  className="px-3 py-1 bg-red-500 rounded hover:bg-red-400 text-sm"
                                >
                                  Procedente
                                </button>
                                <button
                                  onClick={() => analisarDenuncia(d.id, "encerrar", "nao_procedente")}
                                  className="px-3 py-1 bg-green-500 rounded hover:bg-green-400 text-sm"
                                >
                                  Não Procedente
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal Detalhes Utilizador */}
        {utilizadorSelecionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Detalhes do Utilizador</h3>
                <button
                  onClick={() => setUtilizadorSelecionado(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Nome</label>
                    <p className="text-white">{utilizadorSelecionado.firstName} {utilizadorSelecionado.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white">{utilizadorSelecionado.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Tipo</label>
                    <p className="text-white">
                      {utilizadorSelecionado.admin ? "Administrador" : utilizadorSelecionado.vendedor ? "Vendedor" : "Comprador"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Estado</label>
                    <p className={utilizadorSelecionado.bloqueado ? "text-red-400" : "text-green-400"}>
                      {utilizadorSelecionado.bloqueado ? "Bloqueado" : "Ativo"}
                    </p>
                  </div>
                  {utilizadorSelecionado.bloqueado && utilizadorSelecionado.motivoBloqueio && (
                    <div className="col-span-2">
                      <label className="text-sm text-gray-400">Motivo do Bloqueio</label>
                      <p className="text-white">{utilizadorSelecionado.motivoBloqueio}</p>
                    </div>
                  )}
                  {utilizadorSelecionado.vendedor && (
                    <div className="col-span-2">
                      <label className="text-sm text-gray-400">Vendedor Aprovado</label>
                      <p className="text-white">
                        {utilizadorSelecionado.aprovadoPor ? "Sim" : "Não"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Criar Administrador */}
        {mostrarCriarAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Criar Novo Administrador</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch("/api/admin/utilizadores/criar-admin", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify(formAdmin),
                    });
                    const data = await res.json();
                    if (data.success) {
                      alert("Administrador criado com sucesso!");
                      setMostrarCriarAdmin(false);
                      setFormAdmin({
                        firstName: "",
                        lastName: "",
                        username: "",
                        email: "",
                        password: "",
                        phone: "",
                        country: "+351",
                        address: "",
                      });
                      carregarUtilizadores();
                    } else {
                      alert(data.error || "Erro ao criar administrador");
                    }
                  } catch (error) {
                    console.error("Erro:", error);
                    alert("Erro ao criar administrador");
                  }
                }}
                className="space-y-4"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Primeiro Nome"
                    value={formAdmin.firstName}
                    onChange={(e) =>
                      setFormAdmin({ ...formAdmin, firstName: e.target.value })
                    }
                    className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white w-1/2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Último Nome"
                    value={formAdmin.lastName}
                    onChange={(e) =>
                      setFormAdmin({ ...formAdmin, lastName: e.target.value })
                    }
                    className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white w-1/2"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  value={formAdmin.username}
                  onChange={(e) =>
                    setFormAdmin({ ...formAdmin, username: e.target.value })
                  }
                  className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white w-full"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formAdmin.email}
                  onChange={(e) =>
                    setFormAdmin({ ...formAdmin, email: e.target.value })
                  }
                  className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white w-full"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={formAdmin.password}
                  onChange={(e) =>
                    setFormAdmin({ ...formAdmin, password: e.target.value })
                  }
                  className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white w-full"
                  required
                />
                <input
                  type="tel"
                  placeholder="Telefone"
                  value={formAdmin.phone}
                  onChange={(e) =>
                    setFormAdmin({ ...formAdmin, phone: e.target.value })
                  }
                  className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white w-full"
                />
                <input
                  type="text"
                  placeholder="Morada"
                  value={formAdmin.address}
                  onChange={(e) =>
                    setFormAdmin({ ...formAdmin, address: e.target.value })
                  }
                  className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white w-full"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition flex-1"
                  >
                    Criar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarCriarAdmin(false);
                      setFormAdmin({
                        firstName: "",
                        lastName: "",
                        username: "",
                        email: "",
                        password: "",
                        phone: "",
                        country: "+351",
                        address: "",
                      });
                    }}
                    className="bg-zinc-600 hover:bg-zinc-500 text-white px-4 py-2 rounded-lg font-semibold transition flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

