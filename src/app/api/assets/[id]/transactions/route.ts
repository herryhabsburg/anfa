import { NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client-runtime-utils";
import { prisma } from "@/lib/prisma";
import { stockTransactionSchema } from "@/lib/schemas";

function computeStock(transactions: Array<{ type: string; quantity: number }>) {
  let stock = 0;
  for (const t of transactions) {
    if (t.type === "IN" || t.type === "RETURN") stock += t.quantity;
    if (t.type === "OUT") stock -= t.quantity;
  }
  return Number(stock.toFixed(2));
}

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  const assetId = (await params).id;
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get("pageSize") ?? "30")));

  const [totalCount, transactions] = await Promise.all([
    prisma.stockTransaction.count({ where: { assetId } }),
    prisma.stockTransaction.findMany({
      where: { assetId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    totalCount,
    page,
    pageSize,
    transactions,
  });
}

export async function POST(request: Request, { params }: Context) {
  const assetId = (await params).id;

  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是有效的 JSON" }, { status: 400 });
  }

  const parsed = stockTransactionSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "参数校验失败", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return NextResponse.json({ error: "物资不存在" }, { status: 404 });

  // 领用 OUT 需要防止库存为负
  const existingTxs = await prisma.stockTransaction.findMany({
    where: { assetId },
    select: { type: true, quantity: true },
  });

  const currentStock = computeStock(existingTxs);
  if (parsed.data.type === "OUT" && currentStock < parsed.data.quantity) {
    return NextResponse.json(
      { error: "库存不足，无法领用" , currentStock},
      { status: 409 },
    );
  }

  try {
    const created = await prisma.stockTransaction.create({
      data: {
        assetId,
        type: parsed.data.type,
        quantity: parsed.data.quantity,
        operator: parsed.data.operator ?? null,
        note: parsed.data.note ?? null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2003") {
        return NextResponse.json({ error: "物资关联失败" }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "创建流水失败" }, { status: 500 });
  }
}

