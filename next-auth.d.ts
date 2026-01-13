import NextAuth, { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string | number;
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      phone?: string | null;
      country?: string | null;
      address?: string | null;
      image?: string | null;
      vendedor?: boolean | null;
      nif?: string | null;
      admin?: boolean | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string | number;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    country?: string | null;
    address?: string | null;
    image?: string | null;
    vendedor?: boolean | null;
    nif?: string | null;
    admin?: boolean | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    country?: string;
    address?: string;
    image?: string;
    vendedor?: boolean;
    nif?: string | null;
    admin?: boolean;
  }
}
