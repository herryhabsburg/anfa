"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

const DEPARTMENTS = [
  "主席团",
  "青年志愿者协会",
  "文体部",
  "办公室",
  "科技社团",
  "生活权益部",
  "宣传部",
  "学习部",
  "组织部"
];

const EXPIRE_OPTIONS = [
  { value: 1, label: "1天" },
  { value: 3, label: "3天" },
  { value: 7, label: "7天" },
  { value: 14, label: "14天" },
  { value: 30, label: "30天" },
  { value: 0, label: "永久" }
];

type Notice = {
  id: string;
  title: string;
  publishedAt: string; // ISO
  content: string;
  department: string;
  authorName: string;
  authorStudentId: string;
};

type Role = "admin" | "member" | "user";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("zh-CN");
}

function toDateTimeLocal(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16);
}

export default function NoticesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);

  const [role, setRole] = useState<Role>("user");
  const [authLoading, setAuthLoading] = useState(true);
  const canManage = !authLoading && role === "admin";

  const [formTitle, setFormTitle] = useState("");
  const [formPublishedAt, setFormPublishedAt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formDepartment, setFormDepartment] = useState("");
  const [formAuthorName, setFormAuthorName] = useState("");
  const [formAuthorStudentId, setFormAuthorStudentId] = useState("");
  const [formExpireDays, setFormExpireDays] = useState<number>(7);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  async function loadNotices() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/notices");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "加载公告失败");
      setNotices((data.notices ?? []) as Notice[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotices();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && (data.role === "admin" || data.role === "member" || data.role === "user")) {
          setRole(data.role as Role);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const orderedNotices = useMemo(() => {
    return [...notices].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [notices]);

  function resetForm() {
    setEditingId(null);
    setFormTitle("");
    setFormPublishedAt("");
    setFormContent("");
    setFormDepartment("");
    setFormAuthorName("");
    setFormAuthorStudentId("");
    setFormExpireDays(7);
    setSubmitError(null);
    setSubmitSuccess(null);
  }

  function startEdit(n: Notice) {
    setEditingId(n.id);
    setFormTitle(n.title);
    setFormPublishedAt(toDateTimeLocal(n.publishedAt));
    setFormContent(n.content);
    setFormDepartment(n.department);
    setFormAuthorName(n.authorName);
    setFormAuthorStudentId(n.authorStudentId);
    setFormExpireDays(7);
    setSubmitError(null);
    setSubmitSuccess(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitLoading(true);

    try {
      const publishedAtIso = formPublishedAt ? new Date(formPublishedAt).toISOString() : null;

      if (!formTitle.trim()) throw new Error("标题不能为空");
      if (!publishedAtIso || Number.isNaN(new Date(publishedAtIso).getTime())) throw new Error("发布时间不正确");
      if (!formContent.trim()) throw new Error("正文内容不能为空");
      if (!formDepartment) throw new Error("部门不能为空");
      if (!formAuthorName.trim()) throw new Error("姓名不能为空");
      if (!formAuthorStudentId.trim()) throw new Error("学号不能为空");

      const body = {
        title: formTitle.trim(),
        publishedAt: publishedAtIso,
        content: formContent,
        department: formDepartment,
        authorName: formAuthorName.trim(),
        authorStudentId: formAuthorStudentId.trim(),
        expireDays: formExpireDays > 0 ? formExpireDays : null,
      };

      const res = editingId
        ? await fetch(`/api/notices/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/notices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "操作失败");

      setSubmitSuccess(editingId ? "修改公告成功" : "发布公告成功");
      resetForm();
      await loadNotices();
      
      // 3秒后自动清除成功提示
      setTimeout(() => setSubmitSuccess(null), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setSubmitLoading(false);
    }
  }

  async function onDelete(id: string) {
    const ok = window.confirm("确认删除该公告？");
    if (!ok) return;

    setSubmitLoading(true);
    try {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "删除失败");

      if (editingId === id) resetForm();
      await loadNotices();
      setSubmitSuccess("删除公告成功");
      
      // 3秒后自动清除成功提示
      setTimeout(() => setSubmitSuccess(null), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">通知公告</h1>
        <div className="text-sm text-zinc-500 mt-2">按发布时间倒序展示学生会公告，负责人可进行发布管理</div>
      </div>

      {canManage ? (
        <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-200">
            <div className="text-sm font-semibold">公告管理（负责人）</div>
            <div className="text-xs text-zinc-500 mt-1">新增、编辑与删除公告</div>
          </div>

          <div className="p-5">
            {submitError ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                {submitError}
              </div>
            ) : null}
            
            {submitSuccess ? (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">
                {submitSuccess}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">标题</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                  placeholder="例如：关于学生会招新的通知"
                />
              </div>

              <div>
                <label className="text-sm font-medium">部门</label>
                <select
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                >
                  <option value="">请选择部门</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">姓名</label>
                  <input
                    value={formAuthorName}
                    onChange={(e) => setFormAuthorName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                    placeholder="请输入发布人姓名"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">学号</label>
                  <input
                    value={formAuthorStudentId}
                    onChange={(e) => setFormAuthorStudentId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                    placeholder="请输入发布人学号"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">发布时间</label>
                <input
                  value={formPublishedAt}
                  onChange={(e) => setFormPublishedAt(e.target.value)}
                  type="datetime-local"
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                />
              </div>

              <div>
                <label className="text-sm font-medium">保存时间</label>
                <select
                  value={formExpireDays}
                  onChange={(e) => setFormExpireDays(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                >
                  {EXPIRE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">正文内容</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={6}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
                  placeholder="请输入公告正文（可包含换行）"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:bg-zinc-800 transition-colors disabled:opacity-60"
                >
                  {submitLoading ? "处理中…" : editingId ? "保存修改" : "发布公告"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    disabled={submitLoading}
                    onClick={resetForm}
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 transition-colors disabled:opacity-60"
                  >
                    取消
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-200">
          <div className="text-sm font-semibold">公告列表</div>
          <div className="text-xs text-zinc-500 mt-1">共 {orderedNotices.length} 条</div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="text-sm text-zinc-500">加载中…</div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
          ) : orderedNotices.length === 0 ? (
            <div className="text-sm text-zinc-500">暂无公告</div>
          ) : (
            <div className="space-y-4">
              {orderedNotices.map((n) => (
                <div key={n.id} className="rounded-2xl border border-zinc-200 p-4 bg-zinc-50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-zinc-500">
                        {formatDate(n.publishedAt)} · {n.department} · {n.authorName} ({n.authorStudentId})
                      </div>
                      <div className="mt-1 font-semibold text-zinc-950">{n.title}</div>
                    </div>

                    {canManage ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={submitLoading}
                          onClick={() => startEdit(n)}
                          className="text-xs px-2 py-1 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          disabled={submitLoading}
                          onClick={() => onDelete(n.id)}
                          className="text-xs px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-3 whitespace-pre-wrap text-sm text-zinc-700 leading-relaxed">{n.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
