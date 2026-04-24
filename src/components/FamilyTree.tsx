"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Languoid } from "@/lib/constants";

interface Props {
  root: Languoid;
  initialChildren: Languoid[];
}

/**
 * Interactive genealogical tree. Loads more levels lazily via /api/children.
 */
export default function FamilyTree({ root, initialChildren }: Props) {
  return (
    <div className="max-h-[520px] overflow-auto -m-4 p-4 text-sm">
      <TreeNode node={root} initialChildren={initialChildren} depth={0} expanded />
    </div>
  );
}

function TreeNode({ node, initialChildren, depth, expanded: initialExpanded }: {
  node: Languoid;
  initialChildren?: Languoid[];
  depth: number;
  expanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(initialExpanded ?? false);
  const [kids, setKids] = useState<Languoid[] | null>(initialChildren ?? null);
  const [loading, setLoading] = useState(false);
  const loadedRef = useRef(!!initialChildren);

  useEffect(() => {
    if (!expanded || loadedRef.current) return;
    let alive = true;
    setLoading(true);
    fetch(`/api/children/${node.id}`)
      .then((r) => r.json())
      .then((data: { items: Languoid[] }) => { if (alive) { setKids(data.items); loadedRef.current = true; } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [expanded, node.id]);

  const isLeaf = node.level === 'language' || node.level === 'dialect';
  const linkPath = node.level === 'family' ? `/families/${node.id}` : `/languages/${node.id}`;

  return (
    <div className="relative" style={{ paddingLeft: depth ? 16 : 0 }}>
      <div className="flex items-center gap-2 py-0.5">
        {!isLeaf ? (
          <button onClick={() => setExpanded((v) => !v)}
            className="w-5 h-5 flex items-center justify-center rounded border border-zinc-300 dark:border-zinc-700 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? '−' : '+'}
          </button>
        ) : (
          <span className="w-5 h-5 flex items-center justify-center text-zinc-400 text-xs">·</span>
        )}
        <Link href={linkPath} className="hover:underline">{node.name}</Link>
        <span className="text-[10px] text-zinc-500 font-mono">{node.id}</span>
        {node.iso639_3 && <span className="text-[10px] text-zinc-400 font-mono">{node.iso639_3}</span>}
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
          node.level === 'family'   ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300' :
          node.level === 'language' ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300' :
          'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
        }`}>{node.level}</span>
      </div>
      {expanded && (
        <div className="border-l border-dashed border-zinc-300 dark:border-zinc-700 ml-2.5 pl-2">
          {loading && <div className="text-zinc-500 italic text-xs py-0.5">Loading…</div>}
          {kids && kids.map((k) => (
            <TreeNode key={k.id} node={k} depth={depth + 1} expanded={false} />
          ))}
          {kids && kids.length === 0 && <div className="text-zinc-500 italic text-xs py-0.5">(no children)</div>}
        </div>
      )}
    </div>
  );
}
