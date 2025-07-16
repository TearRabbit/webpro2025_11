// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name?: string | null;
      email?: string | null;
      color?: string | null;
      iconUrl?: string | null;
    };
  }

  interface User {
    id: number;
    color?: string | null;
    iconUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    color?: string | null;
    iconUrl?: string | null;
  }
}

export {};
