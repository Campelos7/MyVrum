import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { anuncioId, destinatarioId, conteudo, userEmail } = body;

    console.log("Dados recebidos:", { anuncioId, destinatarioId, conteudo: conteudo?.substring(0, 50), userEmail });

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

    if (!anuncioId || !destinatarioId || !conteudo || conteudo.trim() === "") {
      return NextResponse.json(
        { error: "Anúncio, destinatário e conteúdo são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o anúncio existe e se o destinatário é o vendedor
    const anuncio = await prisma.anuncio.findUnique({
      where: { id: anuncioId },
    });

    if (!anuncio) {
      return NextResponse.json(
        { error: "Anúncio não encontrado" },
        { status: 404 }
      );
    }

    const destinatarioIdNum = typeof destinatarioId === "number" 
      ? destinatarioId 
      : parseInt(destinatarioId);
    
    if (isNaN(destinatarioIdNum)) {
      return NextResponse.json(
        { error: "ID do destinatário inválido" },
        { status: 400 }
      );
    }

    if (anuncio.userId !== destinatarioIdNum) {
      console.error("Destinatário inválido:", {
        anuncioUserId: anuncio.userId,
        destinatarioIdNum,
        tipos: {
          anuncioUserId: typeof anuncio.userId,
          destinatarioIdNum: typeof destinatarioIdNum,
        },
      });
      return NextResponse.json(
        { error: "Destinatário inválido. O destinatário deve ser o vendedor do anúncio." },
        { status: 400 }
      );
    }

    console.log("Criando mensagem com:", {
      anuncioId,
      remetenteId: user.id,
      destinatarioId: destinatarioIdNum,
      conteudoLength: conteudo.trim().length,
    });

    const mensagem = await prisma.mensagem.create({
      data: {
        anuncioId,
        remetenteId: user.id,
        destinatarioId: destinatarioIdNum,
        conteudo: conteudo.trim(),
      },
    });

    // Criar notificação para o destinatário
    try {
      await prisma.notificacao.create({
        data: {
          userId: destinatarioIdNum,
          tipo: "mensagem_nova",
          titulo: "Nova mensagem",
          mensagem: `${user.firstName} ${user.lastName} enviou-te uma mensagem sobre o anúncio "${anuncio.titulo}"`,
          anuncioId,
        },
      });
    } catch (notifError) {
      console.error("Erro ao criar notificação (não crítico):", notifError);
      // Continua mesmo se a notificação falhar
    }

    return NextResponse.json({ success: true, mensagem });
  } catch (error: any) {
    console.error("Erro ao criar mensagem:", error);
    console.error("Detalhes do erro:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    
    // Verificar se o erro é porque o modelo não existe no Prisma Client
    const errorMessage = error.message?.toLowerCase() || "";
    const isModelError = 
      errorMessage.includes("mensagem") || 
      errorMessage.includes("model") || 
      errorMessage.includes("does not exist") ||
      errorMessage.includes("prisma") ||
      error.code === "P2001" ||
      error.code === "P2025";
    
    if (isModelError) {
      return NextResponse.json(
        { 
          error: "O modelo de mensagens não está disponível. Por favor: 1) Pare o servidor (Ctrl+C), 2) Execute 'npx prisma generate', 3) Reinicie o servidor.",
          detalhes: process.env.NODE_ENV === "development" ? error.message : undefined
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Erro ao criar mensagem",
        detalhes: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const anuncioId = searchParams.get("anuncioId");
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

    const where: any = {};
    if (anuncioId) {
      where.anuncioId = anuncioId;
    }
    
    // Mostrar mensagens onde o utilizador é remetente ou destinatário
    where.OR = [
      { remetenteId: user.id },
      { destinatarioId: user.id },
    ];

    let mensagens: any[] = [];
    
    try {
      // Verificar se o modelo existe tentando aceder a ele
      if (!(prisma as any).mensagem) {
        throw new Error("Modelo 'mensagem' não encontrado no Prisma Client. Execute 'npx prisma generate' após parar o servidor.");
      }

      mensagens = await prisma.mensagem.findMany({
        where,
        include: {
          remetente: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
          destinatario: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
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
        orderBy: { createdAt: "asc" },
      });

      // Marcar mensagens recebidas como lidas
      try {
        await prisma.mensagem.updateMany({
          where: {
            destinatarioId: user.id,
            lida: false,
            ...(anuncioId ? { anuncioId } : {}),
          },
          data: { lida: true },
        });
      } catch (updateError) {
        console.error("Erro ao marcar mensagens como lidas (não crítico):", updateError);
        // Continua mesmo se falhar
      }
    } catch (dbError: any) {
      // Se o erro for do Prisma sobre o modelo não existir, relançar para ser capturado pelo catch externo
      if (dbError.message?.includes("mensagem") || dbError.message?.includes("model") || dbError.message?.includes("Prisma Client")) {
        throw dbError;
      }
      // Outros erros de base de dados
      throw new Error(`Erro ao buscar mensagens da base de dados: ${dbError.message}`);
    }

    return NextResponse.json({ mensagens });
  } catch (error: any) {
    console.error("Erro ao buscar mensagens:", error);
    console.error("Detalhes do erro:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    
    // Verificar se o erro é porque o modelo não existe no Prisma Client
    const errorMessage = error.message?.toLowerCase() || "";
    const isModelError = 
      errorMessage.includes("mensagem") || 
      errorMessage.includes("model") || 
      errorMessage.includes("does not exist") ||
      errorMessage.includes("prisma") ||
      error.code === "P2001" ||
      error.code === "P2025";
    
    if (isModelError) {
      return NextResponse.json(
        { 
          error: "O modelo de mensagens não está disponível. Por favor: 1) Pare o servidor (Ctrl+C), 2) Execute 'npx prisma generate', 3) Reinicie o servidor.",
          detalhes: process.env.NODE_ENV === "development" ? error.message : undefined
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Erro ao buscar mensagens",
        detalhes: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

