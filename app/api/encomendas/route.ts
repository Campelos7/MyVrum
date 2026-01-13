import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { anuncioId, userEmail } = body;

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

    const anuncio = await prisma.anuncio.findUnique({
      where: { id: anuncioId },
    });

    if (!anuncio || !anuncio.preco) {
      return NextResponse.json(
        { error: "Anúncio não encontrado ou sem preço" },
        { status: 400 }
      );
    }

    const encomenda = await prisma.encomenda.create({
      data: {
        anuncioId,
        userId: user.id,
        valor: anuncio.preco,
        estado: "pendente",
      },
    });

    // Atualizar estado do anúncio para "vendido"
    await prisma.anuncio.update({
      where: { id: anuncioId },
      data: { estado: "vendido" },
    });

    return NextResponse.json({ success: true, encomenda });
  } catch (error) {
    console.error("Erro ao criar encomenda:", error);
    return NextResponse.json(
      { error: "Erro ao criar encomenda" },
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

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    const encomendas = await prisma.encomenda.findMany({
      where: { userId: user.id },
      include: {
        anuncio: {
          include: {
            imagens: { take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ encomendas });
  } catch (error) {
    console.error("Erro ao buscar encomendas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar encomendas" },
      { status: 500 }
    );
  }
}

