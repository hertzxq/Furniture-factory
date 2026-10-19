import { describe, expect, it } from "vitest";
import {
  createProject,
  deserialize,
  serialize,
  validateProject,
} from "./project";
import {
  autoFill,
  contourLength,
  validateGeometry,
  wallRuns,
  moduleRect,
} from "./geometry";
import { estimate } from "./pricing";
import type { KitchenModule } from "./types";
const module = (
  id: string,
  offset: number,
  wall: "a" | "b" | "c" = "a",
): KitchenModule => ({ id, type: "cab60", wall, offset });
describe("room geometry", () => {
  it("counts straight, L and U contours without duplicate corners", () => {
    const p = createProject();
    p.modules = [];
    p.dimensions = { a: 360, b: 240, c: 240, depth: 60, height: 270 };
    expect(contourLength(p)).toBe(3.6);
    p.layout = "l";
    expect(contourLength(p)).toBe(5.4);
    p.layout = "u";
    expect(contourLength(p)).toBe(7.2);
  });
  it("reserves both U corners and uses perpendicular world coordinates", () => {
    const p = createProject();
    p.layout = "u";
    p.modules = [];
    expect(wallRuns(p).map((r) => [r.wall, r.start, r.end])).toEqual([
      ["a", 60, 300],
      ["b", 60, 240],
      ["c", 60, 240],
    ]);
    expect(moduleRect(p, module("x", 60, "c"))).toEqual({
      x: 300,
      y: 60,
      w: 60,
      h: 60,
    });
  });
  it("rejects overlap but accepts touching modules", () => {
    const p = createProject();
    p.modules = [module("1", 0), module("2", 60)];
    expect(validateGeometry(p)).toBeNull();
    p.modules[1].offset = 59;
    expect(validateGeometry(p)).toMatch(/пересекаются/);
  });
  it("rejects out of bounds, missing walls, duplicate IDs and reserved corners", () => {
    const p = createProject();
    p.modules = [module("1", 330)];
    expect(validateGeometry(p)).toBeTruthy();
    p.modules = [module("1", 0, "b")];
    expect(validateGeometry(p)).toBeTruthy();
    p.modules = [module("1", 0), module("1", 60)];
    expect(validateGeometry(p)).toBeTruthy();
    p.layout = "u";
    p.modules = [module("1", 0)];
    expect(validateGeometry(p)).toBeTruthy();
  });
  it("rejects reduction without mutating modules", () => {
    const p = createProject();
    p.modules = [module("1", 300)];
    const next = structuredClone(p);
    next.dimensions.a = 300;
    expect(validateGeometry(next)).toBeTruthy();
    expect(p.modules[0].offset).toBe(300);
  });
  it("fills gaps around existing modules without collision in every layout", () => {
    for (const layout of ["straight", "l", "u"] as const) {
      const p = createProject();
      p.layout = layout;
      p.modules = [module("existing", 120)];
      p.modules = autoFill(p, "a");
      expect(validateGeometry(p)).toBeNull();
      expect(p.modules.find((m) => m.id === "existing")?.offset).toBe(120);
      for (const r of wallRuns(p)) {
        p.modules = autoFill(p, r.wall);
      }
      expect(validateGeometry(p)).toBeNull();
    }
  });
});
describe("pricing", () => {
  it("provides exact additive category totals and bounded range", () => {
    const p = createProject();
    const e = estimate(p);
    expect(e.total).toBe(e.lines.reduce((s, l) => s + l.amount, 0));
    expect(e.min).toBe(Math.round(e.total * 0.9));
    expect(e.max).toBe(Math.round(e.total * 1.15));
    expect(e.total).toBeGreaterThan(0);
  });
  it("does not charge countertops above tall modules or empty wall space", () => {
    const p = createProject();
    p.modules = [module("1", 0)];
    const regular = estimate(p);
    p.modules[0].type = "tall";
    const tall = estimate(p);
    expect(regular.countertopMeters).toBe(0.6);
    expect(tall.countertopMeters).toBe(0);
    p.dimensions.a = 500;
    expect(estimate(p).total).toBe(tall.total);
  });
  it("adds corners once and increases prices for premium choices", () => {
    const p = createProject();
    p.modules = [];
    p.layout = "u";
    expect(estimate(p).countertopMeters).toBe(1.2);
    p.modules = [module("1", 60)];
    const base = estimate(p).total;
    p.facade = "wood";
    p.countertop = "quartz";
    p.hardware = "premium";
    p.extras.lighting = true;
    expect(estimate(p).total).toBeGreaterThan(base);
  });
});
describe("safe projects", () => {
  it("roundtrips Cyrillic names and recomputes price", () => {
    const p = createProject();
    p.name = "Кухня у окна";
    const restored = deserialize(serialize(p));
    expect(restored).toEqual(p);
    expect(estimate(restored).total).toBe(estimate(p).total);
  });
  it("rejects malformed, huge, nonfinite and colliding imports", () => {
    expect(() => deserialize("not json")).toThrow();
    expect(() => deserialize("a".repeat(30000))).toThrow();
    const p = createProject();
    expect(() =>
      validateProject({ ...p, dimensions: { ...p.dimensions, a: NaN } }),
    ).toThrow();
    expect(() => validateProject({ ...p, facade: "unknown" })).toThrow();
    expect(() =>
      validateProject({ ...p, modules: [module("1", 0), module("2", 0)] }),
    ).toThrow();
  });
  it("strips arbitrary properties, including personal data", () => {
    const p = validateProject({
      ...createProject(),
      phone: "+79999999999",
      email: "private",
    });
    expect(p).not.toHaveProperty("phone");
    expect(p).not.toHaveProperty("email");
  });
});

it("matches a hand-calculated single-module estimate", () => {
  const p = createProject();
  p.modules = [{ id: "single", type: "cab60", wall: "a", offset: 0 }];
  p.facade = "ldsp";
  p.texture = "smooth";
  p.finish = "matte";
  p.handles = "rail";
  p.countertop = "laminate";
  p.hardware = "basic";
  p.extras = {
    closers: false,
    drawers: false,
    lighting: false,
    organizers: false,
  };
  // Cabinet 8200 + facade 0.6*6500 + top 0.6*4200 + hardware 1800 + handle 450.
  expect(estimate(p).total).toBe(16870);
  p.extras.closers = true;
  expect(estimate(p).total).toBe(17720);
});
