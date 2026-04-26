"use client";

import { useEffect, useState, type FormEvent } from "react";

type Role = "admin" | "user";

export default function AdminMembersPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [role, setRole] = useState<Role>("user");
  const canManage = role === "admin";

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported: number; updated: number; skipped: number } | null>(null);

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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!file) {
      setError("请先选择 Excel 文件");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/members/import", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "导入失败");
      setResult({
        imported: Number(data?.imported ?? 0),
        updated: Number(data?.updated ?? 0),
        skipped: Number(data?.skipped ?? 0),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">成员管理</h1>
        <div className="text-sm text-zinc-500 mt-2">管理员可通过 Excel 批量导入成员：学号、姓名、职位、部门。</div>
      </div>

      {authLoading ? null : !canManage ? (
        <div className="p-5 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm">
          无权限：仅管理员可管理成员信息。
        </div>
      ) : (
        <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-200">
            <div className="text-sm font-semibold">Excel 批量导入</div>
            <div className="text-xs text-zinc-500 mt-1">默认密码策略：导入时密码 = 学号（SHA256 校验）。</div>
          </div>

          <div className="p-5">
            {error ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                {error}
              </div>
            ) : null}

            {result ? (
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 px-3 py-2 text-sm space-y-1">
                <div>导入成功：{result.imported} 人</div>
                <div>更新成员：{result.updated} 人</div>
                <div>跳过行：{result.skipped} 行</div>
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">上传 Excel</label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:bg-zinc-800 transition-colors disabled:opacity-60"
              >
                {loading ? "导入中…" : "开始导入"}
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}

