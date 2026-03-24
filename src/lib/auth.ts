import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type Role = "admin" | "user";

const ROLE_COOKIE_NAME = "inventory_role";

export async function getRoleFromCookies(): Promise<Role> {
  const store = await cookies();
  const v = store.get(ROLE_COOKIE_NAME)?.value;
  return v === "admin" ? "admin" : "user";
}

export async function requireAdmin() {
  const role = await getRoleFromCookies();
  if (role !== "admin") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
  return null;
}

export { ROLE_COOKIE_NAME };

