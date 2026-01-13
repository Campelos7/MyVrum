import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // ajusta o caminho conforme o teu setup
import { writeFile } from "fs/promises";
import path from "path";

// 🧩 GET - retorna os dados do utilizador autenticado (frontend passa email como query param)
export async function GET(req: Request) {
try {
const url = new URL(req.url);
const email = url.searchParams.get("email");
if (!email) {
return NextResponse.json({ error: "Email não fornecido" }, { status: 400 });
}


const user = await prisma.user.findUnique({
  where: { email },
  select: { firstName: true, lastName: true, email: true, phone: true, address: true, image: true },
});

if (!user) {
  return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
}

return NextResponse.json({ user });


} catch (err) {
console.error("Erro ao obter perfil:", err);
return NextResponse.json({ error: "Erro ao obter perfil" }, { status: 500 });
}
}

// 🧩 PUT - atualiza nome, contacto, endereço e imagem
// assume que o email do utilizador já é conhecido no frontend
export async function PUT(req: Request) {
try {
const formData = await req.formData();
const email = formData.get("email") as string; // usado apenas para identificar o utilizador
const firstName = formData.get("firstName") as string;
const lastName = formData.get("lastName") as string;
const phone = formData.get("contact") as string;
const address = formData.get("address") as string;
const image = formData.get("image") as File | null;
const vendedor = formData.get("vendedor") === "true";
const nif = formData.get("nif") as string | null;

if (!email) {
  return NextResponse.json({ error: "Email não fornecido" }, { status: 400 });
}

let imagePath: string | undefined;
if (image) {
  const buffer = Buffer.from(await image.arrayBuffer());
  const fileName = `${Date.now()}-${image.name}`;
  const filePath = path.join(process.cwd(), "public", "uploads", fileName);
  await writeFile(filePath, buffer);
  imagePath = `/uploads/${fileName}`;
}

const updatedUser = await prisma.user.update({
  where: { email },
  data: {
    firstName,
    lastName,
    phone,
    address,
    vendedor,   // NOVO 🔥
    nif: vendedor ? nif : null, // só grava se for vendedor
    ...(imagePath ? { image: imagePath } : {}),
  },
  select: { 
    firstName: true, 
    lastName: true,
    phone: true, 
    address: true, 
    email: true, 
    image: true, 
    vendedor:true, 
    nif:true, },
});

return NextResponse.json({ success: true, user: updatedUser });


} catch (err) {
console.error("Erro ao atualizar perfil:", err);
return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
}
}
