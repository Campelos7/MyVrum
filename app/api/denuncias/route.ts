import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tipo, anuncioId, denunciadoId, motivo, descricao, userEmail } = body;

    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (sessionError) {
      console.error("Erro ao obter sessão:", sessionError);
    }

    let email: string | null = null;
    if (session?.user?.email) {
      email = session.user.email;
    } else if (userEmail) {
      email = userEmail;
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

    if (!motivo || motivo.trim() === "") {
      return NextResponse.json({ error: "Motivo é obrigatório" }, { status: 400 });
    }

    const denuncia = await prisma.denuncia.create({
      data: {
        tipo,
        anuncioId: tipo === "anuncio" ? anuncioId : null,
        denunciadoId: tipo === "utilizador" ? denunciadoId : null,
        denuncianteId: user.id,
        motivo: motivo.trim(),
        descricao: descricao ? descricao.trim() : null,
        estado: "aberta",
      },
    });

    console.log(`[Denúncias POST] Denúncia criada: ID=${denuncia.id}, DenuncianteID=${user.id}, Tipo=${tipo}, AnuncioID=${anuncioId || "N/A"}, DenunciadoID=${denunciadoId || "N/A"}`);

    return NextResponse.json({ success: true, denuncia });
  } catch (error) {
    console.error("Erro ao criar denúncia:", error);
    return NextResponse.json(
      { error: "Erro ao criar denúncia" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (sessionError) {
      console.error("Erro ao obter sessão:", sessionError);
    }

    const url = new URL(req.url);
    const userEmail = url.searchParams.get("userEmail");

    let email: string | null = null;
    if (session?.user?.email) {
      email = session.user.email;
    } else if (userEmail) {
      email = userEmail;
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

    const estado = url.searchParams.get("estado");
    const tipo = url.searchParams.get("tipo"); // "enviadas" ou "recebidas"

    const where: any = {};
    
    // Aplicar filtro de estado
    if (estado) {
      where.estado = estado;
    }

    // Se não for admin
    if (!user?.admin) {
      if (tipo === "recebidas") {
        // Denúncias recebidas: onde o utilizador é denunciado OU denúncias dos seus anúncios
        // Primeiro, buscar os IDs dos anúncios do utilizador
        const anunciosDoUsuario = await prisma.anuncio.findMany({
          where: { userId: user.id },
          select: { id: true },
        });
        const anuncioIds = anunciosDoUsuario.map((a) => a.id);

        // Construir condições OR
        const orConditions: any[] = [
          { denunciadoId: user.id }, // Denúncias onde é denunciado como utilizador
        ];
        
        // Adicionar denúncias dos seus anúncios se existirem
        if (anuncioIds.length > 0) {
          orConditions.push({ anuncioId: { in: anuncioIds } });
        }

        where.OR = orConditions;
      } else {
        // Por padrão, denúncias enviadas (onde o utilizador é o denunciante)
        where.denuncianteId = user!.id;
      }
    }

    const denuncias = await prisma.denuncia.findMany({
      where,
      include: {
        anuncio: {
          include: {
            imagens: { take: 1 },
          },
        },
        denunciado: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        denunciante: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        acoes: {
          include: {
            admin: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`[Denúncias GET] Utilizador ${user.email} (ID: ${user.id}, Admin: ${user.admin}) - ${denuncias.length} denúncias encontradas`);
    console.log(`[Denúncias GET] Where clause:`, JSON.stringify(where, null, 2));
    
    return NextResponse.json({ denuncias });
  } catch (error) {
    console.error("Erro ao buscar denúncias:", error);
    return NextResponse.json(
      { error: "Erro ao buscar denúncias" },
      { status: 500 }
    );
  }
}

