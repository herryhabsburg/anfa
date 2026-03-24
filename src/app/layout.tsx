import type { Metadata } from "next";
import "./globals.css";
import TopNav from "./components/TopNav";

export const metadata: Metadata = {
  title: "重庆邮电大学安法学院办公室物资管理",
  description: "物资分类/入库/领用/归还与库存流水管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-zinc-200">
          <div className="mx-auto w-full max-w-5xl px-4 py-4 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-semibold leading-tight text-zinc-950">
                重庆邮电大学安法学院办公室物资管理
              </div>
              <div className="text-xs sm:text-sm text-zinc-500 leading-snug">
                物资分类/入库/领用/归还与库存流水管理
              </div>
            </div>

            <TopNav />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 py-6 flex-1">{children}</main>

        <footer className="py-6 text-center text-xs text-zinc-500">
          重庆邮电大学安法学院办公室物资管理系统
        </footer>
      </body>
    </html>
  );
}
