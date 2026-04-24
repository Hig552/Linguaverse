"use client";

import LanguageMap, { type MapPoint } from "./LanguageMap";

interface Props { points: MapPoint[] }

export default function WorldMap({ points }: Props) {
  return <LanguageMap points={points} center={[20, 0]} zoom={2} />;
}
