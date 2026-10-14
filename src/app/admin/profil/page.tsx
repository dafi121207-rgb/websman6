import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui";
import ProfilEditor from "./ProfilEditor";

export const dynamic = "force-dynamic";

export default async function AdminProfil() {
  const profile = await prisma.schoolProfile.findUnique({ where: { id: "sman6garut" } });
  if (!profile) return <p className="text-sm text-rose-600">Profil sekolah belum di-seed. Jalankan: npm run seed</p>;

  return (
    <div className="space-y-4">
      <div>
        <Badge tone="slate">CMS Profil Resmi</Badge>
        <h1 className="text-2xl font-extrabold tracking-tight mt-2">Profil Sekolah</h1>
        <p className="text-slate-500 text-sm mt-1">
          Perubahan yang disimpan di sini langsung tampil pada landing page publik.
        </p>
      </div>
      <ProfilEditor
        initial={{
          title: profile.title,
          tagline: profile.tagline,
          email: profile.email,
          phone: profile.phone,
          welcomeText: profile.welcomeText,
          vision: profile.vision,
          mission: JSON.parse(profile.mission) as string[],
        }}
      />
    </div>
  );
}
