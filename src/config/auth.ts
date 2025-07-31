// src/config/AuthConfig.ts
import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compareSync } from "bcryptjs";
import { loginSchema } from "@/schema/LoginSchema";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) return null;

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;

        const user = await prisma.pengguna.findFirst({
          where: { username },
          include: {
            mahasiswa: {
              select: {
                id: true,
                semester: true,
              },
            },
            dosen: {
              select: {
                id: true,
              },
            },
            programStudi: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        });

        if (!user) return null;

        const semester = user.mahasiswa?.semester ?? 0;

        const isValid = compareSync(password, user.password);
        return isValid
          ? {
              id: user.id,
              username: user.username,
              nama: user.nama,
              avatar: user.avatar,
              peran: user.peran,
              programStudi: user.programStudi.nama,
              programStudiId: user.programStudiId,
              semester: semester,
            }
          : null;
      },
    }),
  ],
  pages: {
    signIn: "/",
    signOut: "/logout",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.nama = token.nama as string;
        session.user.peran = token.peran as string;
        session.user.avatar = token.avatar as string;
        session.user.programStudi = token.programStudi as string;
        session.user.programStudiId = token.programStudiId as string;
        session.user.semester = token.semester as number;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.nama = user.nama;
        token.peran = user.peran;
        token.avatar = user.avatar;
        token.programStudi = user.programStudi;
        token.programStudiId = user.programStudiId;
        token.semester = user.semester;
      }
      return token;
    },
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
