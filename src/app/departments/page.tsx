import Link from "next/link";
import { DEPARTMENTS } from "@/lib/student-union";

export default function DepartmentsIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">部门介绍</h1>
        <div className="text-sm text-zinc-500 mt-2">共 9 个部门，点击查看详情与成员展示</div>
      </div>

      <div className="mb-6 flex justify-center">
        <Link
          key="chairman"
          href="/departments/chairman"
          className="rounded-2xl bg-white border-2 border-blue-200 shadow-sm p-5 hover:border-blue-400 transition-colors min-w-[280px] text-center"
        >
          <div className="text-sm text-blue-700 font-medium">{DEPARTMENTS[0].shortName}</div>
          <div className="mt-2 font-semibold text-zinc-950">{DEPARTMENTS[0].name}</div>
          <div className="mt-2 text-sm text-zinc-500 leading-relaxed">{DEPARTMENTS[0].description}</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEPARTMENTS.slice(1).map((d) => (
          <Link
            key={d.slug}
            href={`/departments/${d.slug}`}
            className="rounded-2xl bg-white border border-zinc-200 shadow-sm p-5 hover:border-blue-200 transition-colors"
          >
            <div className="text-sm text-blue-700 font-medium">{d.shortName}</div>
            <div className="mt-2 font-semibold text-zinc-950">{d.name}</div>
            <div className="mt-2 text-sm text-zinc-500 leading-relaxed">{d.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

