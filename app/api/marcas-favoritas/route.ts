import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { marca, userEmail } = body;

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

    if (!marca || marca.trim() === "") {
      return NextResponse.json(
        { error: "Marca é obrigatória" },
        { status: 400 }
      );
    }

    // Verificar se já existe
    const marcaExistente = await prisma.marcaFavorita.findFirst({
      where: {
        userId: user.id,
        marca: marca.trim(),
      },
    });

    if (marcaExistente) {
      return NextResponse.json(
        { error: "Marca já está nos favoritos" },
        { status: 400 }
      );
    }

    const marcaFavorita = await prisma.marcaFavorita.create({
      data: {
        userId: user.id,
        marca: marca.trim(),
      },
    });

    return NextResponse.json({ success: true, marcaFavorita });
  } catch (error) {
    console.error("Erro ao criar marca favorita:", error);
    return NextResponse.json(
      { error: "Erro ao criar marca favorita" },
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

    const marcasFavoritas = await prisma.marcaFavorita.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ marcasFavoritas });
  } catch (error) {
    console.error("Erro ao listar marcas favoritas:", error);
    return NextResponse.json(
      { error: "Erro ao listar marcas favoritas" },
      { status: 500 }
    );
  }
}

