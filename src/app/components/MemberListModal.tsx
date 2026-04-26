"use client";

import { useEffect, useState } from "react";
import { DEPARTMENTS, type Department } from "@/lib/student-union";

type Member = {
  name: string;
  title: string;
  studentId?: string;
};

type AllMembers = {
  leaders: Member[];
  staffs: Member[];
};

export default function MemberListModal({
  isOpen,
  onClose,
  deptSlug,
}: {
  isOpen: boolean;
  onClose: () => void;
  deptSlug: string;
}) {
  const [allMembers, setAllMembers] = useState<AllMembers | null>(null);

  useEffect(() => {
    if (isOpen && deptSlug) {
      fetch(`/api/members?department=${deptSlug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.leaders && data.staffs) {
            setAllMembers(data);
          }
        })
        .catch(() => {
          const dept = DEPARTMENTS.find((d) => d.slug === deptSlug);
          if (dept) {
            setAllMembers({
              leaders: dept.members,
              staffs: [],
            });
          }
        });
    }
  }, [isOpen, deptSlug]);

  if (!isOpen) return null;

  const dept = DEPARTMENTS.find((d) => d.slug === deptSlug);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-500">{dept?.name}</div>
            <div className="text-base font-semibold mt-1">成员列表</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500"
          >
            ✕
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[calc(80vh-80px)]">
          {allMembers ? (
            <div className="space-y-6">
              {allMembers.leaders.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-blue-700 mb-3">负责人</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allMembers.leaders.map((m, idx) => (
                      <div
                        key={`leader-${idx}`}
                        className="rounded-xl border border-zinc-200 p-4 bg-gradient-to-b from-white to-zinc-50"
                      >
                        <div className="font-semibold text-zinc-950">{m.name}</div>
                        <div className="text-sm text-zinc-500 mt-1">{m.title}</div>
                        {m.studentId && (
                          <div className="text-xs text-zinc-400 mt-1">学号: {m.studentId}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {allMembers.staffs.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-green-700 mb-3">干事</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allMembers.staffs.map((m, idx) => (
                      <div
                        key={`staff-${idx}`}
                        className="rounded-xl border border-zinc-200 p-4 bg-gradient-to-b from-white to-zinc-50"
                      >
                        <div className="font-semibold text-zinc-950">{m.name}</div>
                        <div className="text-sm text-zinc-500 mt-1">{m.title}</div>
                        {m.studentId && (
                          <div className="text-xs text-zinc-400 mt-1">学号: {m.studentId}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {allMembers.leaders.length === 0 && allMembers.staffs.length === 0 && (
                <div className="text-center text-zinc-500 py-8">暂无成员信息</div>
              )}
            </div>
          ) : (
            <div className="text-center text-zinc-500 py-8">加载中...</div>
          )}
        </div>
      </div>
    </div>
  );
}
