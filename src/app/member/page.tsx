"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  studentId: string;
  name: string;
  position: string;
  department: string;
};

export default function MemberCenterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/members/me");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "加载失败");
        if (cancelled) return;
        setMember((data.member ?? null) as Member | null);
      } catch {
        if (cancelled) return;
        // 未登录则跳转登录页
        router.replace("/member-login");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">个人信息</h1>
        <div className="text-sm text-zinc-500 mt-2">仅管理员可通过 Excel 导入成员信息；成员端不允许修改。</div>
      </div>

      {loading ? (
        <div className="p-5 text-sm text-zinc-500">加载中…</div>
      ) : error ? (
        <div className="p-5 text-sm text-red-700">{error}</div>
      ) : (
        <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-200">
            <div className="text-sm font-semibold">你的信息</div>
          </div>
          <div className="p-5 space-y-3 text-sm text-zinc-700">
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-500">学号</span>
              <span className="font-medium text-zinc-950">{member?.studentId ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-500">姓名</span>
              <span className="font-medium text-zinc-950">{member?.name ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-500">职位</span>
              <span className="font-medium text-zinc-950">{member?.position ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-500">部门</span>
              <span className="font-medium text-zinc-950">{member?.department ?? "-"}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

