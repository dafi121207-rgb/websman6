import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AttendanceClient from "./AttendanceClient";

export const dynamic = "force-dynamic";

export default async function SiswaAbsensi() {
  const session = await getSession();
  if (!session) redirect("/login?next=/siswa/absensi");

  const sessions = await prisma.attendanceSession.findMany({
    where: { kelas: session.kelas ?? "___none___" },
    orderBy: { date: "desc" },
    take: 20,
    include: {
      attendances: { where: { userId: session.id }, select: { status: true, id: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <span className="px-2.5 py-1 rounded-md bg-slate-100 ring-1 ring-slate-200 text-[11px] font-semibold text-slate-600">
          Kelas {session.kelas ?? "-"}
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight mt-2 text-slate-900">Absensi Lapangan</h1>
        <p className="text-slate-500 text-sm mt-1">
          Presensi berbasis lokasi GPS + foto selfie. Pastikan izin kamera &amp; lokasi aktif.
        </p>
      </div>
      <AttendanceClient
        sessions={sessions.map((s) => ({
          id: s.id,
          title: s.title,
          kelas: s.kelas,
          isOpen: s.isOpen,
          date: s.date.toISOString(),
          already: s.attendances[0] ?? null,
        }))}
      />
    </div>
  );
}
