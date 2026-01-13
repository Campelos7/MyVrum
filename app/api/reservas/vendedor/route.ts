import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET - Buscar pedidos de reserva para os anúncios do vendedor
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

    // Buscar reservas dos anúncios do vendedor
    const reservas = await prisma.reserva.findMany({
      where: {
        anuncio: {
          userId: user.id,
        },
      },
      include: {
        anuncio: {
          include: {
            imagens: { take: 1 },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // pendentes primeiro
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ reservas });
  } catch (error) {
    console.error("Erro ao buscar reservas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar reservas" },
      { status: 500 }
    );
  }
}
