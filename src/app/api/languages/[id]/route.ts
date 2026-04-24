import { getLanguoid, getAncestors, getChildren, getAltNames, getCountries } from "@/lib/queries";
import { jsonResponse } from "@/lib/csv";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = getLanguoid(id);
  if (!lang) return new Response("Not found", { status: 404 });
  return jsonResponse({
    ...lang,
    ancestors: getAncestors(id),
    children: getChildren(id),
    alt_names: getAltNames(id),
    countries: getCountries(id),
  });
}
