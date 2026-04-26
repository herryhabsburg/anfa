import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sha256Hex } from "@/lib/password";
import * as XLSX from "xlsx";

function normalizeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") {
    const s = value.toString();
    return s.endsWith(".0") ? s.slice(0, -2) : s;
  }
  return String(value).trim();
}

function pickFirst(row: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    const s = normalizeCell(v);
    if (s) return s;
  }
  return "";
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "请上传 Excel 文件（字段名：file）" }, { status: 400 });
  }

  const mime = file.type;
  if (!mime || !(mime.includes("excel") || mime.includes("spreadsheet") || mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
    // 允许 xls/xlsx 但不同环境 mime 可能不一致，这里不做过严限制
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(bytes, { type: "buffer" });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return NextResponse.json({ error: "Excel 无有效工作表" }, { status: 400 });
  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as Array<Record<string, unknown>>;

  if (!rows.length) return NextResponse.json({ error: "Excel 数据为空" }, { status: 400 });

  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const studentId = pickFirst(row, ["学号", "studentId", "student_id", "学号（必填）"]);
    const name = pickFirst(row, ["姓名", "name"]);
    const position = pickFirst(row, ["职位", "职务", "position"]);
    const department = pickFirst(row, ["部门", "department", "所属部门"]);

    if (!studentId && !name && !position && !department) {
      continue;
    }

    if (!studentId || !name || !position || !department) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.member.findUnique({ where: { studentId } });
    if (existing) {
      await prisma.member.update({
        where: { studentId },
        data: {
          name,
          position,
          department,
        },
      });
      updated += 1;
    } else {
      // 默认密码策略：导入时密码 = 学号
      const passwordHash = sha256Hex(studentId);
      await prisma.member.create({
        data: {
          studentId,
          name,
          position,
          department,
          passwordHash,
        },
      });
      imported += 1;
    }
  }

  return NextResponse.json({ ok: true, imported, updated, skipped });
}

