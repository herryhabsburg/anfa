import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST() {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const now = new Date();
    const result = await prisma.notice.deleteMany({
      where: {
        expireAt: { lte: now }
      }
    });

    return NextResponse.json({ ok: true, deletedCount: result.count });
  } catch (err) {
    console.error("清理过期公告失败:", err);
    return NextResponse.json({ error: "清理过期公告失败" }, { status: 500 });
  }
}
