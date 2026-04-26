import { NextResponse } from "next/server";
import { getRoleFromCookies } from "@/lib/auth";

export async function GET() {
  const role = await getRoleFromCookies();
  return NextResponse.json({ role });
}
