import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui";
import ModulManager from "./ModulManager";

export const dynamic = "force-dynamic";

export default async function GuruMateri() {
  const modules = await prisma.module.findMany({
    orderBy: { order: "asc" },
    include: { quizzes: { select: { id: true } } },
  });

  return (
    <div className="space-y-4">
      <div>
        <Badge tone="slate">Content Management</Badge>
        <h1 className="text-2xl font-extrabold tracking-tight mt-2">Kelola Modul Bab PJOK</h1>
        <p className="text-slate-500 text-sm mt-1">Buat, ubah, atau hapus bab materi — termasuk tautan video tutorial YouTube (format embed).</p>
      </div>
      <ModulManager
        initial={modules.map((m) => ({
          id: m.id,
          title: m.title,
          category: m.category,
          description: m.description,
          videoUrl: m.videoUrl ?? "",
          order: m.order,
          quizCount: m.quizzes.length,
        }))}
      />
    </div>
  );
}
