import { NextResponse } from "next/server";
import { getRoleFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const role = getRoleFromRequest(request);
    return NextResponse.json({ ok: true, role });
  } catch (error) {
    return NextResponse.json({ ok: true, role: "user" });
  }
}
