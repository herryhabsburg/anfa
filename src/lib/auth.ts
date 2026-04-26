import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type Role = "admin" | "member" | "user";

const ROLE_COOKIE_NAME = "inventory_role";
const MEMBER_ID_COOKIE_NAME = "inventory_member_id";

export async function getRoleFromCookies(): Promise<Role> {
  const store = await cookies();
  const v = store.get(ROLE_COOKIE_NAME)?.value;
  if (v === "admin") return "admin";
  if (v === "member") return "member";
  return "user";
}

export async function getMemberIdFromCookies(): Promise<string | null> {
  const store = await cookies();
  const memberId = store.get(MEMBER_ID_COOKIE_NAME)?.value;
  if (memberId) return memberId;
  const role = await getRoleFromCookies();
  if (role === "member") {
    const roleCookie = store.get(ROLE_COOKIE_NAME);
    return roleCookie?.value ?? null;
  }
  return null;
}

export async function requireAdmin() {
  const role = await getRoleFromCookies();
  if (role !== "admin") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
  return null;
}

export async function requireMember() {
  const role = await getRoleFromCookies();
  if (role !== "admin" && role !== "member") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
  return null;
}

export { ROLE_COOKIE_NAME, MEMBER_ID_COOKIE_NAME };
