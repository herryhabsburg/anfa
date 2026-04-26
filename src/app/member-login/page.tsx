"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MemberLoginPage() {
  const router = useRouter();

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/members/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentId.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "登录失败");

      router.replace("/member");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">学生会成员登录</h1>
        <div className="text-sm text-zinc-500 mt-2">登录后仅可查看个人信息（不允许修改）。</div>
      </div>

      <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-200">
          <div className="text-sm font-semibold">账号信息</div>
        </div>

        <div className="p-5">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">学号</label>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                placeholder="请输入学号"
              />
            </div>
            <div>
              <label className="text-sm font-medium">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                placeholder="默认密码：学号"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:bg-zinc-800 transition-colors disabled:opacity-60"
            >
              {loading ? "登录中…" : "登录"}
            </button>

            <div className="text-xs text-zinc-500 leading-relaxed">
              如果你是管理员，请使用{" "}
              <Link href="/login" className="text-blue-700 hover:underline">
                管理员口令登录
              </Link>
              。
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

