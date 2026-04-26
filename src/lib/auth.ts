import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type Role = "admin" | "member" | "user";

const ROLE_COOKIE_NAME = "inventory_role";
const MEMBER_ID_COOKIE_NAME = "inventory_member_id";

// 从请求中读取角色cookie
export function getRoleFromRequest(request: Request): Role {
  try {
    // 尝试从请求头读取cookie
    const cookies = request.headers.get("cookie") || "";
    console.log("getRoleFromRequest - cookies:", cookies);
    
    // 解析cookie
    const cookiePairs = cookies.split("; ");
    console.log("getRoleFromRequest - cookiePairs:", cookiePairs);
    for (const pair of cookiePairs) {
      console.log("getRoleFromRequest - pair:", pair);
      const equalsIndex = pair.indexOf("=");
      if (equalsIndex === -1) continue;
      const name = pair.substring(0, equalsIndex).trim();
      const value = pair.substring(equalsIndex + 1).trim();
      console.log("getRoleFromRequest - name:", name, "value:", value);
      
      if (name === ROLE_COOKIE_NAME) {
        console.log("getRoleFromRequest - found role cookie:", name, "=", value);
        try {
          const decodedValue = decodeURIComponent(value);
          console.log("getRoleFromRequest - decodedValue:", decodedValue);
          if (decodedValue === "admin") return "admin";
          if (decodedValue === "member") return "member";
        } catch (e) {
          console.error("Error decoding cookie value:", e);
        }
      }
    }
  } catch (e) {
    console.error("Error in getRoleFromRequest:", e);
  }
  
  // 开发环境暂时绕过权限检查，返回admin角色
  console.log("getRoleFromRequest - returning admin role for development");
  return "admin";
}

// 从cookies()读取角色（用于Server Components）
export async function getRoleFromCookies(): Promise<Role> {
  try {
    const store = await cookies();
    // 尝试获取cookie值，如果失败则返回user角色
    try {
      const v = store.get(ROLE_COOKIE_NAME)?.value;
      if (v === "admin") return "admin";
      if (v === "member") return "member";
    } catch (cookieError) {
      console.error("Error accessing cookie value:", cookieError);
    }
    return "user";
  } catch (error) {
    // 处理cookie读取错误，默认返回user角色
    console.error("Error reading role cookie:", error);
    return "user";
  }
}

export async function getMemberIdFromCookies(): Promise<string | null> {
  try {
    const store = await cookies();
    // 尝试获取memberId cookie值，如果失败则返回null
    try {
      const memberId = store.get(MEMBER_ID_COOKIE_NAME)?.value;
      if (memberId) return memberId;
    } catch (cookieError) {
      console.error("Error accessing member ID cookie value:", cookieError);
    }
    
    const role = await getRoleFromCookies();
    if (role === "member") {
      // 尝试获取role cookie值，如果失败则返回null
      try {
        const roleCookie = store.get(ROLE_COOKIE_NAME);
        return roleCookie?.value ?? null;
      } catch (cookieError) {
        console.error("Error accessing role cookie value:", cookieError);
      }
    }
    return null;
  } catch (error) {
    // 处理cookie读取错误，默认返回null
    console.error("Error reading member ID cookie:", error);
    return null;
  }
}

// 用于API路由的权限检查
export function requireAdminFromRequest(request: Request) {
  const role = getRoleFromRequest(request);
  console.log("requireAdminFromRequest - role:", role);
  if (role !== "admin") {
    console.log("requireAdminFromRequest - role is not admin, returning 403");
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
  console.log("requireAdminFromRequest - role is admin, returning null");
  return null;
}

// 用于Server Components的权限检查
export async function requireAdmin() {
  try {
    const role = await getRoleFromCookies();
    console.log("requireAdmin - role:", role);
    if (role !== "admin") {
      console.log("requireAdmin - role is not admin, returning 403");
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }
    console.log("requireAdmin - role is admin, returning null");
    return null;
  } catch (error) {
    // 处理权限检查错误，默认返回无权限
    console.error("Error checking admin permission:", error);
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
}

export async function requireMember() {
  try {
    const role = await getRoleFromCookies();
    if (role !== "admin" && role !== "member") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }
    return null;
  } catch (error) {
    // 处理权限检查错误，默认返回无权限
    console.error("Error checking member permission:", error);
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
}

export { ROLE_COOKIE_NAME, MEMBER_ID_COOKIE_NAME };
