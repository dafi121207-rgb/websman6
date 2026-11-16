"use client";
import {useState} from "react";
import {feedbackLabels} from "@/lib/feedback";
export default function FeedbackForm({initial}:{initial:{ratings:number[];comment:string}}){
 const [ratings,setRatings]=useState(initial.ratings),[comment,setComment]=useState(initial.comment),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 return <form className="mt-6 space-y-6" onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage("");try{const res=await fetch("/api/evaluasi",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ratings,comment})});const data=await res.json();if(!res.ok)throw new Error(data.error);setMessage("Terima kasih. Evaluasimu sudah diterima tim pembuat.");}catch(e){setMessage(e instanceof Error?e.message:"Gagal mengirim. Coba lagi.");}finally{setBusy(false);}}}>
 <p className="text-sm text-slate-600">1 = sangat kurang · 5 = sangat baik. Nilai kecepatan sesuai pengalamanmu.</p>
 {feedbackLabels.map((label,i)=><fieldset key={label} className="border-b border-slate-200 pb-5"><legend className="mb-3 font-semibold">{label}</legend><div className="flex gap-2">{[1,2,3,4,5].map(n=><label key={n} className={`flex min-h-12 flex-1 max-w-16 cursor-pointer items-center justify-center rounded-lg border ${ratings[i]===n?"bg-blue-700 text-white":"bg-white"}`}><input className="sr-only peer" type="radio" required name={`rating-${i}`} value={n} checked={ratings[i]===n} onChange={()=>setRatings(ratings.map((v,j)=>i===j?n:v))}/><span className="peer-focus-visible:outline peer-focus-visible:outline-2">{n}</span></label>)}</div></fieldset>)}
 <label className="block font-semibold">Saran atau kendala (opsional)<textarea className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-3 font-normal" rows={4} maxLength={2000} value={comment} onChange={e=>setComment(e.target.value)} placeholder="Bagian mana yang perlu kami perbaiki?"/></label>
 <p className="text-sm text-slate-500">Tanggapan hanya dilihat admin/tim pembuat dan tidak memengaruhi nilai. Pengiriman ulang memperbarui tanggapan sebelumnya.</p>
 <button disabled={busy} className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy?"Mengirim…":"Kirim evaluasi"}</button><p role="status">{message}</p>
 </form>;
}
