import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sha256Hex } from "@/lib/password";
import { getMemberIdFromRequest } from "@/lib/member-auth";
import { ALL_DEPARTMENT_MEMBERS } from "@/lib/members-data";

const DEFAULT_PASSWORD_HASH = sha256Hex("123456");

function isValidMember(studentId: string): boolean {
  for (const dept of Object.values(ALL_DEPARTMENT_MEMBERS)) {
    const leader = dept.leaders.find(m => m.studentId === studentId);
    if (leader) return true;

    const staff = dept.staffs.find(m => m.studentId === studentId);
    if (staff) return true;
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

  return DEFAULT_PASSWORD_HASH;
}

export async function POST(request: Request) {
  const memberId = getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  if (!isValidMember(memberId)) {
    return NextResponse.json({ error: "成员不存在" }, { status: 404 });
  }

  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是有效的 JSON" }, { status: 400 });
  }

  const body = data as { oldPassword?: unknown; newPassword?: unknown };
  const oldPassword = typeof body.oldPassword === "string" ? body.oldPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!oldPassword) return NextResponse.json({ error: "请输入当前密码" }, { status: 400 });
  if (!newPassword) return NextResponse.json({ error: "请输入新密码" }, { status: 400 });
  if (newPassword.length < 4) return NextResponse.json({ error: "新密码长度至少为4位" }, { status: 400 });

  const storedHash = await getMemberPasswordHash(memberId);
  const oldHash = sha256Hex(oldPassword);
  if (oldHash !== storedHash) {
    return NextResponse.json({ error: "当前密码不正确" }, { status: 401 });
  }

  if (oldPassword === newPassword) {
    return NextResponse.json({ error: "新密码不能与当前密码相同" }, { status: 400 });
  }

  const newHash = sha256Hex(newPassword);
  await prisma.memberPassword.upsert({
    where: { studentId: memberId },
    update: { passwordHash: newHash },
    create: { studentId: memberId, passwordHash: newHash },
  });

  return NextResponse.json({ ok: true, message: "密码修改成功" });
}