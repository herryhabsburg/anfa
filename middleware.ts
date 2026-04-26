import { NextResponse, type NextRequest } from "next/server";

function isStaticAssetPath(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/uploads/") ||
    pathname === "/favicon.ico"
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isStaticAssetPath(pathname) || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const role = req.cookies.get("inventory_role")?.value;
  const memberId = req.cookies.get("inventory_member_id")?.value;

  // 管理员：放行所有页面
  if (role === "admin") {
    return NextResponse.next();
  }

  // 访问后台管理页面：非管理员一律跳首页
  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 已登录“学生会成员”：只允许访问首页与个人中心
  if (memberId) {
    const allowed = new Set(["/", "/member", "/member-login"]);
    if (allowed.has(pathname)) return NextResponse.next();
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

