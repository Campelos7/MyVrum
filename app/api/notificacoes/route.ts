import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail");
    const naoLidas = searchParams.get("naoLidas") === "true";

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

    const where: any = { userId: user.id };
    if (naoLidas) {
      where.lida = false;
    }

    const notificacoes = await prisma.notificacao.findMany({
      where,
      include: {
        anuncio: {
          select: {
            id: true,
            titulo: true,
            imagens: {
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: naoLidas ? 10 : 50,
    });

    return NextResponse.json({ notificacoes });
  } catch (error: any) {
    console.error("Erro ao buscar notificações:", error);
    console.error("Detalhes:", {
      message: error.message,
      code: error.code,
    });
    
    const errorMessage = error.message?.toLowerCase() || "";
    if (errorMessage.includes("notificacao") || errorMessage.includes("model") || error.code === "P2001") {
      return NextResponse.json(
        { 
          error: "O modelo de notificações não está disponível. Pare o servidor, execute 'npx prisma generate' e reinicie.",
          detalhes: process.env.NODE_ENV === "development" ? error.message : undefined
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Erro ao buscar notificações",
        detalhes: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, lida, userEmail } = body;

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

    if (id) {
      // Marcar uma notificação específica
      const notificacao = await prisma.notificacao.findUnique({
        where: { id },
      });

      if (!notificacao || notificacao.userId !== user.id) {
        return NextResponse.json(
          { error: "Notificação não encontrada" },
          { status: 404 }
        );
      }

      await prisma.notificacao.update({
        where: { id },
        data: { lida: lida !== undefined ? lida : true },
      });
    } else {
      // Marcar todas como lidas
      await prisma.notificacao.updateMany({
        where: { userId: user.id, lida: false },
        data: { lida: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao atualizar notificação:", error);
    return NextResponse.json(
      { 
        error: "Erro ao atualizar notificação",
        detalhes: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

