import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/** Doppelrand / Double-Bezel Card Architecture */
export function DoubleBezel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass-shell ring-1 ring-black/5 bg-white/70 shadow-sm ${className}`}>
      <div className="bezel-core p-6 bg-white/95">{children}</div>
    </div>
  );
}

export function PrimaryButton({
  icon: Icon,
  children,
  href,
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const baseClasses = `group inline-flex min-h-11 items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-sm hover:shadow-md shadow-blue-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        <span>{children}</span>
        {Icon ? <Icon size={16} className="transition-transform group-hover:translate-x-0.5" /> : null}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={baseClasses}>
      <span>{children}</span>
      {Icon ? <Icon size={16} /> : null}
    </button>
  );
}

export function SecondaryButton({
  icon: Icon,
  children,
  href,
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const baseClasses = `inline-flex min-h-11 items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        <span>{children}</span>
        {Icon ? <Icon size={16} className="text-slate-500" /> : null}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={baseClasses}>
      <span>{children}</span>
      {Icon ? <Icon size={16} className="text-slate-500" /> : null}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  icon: Icon,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-slate-700 hover:text-slate-900 bg-transparent hover:bg-slate-100 transition-colors cursor-pointer ${className}`}
    >
      {Icon ? <Icon size={15} /> : null}
      <span>{children}</span>
    </button>
  );
}

export function Badge({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "emerald" | "amber" | "rose" | "slate";
}) {
  const tones: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    slate: "bg-slate-50 text-slate-600 ring-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold ring-1 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function statusBadgeTone(
  status: string
): "emerald" | "amber" | "rose" | "slate" {
  switch (status) {
    case "HADIR":
    case "LULUS":
    case "GRADED":
      return "emerald";
    case "IZIN":
    case "SAKIT":
    case "PENDING":
      return "amber";
    case "ALPA":
    case "GAGAL":
    case "REJECTED":
      return "rose";
    default:
      return "slate";
  }
}
