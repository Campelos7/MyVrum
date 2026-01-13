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
      console.error("[Bloquear Utilizador] Erro ao obter sessão:", sessionError);
    }
    
    // Obter dados do body
    const body = await req.json();
    const { motivo, ativar, userEmail } = body;
    
    // Fallback: usar email do body se a sessão não funcionar
    let email: string | null = null;
    if (session?.user?.email) {
      email = session.user.email;
    } else if (userEmail) {
      email = userEmail;
    }
    
    if (!email) {
      console.log("[Bloquear Utilizador] Não autenticado: email não encontrado");
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("[Bloquear Utilizador] Utilizador não encontrado:", email);
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    if (!user.admin) {
      console.log("[Bloquear Utilizador] Utilizador não é admin:", email);
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: ativar
        ? {
            bloqueado: false,
            motivoBloqueio: null,
          }
        : {
            bloqueado: true,
            motivoBloqueio: motivo,
          },
    });

    // Registrar ação administrativa
    await prisma.acaoAdministrativa.create({
      data: {
        tipo: ativar ? "ativacao" : "bloqueio",
        adminId: user.id,
        descricao: ativar
          ? `Ativou utilizador ${updated.email}`
          : `Bloqueou utilizador ${updated.email}. Motivo: ${motivo}`,
        dados: JSON.stringify({ userId: updated.id, motivo: ativar ? null : motivo, acao: ativar ? "ativar" : "bloquear" }),
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Erro ao bloquear utilizador:", error);
    return NextResponse.json(
      { error: "Erro ao bloquear utilizador" },
      { status: 500 }
    );
  }
}

