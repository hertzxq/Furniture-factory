import {
  COLORS,
  COUNTERTOPS,
  FACADES,
  HARDWARE,
  MODULES,
} from "../data/materials";
import { validateGeometry } from "./geometry";
import type { Project } from "./types";
export function createProject(): Project {
  return {
    version: 1,
    id: crypto.randomUUID(),
    name: "Моя кухня",
    savedAt: new Date().toISOString(),
    layout: "straight",
    dimensions: { a: 360, b: 240, c: 240, height: 270, depth: 60 },
    modules: [
      { id: crypto.randomUUID(), type: "tall", wall: "a", offset: 0 },
      { id: crypto.randomUUID(), type: "cab60", wall: "a", offset: 60 },
      { id: crypto.randomUUID(), type: "sink", wall: "a", offset: 120 },
      { id: crypto.randomUUID(), type: "cab80", wall: "a", offset: 180 },
      { id: crypto.randomUUID(), type: "hob", wall: "a", offset: 260 },
      { id: crypto.randomUUID(), type: "cab40", wall: "a", offset: 320 },
    ],
    facade: "veneer",
    color: "#c9b99b",
    texture: "wood",
    handles: "profile",
    finish: "matte",
    countertop: "stone",
    hardware: "comfort",
    extras: {
      closers: true,
      drawers: false,
      lighting: true,
      organizers: false,
    },
  };
}
const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
function choice<T extends string>(v: unknown, values: readonly T[]): T {
  if (typeof v !== "string" || !values.includes(v as T))
    throw new Error("Неизвестный параметр проекта.");
  return v as T;
}
function str(v: unknown, max: number): string {
  if (typeof v !== "string" || v.length < 1 || v.length > max)
    throw new Error("Некорректное название или идентификатор.");
  return v;
}
export function validateProject(input: unknown): Project {
  if (
    !isObject(input) ||
    input.version !== 1 ||
    !isObject(input.dimensions) ||
    !isObject(input.extras) ||
    !Array.isArray(input.modules) ||
    input.modules.length > 100
  )
    throw new Error("Формат проекта не поддерживается.");
  const d = input.dimensions;
  for (const [key, min, max] of [
    ["a", 180, 600],
    ["b", 180, 600],
    ["c", 180, 600],
    ["height", 220, 350],
    ["depth", 45, 75],
  ] as const) {
    const v = d[key];
    if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max)
      throw new Error("Размеры выходят за допустимый диапазон.");
  }
  const extras: Project["extras"] = {
    closers: false,
    drawers: false,
    lighting: false,
    organizers: false,
  };
  for (const key of Object.keys(extras) as (keyof typeof extras)[]) {
    if (typeof input.extras[key] !== "boolean")
      throw new Error("Некорректные опции.");
    extras[key] = input.extras[key];
  }
  const p: Project = {
    version: 1,
    id: str(input.id, 100),
    name: str(input.name, 80),
    savedAt: str(input.savedAt, 40),
    layout: choice(input.layout, ["straight", "l", "u"]),
    dimensions: {
      a: d.a as number,
      b: d.b as number,
      c: d.c as number,
      height: d.height as number,
      depth: d.depth as number,
    },
    modules: input.modules.map((v) => {
      if (!isObject(v) || typeof v.offset !== "number")
        throw new Error("Некорректный модуль.");
      return {
        id: str(v.id, 100),
        type: choice(v.type, Object.keys(MODULES) as (keyof typeof MODULES)[]),
        wall: choice(v.wall, ["a", "b", "c"]),
        offset: v.offset,
      };
    }),
    facade: choice(
      input.facade,
      FACADES.map((v) => v.id),
    ),
    color: choice(
      input.color,
      COLORS.map((v) => v.value),
    ),
    texture: choice(input.texture, ["smooth", "wood"]),
    handles: choice(input.handles, ["rail", "knob", "profile"]),
    finish: choice(input.finish, ["matte", "gloss"]),
    countertop: choice(
      input.countertop,
      COUNTERTOPS.map((v) => v.id),
    ),
    hardware: choice(
      input.hardware,
      HARDWARE.map((v) => v.id),
    ),
    extras,
  };
  if (!Number.isFinite(Date.parse(p.savedAt)))
    throw new Error("Некорректная дата проекта.");
  const error = validateGeometry(p);
  if (error) throw new Error(error);
  return p;
}
export function serialize(p: Project): string {
  return btoa(
    String.fromCharCode(
      ...new TextEncoder().encode(JSON.stringify(validateProject(p))),
    ),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
export function deserialize(value: string): Project {
  if (value.length > 25000)
    throw new Error("Ссылка на проект слишком длинная.");
  try {
    return validateProject(
      JSON.parse(
        new TextDecoder().decode(
          Uint8Array.from(
            atob(value.replace(/-/g, "+").replace(/_/g, "/")),
            (c) => c.charCodeAt(0),
          ),
        ),
      ),
    );
  } catch (e) {
    throw new Error(
      e instanceof Error
        ? `Не удалось открыть проект: ${e.message}`
        : "Некорректный проект.",
    );
  }
}
