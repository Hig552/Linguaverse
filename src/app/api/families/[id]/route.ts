import { getLanguoid, getSubtreeLanguages, getSubtreeStats, getChildren } from "@/lib/queries";
import { csvResponse, jsonResponse, toCsv } from "@/lib/csv";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const family = getLanguoid(id);
  if (!family) return new Response("Not found", { status: 404 });
  const url = new URL(req.url);
  const languages = getSubtreeLanguages(id);
  if (url.searchParams.get("format") === "csv") {
    const cols = ["id", "name", "iso639_3", "macroarea", "family_id", "aes", "aes_label", "speaker_count", "script"];
    return csvResponse(toCsv(languages as unknown as Array<Record<string, unknown>>, cols), `linguaverse-${id}-languages.csv`);
  }
  return jsonResponse({
    family,
    children: getChildren(id),
    languages,
    stats: getSubtreeStats(id),
  });
}
