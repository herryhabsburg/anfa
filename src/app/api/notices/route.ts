import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function parseISODate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function GET() {
  const now = new Date();
  const notices = await prisma.notice.findMany({
    where: {
      OR: [
        { expireAt: null },
        { expireAt: { gt: now } }
      ]
    },
    orderBy: { publishedAt: "desc" },
    select: { 
      id: true, 
      title: true, 
      publishedAt: true, 
      content: true,
      department: true,
      authorName: true,
      authorStudentId: true
    },
  });
  return NextResponse.json({ notices });
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是有效的 JSON" }, { status: 400 });
  }

  const body = data as { 
    title?: unknown; 
    publishedAt?: unknown; 
    content?: unknown;
    department?: unknown;
    authorName?: unknown;
    authorStudentId?: unknown;
    expireDays?: unknown;
  };

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  const publishedAt = parseISODate(body.publishedAt);
  const department = typeof body.department === "string" ? body.department.trim() : "";
  const authorName = typeof body.authorName === "string" ? body.authorName.trim() : "";
  const authorStudentId = typeof body.authorStudentId === "string" ? body.authorStudentId.trim() : "";
  const expireDays = typeof body.expireDays === "number" && body.expireDays > 0 ? body.expireDays : null;

  if (!title) return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  if (!publishedAt) return NextResponse.json({ error: "发布时间不正确" }, { status: 400 });
  if (!content.trim()) return NextResponse.json({ error: "正文内容不能为空" }, { status: 400 });
  if (!department) return NextResponse.json({ error: "部门不能为空" }, { status: 400 });
  if (!authorName) return NextResponse.json({ error: "姓名不能为空" }, { status: 400 });
  if (!authorStudentId) return NextResponse.json({ error: "学号不能为空" }, { status: 400 });

  let expireAt: Date | null = null;
  if (expireDays) {
    expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + expireDays);
  }

  const created = await prisma.notice.create({
    data: {
      title,
      publishedAt,
      content,
      department,
      authorName,
      authorStudentId,
      expireAt,
    },
    select: { 
      id: true, 
      title: true, 
      publishedAt: true, 
      content: true,
      department: true,
      authorName: true,
      authorStudentId: true
    },
  });

  return NextResponse.json({ ok: true, notice: created }, { status: 201 });
}
