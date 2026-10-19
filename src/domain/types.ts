export type Layout = "straight" | "l" | "u";
export type Wall = "a" | "b" | "c";
export type ModuleType =
  "cab40" | "cab60" | "cab80" | "sink" | "hob" | "oven" | "tall" | "fridge";
export interface KitchenModule {
  id: string;
  type: ModuleType;
  wall: Wall;
  offset: number;
}
export interface Project {
  version: 1;
  id: string;
  name: string;
  savedAt: string;
  layout: Layout;
  dimensions: {
    a: number;
    b: number;
    c: number;
    height: number;
    depth: number;
  };
  modules: KitchenModule[];
  facade: "ldsp" | "film" | "enamel" | "veneer" | "wood";
  color: string;
  texture: "smooth" | "wood";
  handles: "rail" | "knob" | "profile";
  finish: "matte" | "gloss";
  countertop: "laminate" | "compact" | "stone" | "quartz";
  hardware: "basic" | "comfort" | "premium";
  extras: {
    closers: boolean;
    drawers: boolean;
    lighting: boolean;
    organizers: boolean;
  };
}
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface WallRun {
  wall: Wall;
  start: number;
  end: number;
  length: number;
}
