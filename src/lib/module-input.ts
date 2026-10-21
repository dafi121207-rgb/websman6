import { z } from "zod";
import { safeWebUrl } from "@/lib/public-content";

export const ModuleInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(100000),
  videoUrl: z.string().trim().max(2048).nullish().transform((value) => value || null).refine((value) => !value || !!safeWebUrl(value), "Tautan video tidak valid."),
  pdfUrl: z.string().trim().max(2048).nullish().transform((value) => value || null),
});
