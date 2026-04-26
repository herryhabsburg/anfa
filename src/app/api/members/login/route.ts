import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sha256Hex } from "@/lib/password";
import { MEMBER_ID_COOKIE_NAME } from "@/lib/member-auth";

export async function POST(request: Request) {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是有效的 JSON" }, { status: 400 });
  }

  const body = data as { studentId?: unknown; password?: unknown };
  const studentId = typeof body.studentId === "string" ? body.studentId.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!studentId) return NextResponse.json({ error: "缺少学号" }, { status: 400 });
  if (!password) return NextResponse.json({ error: "缺少密码" }, { status: 400 });

  const member = await prisma.member.findUnique({ where: { studentId } });
  if (!member) return NextResponse.json({ error: "学号或密码错误" }, { status: 401 });

  const hash = sha256Hex(password);
  if (hash !== member.passwordHash) {
    return NextResponse.json({ error: "学号或密码错误" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(MEMBER_ID_COOKIE_NAME, studentId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}

