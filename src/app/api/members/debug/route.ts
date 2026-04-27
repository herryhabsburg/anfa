import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      total: members.length,
      members: members.map(m => ({
        studentId: m.studentId,
        name: m.name,
        position: m.position,
        department: m.department,
        passwordHash: m.passwordHash,
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: "获取成员失败", details: String(error) }, { status: 500 });
  }
}