import { NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client-runtime-utils";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const id = (await params).id;
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
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "分类不存在" }, { status: 404 });

    const updated = await prisma.category.update({
      where: { id },
      data: { name: parsed.data.name },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return NextResponse.json(
          { error: "分类名称已存在，请换一个名称" },
          { status: 409 },
        );
      }
    }
    return NextResponse.json({ error: "更新分类失败" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const id = (await params).id;
  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return NextResponse.json({ error: "分类不存在" }, { status: 404 });
      }
      if (err.code === "P2003" || err.code === "P2014") {
        return NextResponse.json(
          { error: "删除失败：该分类下存在物资或有关联数据" },
          { status: 409 },
        );
      }
    }
    return NextResponse.json({ error: "删除分类失败" }, { status: 500 });
  }
}

