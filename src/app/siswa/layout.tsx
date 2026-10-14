import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getSession } from "@/lib/auth";

export default async function SiswaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/siswa");

  return <DashboardLayout user={session}>{children}</DashboardLayout>;
}
