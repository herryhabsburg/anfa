import { NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client-runtime-utils";
import { prisma } from "@/lib/prisma";
import { assetSchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query")?.trim() ?? "";
  const categoryId = url.searchParams.get("categoryId")?.trim() ?? "";

  const where = {
    ...(categoryId ? { categoryId } : {}),
    ...(query
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          },
        }
      : {}),
  };

  const assets = await prisma.asset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        select: { id: true, name: true },
      },
    },
  });

  return NextResponse.json(assets);
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

  const parsed = assetSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "参数校验失败", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const created = await prisma.asset.create({
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
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      // foreign key: categoryId doesn't exist
      if (err.code === "P2003") {
        return NextResponse.json(
          { error: "选择的分类不存在" },
          { status: 400 },
        );
      }
    }
    return NextResponse.json({ error: "创建物资失败" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();
  if (!id) {
    return NextResponse.json({ error: "缺少物资 ID" }, { status: 400 });
  }

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
      // record not found
      if (err.code === "P2025") {
        return NextResponse.json(
          { error: "物资不存在" },
          { status: 404 },
        );
      }
      // foreign key: categoryId doesn't exist
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

export async function DELETE(request: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();
  if (!id) {
    return NextResponse.json({ error: "缺少物资 ID" }, { status: 400 });
  }

  try {
    await prisma.asset.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      // record not found
      if (err.code === "P2025") {
        return NextResponse.json(
          { error: "物资不存在" },
          { status: 404 },
        );
      }
    }
    return NextResponse.json({ error: "删除物资失败" }, { status: 500 });
  }
}

