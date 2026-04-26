import { cookies } from "next/headers";

export const MEMBER_ID_COOKIE_NAME = "inventory_member_id";

export async function getMemberIdFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get(MEMBER_ID_COOKIE_NAME)?.value ?? null;
}

