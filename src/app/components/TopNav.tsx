"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Role = "admin" | "member" | "user";

const items: Array<{ href: string; label: string }> = [
  { href: "/", label: "首页" },
  { href: "/intro", label: "学生会介绍" },
  { href: "/departments", label: "部门介绍" },
  { href: "/notices", label: "通知公告" },
];

export default function TopNav({ onOpenLogin }: { onOpenLogin: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<Role>("user");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && (data.role === "admin" || data.role === "member" || data.role === "user")) {
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

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setRole("user");
      router.refresh();
    }
  }

  function getRoleLabel() {
    if (role === "admin") return "负责人";
    if (role === "member") return "干事";
    return "未登录";
  }

  return (
    <div className="flex items-center gap-4">
      <nav className="flex items-center gap-2 text-sm">
        {items.map((it) => {
          const active = it.href === "/"
            ? pathname === "/"
            : it.href === "/departments"
              ? pathname.startsWith("/departments")
              : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`px-3 py-2 rounded-full transition-colors ${
                active
                  ? "bg-zinc-100 text-zinc-950 font-medium"
                  : "hover:bg-zinc-100 text-zinc-80"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>

      {authLoading ? null : role === "user" ? (
        <button
          type="button"
          onClick={onOpenLogin}
          className="px-3 py-2 rounded-full text-sm bg-blue-700 text-white hover:bg-blue-80 transition-colors"
        >
          登录
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="px-3 py-2 rounded-full text-sm bg-green-50 text-green-700 border border-green-200">
            {getRoleLabel()}
          </span>
          <button
            type="button"
            onClick={logout}
            className="px-3 py-2 rounded-full text-sm hover:bg-zinc-100 transition-colors text-zinc-800"
          >
            退出
          </button>
        </div>
      )}
    </div>
  );
}