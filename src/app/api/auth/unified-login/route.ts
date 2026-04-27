import { NextResponse } from "next/server";
import { sha256Hex } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { ALL_DEPARTMENT_MEMBERS } from "@/lib/members-data";

const ADMIN_SLUGS = ["chairman", "qingnian", "wenwen", "office", "tech", "life", "propaganda", "study", "org"];

function isAdminStudentId(studentId: string): boolean {
  for (const slug of ADMIN_SLUGS) {
    const members = ALL_DEPARTMENT_MEMBERS[slug];
    if (members?.leaders.some((m) => m.studentId === studentId)) {
      return true;
    }
  }
  return false;
}

function isStaffStudentId(studentId: string): boolean {
  for (const slug of ADMIN_SLUGS) {
    const members = ALL_DEPARTMENT_MEMBERS[slug];
    if (members?.staffs.some((m) => m.studentId === studentId)) {
      return true;
    }
  }
  return false;
}

async function getMemberPasswordHash(studentId: string): Promise<string> {
  const memberPassword = await prisma.memberPassword.findUnique({
    where: { studentId },
  });

  if (memberPassword) {
    return memberPassword.passwordHash;
  }

  return sha256Hex("123456");
}

export async function POST(request: Request) {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是有效的 JSON" }, { status: 400 });
  }

  const body = data as { studentId?: unknown; password?: unknown; role?: unknown };
  const studentId = typeof body.studentId === "string" ? body.studentId.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = typeof body.role === "string" ? body.role : "member";

  if (!studentId) return NextResponse.json({ error: "缺少学号" }, { status: 400 });
  if (!password) return NextResponse.json({ error: "缺少密码" }, { status: 400 });

  const passwordHash = await getMemberPasswordHash(studentId);
  const inputHash = sha256Hex(password);

  if (inputHash !== passwordHash) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, role: role === "admin" ? "admin" : "member" });

  if (role === "admin") {
    if (!isAdminStudentId(studentId)) {
      return NextResponse.json({ error: "您不是负责人，无权登录" }, { status: 403 });
    }

    res.cookies.set("inventory_role", "admin", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false,
      maxAge: 60 * 60 * 24 * 7,
    });
    res.cookies.set("inventory_member_id", studentId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false,
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }

  if (!isStaffStudentId(studentId)) {
    return NextResponse.json({ error: "您不是干事，无法登录" }, { status: 403 });
  }

  res.cookies.set("inventory_role", "member", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false,
    maxAge: 60 * 60 * 24 * 7,
  });
  res.cookies.set("inventory_member_id", studentId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false,
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}