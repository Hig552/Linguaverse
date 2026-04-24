"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ENDANGERMENT_LABELS } from "@/lib/constants";

export interface MapPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  macroarea?: string | null;
  aes?: number | null;
  aes_label?: string | null;
  speaker_count?: number | null;
  iso639_3?: string | null;
}

interface Props {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
  clusterMode?: boolean;
}

const AES_COLORS: Record<number, string> = {
  1: "#10b981", // emerald-500
  2: "#eab308", // yellow-500
  3: "#f97316", // orange-500
  4: "#ef4444", // red-500
  5: "#b91c1c", // red-700
  6: "#52525b", // zinc-600
};

/**
 * Leaflet must only run in the browser (it touches `window` on import).
 * We therefore mount it inside a useEffect and tear it down on unmount.
 */
export default function LanguageMap({ points, center = [20, 0], zoom = 2 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;
    let mapObj: { remove: () => void } | null = null;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (disposed || !containerRef.current) return;
      const map = L.map(containerRef.current, { preferCanvas: true, worldCopyJump: true }).setView(center, zoom);
      mapObj = map;
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '© <a href="https://openstreetmap.org/copyright">OSM</a> contributors, © <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      const MAX = 20000;
      const slice = points.slice(0, MAX);
      const bounds = L.latLngBounds([]);
      for (const p of slice) {
        const color = p.aes && AES_COLORS[p.aes] ? AES_COLORS[p.aes] : "#0ea5e9";
        const radius = p.speaker_count
          ? Math.max(3, Math.min(14, 3 + Math.log10(p.speaker_count) * 1.8))
          : 4;
        const marker = L.circleMarker([p.latitude, p.longitude], {
          radius,
          color,
          fillColor: color,
          fillOpacity: 0.6,
          weight: 1,
        });
        const speakers = p.speaker_count ? p.speaker_count.toLocaleString() : 'unknown';
        const endangerment = p.aes ? (ENDANGERMENT_LABELS[p.aes]?.label ?? p.aes_label ?? '') : '';
        marker.bindPopup(
          `<div style="font-size:12px"><strong><a href="/languages/${p.id}" style="color:#0ea5e9">${p.name}</a></strong><br>` +
          `<span style="color:#71717a">${p.macroarea ?? ''}${endangerment ? ' · ' + endangerment : ''}</span><br>` +
          `Speakers: ${speakers}</div>`
        );
        marker.addTo(map);
        bounds.extend([p.latitude, p.longitude]);
      }
      if (slice.length > 1 && bounds.isValid()) {
        map.fitBounds(bounds.pad(0.15), { maxZoom: 8 });
      }
    })();

    return () => {
      disposed = true;
      if (mapObj) mapObj.remove();
    };
  }, [points, center, zoom]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full z-0" />
      {!points.length && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
          No geolocated points to display.
        </div>
      )}
    </div>
  );
}

export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <span className="text-zinc-500">Marker color:</span>
      {Object.entries(ENDANGERMENT_LABELS).map(([aes, info]) => (
        <span key={aes} className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ background: AES_COLORS[Number(aes)] }} />
          {info.label}
        </span>
      ))}
      <span className="text-zinc-500 ml-auto">Marker size is proportional to speaker count.</span>
      <Link href="/map" className="text-sky-600 hover:underline">Open full map →</Link>
    </div>
  );
}
