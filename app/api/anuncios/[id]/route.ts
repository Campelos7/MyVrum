import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const anuncio = await prisma.anuncio.findUnique({
      where: { id },
      include: {
        imagens: {
          orderBy: { ordem: "asc" },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    if (!anuncio) {
      return NextResponse.json(
        { error: "Anúncio não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ anuncio });
  } catch (error) {
    console.error("Erro ao buscar anúncio:", error);
    return NextResponse.json(
      { error: "Erro ao buscar anúncio" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (sessionError) {
      console.error("Erro ao obter sessão:", sessionError);
    }

    const body = await req.json();
    const { estado, userEmail: userEmailFromBody } = body;

    let email: string | null = null;
    if (session?.user?.email) {
      email = session.user.email;
    } else if (userEmailFromBody) {
      email = userEmailFromBody;
    }

    if (!email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    const anuncio = await prisma.anuncio.findUnique({
      where: { id },
    });

    if (!anuncio) {
      return NextResponse.json(
        { error: "Anúncio não encontrado" },
        { status: 404 }
      );
    }

    // Apenas o dono do anúncio ou admin pode alterar
    if (anuncio.userId !== user.id && !user.admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const updated = await prisma.anuncio.update({
      where: { id },
      data: { estado },
    });

    return NextResponse.json({ success: true, anuncio: updated });
  } catch (error) {
    console.error("Erro ao atualizar anúncio:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar anúncio" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Obter sessão ou email do FormData
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (sessionError) {
      console.error("Erro ao obter sessão:", sessionError);
    }

    const formData = await req.formData();
    let userEmail: string | null = null;

    if (session?.user?.email) {
      userEmail = session.user.email;
    } else {
      const emailFromForm = formData.get("userEmail") as string;
      if (emailFromForm) {
        userEmail = emailFromForm;
      }
    }

    if (!userEmail) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    const anuncio = await prisma.anuncio.findUnique({
      where: { id },
    });

    if (!anuncio) {
      return NextResponse.json(
        { error: "Anúncio não encontrado" },
        { status: 404 }
      );
    }

    // Apenas o dono do anúncio ou admin pode editar
    if (anuncio.userId !== user.id && !user.admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Obter dados do formulário
    const titulo = formData.get("titulo") as string;
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

    // Atualizar anúncio
    const updated = await prisma.anuncio.update({
      where: { id },
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
      },
    });

    // Processar novas imagens
    const imagens = formData.getAll("imagens") as File[];
    if (imagens.length > 0) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Obter a ordem máxima atual
      const imagensExistentes = await prisma.imagemAnuncio.findMany({
        where: { anuncioId: id },
        orderBy: { ordem: "desc" },
        take: 1,
      });
      let ordemInicial = imagensExistentes.length > 0 ? imagensExistentes[0].ordem + 1 : 0;

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
                anuncioId: id,
                ordem: ordemInicial + i,
              },
            });
          } catch (imageError) {
            console.error(`Erro ao processar imagem ${i}:`, imageError);
          }
        }
      }
    }

    return NextResponse.json({ success: true, anuncio: updated });
  } catch (error: any) {
    console.error("Erro ao atualizar anúncio:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar anúncio" },
      { status: 500 }
    );
  }
}
