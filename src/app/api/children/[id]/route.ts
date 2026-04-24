import { getChildren } from "@/lib/queries";
import { jsonResponse } from "@/lib/csv";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return jsonResponse({ items: getChildren(id) });
}
