import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const categoria = url.searchParams.get("categoria");
    const marca = url.searchParams.get("marca");
    const modelo = url.searchParams.get("modelo");
    const anoMin = url.searchParams.get("anoMin");
    const anoMax = url.searchParams.get("anoMax");
    const precoMin = url.searchParams.get("precoMin");
    const precoMax = url.searchParams.get("precoMax");
    const quilometragem = url.searchParams.get("quilometragem");
    const combustivel = url.searchParams.get("combustivel");
    const caixa = url.searchParams.get("caixa");
    const localizacao = url.searchParams.get("localizacao");
    const ordenacao = url.searchParams.get("ordenacao") || "mais_recentes";

    const where: any = {
      estado: "ativo", // Apenas anúncios ativos
    };

    if (categoria) where.categoria = { contains: categoria };
    if (marca) where.marca = { contains: marca };
    if (modelo) where.modelo = { contains: modelo };
    if (anoMin) where.ano = { gte: parseInt(anoMin) };
    if (anoMax) {
      if (where.ano) {
        where.ano = { ...where.ano, lte: parseInt(anoMax) };
      } else {
        where.ano = { lte: parseInt(anoMax) };
      }
    }
    if (precoMin) where.preco = { gte: parseFloat(precoMin) };
    if (precoMax) {
      if (where.preco) {
        where.preco = { ...where.preco, lte: parseFloat(precoMax) };
      } else {
        where.preco = { lte: parseFloat(precoMax) };
      }
    }
    if (quilometragem) where.quilometragem = { lte: parseInt(quilometragem) };
    if (combustivel) where.combustivel = combustivel;
    if (caixa) where.caixa = caixa;
    if (localizacao) where.localizacao = { contains: localizacao };

    const orderBy: any = {};
    switch (ordenacao) {
      case "preco_asc":
        orderBy.preco = "asc";
        break;
      case "preco_desc":
        orderBy.preco = "desc";
        break;
      case "quilometragem_asc":
        orderBy.quilometragem = "asc";
        break;
      default:
        orderBy.createdAt = "desc";
    }

    const anuncios = await prisma.anuncio.findMany({
      where,
      orderBy,
      include: {
        imagens: {
          orderBy: { ordem: "asc" },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    return NextResponse.json({ anuncios });
  } catch (error) {
    console.error("Erro ao buscar anúncios:", error);
    return NextResponse.json(
      { error: "Erro ao buscar anúncios" },
      { status: 500 }
    );
  }
}

