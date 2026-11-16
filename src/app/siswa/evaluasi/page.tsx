import {requireRole} from "@/lib/auth";
import {redirect} from "next/navigation";
import prisma from "@/lib/prisma";
import FeedbackForm from "./FeedbackForm";
export const dynamic="force-dynamic";
export default async function Page(){const user=await requireRole(["SISWA"]);if(!user)redirect("/login");const row=await prisma.websiteFeedback.findUnique({where:{userId:user.id}});return <section className="mx-auto w-full max-w-3xl min-w-0"><h1 className="text-3xl font-bold tracking-tight text-[#17324d]">Evaluasi website</h1><p className="mt-3 max-w-prose text-sm leading-relaxed text-slate-600 sm:text-base">Bantu kami memperbaiki pengalaman belajar di SMAN 6 Garut.</p><FeedbackForm initial={{ratings:row?JSON.parse(row.ratings):[0,0,0,0,0,0],comment:row?.comment??""}}/></section>}
