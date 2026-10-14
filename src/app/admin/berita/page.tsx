import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui";
import BeritaClient from "./BeritaClient";

export const dynamic = "force-dynamic";

export default async function AdminBerita() {
  const news = await prisma.news.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <div>
        <Badge tone="slate">Publication</Badge>
        <h1 className="text-2xl font-extrabold tracking-tight mt-2">Berita &amp; Pengumuman</h1>
        <p className="text-slate-500 text-sm mt-1">Tulisan yang dipublikasikan tampil pada landing page publik.</p>
      </div>
      <BeritaClient
        initial={news.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          published: n.published,
          createdAt: n.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
