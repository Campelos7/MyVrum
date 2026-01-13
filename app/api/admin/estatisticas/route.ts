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
      console.error("[Estatísticas] Erro ao obter sessão:", sessionError);
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

    // Estatísticas
    const totalCompradores = await prisma.user.count({
      where: { vendedor: false, admin: false },
    });

    const totalVendedores = await prisma.user.count({
      where: { vendedor: true },
    });

    const anunciosAtivos = await prisma.anuncio.count({
      where: { estado: "ativo" },
    });

    const data30DiasAtras = new Date();
    data30DiasAtras.setDate(data30DiasAtras.getDate() - 30);

    const vendas30Dias = await prisma.encomenda.count({
      where: {
        createdAt: { gte: data30DiasAtras },
        estado: "pago",
      },
    });

    // Top marca
    const topMarcaData = await prisma.anuncio.groupBy({
      by: ["marca"],
      where: {
        marca: { not: null },
      },
      _count: {
        marca: true,
      },
      orderBy: {
        _count: {
          marca: "desc",
        },
      },
      take: 1,
    });

    const topMarca = topMarcaData[0]?.marca || null;

    // Top modelo
    const topModeloData = await prisma.anuncio.groupBy({
      by: ["modelo"],
      where: {
        modelo: { not: null },
      },
      _count: {
        modelo: true,
      },
      orderBy: {
        _count: {
          modelo: "desc",
        },
      },
      take: 1,
    });

    const topModelo = topModeloData[0]?.modelo || null;

    const denunciasAbertas = await prisma.denuncia.count({
      where: { estado: "aberta" },
    });

    return NextResponse.json({
      totalCompradores,
      totalVendedores,
      anunciosAtivos,
      vendas30Dias,
      topMarca,
      topModelo,
      denunciasAbertas,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}

