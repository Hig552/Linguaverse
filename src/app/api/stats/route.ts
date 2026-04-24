import { getStats, getAllScripts, getAllCountries } from "@/lib/queries";
import { jsonResponse } from "@/lib/csv";

export async function GET() {
  return jsonResponse({
    ...getStats(),
    scripts: getAllScripts(),
    countries: getAllCountries(),
  });
}
