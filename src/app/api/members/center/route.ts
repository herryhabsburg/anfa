import { NextResponse } from "next/server";
import { getMemberIdFromRequest } from "@/lib/member-auth";
import { ALL_DEPARTMENT_MEMBERS, DEPARTMENT_NAMES } from "@/lib/members-data";

interface MemberInfo {
  studentId: string;
  name: string;
  position: string;
  department: string;
  role: "admin" | "member";
}

function findMemberInfo(studentId: string): MemberInfo | null {
  for (const [deptSlug, dept] of Object.entries(ALL_DEPARTMENT_MEMBERS)) {
    const leader = dept.leaders.find(m => m.studentId === studentId);
    if (leader) {
      const departmentName = DEPARTMENT_NAMES[deptSlug];
      return {
        studentId: leader.studentId,
        name: leader.name,
        position: leader.title,
        department: departmentName !== undefined ? departmentName : deptSlug,
        role: "admin",
      };
    }

    const staff = dept.staffs.find(m => m.studentId === studentId);
    if (staff) {
      const departmentName = DEPARTMENT_NAMES[deptSlug];
      return {
        studentId: staff.studentId,
        name: staff.name,
        position: staff.title,
        department: departmentName !== undefined ? departmentName : deptSlug,
        role: "member",
      };
    }
  }

  return null;
}

export async function GET(request: Request) {
  const memberId = getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const memberInfo = findMemberInfo(memberId);
  if (!memberInfo) {
    return NextResponse.json({ error: "成员不存在" }, { status: 404 });
  }

  return NextResponse.json({ member: memberInfo });
}