import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getSession } from "@/lib/auth";

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/guru");

  return <DashboardLayout user={session}>{children}</DashboardLayout>;
}
