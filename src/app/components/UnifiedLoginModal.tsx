"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type LoginRole = "admin" | "member";

export default function UnifiedLoginModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [loginRole, setLoginRole] = useState<LoginRole>("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/unified-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentId.trim(), password, role: loginRole }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "登录失败");

      onClose();
      setStudentId("");
      setPassword("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-500">登录</div>
            <div className="text-base font-semibold mt-1">学生会干事/负责人登录</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">身份选择</label>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setLoginRole("member")}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm border transition-colors ${
                    loginRole === "member"
                      ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                      : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  干事
                </button>
                <button
                  type="button"
                  onClick={() => setLoginRole("admin")}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm border transition-colors ${
                    loginRole === "admin"
                      ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                      : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  负责人
                </button>
              </div>
            </div>

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
                placeholder="请输入密码"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:bg-zinc-800 transition-colors disabled:opacity-60"
            >
              {loading ? "登录中…" : "登录"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
