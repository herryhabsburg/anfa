"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";

type Category = { id: string; name: string; createdAt: string };
type Asset = {
  id: string;
  name: string;
  modelOrSpec: string | null;
  unit: string | null;
  categoryId: string;
  createdAt: string;
  category?: { id: string; name: string } | null;
};
type StockResp = { assetId: string; stock: number };

export default function OfficeInventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categoryCount, setCategoryCount] = useState(0);
  const [assetCount, setAssetCount] = useState(0);
  const [stocks, setStocks] = useState<Array<{ asset: Asset; stock: number }>>([]);
  const [stockPage, setStockPage] = useState(1);
  const stockPageSize = 10;

  const logoInputId = useId();
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoBuster, setLogoBuster] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const [catsRes, assetsRes] = await Promise.all([fetch("/api/categories"), fetch("/api/assets")]);

        const categories: Category[] = await catsRes.json();
        const assets: Asset[] = await assetsRes.json();

        if (cancelled) return;

        setCategoryCount(categories.length);
        setAssetCount(assets.length);

        const stockList: StockResp[] = await Promise.all(
          assets.map((a) => fetch(`/api/assets/${a.id}/stock`).then((r) => r.json())),
        );

        if (cancelled) return;

        setStocks(
          assets.map((a) => ({
            asset: a,
            stock: stockList.find((s) => s.assetId === a.id)?.stock ?? 0,
          })),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortStocks = useMemo(() => {
    return [...stocks].sort((a, b) => a.stock - b.stock);
  }, [stocks]);

  const stockTotalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortStocks.length / stockPageSize));
  }, [sortStocks.length]);

  const stockPageRows = useMemo(() => {
    const start = (stockPage - 1) * stockPageSize;
    return sortStocks.slice(start, start + stockPageSize);
  }, [sortStocks, stockPage]);

  useEffect(() => {
    if (stockPage > stockTotalPages) {
      setStockPage(stockTotalPages);
    }
  }, [stockPage, stockTotalPages]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">物资管理系统</h2>
          <div className="text-sm text-zinc-500 mt-1">办公室物资管理模块</div>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 transition-colors"
        >
          ← 返回
        </button>
      </div>

      <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-5 flex items-center gap-4">
          <div className="flex flex-col items-center">
            <input
              id={logoInputId}
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0] ?? null;
                if (!f) return;
                setLogoError(null);
                setLogoUploading(true);
                try {
                  const fd = new FormData();
                  fd.append("logo", f);
                  const res = await fetch("/api/college-logo", { method: "POST", body: fd });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) throw new Error(data?.error ?? "上传失败");
                  setLogoBuster(Date.now());
                } catch (err) {
                  setLogoError(err instanceof Error ? err.message : "上传失败");
                } finally {
                  setLogoUploading(false);
                }
              }}
            />

            <label htmlFor={logoInputId} className="cursor-pointer" title="点击上传院徽（可更换）">
              <img
                src={`/api/college-logo?bust=${logoBuster}`}
                alt="院徽（点击可上传）"
                className="w-14 h-14 rounded-2xl border border-zinc-200 bg-zinc-50 object-contain"
                referrerPolicy="no-referrer"
              />
            </label>

            <div className="mt-2 text-[11px] text-zinc-500 leading-tight">
              {logoUploading ? "上传中…" : "点击院徽上传"}
            </div>

            {logoError ? <div className="mt-1 text-[11px] text-red-600 leading-tight">{logoError}</div> : null}
          </div>

          <div className="min-w-0">
            <div className="text-base font-semibold text-zinc-950">物资管理系统（办公室模块）</div>
            <div className="text-sm text-zinc-500 mt-1">物资分类、入库、领用、归还与库存流水管理</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/assets"
                className="text-xs px-3 py-2 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
              >
                物资档案
              </Link>
              <Link
                href="/categories"
                className="text-xs px-3 py-2 rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors"
              >
                分类管理
              </Link>
              <Link
                href="/stock-in"
                className="text-xs px-3 py-2 rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors"
              >
                入库记录
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm">
          <div className="text-xs text-zinc-500">物资分类</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">{categoryCount}</div>
        </div>
        <div className="rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm">
          <div className="text-xs text-zinc-500">物资档案</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">{assetCount}</div>
        </div>
        <div className="rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm">
          <div className="text-xs text-zinc-500">重点关注（低库存）</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">{sortStocks.filter((s) => s.stock <= 0).length}</div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-200 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-zinc-500">物资库存概览</div>
            <div className="text-base font-semibold mt-1">按库存从低到高展示（全部物资）</div>
          </div>
          <Link
            href="/assets"
            className="text-sm px-3 py-2 rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors"
          >
            去物资管理
          </Link>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-zinc-500">加载中…</div>
        ) : sortStocks.length === 0 ? (
          <div className="p-5 text-sm text-zinc-500">暂无物资记录</div>
        ) : (
          <div className="p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-xs text-zinc-500">共 {sortStocks.length} 条物资记录</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStockPage((p) => Math.max(1, p - 1))}
                  disabled={stockPage <= 1}
                  className="text-xs px-2 py-1 rounded-md border border-zinc-200 hover:bg-zinc-50 disabled:opacity-60"
                >
                  上一页
                </button>
                <div className="text-xs text-zinc-600">
                  第 {stockPage}/{stockTotalPages} 页
                </div>
                <button
                  type="button"
                  onClick={() => setStockPage((p) => Math.min(stockTotalPages, p + 1))}
                  disabled={stockPage >= stockTotalPages}
                  className="text-xs px-2 py-1 rounded-md border border-zinc-200 hover:bg-zinc-50 disabled:opacity-60"
                >
                  下一页
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-zinc-500">
                  <tr>
                    <th className="py-2 pr-3 font-medium">物资名称</th>
                    <th className="py-2 pr-3 font-medium">分类</th>
                    <th className="py-2 pr-3 font-medium">当前库存</th>
                    <th className="py-2 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-900">
                  {stockPageRows.map((row) => (
                    <tr key={row.asset.id} className="border-t border-zinc-100">
                      <td className="py-3 pr-3">
                        <div className="font-medium">{row.asset.name}</div>
                        {row.asset.modelOrSpec ? <div className="text-xs text-zinc-500">规格：{row.asset.modelOrSpec}</div> : null}
                      </td>
                      <td className="py-3 pr-3 text-zinc-600">{row.asset.category?.name ?? "-"}</td>
                      <td className="py-3 pr-3">
                        <span className={row.stock <= 0 ? "text-red-600 font-semibold" : ""}>
                          {row.stock}
                          {row.asset.unit ? ` ${row.asset.unit}` : ""}
                        </span>
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/assets/${row.asset.id}`}
                          className="text-xs px-2 py-1 rounded-md border border-zinc-200 hover:bg-zinc-50"
                        >
                          查看详情
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

