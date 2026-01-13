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
      console.error("[Utilizadores] Erro ao obter sessão:", sessionError);
    }
    
    // Fallback: obter email do query parameter
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

    if (!user?.admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const utilizadores = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        vendedor: true,
        admin: true,
        bloqueado: true,
        motivoBloqueio: true,
        aprovadoPor: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ utilizadores });
  } catch (error) {
    console.error("Erro ao buscar utilizadores:", error);
    return NextResponse.json(
      { error: "Erro ao buscar utilizadores" },
      { status: 500 }
    );
  }
}

