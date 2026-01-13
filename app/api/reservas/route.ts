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
    // Criar pedido de reserva pendente (não altera o estado do anúncio)
    const reserva = await prisma.reserva.create({
      data: {
        anuncioId,
        userId: user.id,
        status: "pendente",
        expiraEm: null,
      },
    });

    console.log(`[Reservas POST] Pedido de reserva criado: ID=${reserva.id}, UserID=${user.id}, AnuncioID=${anuncioId}`);

    // Notificar o vendedor do anúncio
    const anuncio = await prisma.anuncio.findUnique({
      where: { id: anuncioId },
      select: { userId: true },
    });

    if (anuncio) {
      await prisma.notificacao.create({
        data: {
          userId: anuncio.userId,
          tipo: "pedido_reserva",
          titulo: "Novo Pedido de Reserva",
          mensagem: `${user.firstName} ${user.lastName} fez um pedido de reserva para o seu veículo.`,
          anuncioId,
        },
      });
    }

    return NextResponse.json({ success: true, reserva });
  } catch (error) {
    console.error("Erro ao criar reserva:", error);
    return NextResponse.json(
      { error: "Erro ao criar reserva" },
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

    const reservas = await prisma.reserva.findMany({
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

    console.log(`[Reservas GET] Utilizador ${user.email} (ID: ${user.id}) - ${reservas.length} reservas encontradas`);
    
    return NextResponse.json({ reservas });
  } catch (error) {
    console.error("Erro ao buscar reservas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar reservas" },
      { status: 500 }
    );
  }
}

