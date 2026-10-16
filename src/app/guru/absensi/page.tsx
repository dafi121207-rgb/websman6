import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui";
import AbsensiManager from "./AbsensiManager";
import { signMediaReferences } from "@/lib/supabase-storage";

export const dynamic = "force-dynamic";

export default async function GuruAbsensi() {
  const [sessions, students] = await Promise.all([
    prisma.attendanceSession.findMany({
      orderBy: { date: "desc" },
      take: 50,
      include: {
        attendances: {
          include: { user: { select: { id: true, name: true, kelas: true, identifier: true } } },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "SISWA" },
      orderBy: [{ kelas: "asc" }, { name: "asc" }],
      select: { id: true, name: true, identifier: true, kelas: true },
    }),
  ]);
  const photoUrls = await signMediaReferences(
    sessions.flatMap((session) =>
      session.attendances.map((attendance) => attendance.photoProof),
    ),
  );
  let photoIndex = 0;

  return (
    <div className="space-y-5">
      <div>
        <Badge tone="slate">Presensi Lapangan &amp; Kelas</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-slate-900">
          Monitor &amp; Kontrol Presensi Digital
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Buka sesi absensi, beri tanda centang kehadiran siswa secara langsung di tempat, atau pantau bukti foto GPS mandiri siswa.
        </p>
      </div>

      <AbsensiManager
        students={students}
        initialSessions={sessions.map((s) => ({
          id: s.id,
          title: s.title,
          kelas: s.kelas,
          isOpen: s.isOpen,
          date: s.date.toISOString(),
          targetLat: s.targetLat,
          targetLng: s.targetLng,
          maxRadiusMeters: s.maxRadiusMeters,
          attendances: s.attendances.map((a) => ({
            id: a.id,
            userId: a.user.id,
            status: a.status,
            userLat: a.userLat,
            userLng: a.userLng,
            photoProof: photoUrls[photoIndex++],
            createdAt: a.createdAt.toISOString(),
            userName: a.user.name,
            userKelas: a.user.kelas,
            userIdentifier: a.user.identifier,
          })),
        }))}
      />
    </div>
  );
}
