import { searchLanguoids } from "@/lib/queries";
import { jsonResponse } from "@/lib/csv";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  if (!q.trim()) return jsonResponse({ items: [] });
  const r = searchLanguoids({ q, limit: 12 });
  return jsonResponse({
    items: r.items.map((l) => ({
      id: l.id,
      name: l.name,
      iso: l.iso639_3,
      level: l.level,
      macroarea: l.macroarea,
      speakers: l.speaker_count,
      aes: l.aes,
    })),
  });
}
