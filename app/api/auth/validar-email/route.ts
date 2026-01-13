import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.json(
        { error: "Token e email são obrigatórios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilizador não encontrado" },
        { status: 404 }
      );
    }

    if (user.emailValidado) {
      return NextResponse.json({
        success: true,
        mensagem: "Email já foi validado anteriormente",
      });
    }

    if (user.tokenValidacao !== token) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 400 }
      );
    }

    // Validar email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailValidado: true,
        tokenValidacao: null,
      },
    });

    return NextResponse.json({
      success: true,
      mensagem: "Email validado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao validar email:", error);
    return NextResponse.json(
      { error: "Erro ao validar email" },
      { status: 500 }
    );
  }
}

