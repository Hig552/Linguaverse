export function toCsv<T extends Record<string, unknown>>(rows: T[], columns?: string[]): string {
  if (!rows.length && !columns) return '';
  const cols = columns ?? Object.keys(rows[0] ?? {});
  const header = cols.map(csvEscape).join(',');
  const body = rows.map((r) => cols.map((c) => csvEscape(r[c])).join(',')).join('\n');
  return header + '\n' + body;
}

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
    },
  });
}

export function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
    },
  });
}
