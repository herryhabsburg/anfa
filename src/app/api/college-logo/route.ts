import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";

export const runtime = "nodejs";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const EXT_FILE = path.join(UPLOADS_DIR, "college-logo.ext");
const PLACEHOLDER_PATH = path.join(process.cwd(), "public", "college-logo-placeholder.svg");
const INITIAL_LOGO_PATH = path.join(
  process.cwd(),
  ".cursor",
  "projects",
  "C-Users-30390-AppData-Local-Temp-2473b844-71c5-4cd0-9841-9d2f680d860f",
  "assets",
  "c__Users_30390_AppData_Roaming_Cursor_User_workspaceStorage_1774266315769_images___1-284d15de-9a7e-470f-9c78-7f6d92e98daa.png",
);

function getExtFromMime(mime: string) {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/jpg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return null;
  }
}

function getMimeFromExt(ext: string) {
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

export async function GET() {
  try {
    const ext = (await fs.readFile(EXT_FILE, "utf8")).trim();
    const logoPath = path.join(UPLOADS_DIR, `college-logo.${ext}`);
    const bytes = await fs.readFile(logoPath);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": getMimeFromExt(ext),
        "Cache-Control": "no-store",
      },
    });
  } catch {
    // 如果还没有上传过，尝试使用 Cursor 附带的初始图片（你刚刚提供的院徽）。
    // 成功后会缓存到 `public/uploads`，后续走上传后的版本。
    try {
      const bytes = await fs.readFile(INITIAL_LOGO_PATH);
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      await fs.writeFile(path.join(UPLOADS_DIR, "college-logo.png"), bytes);
      await fs.writeFile(EXT_FILE, "png", "utf8");
      return new NextResponse(bytes, {
        headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
      });
    } catch {
      // 没拿到初始图，再返回占位图
      const bytes = await fs.readFile(PLACEHOLDER_PATH);
      return new NextResponse(bytes, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-store",
        },
      });
    }
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("logo");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "未上传院徽图片" }, { status: 400 });
  }

  const mime = file.type;
  const ext = getExtFromMime(mime);
  if (!ext) {
    return NextResponse.json(
      { error: "不支持的图片类型（仅支持 png/jpg/jpeg/webp/gif）" },
      { status: 400 },
    );
  }

  const maxBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "图片过大（最大 5MB）" }, { status: 400 });
  }

  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  const logoPath = path.join(UPLOADS_DIR, `college-logo.${ext}`);
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(logoPath, bytes);

  // 记录当前 ext，供 GET 使用
  await fs.writeFile(EXT_FILE, ext, "utf8");

  return NextResponse.json({ ok: true });
}

