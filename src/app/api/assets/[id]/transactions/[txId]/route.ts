import { NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client-runtime-utils";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { stockTransactionEditSchema } from "@/lib/schemas";

type Context = { params: Promise<{ id: string; txId: string }> };

export async function PUT(request: Request, { params }: Context) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id: assetId, txId } = await params;

  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是有效的 JSON" }, { status: 400 });
  }

  const parsed = stockTransactionEditSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "参数校验失败", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.stockTransaction.findUnique({ where: { id: txId } });
    if (!existing || existing.assetId !== assetId) {
      return NextResponse.json({ error: "流水不存在" }, { status: 404 });
    }

    if (existing.type !== "IN") {
      return NextResponse.json({ error: "仅支持编辑入库(IN)流水" }, { status: 400 });
    }

    const updated = await prisma.stockTransaction.update({
      where: { id: txId },
      data: {
        quantity: parsed.data.quantity,
        operator: parsed.data.operator ?? null,
        note: parsed.data.note ?? null,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "更新流水失败" }, { status: 500 });
    }
    return NextResponse.json({ error: "更新流水失败" }, { status: 500 });
  }
}

