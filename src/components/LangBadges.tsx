import Link from "next/link";
import { ENDANGERMENT_LABELS, MED_LABELS } from "@/lib/constants";

export function EndangermentBadge({ aes, label, compact }: { aes: number | null; label?: string | null; compact?: boolean }) {
  if (aes === null || aes === undefined) return null;
  const info = ENDANGERMENT_LABELS[aes];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800"
          title={info?.description ?? label ?? ''}>
      <span className={`w-2 h-2 rounded-full ${info?.color ?? 'bg-zinc-400'}`} />
      {!compact && (info?.label ?? label)}
    </span>
  );
}

export function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    language: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
    family: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
    dialect: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  };
  return (
    <span className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${colors[level] ?? colors.dialect}`}>
      {level}
    </span>
  );
}

export function MedBadge({ med }: { med: number | null }) {
  if (med === null || med === undefined) return null;
  const info = MED_LABELS[med];
  if (!info) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800" title={info.description}>
      <span className="w-2 h-2 rounded-full bg-sky-500" />
      {info.label}
    </span>
  );
}

export function IsoBadge({ iso }: { iso: string | null | undefined }) {
  if (!iso) return null;
  return (
    <Link href={`https://iso639-3.sil.org/code/${iso}`} target="_blank" rel="noreferrer"
      className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700">
      iso: {iso}
    </Link>
  );
}
