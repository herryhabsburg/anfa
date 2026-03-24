import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

function isAllowedMime(mime: string) {
  return ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(mime);
}

export async function POST(request: Request, { params }: Context) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const assetId = (await params).id;

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return NextResponse.json({ error: "物资不存在" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("photo");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "未上传照片" }, { status: 400 });
  }

  const mime = file.type;
  if (!isAllowedMime(mime)) {
    return NextResponse.json(
      { error: "不支持的图片类型（仅支持 png/jpg/jpeg/webp/gif）" },
      { status: 400 },
    );
  }

  const maxBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "图片过大（最大 5MB）" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "assets");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : mime === "image/gif" ? ".gif" : ".jpg";
  const fileName = `${assetId}-${Date.now()}${ext}`;
  const absPath = path.join(uploadsDir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(absPath, bytes);

  const photoUrl = `/uploads/assets/${fileName}`;

  // 更新前清理旧文件（尽量避免残留）
  if (asset.photoUrl) {
    try {
      const oldAbs = path.join(process.cwd(), "public", asset.photoUrl.replace("/public", ""));
      await fs.unlink(oldAbs);
    } catch {
      // 忽略清理失败
    }
  }

  const updated = await prisma.asset.update({
    where: { id: assetId },
    data: { photoUrl },
    select: { id: true, photoUrl: true },
  });

  return NextResponse.json(updated, { status: 200 });
}

