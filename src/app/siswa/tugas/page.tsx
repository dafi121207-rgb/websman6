import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui";
import TugasClient from "./TugasClient";

export const dynamic = "force-dynamic";

export default async function SiswaTugas() {
  const session = await getSession();
  if (!session) redirect("/login?next=/siswa/tugas");

  const assignments = await prisma.assignment.findMany({
    orderBy: { dueDate: "desc" },
    include: {
      module: { select: { title: true, category: true } },
      submissions: { where: { userId: session.id } },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <Badge tone="slate">Bukti Praktik</Badge>
        <h1 className="text-2xl font-extrabold tracking-tight mt-2">Tugas Praktik Video/Foto 🎥</h1>
        <p className="text-slate-500 text-sm mt-1">
          Rekam peragaan gerakanmu lalu unggah. Media dikompresi otomatis sebelum dikirim.
        </p>
      </div>

      <TugasClient
        assignments={assignments.map((a) => ({
          id: a.id,
          title: a.title,
          instruction: a.instruction,
          dueDate: a.dueDate.toISOString(),
          moduleTitle: a.module?.title ?? "",
          category: a.module?.category ?? "",
          submission: a.submissions[0]
            ? {
                status: a.submissions[0].status,
                score: a.submissions[0].score,
                notes: a.submissions[0].notes,
                submittedAt: a.submissions[0].createdAt.toISOString(),
              }
            : null,
        }))}
      />
    </div>
  );
}
