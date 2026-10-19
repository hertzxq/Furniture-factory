import type { ModuleType, Project } from "../domain/types";
export const MODULES: Record<
  ModuleType,
  { name: string; width: number; price: number; short: string }
> = {
  cab40: { name: "Шкаф 40 см", width: 40, price: 6200, short: "40" },
  cab60: { name: "Шкаф 60 см", width: 60, price: 8200, short: "60" },
  cab80: { name: "Шкаф 80 см", width: 80, price: 10800, short: "80" },
  sink: { name: "Шкаф под мойку", width: 60, price: 9800, short: "Мойка" },
  hob: {
    name: "Варочная поверхность",
    width: 60,
    price: 10500,
    short: "Плита",
  },
  oven: { name: "Духовой шкаф", width: 60, price: 11200, short: "Духовка" },
  tall: { name: "Высокий пенал", width: 60, price: 18500, short: "Пенал" },
  fridge: {
    name: "Место для холодильника",
    width: 60,
    price: 3500,
    short: "Холод.",
  },
};
export const FACADES = [
  {
    id: "ldsp",
    name: "ЛДСП",
    price: 6500,
    description: "Практичная поверхность для повседневной жизни",
    life: "10–15 лет",
    care: "Простой",
    sample: "#c6b89d",
  },
  {
    id: "film",
    name: "МДФ в плёнке",
    price: 9500,
    description: "Мягкие оттенки и большой выбор фактур",
    life: "12–18 лет",
    care: "Бережный",
    sample: "#b6baaa",
  },
  {
    id: "enamel",
    name: "МДФ эмаль",
    price: 14500,
    description: "Глубокий цвет и безупречная гладкость",
    life: "15–20 лет",
    care: "Простой",
    sample: "#ded6c7",
  },
  {
    id: "veneer",
    name: "Натуральный шпон",
    price: 21000,
    description: "Живая текстура настоящего дерева",
    life: "20+ лет",
    care: "Бережный",
    sample: "#aa8459",
  },
  {
    id: "wood",
    name: "Массив дерева",
    price: 32000,
    description: "Выразительный характер и долговечность",
    life: "25+ лет",
    care: "Регулярный",
    sample: "#806345",
  },
] as const;
export const COLORS = [
  { value: "#c9b99b", name: "Песочный" },
  { value: "#e6e1d6", name: "Молочный" },
  { value: "#8a927a", name: "Оливковый" },
  { value: "#aaa9a3", name: "Тёплый серый" },
  { value: "#454742", name: "Графит" },
  { value: "#ae8053", name: "Натуральный дуб" },
];
export const COUNTERTOPS = [
  { id: "laminate", name: "ЛДСП", price: 4200 },
  { id: "compact", name: "Компакт-плита", price: 9800 },
  { id: "stone", name: "Искусственный камень", price: 17000 },
  { id: "quartz", name: "Кварцевый агломерат", price: 26000 },
] as const;
export const HARDWARE = [
  { id: "basic", name: "Базовая", price: 1800 },
  { id: "comfort", name: "Комфорт", price: 3600 },
  { id: "premium", name: "Премиальная", price: 6200 },
] as const;
export const EXTRA_LABELS: Record<keyof Project["extras"], string> = {
  closers: "Доводчики",
  drawers: "Выдвижные системы",
  lighting: "Подсветка рабочей зоны",
  organizers: "Органайзеры",
};
export const money = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽";
export const layoutName = (l: Project["layout"]) =>
  ({ straight: "Прямая", l: "Г-образная", u: "П-образная" })[l];
