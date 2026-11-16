import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
export async function POST(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
 const user = await requireRole(["SISWA"]);
 if (!user) return NextResponse.json({error:"Silakan masuk sebagai siswa."},{status:403});
 const {id} = await params;
 const quiz = await prisma.quiz.findUnique({where:{id},include:{_count:{select:{questions:true}}}});
 if (!quiz || !quiz._count.questions) return NextResponse.json({error:"Kuis belum tersedia."},{status:404});
 const session = await prisma.quizSession.upsert({where:{quizId_userId:{quizId:id,userId:user.id}},update:{},create:{quizId:id,userId:user.id,expiresAt:new Date(Date.now()+quiz.durationMin*60000)}});
 return NextResponse.json({...session,serverNow:Date.now(),answers:JSON.parse(session.answers)});
}
export async function PUT(req: NextRequest, {params}: {params:Promise<{id:string}>}) {
 const user=await requireRole(["SISWA"]);
 if(!user) return NextResponse.json({error:"Tidak diizinkan"},{status:403});
 const {id}=await params;
 const body=await req.json().catch(()=>null);
 if(!body?.answers || typeof body.answers!=="object" || Array.isArray(body.answers) || JSON.stringify(body.answers).length>50000) return NextResponse.json({error:"Jawaban tidak valid"},{status:400});
 await prisma.quizSession.updateMany({where:{quizId:id,userId:user.id,expiresAt:{gt:new Date()}},data:{answers:JSON.stringify(body.answers)}});
 return NextResponse.json({ok:true});
}
