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
      console.error("[Moderar Anúncio] Erro ao obter sessão:", sessionError);
    }
    
    // Obter dados do body
    const body = await req.json();
    const { acao, userEmail } = body;
    
    // Fallback: usar email do body se a sessão não funcionar
    let email: string | null = null;
    if (session?.user?.email) {
      email = session.user.email;
    } else if (userEmail) {
      email = userEmail;
    }
    
    if (!email) {
      console.log("[Moderar Anúncio] Não autenticado: email não encontrado");
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email },
    });

    if (!admin) {
      console.log("[Moderar Anúncio] Utilizador não encontrado:", email);
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    if (!admin.admin) {
      console.log("[Moderar Anúncio] Utilizador não é admin:", email);
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    let estado = "ativo";
    if (acao === "pausar") {
      estado = "pausado";
    } else if (acao === "ativar") {
      estado = "ativo";
    } else if (acao === "remover") {
      // Remover anúncio (pode ser soft delete ou hard delete)
      await prisma.anuncio.delete({
        where: { id },
      });

      await prisma.acaoAdministrativa.create({
        data: {
          tipo: "moderacao_anuncio",
          adminId: admin.id,
          descricao: `Removeu anúncio ${id}`,
          dados: JSON.stringify({ anuncioId: id, acao }),
        },
      });

      return NextResponse.json({ success: true });
    }

    const updated = await prisma.anuncio.update({
      where: { id },
      data: { estado },
    });

    await prisma.acaoAdministrativa.create({
      data: {
        tipo: "moderacao_anuncio",
        adminId: admin.id,
        descricao: `${acao === "pausar" ? "Pausou" : acao === "ativar" ? "Ativou" : "Moderou"} anúncio ${id}`,
        dados: JSON.stringify({ anuncioId: id, acao, estado }),
      },
    });

    return NextResponse.json({ success: true, anuncio: updated });
  } catch (error) {
    console.error("Erro ao moderar anúncio:", error);
    return NextResponse.json(
      { error: "Erro ao moderar anúncio" },
      { status: 500 }
    );
  }
}

