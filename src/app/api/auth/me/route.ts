import { NextResponse } from "next/server";
import { getRoleFromCookies } from "@/lib/auth";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const role = await getRoleFromCookies();
  return NextResponse.json({ role, cookieHeader: cookieHeader ?? null });
}

