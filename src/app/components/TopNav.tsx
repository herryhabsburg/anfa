"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Role = "admin" | "user";

const items: Array<{ href: string; label: string }> = [
  { href: "/", label: "概览" },
  { href: "/categories", label: "分类管理" },
  { href: "/assets", label: "物资管理" },
  { href: "/stock-in", label: "入库记录" },
];

export default function TopNav() {
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

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setRole("user");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-4">
      <nav className="flex items-center gap-2 text-sm">
        {items.map((it) => {
          const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`px-3 py-2 rounded-full transition-colors ${
                active
                  ? "bg-zinc-100 text-zinc-950 font-medium"
                  : "hover:bg-zinc-100 text-zinc-800"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>

      {authLoading ? null : role === "admin" ? (
        <button
          type="button"
          onClick={logout}
          className="px-3 py-2 rounded-full text-sm hover:bg-zinc-100 transition-colors text-zinc-800"
        >
          退出管理员
        </button>
      ) : (
        <Link
          href="/login"
          className="px-3 py-2 rounded-full text-sm bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
        >
          管理员登录
        </Link>
      )}
    </div>
  );
}

