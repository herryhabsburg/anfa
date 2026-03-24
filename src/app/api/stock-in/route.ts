import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get("pageSize") ?? "30")));

  const [totalCount, transactions] = await Promise.all([
    prisma.stockTransaction.count({ where: { type: "IN" } }),
    prisma.stockTransaction.findMany({
      where: { type: "IN" },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            unit: true,
            category: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    totalCount,
    page,
    pageSize,
    transactions,
  });
}

