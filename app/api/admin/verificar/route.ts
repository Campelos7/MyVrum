import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Tentar obter sessão do NextAuth
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (sessionError) {
      console.error("[Admin Verificar] Erro ao obter sessão:", sessionError);
    }
    
    // Fallback: obter email do query parameter
    const url = new URL(req.url);
    const userEmail = url.searchParams.get("userEmail");
    
    let email: string | null = null;
    if (session?.user?.email) {
      email = session.user.email;
      console.log("[Admin Verificar] Email da sessão NextAuth:", email);
    } else if (userEmail) {
      email = userEmail;
      console.log("[Admin Verificar] Email do query parameter:", email);
    }
    
    if (!email) {
      console.log("[Admin Verificar] Sem email - não autenticado");
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    console.log("[Admin Verificar] Admin na sessão:", (session?.user as any)?.admin);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("[Admin Verificar] Utilizador não encontrado na BD");
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    console.log("[Admin Verificar] Admin na BD:", user.admin);

    if (!user.admin) {
      console.log("[Admin Verificar] Utilizador não é admin");
      return NextResponse.json({ 
        error: "Não autorizado. O utilizador não tem permissões de administrador.",
        userAdmin: user.admin,
        sessionAdmin: (session?.user as any)?.admin
      }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Verificar] Erro:", error);
    return NextResponse.json({ error: "Erro ao verificar" }, { status: 500 });
  }
}

