"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type StockType = "IN" | "OUT" | "RETURN";

type Transaction = {
  id: string;
  assetId: string;
  type: StockType;
  quantity: number;
  operator: string | null;
  note: string | null;
  createdAt: string;
  asset?: {
    id: string;
    name: string;
    unit: string | null;
    category?: { name: string } | null;
  };
};

export default function StockInPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 30;
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize]);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const url = `/api/stock-in?page=${page}&pageSize=${pageSize}`;
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "加载入库记录失败");

      setTransactions((data.transactions ?? []) as Transaction[]);
      setTotalCount(Number(data.totalCount ?? 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载入库记录失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">入库记录</h2>
        <div className="text-sm text-zinc-500 mt-1">展示所有“入库(IN)”流水（支持分页）</div>
      </div>

      <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-200 flex items-start justify-between gap-4">
          <div className="text-sm text-zinc-500">
            共 {totalCount} 条记录
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 transition-colors disabled:opacity-60"
            >
              上一页
            </button>
            <div className="text-sm text-zinc-600">
              第 {page}/{totalPages} 页
            </div>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 transition-colors disabled:opacity-60"
            >
              下一页
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-zinc-500">加载中…</div>
        ) : error ? (
          <div className="p-5">
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-5 text-sm text-zinc-500">暂无入库记录</div>
        ) : (
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-zinc-500">
                  <tr>
                    <th className="py-2 pr-3 font-medium">时间</th>
                    <th className="py-2 pr-3 font-medium">物资</th>
                    <th className="py-2 pr-3 font-medium">分类</th>
                    <th className="py-2 pr-3 font-medium">入库数量</th>
                    <th className="py-2 pr-3 font-medium">经办人</th>
                    <th className="py-2 font-medium">备注</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-900">
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-t border-zinc-100">
                      <td className="py-3 pr-3 whitespace-nowrap text-zinc-600">{new Date(t.createdAt).toLocaleString("zh-CN")}</td>
                      <td className="py-3 pr-3">
                        <Link
                          href={`/assets/${t.assetId}`}
                          className="text-xs px-2 py-1 rounded-md border border-zinc-200 hover:bg-zinc-50 inline-flex"
                        >
                          {t.asset?.name ?? t.assetId}
                        </Link>
                      </td>
                      <td className="py-3 pr-3 text-zinc-600">{t.asset?.category?.name ?? "-"}</td>
                      <td className="py-3 pr-3">
                        <span className="text-green-700 font-semibold">
                          +{t.quantity}
                          {t.asset?.unit ? ` ${t.asset.unit}` : ""}
                        </span>
                      </td>
                      <td className="py-3 pr-3">{t.operator ?? "-"}</td>
                      <td className="py-3">{t.note ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

