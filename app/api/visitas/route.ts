import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { anuncioId, dataHora, userEmail } = body;

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

    const visita = await prisma.visita.create({
      data: {
        anuncioId,
        userId: user.id,
        dataHora: new Date(dataHora),
      },
    });

    console.log(`[Visitas POST] Visita criada: ID=${visita.id}, UserID=${user.id}, AnuncioID=${anuncioId}, DataHora=${dataHora}`);

    return NextResponse.json({ success: true, visita });
  } catch (error) {
    console.error("Erro ao marcar visita:", error);
    return NextResponse.json(
      { error: "Erro ao marcar visita" },
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

    let email: string | null = null;
    if (session?.user?.email) {
      email = session.user.email;
    } else {
      // Tentar obter do query string como fallback
      const url = new URL(req.url);
      const userEmail = url.searchParams.get("userEmail");
      if (userEmail) {
        email = userEmail;
      }
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

    const visitas = await prisma.visita.findMany({
      where: { userId: user.id },
      include: {
        anuncio: {
          include: {
            imagens: { take: 1 },
          },
        },
      },
      orderBy: { dataHora: "asc" },
    });

    console.log(`[Visitas GET] Utilizador ${user.email} (ID: ${user.id}) - ${visitas.length} visitas encontradas`);
    
    return NextResponse.json({ visitas });
  } catch (error) {
    console.error("Erro ao buscar visitas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar visitas" },
      { status: 500 }
    );
  }
}

