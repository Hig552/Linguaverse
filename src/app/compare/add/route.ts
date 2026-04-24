import { NextResponse } from "next/server";
import { getLanguoid, getLanguoidByIso } from "@/lib/queries";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const add = (url.searchParams.get("add") ?? "").trim();
  const ids = (url.searchParams.get("ids") ?? "").split(",").filter(Boolean);

  let matched: string | null = null;
  if (add) {
    const direct = getLanguoid(add);
    if (direct) matched = direct.id;
    else {
      const byIso = getLanguoidByIso(add);
      if (byIso) matched = byIso.id;
    }
  }

  if (matched && !ids.includes(matched)) ids.push(matched);
  const next = new URL("/compare", url);
  next.searchParams.set("ids", ids.join(","));
  return NextResponse.redirect(next);
}
