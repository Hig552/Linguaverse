import { searchLanguoids } from "@/lib/queries";
import { csvResponse, jsonResponse, toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const p = url.searchParams;
  const result = searchLanguoids({
    q: p.get("q") ?? undefined,
    level: (p.get("level") as "family" | "language" | "dialect" | null) ?? undefined,
    macroarea: p.get("macroarea") ?? undefined,
    country: p.get("country") ?? undefined,
    family: p.get("family") ?? undefined,
    endangerment: p.get("endangerment") ? Number(p.get("endangerment")) : undefined,
    minSpeakers: p.get("minSpeakers") ? Number(p.get("minSpeakers")) : undefined,
    maxSpeakers: p.get("maxSpeakers") ? Number(p.get("maxSpeakers")) : undefined,
    script: p.get("script") ?? undefined,
    hasCoordinates: p.get("hasCoordinates") === "true" ? true : undefined,
    isolate: p.get("isolate") === "true" ? true : undefined,
    orderBy: (p.get("orderBy") as "name" | "speakers" | "endangerment" | null) ?? undefined,
    order: (p.get("order") as "asc" | "desc" | null) ?? undefined,
    limit: p.get("limit") ? Number(p.get("limit")) : undefined,
    offset: p.get("offset") ? Number(p.get("offset")) : undefined,
  });

  if (p.get("format") === "csv") {
    const cols = [
      "id","name","iso639_3","level","category","macroarea","latitude","longitude","countries",
      "family_id","parent_id","is_isolate","aes","aes_label","med","med_label",
      "speaker_count","script","wikipedia_url",
    ];
    const csv = toCsv(result.items as unknown as Array<Record<string, unknown>>, cols);
    return csvResponse(csv, "linguaverse-languages.csv");
  }
  return jsonResponse({
    total: result.total,
    count: result.items.length,
    items: result.items,
  });
}
