import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, filtros, userEmail } = body;

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

    if (!nome || !filtros) {
      return NextResponse.json(
        { error: "Nome e filtros são obrigatórios" },
        { status: 400 }
      );
    }

    const filtroFavorito = await prisma.filtroFavorito.create({
      data: {
        userId: user.id,
        nome,
        filtros: JSON.stringify(filtros),
      },
    });

    return NextResponse.json({ success: true, filtroFavorito });
  } catch (error) {
    console.error("Erro ao criar filtro favorito:", error);
    return NextResponse.json(
      { error: "Erro ao criar filtro favorito" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail");

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

    const filtrosFavoritos = await prisma.filtroFavorito.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const filtrosFormatados = filtrosFavoritos.map((f) => ({
      ...f,
      filtros: JSON.parse(f.filtros),
    }));

    return NextResponse.json({ filtrosFavoritos: filtrosFormatados });
  } catch (error) {
    console.error("Erro ao listar filtros favoritos:", error);
    return NextResponse.json(
      { error: "Erro ao listar filtros favoritos" },
      { status: 500 }
    );
  }
}

