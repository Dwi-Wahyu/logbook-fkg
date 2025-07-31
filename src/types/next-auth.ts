import NextAuth, { DefaultSession, User } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      nama: string;
      peran: string;
      avatar: string;
      programStudiId: string;
      programStudi: string;
      semester?: number;
    };
  }

  interface User {
    id: string;
    username: string;
    nama: string;
    peran: string;
    avatar: string | null;
    programStudiId: string;
    programStudi: string;
    semester?: number;
  }
}
