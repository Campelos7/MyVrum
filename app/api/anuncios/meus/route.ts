import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (sessionError) {
      console.error("Erro ao obter sessão:", sessionError);
    }

    let userEmail: string | null = null;

    if (session?.user?.email) {
      userEmail = session.user.email;
    } else {
      // Tentar obter email do header ou query params como fallback
      const url = new URL(req.url);
      const emailFromQuery = url.searchParams.get("email");
      if (emailFromQuery) {
        userEmail = emailFromQuery;
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

    const anuncios = await prisma.anuncio.findMany({
      where: { userId: user.id },
      include: {
        imagens: {
          orderBy: { ordem: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ anuncios });
  } catch (error) {
    console.error("Erro ao buscar anúncios:", error);
    return NextResponse.json(
      { error: "Erro ao buscar anúncios" },
      { status: 500 }
    );
  }
}

