import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// 使用默认的SQLite数据库路径，避免环境变量依赖
const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

export const prisma = global.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

