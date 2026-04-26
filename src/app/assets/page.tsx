"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useId, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; createdAt: string };
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

type Role = "admin" | "member" | "user";

export default function AssetsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  const [query, setQuery] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [modelOrSpec, setModelOrSpec] = useState("");
  const [unit, setUnit] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [initialPhotoUrl, setInitialPhotoUrl] = useState<string | null>(null);
  const photoInputId = useId();

  const [error, setError] = useState<string | null>(null);

  const [role, setRole] = useState<Role>("user");
  const [authLoading, setAuthLoading] = useState(true);

  const canEdit = !authLoading && role === "admin";

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch("/api/auth/me");
        console.log("Auth response status:", res.status);
        const data = await res.json();
        console.log("Auth response data:", data);
        if (cancelled) return;
        // 无论 res.ok 如何，只要 data.role 是有效的角色值，就更新角色
        if (data.role === "admin" || data.role === "member" || data.role === "user") {
          setRole(data.role as Role);
          console.log("Role updated to:", data.role);
        }
      } catch (error) {
        console.error("Error fetching auth status:", error);
      } finally {
        if (!cancelled) setAuthLoading(false);
        console.log("Auth loading set to false");
      }
    }
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 释放本地预览对象 URL，避免内存泄漏
  useEffect(() => {
    return () => {
      if (photoPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? "加载分类失败");
    return data as Category[];
  }

  async function loadAssets() {
    const qs = new URLSearchParams();
    if (query.trim()) qs.set("query", query.trim());
    if (filterCategoryId) qs.set("categoryId", filterCategoryId);

    const url = qs.toString() ? `/api/assets?${qs.toString()}` : "/api/assets";
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? "加载物资失败");
    return data as Asset[];
  }

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const [cats, list] = await Promise.all([loadCategories(), loadAssets()]);
        if (cancelled) return;
        setCategories(cats);
        setAssets(list);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editingId && !categoryId && categories.length > 0) {
      setCategoryId(categories[0]!.id);
    }
  }, [categories, editingId, categoryId]);

  const sorted = useMemo(() => assets, [assets]);

  async function onSearch() {
    setError(null);
    try {
      const list = await loadAssets();
      setAssets(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "搜索失败");
    }
  }

  function startCreate() {
    setEditingId(null);
    setName("");
    setModelOrSpec("");
    setUnit("");
    setCategoryId(categories[0]?.id ?? "");
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    setInitialPhotoUrl(null);
    setError(null);
  }

  function startEdit(asset: Asset) {
    setEditingId(asset.id);
    setName(asset.name);
    setModelOrSpec(asset.modelOrSpec ?? "");
    setUnit(asset.unit ?? "");
    setCategoryId(asset.categoryId);
    setPhotoFile(null);
    setPhotoPreviewUrl(asset.photoUrl ?? null);
    setInitialPhotoUrl(asset.photoUrl ?? null);
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canEdit) {
      return setError("无权限：仅管理员可新增/编辑/删除物资");
    }

    if (!name.trim()) return setError("请输入物资名称");
    if (!categoryId) return setError("请选择分类");

    const payload = {
      name: name.trim(),
      modelOrSpec: modelOrSpec.trim() ? modelOrSpec.trim() : null,
      unit: unit.trim() ? unit.trim() : null,
      categoryId,
    };

    try {
      let nextAssetId: string | null = null;
      const res = editingId
        ? await fetch(`/api/assets/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/assets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "操作失败");
      nextAssetId = data?.id ?? editingId;

      // 上传照片（如果用户选了文件）
      if (photoFile && nextAssetId) {
        const fd = new FormData();
        fd.append("photo", photoFile);
        const uploadRes = await fetch(`/api/assets/${nextAssetId}/photo`, {
          method: "POST",
          body: fd,
        });
        const uploadData = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok) {
          throw new Error(uploadData?.error ?? "照片上传失败");
        }
      }

      startCreate();
      const list = await loadAssets();
      setAssets(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  }

  async function onDelete(id: string) {
    if (!canEdit) {
      setError("无权限：仅管理员可删除物资");
      return;
    }

    const ok = window.confirm("确认删除该物资？（会连同流水记录一起删除）");
    if (!ok) return;

    setError(null);
    try {
      const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "删除失败");
      const list = await loadAssets();
      setAssets(list);

      if (editingId === id) startCreate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">物资管理</h2>
          <div className="text-sm text-zinc-500 mt-1">
            {canEdit ? "物资档案新增、编辑、删除；支持按名称与分类搜索" : "普通用户仅可查看；支持按名称与分类搜索"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 transition-colors"
        >
          ← 返回
        </button>
      </div>

      <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-200 space-y-3">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium">关键字</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="例如：电脑、打印机"
                className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
              />
            </div>
            <div className="w-full md:w-64">
              <label className="text-sm font-medium">分类</label>
              <select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
              >
                <option value="">全部</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onSearch}
                className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:bg-zinc-800 transition-colors"
              >
                搜索
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFilterCategoryId("");
                  setError(null);
                  setTimeout(() => onSearch(), 0);
                }}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 transition-colors"
              >
                重置
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-zinc-500">加载中…</div>
        ) : sorted.length === 0 ? (
          <div className="p-5 text-sm text-zinc-500">暂无匹配物资</div>
        ) : (
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-zinc-500">
                  <tr>
                    <th className="py-2 pr-3 font-medium">物资名称</th>
                    <th className="py-2 pr-3 font-medium">分类</th>
                    <th className="py-2 pr-3 font-medium">规格/型号</th>
                    <th className="py-2 pr-3 font-medium">单位</th>
                    <th className="py-2 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-900">
                  {sorted.map((a) => (
                    <tr key={a.id} className="border-t border-zinc-100">
                      <td className="py-3 pr-3">
                        <div className="font-medium">{a.name}</div>
                        <div className="text-xs text-zinc-500">建档：{new Date(a.createdAt).toLocaleDateString("zh-CN")}</div>
                      </td>
                      <td className="py-3 pr-3 text-zinc-600">{a.category?.name ?? "-"}</td>
                      <td className="py-3 pr-3">{a.modelOrSpec ?? "-"}</td>
                      <td className="py-3 pr-3">{a.unit ?? "-"}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/assets/${a.id}`}
                            className="text-xs px-2 py-1 rounded-md border border-zinc-200 hover:bg-zinc-50"
                          >
                            详情
                          </Link>
                          {canEdit ? (
                            <button
                              type="button"
                              className="text-xs px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                              onClick={() => onDelete(a.id)}
                            >
                              删除
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden lg:col-span-1">
          <div className="p-5 border-b border-zinc-200">
            <div className="text-sm font-semibold">
              {canEdit ? (editingId ? "编辑物资" : "新增物资") : "管理员权限"}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {canEdit ? "建档后可在详情页进行入库/领用/归还" : "当前身份无权限编辑物资"}
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
                <label className="text-sm font-medium">物资名称</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                  placeholder="例如：投影仪"
                />
              </div>
              <div>
                <label className="text-sm font-medium">规格/型号（可选）</label>
                <input
                  value={modelOrSpec}
                  onChange={(e) => setModelOrSpec(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                  placeholder="例如：EPSON-XYZ"
                />
              </div>
              <div>
                <label className="text-sm font-medium">单位（可选）</label>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                  placeholder="例如：台、件"
                />
              </div>
              <div>
                <label className="text-sm font-medium">分类</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                >
                  <option value="" disabled>
                    请选择分类
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">照片（可选）</label>
                <div className="mt-2">
                  <input
                    id={photoInputId}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setPhotoFile(f);
                      if (!f) {
                        setPhotoPreviewUrl(initialPhotoUrl);
                        return;
                      }
                      const nextPreview = URL.createObjectURL(f);
                      setPhotoPreviewUrl(nextPreview);
                    }}
                    className="sr-only"
                  />

                  <label
                    htmlFor={photoInputId}
                    className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm cursor-pointer border transition-colors ${
                      photoPreviewUrl
                        ? "border-zinc-200 bg-zinc-50 hover:bg-zinc-100"
                        : "border-zinc-200 bg-white hover:bg-zinc-50"
                    }`}
                  >
                    选择图片{photoPreviewUrl ? "（可更换）" : ""}
                  </label>
                </div>

                {photoPreviewUrl ? (
                  <div className="mt-3">
                    <div className="text-xs text-zinc-500 mb-2">预览：</div>
                    <img
                      src={photoPreviewUrl}
                      alt="物资照片预览"
                      className="w-full max-w-xs rounded-2xl border border-zinc-200"
                    />
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-zinc-500">未选择照片</div>
                )}
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
                    onClick={startCreate}
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 transition-colors"
                  >
                    取消
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setName("");
                      setModelOrSpec("");
                      setUnit("");
                      setCategoryId(categories[0]?.id ?? "");
                      setError(null);
                    }}
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 transition-colors"
                  >
                    清空
                  </button>
                )}
              </div>
            </form>
              </>
            ) : (
              <div className="text-sm text-zinc-600 space-y-2">
                <div className="text-zinc-800">仅管理员可新增/编辑/删除物资</div>
                <div className="text-xs text-zinc-500">普通用户只能查看物资列表与库存流水。</div>
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

        <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden lg:col-span-1">
          <div className="p-5 border-b border-zinc-200">
            <div className="text-sm font-semibold">快捷说明</div>
            <div className="text-xs text-zinc-500 mt-1">使用建议</div>
          </div>
          <div className="p-5 text-sm text-zinc-700 space-y-3">
            <div>
              1. 先在“分类管理”里建好分类，再回到这里建档物资。
            </div>
            <div>
              2. 物资建档后进入详情页，进行“入库 / 领用 / 归还”，系统会自动计算当前库存。
            </div>
            <div>
              3. 领用时若库存不足，会提示并阻止提交。
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

