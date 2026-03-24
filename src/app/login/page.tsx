"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Role = "admin" | "user";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>("user");

  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (role === "admin") router.replace("/assets");
  }, [loading, role, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "登录失败");

      router.replace("/assets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-zinc-500">加载中…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">管理员登录</h2>
        <div className="text-sm text-zinc-500 mt-1">输入管理员口令后，才可新增/编辑/删除物资。</div>
      </div>

      <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-200">
          <div className="text-sm font-semibold">身份校验</div>
        </div>

        <div className="p-5">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">管理员口令</label>
              <input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                type="password"
                className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                placeholder="请输入管理员口令"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:bg-zinc-800 transition-colors disabled:opacity-60"
            >
              {submitting ? "校验中…" : "登录为管理员"}
            </button>

            <div className="text-xs text-zinc-500 leading-relaxed">
              普通用户无需登录，可正常查看物资与库存流水；但默认不显示新增/编辑/删除按钮。
            </div>

            <div className="text-sm">
              <Link href="/assets" className="text-zinc-700 hover:underline">
                返回物资管理
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

