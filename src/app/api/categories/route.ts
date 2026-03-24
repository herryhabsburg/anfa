import { NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client-runtime-utils";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(categories);
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

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "参数校验失败", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const created = await prisma.category.create({
      data: { name: parsed.data.name },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return NextResponse.json(
          { error: "分类名称已存在，请换一个名称" },
          { status: 409 },
        );
      }
    }
    return NextResponse.json({ error: "创建分类失败" }, { status: 500 });
  }
}

