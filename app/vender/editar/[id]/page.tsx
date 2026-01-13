"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EditarAnuncioPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [anuncio, setAnuncio] = useState<any>(null);

  const [formData, setFormData] = useState({
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
    imagensExistentes: [] as any[],
    novasImagens: [] as File[],
  });

  useEffect(() => {
    if (params?.id && session?.user) {
      carregarAnuncio();
    }
  }, [params?.id, session]);

  const carregarAnuncio = async () => {
    try {
      const id = typeof params.id === 'string' ? params.id : params.id?.[0] || params.id;
      if (!id) return;

      const res = await fetch(`/api/anuncios/${id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        alert("Erro ao carregar anúncio");
        router.push("/vender");
        return;
      }

      const data = await res.json();
      if (data.anuncio) {
        setAnuncio(data.anuncio);
        setFormData({
          titulo: data.anuncio.titulo || "",
          marca: data.anuncio.marca || "",
          modelo: data.anuncio.modelo || "",
          categoria: data.anuncio.categoria || "",
          ano: data.anuncio.ano?.toString() || "",
          preco: data.anuncio.preco?.toString() || "",
          quilometragem: data.anuncio.quilometragem?.toString() || "",
          combustivel: data.anuncio.combustivel || "",
          caixa: data.anuncio.caixa || "",
          localizacao: data.anuncio.localizacao || "",
          descricao: data.anuncio.descricao || "",
          estado: data.anuncio.estado || "ativo",
          imagensExistentes: data.anuncio.imagens || [],
          novasImagens: [],
        });
      }
    } catch (error) {
      console.error("Erro ao carregar anúncio:", error);
      alert("Erro ao carregar anúncio");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const id = typeof params.id === 'string' ? params.id : params.id?.[0] || params.id;
      if (!id) return;

      const formDataToSend = new FormData();
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("marca", formData.marca);
      formDataToSend.append("modelo", formData.modelo);
      formDataToSend.append("categoria", formData.categoria);
      formDataToSend.append("ano", formData.ano);
      formDataToSend.append("preco", formData.preco);
      formDataToSend.append("quilometragem", formData.quilometragem);
      formDataToSend.append("combustivel", formData.combustivel);
      formDataToSend.append("caixa", formData.caixa);
      formDataToSend.append("localizacao", formData.localizacao);
      formDataToSend.append("descricao", formData.descricao);
      formDataToSend.append("estado", formData.estado);
      
      if (session?.user?.email) {
        formDataToSend.append("userEmail", session.user.email);
      }

      // Adicionar novas imagens
      formData.novasImagens.forEach((img) => {
        formDataToSend.append("imagens", img);
      });

      const res = await fetch(`/api/anuncios/${id}`, {
        method: "PUT",
        body: formDataToSend,
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        alert("Anúncio atualizado com sucesso!");
        router.push("/vender");
      } else {
        alert(data.error || "Erro ao atualizar anúncio");
      }
    } catch (error) {
      console.error("Erro ao atualizar anúncio:", error);
      alert("Erro ao atualizar anúncio");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async (imagemId: string) => {
    if (!confirm("Tem certeza que deseja remover esta imagem?")) return;

    try {
      const res = await fetch(`/api/anuncios/imagens/${imagemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setFormData({
          ...formData,
          imagensExistentes: formData.imagensExistentes.filter(
            (img) => img.id !== imagemId
          ),
        });
      } else {
        alert("Erro ao remover imagem");
      }
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
    }
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
      <header className="flex justify-between items-center px-10 py-6 bg-black shadow-sm">
        <Link href="/vender" className="text-lg font-semibold hover:underline">
          ← Voltar
        </Link>
        <div className="text-white">{session?.user?.name}</div>
      </header>

      <div className="px-10 py-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Editar Anúncio</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2">Título *</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Marca</label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block mb-2">Modelo</label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-2">Categoria</label>
              <input
                type="text"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block mb-2">Ano</label>
              <input
                type="number"
                value={formData.ano}
                onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block mb-2">Preço (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-2">Quilometragem</label>
              <input
                type="number"
                value={formData.quilometragem}
                onChange={(e) => setFormData({ ...formData, quilometragem: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block mb-2">Combustível</label>
              <select
                value={formData.combustivel}
                onChange={(e) => setFormData({ ...formData, combustivel: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="">Selecione...</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Diesel">Diesel</option>
                <option value="Elétrico">Elétrico</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Caixa</label>
              <select
                value={formData.caixa}
                onChange={(e) => setFormData({ ...formData, caixa: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="">Selecione...</option>
                <option value="Manual">Manual</option>
                <option value="Automática">Automática</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2">Localização</label>
            <input
              type="text"
              value={formData.localizacao}
              onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block mb-2">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              rows={4}
            />
          </div>

          <div>
            <label className="block mb-2">Estado</label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="ativo">Ativo</option>
              <option value="pausado">Pausado</option>
              <option value="reservado">Reservado</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>

          {/* Imagens existentes */}
          {formData.imagensExistentes.length > 0 && (
            <div>
              <label className="block mb-2">Imagens Existentes</label>
              <div className="grid grid-cols-4 gap-4">
                {formData.imagensExistentes.map((img) => (
                  <div key={img.id} className="relative">
                    <div className="relative w-full h-24 rounded-lg overflow-hidden">
                      <Image
                        src={img.url}
                        alt="Imagem do anúncio"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adicionar novas imagens */}
          <div>
            <label className="block mb-2">Adicionar Novas Imagens</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setFormData({ ...formData, novasImagens: files });
              }}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/vender")}
              className="px-6 py-3 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? "A guardar..." : "Guardar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

