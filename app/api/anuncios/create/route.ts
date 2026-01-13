import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(req: Request) {
  try {
    // Ler o FormData primeiro (só pode ser lido uma vez)
    const formData = await req.formData();
    
    // Tentar obter a sessão
    const session = await getServerSession(authOptions);
    
    // Determinar o email do utilizador
    let userEmail: string | null = null;
    
    if (session?.user?.email) {
      // Prioridade: usar email da sessão (mais seguro)
      userEmail = session.user.email;
    } else {
      // Fallback: usar email do FormData (menos seguro, mas necessário quando cookies não funcionam)
      const emailFromForm = formData.get("userEmail") as string;
      if (emailFromForm) {
        userEmail = emailFromForm;
      } else {
        console.error("Sessão não encontrada e email não fornecido no FormData");
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
      }
    }
    
    if (!userEmail) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.error("Utilizador não encontrado:", userEmail);
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    if (!user.vendedor) {
      return NextResponse.json(
        { error: "Apenas vendedores podem criar anúncios" },
        { status: 403 }
      );
    }
    const titulo = formData.get("titulo") as string;
    
    if (!titulo || titulo.trim() === "") {
      return NextResponse.json(
        { error: "O título é obrigatório" },
        { status: 400 }
      );
    }

    const marca = formData.get("marca") as string;
    const modelo = formData.get("modelo") as string;
    const categoria = formData.get("categoria") as string;
    const ano = formData.get("ano") as string;
    const preco = formData.get("preco") as string;
    const quilometragem = formData.get("quilometragem") as string;
    const combustivel = formData.get("combustivel") as string;
    const caixa = formData.get("caixa") as string;
    const localizacao = formData.get("localizacao") as string;
    const descricao = formData.get("descricao") as string;
    const estado = (formData.get("estado") as string) || "ativo";

    // Validar e converter números
    const anoNum = ano && ano.trim() !== "" ? parseInt(ano) : null;
    const precoNum = preco && preco.trim() !== "" ? parseFloat(preco) : null;
    const quilometragemNum = quilometragem && quilometragem.trim() !== "" ? parseInt(quilometragem) : null;

    // Validar se os números são válidos
    if (anoNum !== null && isNaN(anoNum)) {
      return NextResponse.json({ error: "Ano inválido" }, { status: 400 });
    }
    if (precoNum !== null && isNaN(precoNum)) {
      return NextResponse.json({ error: "Preço inválido" }, { status: 400 });
    }
    if (quilometragemNum !== null && isNaN(quilometragemNum)) {
      return NextResponse.json({ error: "Quilometragem inválida" }, { status: 400 });
    }

    // Criar anúncio
    const anuncio = await prisma.anuncio.create({
      data: {
        titulo: titulo.trim(),
        marca: marca && marca.trim() !== "" ? marca.trim() : null,
        modelo: modelo && modelo.trim() !== "" ? modelo.trim() : null,
        categoria: categoria && categoria.trim() !== "" ? categoria.trim() : null,
        ano: anoNum,
        preco: precoNum,
        quilometragem: quilometragemNum,
        combustivel: combustivel && combustivel.trim() !== "" ? combustivel : null,
        caixa: caixa && caixa.trim() !== "" ? caixa : null,
        localizacao: localizacao && localizacao.trim() !== "" ? localizacao.trim() : null,
        descricao: descricao && descricao.trim() !== "" ? descricao.trim() : null,
        estado,
        userId: user.id,
      },
    });

    // Garantir que o diretório de uploads existe
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Processar imagens
    const imagens = formData.getAll("imagens") as File[];
    for (let i = 0; i < imagens.length; i++) {
      const file = imagens[i];
      if (file && file.size > 0 && file.name) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const timestamp = Date.now();
          const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
          const fileName = `${timestamp}-${i}-${sanitizedFileName}`;
          const filePath = path.join(uploadsDir, fileName);
          await writeFile(filePath, buffer);

          await prisma.imagemAnuncio.create({
            data: {
              url: `/uploads/${fileName}`,
              anuncioId: anuncio.id,
              ordem: i,
            },
          });
        } catch (imageError) {
          console.error(`Erro ao processar imagem ${i}:`, imageError);
          // Continua com as outras imagens mesmo se uma falhar
        }
      }
    }

    // Criar notificações para utilizadores com esta marca nos favoritos
    if (marca) {
      // SQLite não suporta mode: "insensitive", então vamos buscar todas e filtrar
      const todasMarcasFavoritas = await prisma.marcaFavorita.findMany({
        include: {
          user: {
            select: {
              id: true,
            },
          },
        },
      });
      
      // Filtrar case-insensitive
      const marcasFavoritas = todasMarcasFavoritas.filter(
        (mf) => mf.marca.toLowerCase() === marca.toLowerCase()
      );

      // Criar notificações para cada utilizador que tem esta marca favorita
      for (const marcaFavorita of marcasFavoritas) {
        // Não notificar o próprio vendedor
        if (marcaFavorita.userId !== user.id) {
          try {
            await prisma.notificacao.create({
              data: {
                userId: marcaFavorita.userId,
                tipo: "nova_marca_favorita",
                titulo: "Novo anúncio da tua marca favorita!",
                mensagem: `Foi publicado um novo anúncio de ${marca}: "${titulo}"`,
                anuncioId: anuncio.id,
              },
            });
          } catch (notifError) {
            console.error("Erro ao criar notificação:", notifError);
            // Continua mesmo se uma notificação falhar
          }
        }
      }
    }

    return NextResponse.json({ success: true, anuncio });
  } catch (error: any) {
    console.error("Erro ao criar anúncio:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar anúncio" },
      { status: 500 }
    );
  }
}

