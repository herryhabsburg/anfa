import { NextResponse } from "next/server";
import { ROLE_COOKIE_NAME, MEMBER_ID_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  
  // 清除登录状态的cookie
  res.cookies.delete(ROLE_COOKIE_NAME);
  res.cookies.delete(MEMBER_ID_COOKIE_NAME);
  
  return res;
}
