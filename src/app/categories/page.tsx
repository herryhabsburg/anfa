"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";

type Category = { id: string; name: string; createdAt: string };

export default function CategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  type Role = "admin" | "user";
  const [role, setRole] = useState<Role>("user");
  const [authLoading, setAuthLoading] = useState(true);
  const canEdit = !authLoading && role === "admin";

  async function load() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? "加载失败");
    return data as Category[];
  }

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const list = await load();
        if (!cancelled) setCategories(list);
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
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(() => {
    return [...categories];
  }, [categories]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canEdit) {
      return setError("无权限：仅管理员可新增/编辑物资分类");
    }

    if (!name.trim()) {
      setError("请输入分类名称");
      return;
    }

    const payload = { name: name.trim() };
    try {
      const res = editingId
        ? await fetch(`/api/categories/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "操作失败");

      setName("");
      setEditingId(null);

      const list = await load();
      setCategories(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  }

  function onEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setError(null);
  }

  async function onDelete(id: string) {
    if (!canEdit) {
      setError("无权限：仅管理员可删除物资分类");
      return;
    }

    const ok = window.confirm("确认删除该分类？");
    if (!ok) return;

    setError(null);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "删除失败");
      const list = await load();
      setCategories(list);

      if (editingId === id) {
        setEditingId(null);
        setName("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">分类管理</h2>
        <div className="text-sm text-zinc-500 mt-1">
          {canEdit ? "新增、编辑、删除物资分类" : "普通用户仅可查看物资分类"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-200">
            <div className="text-sm font-semibold">分类列表</div>
            <div className="text-xs text-zinc-500 mt-1">点击“编辑”可修改名称</div>
          </div>
          {loading ? (
            <div className="p-5 text-sm text-zinc-500">加载中…</div>
          ) : sorted.length === 0 ? (
            <div className="p-5 text-sm text-zinc-500">暂无分类</div>
          ) : (
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-zinc-500">
                    <tr>
                      <th className="py-2 pr-3 font-medium">分类名称</th>
                      <th className="py-2 pr-3 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-900">
                    {sorted.map((cat) => (
                      <tr key={cat.id} className="border-t border-zinc-100">
                        <td className="py-3 pr-3">
                          <div className="font-medium">{cat.name}</div>
                        </td>
                        <td className="py-3 pr-3">
                          {canEdit ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="text-xs px-3 py-1 rounded-md border border-zinc-200 hover:bg-zinc-50"
                                onClick={() => onEdit(cat)}
                              >
                                编辑
                              </button>
                              <button
                                type="button"
                                className="text-xs px-3 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                                onClick={() => onDelete(cat.id)}
                              >
                                删除
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
          <div className="p-5 border-b border-zinc-200">
            <div className="text-sm font-semibold">
              {canEdit ? (editingId ? "编辑分类" : "新增分类") : "管理员权限"}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {canEdit ? "请确保名称唯一（不重复）" : "当前身份无权限新增/编辑/删除分类"}
            </div>
          </div>

          <div className="p-5">
            {canEdit ? (
              <>
                {error ? (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                    {error}
                  </div>
                ) : null}

                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">分类名称</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                      placeholder="例如：办公设备"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:bg-zinc-800 transition-colors"
                    >
                      {editingId ? "保存修改" : "新增"}
                    </button>
                    {editingId ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setName("");
                          setError(null);
                        }}
                        className="rounded-xl border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 transition-colors"
                      >
                        取消
                      </button>
                    ) : null}
                  </div>
                </form>
              </>
            ) : (
              <div className="text-sm text-zinc-600 space-y-2">
                <div className="text-zinc-800">仅管理员可新增/编辑/删除物资分类</div>
                <div className="text-xs text-zinc-500">你可以先返回物资管理查看物资。</div>
                <div>
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:bg-zinc-800 transition-colors"
                  >
                    管理员登录
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

