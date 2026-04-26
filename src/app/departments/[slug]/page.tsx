import Link from "next/link";
import { DEPARTMENTS, type DepartmentSlug } from "@/lib/student-union";
import DepartmentContent from "./DepartmentContent";

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ slug: DepartmentSlug | string }>;
}) {
  const { slug } = await params;
  const normalized = String(slug).toLowerCase();
  const dept =
    DEPARTMENTS.find((d) => d.slug === normalized) ??
    (normalized.startsWith("of") ? DEPARTMENTS.find((d) => d.slug === "office") : undefined);

  if (!dept) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">部门不存在</h1>
          <div className="text-sm text-zinc-500 mt-2">请返回部门介绍页面</div>
        </div>
        <Link href="/departments" className="text-blue-700 hover:underline">
          返回部门介绍
        </Link>
      </div>
    );
  }

  return <DepartmentContent dept={dept} />;
}
