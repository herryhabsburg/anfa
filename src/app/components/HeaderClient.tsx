"use client";

import { useState } from "react";
import TopNav from "./TopNav";
import UnifiedLoginModal from "./UnifiedLoginModal";

export default function HeaderClient() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-zinc-200">
        <div className="mx-auto w-full max-w-5xl px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              <img
                src="/图片1.png"
                alt="网络空间安全与信息法学院院徽"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-semibold leading-tight text-zinc-950">
                重庆邮电大学网络空间安全与信息法学院 学生会官网
              </div>
              <div className="text-xs sm:text-sm text-zinc-500 leading-snug">
                简洁高效 · 部门职能 · 通知公告
              </div>
            </div>
          </div>

          <TopNav onOpenLogin={() => setShowLogin(true)} />
        </div>
      </header>

      <UnifiedLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}