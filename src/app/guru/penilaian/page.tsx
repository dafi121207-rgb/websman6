import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui";
import PenilaianClient from "./PenilaianClient";
import { signMediaReferences } from "@/lib/supabase-storage";

export const dynamic = "force-dynamic";

export default async function GuruPenilaian() {
  const submissions = await prisma.submission.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { name: true, kelas: true } },
      assignment: { select: { title: true } },
    },
  });
  const mediaUrls = await signMediaReferences(
    submissions.map((submission) => submission.mediaUrl),
  );

  return (
    <div className="space-y-4">
      <div>
        <Badge tone="slate">Grading Console</Badge>
        <h1 className="text-2xl font-extrabold tracking-tight mt-2">Penilaian Tugas Praktik</h1>
        <p className="text-slate-500 text-sm mt-1">
          Tonton/periksa bukti video atau foto peragaan gerakan siswa, lalu beri nilai (0–100).
        </p>
      </div>
      <PenilaianClient
        initial={submissions.map((s, index) => ({
          id: s.id,
          status: s.status,
          score: s.score,
          notes: s.notes,
          mediaUrl: mediaUrls[index] ?? null,
          createdAt: s.createdAt.toISOString(),
          assignmentTitle: s.assignment.title,
          userName: s.user.name,
          userKelas: s.user.kelas,
        }))}
      />
    </div>
  );
}
