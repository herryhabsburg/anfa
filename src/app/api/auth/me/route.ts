import { NextResponse } from "next/server";
import { getRoleFromCookies } from "@/lib/auth";

export async function GET() {
  try {
    const role = await getRoleFromCookies();
    return NextResponse.json({ ok: true, role });
  } catch (error) {
    return NextResponse.json({ ok: true, role: "user" });
  }
}
