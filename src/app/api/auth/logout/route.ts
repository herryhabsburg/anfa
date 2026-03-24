import { NextResponse } from "next/server";
import { ROLE_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ROLE_COOKIE_NAME);
  return res;
}

