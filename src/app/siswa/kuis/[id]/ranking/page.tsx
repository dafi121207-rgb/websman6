import Link from "next/link";
import prisma from "@/lib/prisma";
import {requireRole} from "@/lib/auth";
import {redirect,notFound} from "next/navigation";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{id:string}>}){
 const user=await requireRole(["SISWA"]);if(!user)redirect("/login");const {id}=await params;
 const quiz=await prisma.quiz.findUnique({where:{id}});if(!quiz)notFound();
 const rows=await prisma.quizAttempt.findMany({where:{quizId:id},orderBy:[{score:"desc"},{createdAt:"asc"}],include:{user:{select:{name:true}}}});
 let rank=0;
 return <section><Link href="/siswa/kuis" className="text-blue-700">← Daftar kuis</Link><h1 className="mt-5 text-3xl font-bold">Ranking kuis</h1><p className="mt-2">{quiz.title}</p><p className="mt-2 text-sm text-slate-500">Nilai sama mendapat peringkat yang sama. Waktu dicatat sebagai informasi, bukan penentu nilai.</p>{!rows.length?<p className="mt-6 rounded-lg border p-5">Belum ada hasil kuis.</p>:<ol className="mt-6 divide-y rounded-lg border bg-white">{rows.map((r,i)=>{if(i===0||rows[i-1].score!==r.score)rank=i+1;return <li key={r.id} className={`flex items-center gap-4 p-4 ${r.userId===user.id?"bg-blue-50":""}`}><span className="w-8 font-bold">{rank}</span><div className="min-w-0 flex-1"><p className="truncate font-semibold">{r.userId===user.id?`${r.user.name} (Kamu)`:r.user.name.split(" ").map((v,j)=>j===0?v:v[0]+".").join(" ")}</p><p className="text-xs text-slate-500">{r.durationSeconds==null?"Waktu belum tercatat":`${Math.floor(r.durationSeconds/60)} menit ${r.durationSeconds%60} detik`}</p></div><strong>{r.score}</strong></li>})}</ol>}</section>
}
