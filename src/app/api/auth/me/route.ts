import { NextResponse } from "next/server";
import { getRoleFromRequest } from "@/lib/auth";
import { getMemberIdFromCookies } from "@/lib/member-auth";

export async function GET(request: Request) {
  try {
    const role = getRoleFromRequest(request);
    const memberId = await getMemberIdFromCookies();
    return NextResponse.json({ ok: true, role, memberId });
  } catch (error) {
    return NextResponse.json({ ok: true, role: "user" });
  }
}