import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { acao, dias, userEmail } = body; // acao: "aprovar" ou "recusar", dias: prazo de expiração

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

    // Buscar a reserva
    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        anuncio: true,
        user: true,
      },
    });

    if (!reserva) {
      return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 });
    }

    // Verificar se o utilizador é o dono do anúncio
    if (reserva.anuncio.userId !== user.id) {
      return NextResponse.json({ error: "Não autorizado - apenas o vendedor pode responder" }, { status: 403 });
    }

    // Verificar se já foi respondida
    if (reserva.status !== "pendente") {
      return NextResponse.json({ error: "Esta reserva já foi respondida" }, { status: 400 });
    }

    if (acao === "aprovar") {
      // Definir data de expiração
      const expiraEm = new Date();
      expiraEm.setDate(expiraEm.getDate() + (dias || 7));

      // Atualizar reserva
      await prisma.reserva.update({
        where: { id },
        data: {
          status: "aprovado",
          expiraEm,
          respondidoEm: new Date(),
        },
      });

      // Atualizar estado do anúncio
      await prisma.anuncio.update({
        where: { id: reserva.anuncioId },
        data: { estado: "reservado" },
      });

      // Notificar o comprador
      await prisma.notificacao.create({
        data: {
          userId: reserva.userId,
          tipo: "reserva_aprovada",
          titulo: "Pedido de Reserva Aprovado",
          mensagem: `O seu pedido de reserva para ${reserva.anuncio.titulo} foi aprovado pelo vendedor!`,
          anuncioId: reserva.anuncioId,
        },
      });

      return NextResponse.json({ success: true, message: "Reserva aprovada com sucesso" });
    } else if (acao === "recusar") {
      // Atualizar reserva
      await prisma.reserva.update({
        where: { id },
        data: {
          status: "recusado",
          respondidoEm: new Date(),
        },
      });

      // Notificar o comprador
      await prisma.notificacao.create({
        data: {
          userId: reserva.userId,
          tipo: "reserva_recusada",
          titulo: "Pedido de Reserva Recusado",
          mensagem: `O seu pedido de reserva para ${reserva.anuncio.titulo} foi recusado pelo vendedor.`,
          anuncioId: reserva.anuncioId,
        },
      });

      return NextResponse.json({ success: true, message: "Reserva recusada" });
    } else {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }
  } catch (error) {
    console.error("Erro ao responder reserva:", error);
    return NextResponse.json(
      { error: "Erro ao responder reserva" },
      { status: 500 }
    );
  }
}
