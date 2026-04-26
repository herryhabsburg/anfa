import type { Metadata } from "next";
import "./globals.css";
import HeaderClient from "./components/HeaderClient";

export const metadata: Metadata = {
  title: "重庆邮电大学 网络空间安全与信息法学院 学生会官网",
  description: "学生会介绍、部门职能、通知公告",
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
        <HeaderClient />

        <main className="mx-auto w-full max-w-5xl px-4 py-6 flex-1">{children}</main>

        <footer className="py-6 text-center text-xs text-zinc-500">
          重庆邮电大学网络空间安全与信息法学院学生会官网
        </footer>
      </body>
    </html>
  );
}