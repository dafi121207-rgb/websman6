"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Camera, CheckCircle2, Crosshair, Send } from "lucide-react";
import { Badge, DoubleBezel, PrimaryButton, statusBadgeTone } from "@/components/ui";
import { uploadPrivateMedia } from "@/lib/upload-media";

type SessionDTO = {
  id: string;
  title: string;
  kelas: string;
  isOpen: boolean;
  date: string;
  already: { status: string; id: string } | null;
};

const FIELD_LAT = Number(process.env.NEXT_PUBLIC_FIELD_LAT ?? -7.2278);
const FIELD_LNG = Number(process.env.NEXT_PUBLIC_FIELD_LNG ?? 107.9087);
const FIELD_RADIUS = Number(process.env.NEXT_PUBLIC_FIELD_RADIUS ?? 100);

export default function AttendanceClient({ sessions }: { sessions: SessionDTO[] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? "");
  const [coords, setCoords] = useState<{ lat: number; lng: number; dist: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "locating" | "ready" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const active = sessions.find((s) => s.id === sessionId);

  async function locate() {
    setError(null);
    setOkMsg(null);
    if (!navigator.geolocation) {
      setError("Perangkalmu tidak mendukung Geolocation.");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = Math.round(
          haversine(pos.coords.latitude, pos.coords.longitude, FIELD_LAT, FIELD_LNG)
        );
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, dist });
        setStatus("ready");
      },
      (err) => {
        setError("Gagal mengambil lokasi: " + err.message);
        setStatus("idle");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError("Kamera tidak dapat diakses. Berikan izin kamera pada browser.");
    }
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = 720;
    const h = Math.round((video.videoHeight / video.videoWidth) * w) || 540;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // mirror agar seperti selfie
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    const data = canvas.toDataURL("image/jpeg", 0.7); // kompresi client-side
    setPhoto(data);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function submit() {
    if (!coords || !photo || !sessionId) {
      setError("Lengkapi lokasi dan foto selfie terlebih dulu.");
      return;
    }
    setError(null);
    setOkMsg(null);
    setStatus("submitting");
    try {
      const photoBlob = await fetch(photo).then((response) => response.blob());
      const photoFile = new File([photoBlob], "attendance-selfie.jpg", {
        type: "image/jpeg",
      });
      const storagePath = await uploadPrivateMedia(photoFile, {
        purpose: "attendance",
        sessionId,
      });
      const res = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userLat: coords.lat,
          userLng: coords.lng,
          storagePath,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data.detail ? `${data.error} — ${data.detail}` : data.error) ?? "Check-in gagal");
        setStatus("ready");
        return;
      }
      setOkMsg(data.message ?? "Presensi berhasil!");
      setStatus("done");
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
      setStatus("ready");
    }
  }

  function reset() {
    setCoords(null);
    setPhoto(null);
    setStatus("idle");
    setOkMsg(null);
    setError(null);
  }

  return (
    <div className="space-y-4">
      {sessions.length === 0 && (
        <DoubleBezel>
          <p className="text-sm text-slate-500">
            Guru belum membuka sesi absensi untuk kelas {active?.kelas ?? "ACAK"}.
          </p>
        </DoubleBezel>
      )}

      <DoubleBezel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-extrabold tracking-tight">Pilih Sesi Absensi</h2>
          <select
            value={sessionId}
            onChange={(e) => {
              setSessionId(e.target.value);
              reset();
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} {s.isOpen ? "(Terbuka)" : "(Tertutup)"}
              </option>
            ))}
          </select>
        </div>
      </DoubleBezel>

      {sessions.map((s) =>
        s.already ? (
          <div key={s.id} className="glass-shell ring-1 ring-black/5">
            <div className="bezel-core p-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">{s.title}</p>
              <Badge tone={statusBadgeTone(s.already.status)}>Sudah {s.already.status}</Badge>
            </div>
          </div>
        ) : null
      )}

      {active && !active.already && (
        <DoubleBezel>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold ${
            active.isOpen ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
          }`}>
            <span className={`w-2 h-2 rounded-full ${active.isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
            {active.isOpen ? "Sesi Terbuka" : "Sesi Ditutup"}
          </div>

          <h2 className="mt-4 font-extrabold tracking-tight text-lg text-slate-900">Ambil Foto Presensi</h2>
          <ol className="mt-2 text-[13px] text-slate-500 list-decimal list-inside space-y-0.5">
            <li>Detect lokasi GPS-mu terhadap lapangan (≤ {FIELD_RADIUS} m).</li>
            <li>Aktifkan kamera depan &amp; ambil foto selfie.</li>
            <li>Kirim presensi.</li>
          </ol>

          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {/* LANGKAH 1: Lokasi */}
            <div className="p-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Langkah 1 · Lokasi GPS</p>
              {status === "idle" && (
                <button onClick={locate} className="mt-3 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer">
                  <Crosshair size={15} /> Ambil Lokasi
                </button>
              )}
              {status === "locating" && (
                <p className="mt-3 text-sm text-blue-600 font-semibold animate-pulse">Mendeteksi lokasi...</p>
              )}
              {coords && (
                <div className="mt-3 space-y-1.5">
                  <p className={`text-sm font-semibold ${coords.dist <= FIELD_RADIUS ? "text-emerald-600" : "text-rose-600"}`}>
                    {coords.dist <= FIELD_RADIUS
                      ? `Dalam radius! Jarak: ${coords.dist} m`
                      : `Di luar radius: ${coords.dist} m — maksimal ${FIELD_RADIUS} m`}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </p>
                  <button onClick={locate} className="text-[12px] text-blue-600 font-semibold cursor-pointer">Ulangi deteksi</button>
                </div>
              )}
            </div>

            {/* LANGKAH 2: Selfie */}
            <div className="p-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Langkah 2 · Foto Selfie</p>
              {!photo ? (
                <>
                  <div className="mt-3 aspect-video rounded-xl overflow-hidden bg-slate-900/5 relative">
                    <video ref={videoRef} playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                    {status === "ready" && !photo && !videoRef.current?.srcObject && null}
                  </div>
                  <div className="mt-2 flex gap-2">
                    {videoRef.current?.srcObject ? (
                      <button onClick={capture} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer">
                        Jepret Foto
                      </button>
                    ) : (
                      <button onClick={startCamera} className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer">
                        <Camera size={15} /> Buka Kamera Depan
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="Bukti presensi" className="mt-3 aspect-video w-full object-cover rounded-xl ring-1 ring-black/10" />
                  <button onClick={reset} className="mt-2 text-[12px] text-blue-600 font-semibold">Ambil ulang</button>
                </>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 ring-1 ring-rose-200 text-rose-700 text-sm flex items-start gap-2">
              <AlertTriangle size={17} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">{error}</p>
                <p className="text-[12px] opacity-75">Cek juga apakah GPS-mu aktif &amp; kamu benar-benar di area lapangan.</p>
              </div>
            </div>
          )}
          {okMsg && (
            <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 size={17} /> {okMsg}
            </div>
          )}

          <div className="mt-5">
            <PrimaryButton
              icon={Send}
              onClick={submit}
              disabled={!coords || !photo || status === "submitting" || !active.isOpen || coords.dist > FIELD_RADIUS}
            >
              {status === "submitting" ? "Mengirim..." : "Kirim Presensi"}
            </PrimaryButton>
          </div>
        </DoubleBezel>
      )}
    </div>
  );
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
