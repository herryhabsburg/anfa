import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是有效 JSON" }, { status: 400 });
  }

  const key = (data as { key?: unknown } | null)?.key;
  if (typeof key !== "string" || !key.trim()) {
    return NextResponse.json({ error: "缺少管理员口令" }, { status: 400 });
  }

  const adminKey = process.env.ADMIN_ACCESS_KEY;
  if (!adminKey) {
    return NextResponse.json({ error: "服务端未配置 ADMIN_ACCESS_KEY" }, { status: 500 });
  }

  if (key !== adminKey) {
    return NextResponse.json({ error: "管理员口令错误" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, role: "admin" });
  res.cookies.set("inventory_role", "admin", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}

