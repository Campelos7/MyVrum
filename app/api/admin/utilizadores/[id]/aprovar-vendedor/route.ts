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
      console.error("[Aprovar Vendedor] Erro ao obter sessão:", sessionError);
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
      console.log("[Aprovar Vendedor] Não autenticado: email não encontrado");
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email },
    });

    if (!admin) {
      console.log("[Aprovar Vendedor] Utilizador não encontrado:", email);
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    if (!admin.admin) {
      console.log("[Aprovar Vendedor] Utilizador não é admin:", email);
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const userToApprove = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!userToApprove) {
      return NextResponse.json(
        { error: "Utilizador não encontrado" },
        { status: 404 }
      );
    }

    if (!userToApprove.emailValidado) {
      return NextResponse.json(
        { error: "O utilizador precisa validar o email antes de ser aprovado como vendedor" },
        { status: 400 }
      );
    }

    if (!userToApprove.vendedor) {
      return NextResponse.json(
        { error: "O utilizador não solicitou ser vendedor" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        aprovadoPor: admin.id,
      },
    });

    // Registrar ação administrativa
    await prisma.acaoAdministrativa.create({
      data: {
        tipo: "aprovacao_vendedor",
        adminId: admin.id,
        descricao: `Aprovou vendedor ${updated.email}`,
        dados: JSON.stringify({ userId: updated.id }),
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Erro ao aprovar vendedor:", error);
    return NextResponse.json(
      { error: "Erro ao aprovar vendedor" },
      { status: 500 }
    );
  }
}

