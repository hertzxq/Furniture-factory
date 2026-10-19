import { COUNTERTOPS, FACADES, HARDWARE, MODULES } from "../data/materials";
import { corners } from "./geometry";
import type { Project } from "./types";
export interface EstimateLine {
  name: string;
  amount: number;
}
export function estimate(p: Project) {
  const cornerCount = corners(p).length,
    cornerMeters = (cornerCount * p.dimensions.depth) / 100;
  const meters = p.modules.reduce(
    (s, m) => s + MODULES[m.type].width / 100,
    cornerMeters,
  );
  const countertopMeters = p.modules
    .filter((m) => m.type !== "tall" && m.type !== "fridge")
    .reduce((s, m) => s + MODULES[m.type].width / 100, cornerMeters);
  const count = p.modules.length + cornerCount;
  const facadeRate = FACADES.find((f) => f.id === p.facade)!.price;
  const facade = Math.round(
    meters *
      facadeRate *
      (p.finish === "gloss" ? 1.12 : 1) *
      (p.texture === "wood" ? 1.05 : 1),
  );
  const optionCosts = {
    closers: p.extras.closers ? count * 850 : 0,
    drawers: p.extras.drawers ? count * 1800 : 0,
    lighting: p.extras.lighting ? Math.round(countertopMeters * 2400) : 0,
    organizers: p.extras.organizers ? count * 650 : 0,
  };
  const lines: EstimateLine[] = [
    {
      name: "Корпуса и модули",
      amount: p.modules.reduce((s, m) => s + MODULES[m.type].price, 0),
    },
    { name: "Угловые элементы", amount: cornerCount * 12500 },
    { name: "Фасады и отделка", amount: facade },
    {
      name: "Столешница",
      amount: Math.round(
        countertopMeters *
          COUNTERTOPS.find((t) => t.id === p.countertop)!.price,
      ),
    },
    {
      name: "Фурнитура и ручки",
      amount:
        count *
        (HARDWARE.find((h) => h.id === p.hardware)!.price +
          { rail: 450, knob: 300, profile: 1100 }[p.handles]),
    },
    {
      name: "Дополнительные опции",
      amount: Object.values(optionCosts).reduce((a, b) => a + b, 0),
    },
  ];
  const total = lines.reduce((s, l) => s + l.amount, 0);
  return {
    lines,
    total,
    min: Math.round(total * 0.9),
    max: Math.round(total * 1.15),
    meters,
    countertopMeters,
    optionCosts,
  };
}
