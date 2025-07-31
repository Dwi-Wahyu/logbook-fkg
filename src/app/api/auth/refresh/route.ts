import getServerSession from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/config/auth";

export async function POST() {
  const session = await getServerSession(authConfig);
  // Lakukan apapun jika ingin logging, dsb.
  return NextResponse.json({ ok: true });
}
