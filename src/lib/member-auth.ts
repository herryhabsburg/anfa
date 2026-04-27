import { cookies } from "next/headers";

export const MEMBER_ID_COOKIE_NAME = "inventory_member_id";

export async function getMemberIdFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get(MEMBER_ID_COOKIE_NAME)?.value ?? null;
}

export function getMemberIdFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const trimmed = pair.trim();
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;

    const name = trimmed.slice(0, idx);
    if (name !== MEMBER_ID_COOKIE_NAME) continue;

    const value = trimmed.slice(idx + 1);
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return null;
}