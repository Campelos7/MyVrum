import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!admin?.admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const data = await req.json();
    const { firstName, lastName, username, email, password } = data;

    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 400 }
      );
    }

    // Verificar se o username já existe
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username já está em uso" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        phone: data.phone || "",
        country: data.country || "+351",
        address: data.address || "",
        admin: true,
        emailValidado: true, // Administradores criados por outros admins não precisam validar email
      },
    });

    // Registrar ação administrativa
    await prisma.acaoAdministrativa.create({
      data: {
        tipo: "criar_admin",
        adminId: admin.id,
        descricao: `Criou novo administrador: ${newAdmin.email}`,
        dados: JSON.stringify({ userId: newAdmin.id }),
      },
    });

    return NextResponse.json({ success: true, user: newAdmin });
  } catch (error) {
    console.error("Erro ao criar administrador:", error);
    return NextResponse.json(
      { error: "Erro ao criar administrador" },
      { status: 500 }
    );
  }
}

