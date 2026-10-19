import type { Project } from "./types";
export interface History {
  past: Project[];
  current: Project;
  future: Project[];
  group?: string;
}
export const emptyHistory = (current: Project): History => ({
  past: [],
  current,
  future: [],
});
export function recordHistory(
  h: History,
  next: Project,
  group?: string,
): History {
  if (JSON.stringify(h.current) === JSON.stringify(next)) return h;
  return {
    past:
      group && h.group === group ? h.past : [...h.past.slice(-49), h.current],
    current: next,
    future: [],
    group,
  };
}
export function undoHistory(h: History): History {
  const previous = h.past.at(-1);
  return previous
    ? {
        past: h.past.slice(0, -1),
        current: previous,
        future: [h.current, ...h.future],
      }
    : h;
}
export function redoHistory(h: History): History {
  const next = h.future[0];
  return next
    ? {
        past: [...h.past.slice(-49), h.current],
        current: next,
        future: h.future.slice(1),
      }
    : h;
}
