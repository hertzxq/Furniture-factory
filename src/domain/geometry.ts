import { MODULES } from "../data/materials";
import type { KitchenModule, Project, Rect, Wall, WallRun } from "./types";
export function wallRuns(p: Project): WallRun[] {
  const { a, b, c, depth: d } = p.dimensions;
  return [
    {
      wall: "a",
      start: p.layout === "u" ? d : 0,
      end: a - (p.layout === "straight" ? 0 : d),
      length: a,
    },
    ...(p.layout !== "straight"
      ? [{ wall: "b" as const, start: d, end: b, length: b }]
      : []),
    ...(p.layout === "u"
      ? [{ wall: "c" as const, start: d, end: c, length: c }]
      : []),
  ];
}
export function corners(p: Project): Rect[] {
  const { a, depth: d } = p.dimensions;
  return p.layout === "straight"
    ? []
    : [
        { x: a - d, y: 0, w: d, h: d },
        ...(p.layout === "u" ? [{ x: 0, y: 0, w: d, h: d }] : []),
      ];
}
export function contourLength(p: Project): number {
  const { a, b, c, depth: d } = p.dimensions;
  return (
    (a +
      (p.layout !== "straight" ? b - d : 0) +
      (p.layout === "u" ? c - d : 0)) /
    100
  );
}
export function moduleRect(p: Project, m: KitchenModule): Rect {
  const d = p.dimensions.depth,
    w = MODULES[m.type].width;
  if (m.wall === "a") return { x: m.offset, y: 0, w, h: d };
  return {
    x: m.wall === "c" || p.layout === "l" ? p.dimensions.a - d : 0,
    y: m.offset,
    w: d,
    h: w,
  };
}
export function intersects(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}
export function validateGeometry(p: Project): string | null {
  const runs = wallRuns(p);
  const ids = new Set<string>();
  for (const m of p.modules) {
    if (ids.has(m.id)) return "Идентификаторы модулей должны быть уникальными.";
    ids.add(m.id);
    const r = runs.find((r) => r.wall === m.wall);
    if (
      !r ||
      !Number.isInteger(m.offset) ||
      m.offset < r.start ||
      m.offset + MODULES[m.type].width > r.end
    )
      return `${MODULES[m.type].name}: недостаточно места на стене ${m.wall.toUpperCase()}. Учтите угловые участки.`;
  }
  for (let i = 0; i < p.modules.length; i++)
    for (let j = i + 1; j < p.modules.length; j++)
      if (intersects(moduleRect(p, p.modules[i]), moduleRect(p, p.modules[j])))
        return "Модули пересекаются. Выберите свободное место.";
  return null;
}
export function freeIntervals(p: Project, wall: Wall): [number, number][] {
  const r = wallRuns(p).find((r) => r.wall === wall);
  if (!r) return [];
  const sorted = p.modules
    .filter((m) => m.wall === wall)
    .sort((a, b) => a.offset - b.offset);
  const gaps: [number, number][] = [];
  let cursor = r.start;
  for (const m of sorted) {
    if (m.offset > cursor) gaps.push([cursor, m.offset]);
    cursor = m.offset + MODULES[m.type].width;
  }
  if (cursor < r.end) gaps.push([cursor, r.end]);
  return gaps;
}
export function autoFill(p: Project, wall: Wall): KitchenModule[] {
  const result = [...p.modules];
  for (const [start, end] of freeIntervals(p, wall)) {
    let x = start;
    const n = Math.floor((end - start) / 20);
    let best: number[] = [];
    // Exact maximum coverage, retaining a small unfilled gap if no combination fits.
    for (let target = n; target >= 2; target--) {
      const dp: (number[] | undefined)[] = Array(target + 1);
      dp[0] = [];
      for (let k = 1; k <= target; k++)
        for (const size of [4, 3, 2])
          if (
            k >= size &&
            dp[k - size] &&
            (!dp[k] || dp[k - size]!.length + 1 < dp[k]!.length)
          )
            dp[k] = [...dp[k - size]!, size * 20];
      if (dp[target]) {
        best = dp[target]!;
        break;
      }
    }
    for (const width of best) {
      result.push({
        id: crypto.randomUUID(),
        type: width === 80 ? "cab80" : width === 60 ? "cab60" : "cab40",
        wall,
        offset: x,
      });
      x += width;
    }
  }
  return result;
}
export function firstPosition(
  p: Project,
  wall: Wall,
  width: number,
): number | null {
  return freeIntervals(p, wall).find(([a, b]) => b - a >= width)?.[0] ?? null;
}
