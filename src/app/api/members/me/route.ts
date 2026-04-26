import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMemberIdFromCookies } from "@/lib/member-auth";

export async function GET() {
  const memberId = await getMemberIdFromCookies();
  if (!memberId) return NextResponse.json({ error: "未登录成员" }, { status: 401 });

  const member = await prisma.member.findUnique({ where: { studentId: memberId } });
  if (!member) return NextResponse.json({ error: "成员不存在" }, { status: 404 });

  return NextResponse.json({
    member: {
      studentId: member.studentId,
      name: member.name,
      position: member.position,
      department: member.department,
    },
  });
}

