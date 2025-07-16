// pages/api/auth/[...nextauth].ts
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          color: user.color,
          iconUrl: user.iconUrl,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.color = user.color;
        token.iconUrl = user.iconUrl;
        token.name = user.name;
      } else if (token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: Number(token.id) } });
        if (dbUser) {
          token.color = dbUser.color;
          token.iconUrl = dbUser.iconUrl;
          token.name = dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id;
        session.user.color = token.color;
        session.user.iconUrl = token.iconUrl;
        session.user.name = token.name; 
      }
      return session;
    },
  },
  
  pages: {
    signIn: "/auth/signin",
  },
};

export default NextAuth(authOptions);
