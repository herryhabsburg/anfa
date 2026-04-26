"use client";

import { useState } from "react";
import { DEPARTMENTS, type DepartmentSlug, type Department } from "@/lib/student-union";
import OfficeInventoryPage from "../office/inventory/page";
import MemberListModal from "../../components/MemberListModal";
import Link from "next/link";

export default function DepartmentContent({
  dept,
}: {
  dept: Department;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{dept.name}</h1>
          <div className="text-sm text-zinc-500 mt-2">{dept.description}</div>
        </div>

        {dept.slug === "office" ? (
          <section className="rounded-2xl border border-blue-200 bg-blue-50/30 overflow-hidden">
            <div className="p-5 border-b border-blue-100">
              <div className="text-sm text-blue-700 font-medium">办公室专属功能模块</div>
            </div>
            <OfficeInventoryPage />
          </section>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden lg:col-span-2">
            <div className="p-5 border-b border-zinc-200">
              <div className="text-sm font-semibold">部门介绍</div>
            </div>
            <div className="p-5 text-sm text-zinc-700 space-y-3">
              {dept.intro.map((p, idx) => (
                <p key={idx} className="leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-200">
              <div className="text-sm font-semibold">职能概览</div>
            </div>
            <div className="p-5 text-sm text-zinc-700 space-y-2">
              {dept.functions.map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="leading-relaxed">{f}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">成员展示</div>
              <div className="text-xs text-zinc-500 mt-1">具体岗位信息可根据实际情况更新</div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-full bg-blue-700 text-white text-sm hover:bg-blue-800 transition-colors"
            >
              成员列表
            </button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dept.members.map((m) => (
                <div
                  key={m.name}
                  className="rounded-2xl border border-zinc-200 p-4 bg-gradient-to-b from-white to-zinc-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-zinc-950">{m.name}</div>
                      <div className="text-sm text-zinc-500 mt-1">{m.title}</div>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100" />
                  </div>
                  <div className="mt-3 text-xs text-zinc-500 leading-relaxed">
                    {m.studentId ? `学号: ${m.studentId}` : `${dept.shortName} 成员`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <MemberListModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        deptSlug={dept.slug}
      />
    </>
  );
}
