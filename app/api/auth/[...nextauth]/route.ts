import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

type MyUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  country?: string;
  address?: string;
  image?: string;
  name: string;
  vendedor: boolean;   // 🔥 novo
  nif?: string | null;  // 🔥 novo
};

// ⚡ Exporta as opções separadamente
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: { user: {}, password: {} },
      async authorize(credentials): Promise<MyUser | null> {
        if (!credentials) return null;
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.user },
              { username: credentials.user },
            ],
          },
        });
        if (!user) return null;
        
        // Verificar se o utilizador está bloqueado
        if (user.bloqueado) {
          throw new Error(`Acesso negado. Motivo: ${user.motivoBloqueio || "Conta bloqueada por um administrador"}`);
        }
        
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        
        // Se a conta foi criada antes da implementação da validação (sem tokenValidacao)
        // e ainda não foi validada, validar automaticamente
        if (!user.emailValidado && !user.tokenValidacao) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              emailValidado: true,
            },
          });
          user.emailValidado = true; // Atualizar o objeto local
        }
        
        // Verificar se o email foi validado (após possível validação automática)
        if (!user.emailValidado) {
          throw new Error("Por favor, valide o seu email antes de fazer login.");
        }
        return {
          id: user.id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone,
          country: user.country,
          address: user.address,
          image: user.image,
          vendedor: user.vendedor,
          nif: user.nif,
          admin: user.admin || false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Quando o utilizador faz login
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.email = user.email;
        token.phone = user.phone;
        token.country = user.country;
        token.address = user.address;
        token.image = user.image;
        token.vendedor = user.vendedor;
        token.nif = user.nif;
        token.admin = user.admin || false;
      }
      
      // Sempre verificar na base de dados para garantir que está atualizado
      // (útil quando o utilizador é promovido a admin enquanto está logado)
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: {
              admin: true,
              vendedor: true,
              bloqueado: true,
              emailValidado: true,
            },
          });
          
          if (dbUser) {
            token.admin = dbUser.admin || false;
            token.vendedor = dbUser.vendedor || false;
            // Se o utilizador foi bloqueado, invalidar o token
            if (dbUser.bloqueado) {
              return null; // Isso vai fazer logout automático
            }
          }
        } catch (error) {
          console.error("Erro ao verificar utilizador no JWT callback:", error);
          // Continuar com os valores do token se houver erro
        }
      }
      
      return token;
    },
     async session({ session, token }) {
    if (session.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        country: true,
        address: true,
        image: true,
        vendedor: true,
        nif: true,
        admin: true
        }
      });
      if (user) {
        session.user.id = user.id.toString();
        session.user.firstName = user.firstName;
        session.user.lastName = user.lastName;
        session.user.name = `${user.firstName} ${user.lastName}`;
        session.user.phone = user.phone;
        session.user.country = user.country;
        session.user.address = user.address;
        session.user.image = user.image;
        session.user.vendedor = user.vendedor;
        session.user.nif = user.nif;
        session.user.admin = user.admin || false;
      }
    }
    return session;
    },
  },
  session: { strategy: "jwt" as const }, // ⚠️ corrigido o type
  pages: { signIn: "/" },
};

// ⚡ Exporta o handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
