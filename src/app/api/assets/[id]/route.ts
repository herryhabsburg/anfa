import { NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client-runtime-utils";
import path from "node:path";
import fs from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { assetSchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: Context) {
  const id = (await params).id;
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  if (!asset) return NextResponse.json({ error: "物资不存在" }, { status: 404 });
  return NextResponse.json(asset);
}

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

  const parsed = assetSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "参数校验失败", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "物资不存在" }, { status: 404 });

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        name: parsed.data.name,
        modelOrSpec: parsed.data.modelOrSpec ?? null,
        unit: parsed.data.unit ?? null,
        categoryId: parsed.data.categoryId,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2003") {
        return NextResponse.json(
          { error: "选择的分类不存在" },
          { status: 400 },
        );
      }
    }
    return NextResponse.json({ error: "更新物资失败" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const id = (await params).id;
  try {
    const existing = await prisma.asset.findUnique({ where: { id } });
    await prisma.asset.delete({ where: { id } });

    // 删除时顺带清理图片文件（尽量避免残留）
    if (existing?.photoUrl) {
      try {
        const rel = existing.photoUrl.replace(/^\//, "");
        const abs = path.join(process.cwd(), "public", rel);
        await fs.unlink(abs);
      } catch {
        // 忽略清理失败
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return NextResponse.json({ error: "物资不存在" }, { status: 404 });
      }
    }
    return NextResponse.json({ error: "删除物资失败" }, { status: 500 });
  }
}

