import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const assetId = (await params).id;

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return NextResponse.json({ error: "物资不存在" }, { status: 404 });

  const transactions = await prisma.stockTransaction.findMany({
    where: { assetId },
    select: { type: true, quantity: true },
  });

  let stock = 0;
  for (const t of transactions) {
    if (t.type === "IN" || t.type === "RETURN") stock += t.quantity;
    if (t.type === "OUT") stock -= t.quantity;
  }

  const normalized = Number(stock.toFixed(2));
  return NextResponse.json({ assetId, stock: normalized });
}

