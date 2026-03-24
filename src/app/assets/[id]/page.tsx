"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState, type FormEvent } from "react";

type Asset = {
  id: string;
  name: string;
  modelOrSpec: string | null;
  unit: string | null;
  photoUrl: string | null;
  categoryId: string;
  createdAt: string;
  category?: { id: string; name: string } | null;
};

type StockResp = { assetId: string; stock: number };

type StockType = "IN" | "OUT" | "RETURN";

type Transaction = {
  id: string;
  assetId: string;
  type: StockType;
  quantity: number;
  operator: string | null;
  note: string | null;
  createdAt: string;
};

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const assetId = use(params).id;

  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [stock, setStock] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  type Role = "admin" | "user";
  const [role, setRole] = useState<Role>("user");
  const [authLoading, setAuthLoading] = useState(true);
  const canEdit = !authLoading && role === "admin";

  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editOperator, setEditOperator] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [tab, setTab] = useState<StockType>("IN");
  const [quantity, setQuantity] = useState("");
  const [operator, setOperator] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && (data.role === "admin" || data.role === "user")) {
          setRole(data.role as Role);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadAll() {
    const [assetRes, stockRes, txRes] = await Promise.all([
      fetch(`/api/assets/${assetId}`),
      fetch(`/api/assets/${assetId}/stock`),
      fetch(`/api/assets/${assetId}/transactions?page=1&pageSize=30`),
    ]);

    const assetData = await assetRes.json().catch(() => ({}));
    const stockData = await stockRes.json().catch(() => ({}));
    const txData = await txRes.json().catch(() => ({}));

    if (!assetRes.ok) throw new Error(assetData?.error ?? "加载物资失败");
    if (!stockRes.ok) throw new Error(stockData?.error ?? "加载库存失败");
    if (!txRes.ok) throw new Error(txData?.error ?? "加载流水失败");

    setAsset(assetData as Asset);
    setStock((stockData as StockResp).stock);
    setTransactions((txData.transactions ?? []) as Transaction[]);
  }

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        await loadAll();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId]);

  const unitLabel = useMemo(() => {
    return asset?.unit ? ` ${asset.unit}` : "";
  }, [asset?.unit]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const q = Number(quantity);
    if (!Number.isFinite(q) || q <= 0) {
      setSubmitError("请输入正确的数量（大于 0）");
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        type: tab,
        quantity: q,
        operator: operator.trim() ? operator.trim() : null,
        note: note.trim() ? note.trim() : null,
      };

      const res = await fetch(`/api/assets/${assetId}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "提交失败");

      setQuantity("");
      setOperator("");
      setNote("");
      await loadAll();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setSubmitLoading(false);
    }
  }

  function startEditTx(t: Transaction) {
    setEditingTxId(t.id);
    setEditQuantity(String(t.quantity));
    setEditOperator(t.operator ?? "");
    setEditNote(t.note ?? "");
    setEditLoading(false);
    setEditError(null);
  }

  function cancelEditTx() {
    setEditingTxId(null);
    setEditQuantity("");
    setEditOperator("");
    setEditNote("");
    setEditLoading(false);
    setEditError(null);
  }

  async function saveEditTx(e: FormEvent) {
    e.preventDefault();
    setEditError(null);

    if (!canEdit) {
      setEditError("无权限：仅管理员可编辑入库(IN)数量");
      return;
    }
    if (!editingTxId) return;

    const q = Number(editQuantity);
    if (!Number.isFinite(q) || q <= 0) {
      setEditError("请输入正确的数量（大于 0）");
      return;
    }

    setEditLoading(true);
    try {
      const payload = {
        quantity: q,
        operator: editOperator.trim() ? editOperator.trim() : null,
        note: editNote.trim() ? editNote.trim() : null,
      };

      const res = await fetch(`/api/assets/${assetId}/transactions/${editingTxId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "更新失败");

      cancelEditTx();
      await loadAll();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "更新失败");
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-500">
            <Link href="/assets" className="hover:underline">
              返回物资管理
            </Link>
          </div>
          <h2 className="text-lg font-semibold mt-1">{asset?.name ?? "物资详情"}</h2>
          <div className="text-sm text-zinc-500 mt-1">
            {asset?.category?.name ? `分类：${asset.category.name}` : "—"}
            {asset?.modelOrSpec ? ` | 规格：${asset.modelOrSpec}` : ""}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm px-5 py-4 text-right">
          {asset?.photoUrl ? (
            <img
              src={asset.photoUrl}
              alt="物资照片"
              className="mx-auto w-full max-w-xs rounded-2xl border border-zinc-200 mb-4 object-cover aspect-[4/3]"
            />
          ) : (
            <div className="mx-auto w-full max-w-xs rounded-2xl border border-dashed border-zinc-200 mb-4 p-3 text-xs text-zinc-500">
              暂无照片
            </div>
          )}
          <div className="text-xs text-zinc-500">当前库存</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">{stock}</div>
          {unitLabel ? <div className="text-xs text-zinc-500 mt-1">单位：{unitLabel.trim()}</div> : null}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-500">加载中…</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden lg:col-span-2">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">库存流水</div>
                <div className="text-xs text-zinc-500 mt-1">按时间倒序展示（最近 30 条）</div>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="p-5 text-sm text-zinc-500">暂无流水记录</div>
            ) : (
              <div className="p-5">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-zinc-500">
                      <tr>
                        <th className="py-2 pr-3 font-medium">时间</th>
                        <th className="py-2 pr-3 font-medium">类型</th>
                        <th className="py-2 pr-3 font-medium">数量</th>
                        <th className="py-2 pr-3 font-medium">经办人</th>
                        <th className="py-2 font-medium">备注</th>
                      </tr>
                    </thead>
                    <tbody className="text-zinc-900">
                      {transactions.map((t) => (
                        <tr key={t.id} className="border-t border-zinc-100">
                          <td className="py-3 pr-3 whitespace-nowrap text-zinc-600">
                            {new Date(t.createdAt).toLocaleString("zh-CN")}
                          </td>
                          <td className="py-3 pr-3">
                            {t.type === "IN" ? (
                              <span className="text-green-700 font-semibold">入库</span>
                            ) : t.type === "OUT" ? (
                              <span className="text-red-700 font-semibold">领用</span>
                            ) : (
                              <span className="text-blue-700 font-semibold">归还</span>
                            )}
                          </td>
                          <td className="py-3 pr-3">
                            {t.type === "OUT" ? (
                              <span className="text-red-700 font-semibold">
                                -{t.quantity}
                              </span>
                            ) : (
                              <span className="text-green-700 font-semibold">
                                +{t.quantity}
                              </span>
                            )}
                            {asset?.unit ? ` ${asset.unit}` : ""}
                          </td>
                          <td className="py-3 pr-3">{t.operator ?? "-"}</td>
                          <td className="py-3">
                            {t.note ?? "-"}
                            {canEdit && t.type === "IN" ? (
                              <div className="mt-2">
                                <button
                                  type="button"
                                  onClick={() => startEditTx(t)}
                                  className="text-xs px-2 py-1 rounded-md border border-zinc-200 hover:bg-zinc-50"
                                >
                                  编辑入库数量
                                </button>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
            {editingTxId ? (
              <>
                <div className="p-5 border-b border-zinc-200">
                  <div className="text-sm font-semibold">编辑入库记录</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    仅管理员可修正历史 `IN` 数量（将影响当前库存）
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {editError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                      {editError}
                    </div>
                  ) : null}

                  <form onSubmit={saveEditTx} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        入库数量{unitLabel ? `（${asset?.unit}）` : ""}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                        placeholder="例如：10"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">经办人（可选）</label>
                      <input
                        value={editOperator}
                        onChange={(e) => setEditOperator(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                        placeholder="例如：张三"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">备注（可选）</label>
                      <input
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                        placeholder="例如：第几次入库"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={editLoading}
                        className="flex-1 rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:bg-zinc-800 transition-colors disabled:opacity-60"
                      >
                        {editLoading ? "保存中…" : "保存修改"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditTx}
                        className="rounded-xl border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <>
                <div className="p-5 border-b border-zinc-200">
                  <div className="text-sm font-semibold">新增流水</div>
                  <div className="text-xs text-zinc-500 mt-1">选择类型后填写数量</div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTab("IN")}
                      className={`flex-1 rounded-xl px-3 py-2 text-sm border transition-colors ${
                        tab === "IN"
                          ? "bg-green-50 border-green-200 text-green-900"
                          : "bg-white border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      入库
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab("OUT")}
                      className={`flex-1 rounded-xl px-3 py-2 text-sm border transition-colors ${
                        tab === "OUT"
                          ? "bg-red-50 border-red-200 text-red-900"
                          : "bg-white border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      领用
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab("RETURN")}
                      className={`flex-1 rounded-xl px-3 py-2 text-sm border transition-colors ${
                        tab === "RETURN"
                          ? "bg-blue-50 border-blue-200 text-blue-900"
                          : "bg-white border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      归还
                    </button>
                  </div>

                  {submitError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                      {submitError}
                    </div>
                  ) : null}

                  <form onSubmit={submit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        数量{unitLabel ? `（${asset?.unit}）` : ""}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                        placeholder={tab === "OUT" ? "例如：2" : "例如：10"}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">经办人（可选）</label>
                      <input
                        value={operator}
                        onChange={(e) => setOperator(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                        placeholder="例如：张三"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">备注（可选）</label>
                      <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                        placeholder="例如：借用第几次"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="w-full rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:bg-zinc-800 transition-colors disabled:opacity-60"
                    >
                      {submitLoading ? "提交中…" : "提交"}
                    </button>

                    <div className="text-xs text-zinc-500 leading-relaxed">
                      {tab === "OUT" ? "领用会自动校验库存，避免库存出现负数。" : "系统会按所选类型更新库存。"}
                    </div>
                  </form>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

