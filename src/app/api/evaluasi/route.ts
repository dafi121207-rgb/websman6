import {NextRequest,NextResponse} from "next/server";
import {requireRole} from "@/lib/auth";
import prisma from "@/lib/prisma";
import {z} from "zod";
const schema=z.object({ratings:z.array(z.number().int().min(1).max(5)).length(6),comment:z.string().trim().max(2000)});
export async function POST(req:NextRequest){
 const user=await requireRole(["SISWA"]);
 if(!user)return NextResponse.json({error:"Masuk sebagai siswa terlebih dahulu."},{status:403});
 const parsed=schema.safeParse(await req.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:"Lengkapi keenam penilaian (1–5). Saran maksimal 2.000 karakter."},{status:400});
 const data={ratings:JSON.stringify(parsed.data.ratings),comment:parsed.data.comment};
 await prisma.websiteFeedback.upsert({where:{userId:user.id},create:{userId:user.id,...data},update:data});
 return NextResponse.json({ok:true});
}
