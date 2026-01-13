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
    
    // Tentar obter sessão do NextAuth
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (sessionError) {
      console.error("[Promover Admin] Erro ao obter sessão:", sessionError);
    }
    
    // Obter dados do body (pode estar vazio, mas vamos tentar)
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      // Body pode estar vazio
    }
    const { userEmail } = body;
    
    // Fallback: usar email do body se a sessão não funcionar
    let email: string | null = null;
    if (session?.user?.email) {
      email = session.user.email;
    } else if (userEmail) {
      email = userEmail;
    }
    
    if (!email) {
      console.log("[Promover Admin] Não autenticado: email não encontrado");
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email },
    });

    if (!admin) {
      console.log("[Promover Admin] Utilizador não encontrado:", email);
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    if (!admin.admin) {
      console.log("[Promover Admin] Utilizador não é admin:", email);
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const userToPromote = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!userToPromote) {
      return NextResponse.json(
        { error: "Utilizador não encontrado" },
        { status: 404 }
      );
    }

    if (userToPromote.admin) {
      return NextResponse.json(
        { error: "O utilizador já é administrador" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        admin: true,
        emailValidado: true, // Promover a admin também valida o email
      },
    });

    // Registrar ação administrativa
    await prisma.acaoAdministrativa.create({
      data: {
        tipo: "promover_admin",
        adminId: admin.id,
        descricao: `Promoveu utilizador ${updated.email} a administrador`,
        dados: JSON.stringify({ userId: updated.id }),
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Erro ao promover utilizador a admin:", error);
    return NextResponse.json(
      { error: "Erro ao promover utilizador a admin" },
      { status: 500 }
    );
  }
}

