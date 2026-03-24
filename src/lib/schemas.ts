import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1).max(64),
});

export const assetSchema = z.object({
  name: z.string().min(1).max(120),
  modelOrSpec: z.string().max(120).optional().nullable(),
  unit: z.string().max(32).optional().nullable(),
  categoryId: z.string().min(1),
});

export const stockTransactionSchema = z.object({
  type: z.enum(["IN", "OUT", "RETURN"]),
  quantity: z.number().finite().positive(),
  operator: z.string().max(64).optional().nullable(),
  note: z.string().max(200).optional().nullable(),
});

export const stockTransactionEditSchema = z.object({
  // 仅允许管理员对历史流水的数量进行修正（类型不可变）
  quantity: z.number().finite().positive(),
  operator: z.string().max(64).optional().nullable(),
  note: z.string().max(200).optional().nullable(),
});

