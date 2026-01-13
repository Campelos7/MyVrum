import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 400 }
      );
    }

    // Verificar se o username já existe
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username já está em uso" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Gerar token de validação
    const tokenValidacao = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        emailValidado: false,
        tokenValidacao,
        vendedor: data.vendedor || false,
      },
    });

    // Em produção, aqui enviaria um email com o link de validação
    // Por agora, retornamos o token para fins de desenvolvimento
    // Em produção, o token seria enviado por email e não retornado na resposta

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      // Em desenvolvimento: incluir token (remover em produção)
      tokenValidacao: process.env.NODE_ENV === "development" ? tokenValidacao : undefined,
      mensagem: "Registo realizado com sucesso. Por favor, valide o seu email.",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro ao registar." }, { status: 500 });
  }
}
