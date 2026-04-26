import { NextRequest, NextResponse } from "next/server";
import { ALL_DEPARTMENT_MEMBERS } from "@/lib/members-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department");

  if (!department) {
    return NextResponse.json({ error: "缺少部门参数" }, { status: 400 });
  }

  const members = ALL_DEPARTMENT_MEMBERS[department];

  if (!members) {
    return NextResponse.json({ error: "部门不存在" }, { status: 404 });
  }

  return NextResponse.json(members);
}
