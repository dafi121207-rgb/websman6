import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function DashboardIndex() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "ADMIN") redirect("/admin");
  if (session.role === "GURU") redirect("/guru");
  redirect("/siswa");
}
