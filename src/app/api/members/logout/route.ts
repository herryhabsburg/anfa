import { NextResponse } from "next/server";
import { MEMBER_ID_COOKIE_NAME } from "@/lib/member-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(MEMBER_ID_COOKIE_NAME);
  return res;
}

