"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DEPARTMENTS, type Department } from "@/lib/student-union";

type Notice = {
  id: string;
  title: string;
  publishedAt: string; // ISO
  content: string;
};

export default function Home() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const res = await fetch("/api/notices");
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) throw new Error(data?.error ?? "加载公告失败");
        setNotices((data.notices ?? []) as Notice[]);
      } catch {
        if (!cancelled) setNotices([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const latestNotices = useMemo(() => {
    return [...notices].slice(0, 3);
  }, [notices]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-sm">
        <div className="p-6 sm:p-10 bg-gradient-to-r from-blue-700 to-green-500 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <img
                  src="/图片1.png"
                  alt="网络空间安全与信息法学院院徽"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="max-w-2xl">
                <div className="text-xs opacity-90 tracking-wide">重庆邮电大学 · 网络空间安全与信息法学院</div>
                <h2 className="mt-3 text-2xl sm:text-3xl font-semibold leading-tight">学生会官方网站</h2>
                <p className="mt-2 text-sm sm:text-base opacity-95 leading-relaxed">以服务同学为宗旨，共建更美校园。</p>
                <div className="mt-3 text-sm sm:text-base opacity-90 leading-relaxed italic">法安天下，德润人心</div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href="/departments"
                    className="inline-flex items-center justify-center rounded-xl bg-white text-blue-700 px-5 py-2 text-sm font-medium hover:bg-zinc-100 transition-colors"
                  >
                    部门介绍
                  </Link>
                  <Link
                    href="/notices"
                    className="inline-flex items-center justify-center rounded-xl border border-white/70 text-white px-5 py-2 text-sm hover:bg-white/10 transition-colors"
                  >
                    通知公告
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-200">
          <div className="text-sm text-zinc-500">部门快捷入口</div>
          <div className="text-base font-semibold mt-1">9 个部门 · 点击进入独立页面</div>
        </div>
        <div className="p-5">
          <div className="mb-6 flex justify-center">
            <Link
              key="chairman"
              href="/departments/chairman"
              className="rounded-2xl border-2 border-blue-200 p-5 hover:border-blue-400 transition-colors bg-gradient-to-b from-blue-50 to-white min-w-[280px] text-center"
            >
              <div className="text-sm text-blue-700 font-semibold">{DEPARTMENTS[0].shortName}</div>
              <div className="mt-2 font-semibold text-zinc-950">{DEPARTMENTS[0].name}</div>
              <div className="mt-2 text-sm text-zinc-500 leading-relaxed">{DEPARTMENTS[0].description}</div>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEPARTMENTS.slice(1).map((d: Department) => (
              <Link
                key={d.slug}
                href={`/departments/${d.slug}`}
                className="rounded-2xl border border-zinc-200 p-5 hover:border-blue-200 transition-colors bg-gradient-to-b from-white to-zinc-50"
              >
                <div className="text-sm text-blue-700 font-semibold">{d.shortName}</div>
                <div className="mt-2 font-semibold text-zinc-950">{d.name}</div>
                <div className="mt-2 text-sm text-zinc-500 leading-relaxed">{d.description}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-zinc-200">
            <div className="text-sm font-semibold">最新通知</div>
            <div className="text-xs text-zinc-500 mt-1">及时掌握学生会动态</div>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {loading ? (
                <div className="text-sm text-zinc-500">加载中…</div>
              ) : latestNotices.length === 0 ? (
                <div className="text-sm text-zinc-500">暂无通知</div>
              ) : (
                latestNotices.map((n) => (
                  <Link
                    key={n.id}
                    href="/notices"
                    className="block rounded-xl border border-zinc-200 hover:border-blue-200 transition-colors p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-zinc-500">
                          {new Date(n.publishedAt).toLocaleDateString("zh-CN")}
                        </div>
                        <div className="mt-1 font-semibold text-zinc-950">{n.title}</div>
                        <div className="mt-1 text-sm text-zinc-500 leading-relaxed">
                          {(n.content ?? "").slice(0, 60)}
                          {(n.content ?? "").length > 60 ? "…" : ""}
                        </div>
                      </div>
                      <div className="text-xs text-blue-700 whitespace-nowrap">查看</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-200">
            <div className="text-sm font-semibold">学生会简介</div>
          </div>
          <div className="p-5 text-sm text-zinc-700 space-y-3 leading-relaxed">
            <p>我们以服务同学为宗旨，凝聚青年力量，围绕学习成长、文化活动与权益保障开展工作。</p>
            <p>通过部门协同与规范化运营，持续提升活动质量与服务效率，打造简洁高效的学生组织形象。</p>
            <div className="pt-2">
              <Link href="/intro" className="text-blue-700 hover:underline">
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
