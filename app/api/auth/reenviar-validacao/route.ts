import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
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

    // Gerar novo token de validação
    const tokenValidacao = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        tokenValidacao,
      },
    });

    // Em produção, aqui enviaria um email com o link de validação
    // Por agora, retornamos o token para fins de desenvolvimento

    return NextResponse.json({
      success: true,
      mensagem: "Token de validação gerado com sucesso",
      // Em desenvolvimento: incluir token (remover em produção)
      tokenValidacao: process.env.NODE_ENV === "development" ? tokenValidacao : undefined,
      linkValidacao: process.env.NODE_ENV === "development" 
        ? `/validar-email?token=${tokenValidacao}&email=${encodeURIComponent(email)}`
        : undefined,
    });
  } catch (error) {
    console.error("Erro ao reenviar validação:", error);
    return NextResponse.json(
      { error: "Erro ao reenviar validação" },
      { status: 500 }
    );
  }
}

