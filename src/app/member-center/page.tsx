"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type MemberInfo = {
  studentId: string;
  name: string;
  position: string;
  department: string;
  role: "admin" | "member";
};

export default function MemberCenterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [member, setMember] = useState<MemberInfo | null>(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/members/center");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 401) {
            router.replace("/?login=true");
            return;
          }
          throw new Error(data?.error ?? "加载失败");
        }
        if (cancelled) return;
        setMember((data.member ?? null) as MemberInfo | null);
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

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!newPassword) return setPasswordError("请输入新密码");
    if (newPassword.length < 4) return setPasswordError("新密码长度至少为4位");
    if (newPassword !== confirmPassword) return setPasswordError("两次输入的新密码不一致");

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/members/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "密码修改失败");

      setPasswordSuccess("密码修改成功！");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess(null);
      }, 2000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "密码修改失败");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">成员中心</h1>
        <div className="text-sm text-zinc-500 mt-2">查看个人信息，修改登录密码</div>
      </div>

      {loading ? (
        <div className="p-5 text-sm text-zinc-500">加载中…</div>
      ) : error ? (
        <div className="p-5 text-sm text-red-700">{error}</div>
      ) : (
        <>
          <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-200">
              <div className="text-sm font-semibold">个人信息</div>
            </div>
            <div className="p-5 space-y-3 text-sm text-zinc-700">
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">姓名</span>
                <span className="font-medium text-zinc-950">{member?.name ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">学号</span>
                <span className="font-medium text-zinc-950">{member?.studentId ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">部门</span>
                <span className="font-medium text-zinc-950">{member?.department ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">职位</span>
                <span className="font-medium text-zinc-950">{member?.position ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">身份</span>
                <span className="font-medium text-zinc-950">
                  {member?.role === "admin" ? "负责人" : "干事"}
                </span>
              </div>
            </div>
          </section>

          {!showPasswordForm ? (
            <button
              type="button"
              onClick={() => setShowPasswordForm(true)}
              className="w-full rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:bg-zinc-800 transition-colors"
            >
              修改密码
            </button>
          ) : (
            <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-zinc-200">
                <div className="text-sm font-semibold">修改密码</div>
                <div className="text-xs text-zinc-500 mt-1">密码修改后将永久生效，请妥善保管您的新密码。</div>
              </div>
              <div className="p-5">
                {passwordError ? (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                    {passwordError}
                  </div>
                ) : null}

                {passwordSuccess ? (
                  <div className="mb-4 rounded-xl border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">
                    {passwordSuccess}
                  </div>
                ) : null}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">当前密码</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                      placeholder="请输入当前密码（默认密码：123456）"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">新密码</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                      placeholder="请输入新密码（至少4位）"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">确认新密码</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                      placeholder="请再次输入新密码"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="flex-1 rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:bg-zinc-800 transition-colors disabled:opacity-60"
                    >
                      {passwordLoading ? "保存中…" : "保存"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setOldPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setPasswordError(null);
                        setPasswordSuccess(null);
                      }}
                      className="rounded-xl border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}