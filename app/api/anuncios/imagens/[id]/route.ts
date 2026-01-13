import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Obter a imagem
    const imagem = await prisma.imagemAnuncio.findUnique({
      where: { id },
      include: {
        anuncio: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!imagem) {
      return NextResponse.json(
        { error: "Imagem não encontrada" },
        { status: 404 }
      );
    }

    // Verificar autenticação
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (sessionError) {
      console.error("Erro ao obter sessão:", sessionError);
    }

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    // Apenas o dono do anúncio ou admin pode remover
    if (imagem.anuncio.userId !== user.id && !user.admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Remover arquivo físico
    try {
      const filePath = path.join(process.cwd(), "public", imagem.url);
      await unlink(filePath);
    } catch (fileError) {
      console.error("Erro ao remover arquivo:", fileError);
      // Continua mesmo se não conseguir remover o arquivo
    }

    // Remover da base de dados
    await prisma.imagemAnuncio.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao remover imagem:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao remover imagem" },
      { status: 500 }
    );
  }
}

