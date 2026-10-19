import { estimate } from "../domain/pricing";
import {
  FACADES,
  COUNTERTOPS,
  layoutName,
  money,
  MODULES,
} from "../data/materials";
import type { Project } from "../domain/types";
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function printEstimate(p: Project, notify: (s: string) => void) {
  const win = window.open("", "_blank");
  if (!win) {
    notify("Разрешите всплывающее окно для печати сметы.");
    return;
  }
  const e = estimate(p);
  win.document.write(
    `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Смета FORMA MEBEL</title><style>body{font:15px Arial;color:#292b24;max-width:800px;margin:50px auto;padding:20px}h1{font:44px Georgia}header{letter-spacing:5px}table{border-collapse:collapse;width:100%;margin:24px 0}td,th{text-align:left;padding:12px 0;border-bottom:1px solid #ddd}td:last-child{text-align:right}.note{font-size:12px;color:#666;line-height:1.7}button{background:#424936;color:white;border:0;padding:14px 24px;cursor:pointer}@media print{button{display:none}body{margin:0;max-width:none}}</style><header>FORMA MEBEL</header><h1>${escape(p.name)}</h1><p>Предварительная смета · ${new Date().toLocaleDateString("ru-RU")}</p><p>${layoutName(p.layout)} кухня · ${e.meters.toFixed(2)} пог. м · ${p.modules.length} модулей</p><p>Стены: ${p.dimensions.a}${p.layout !== "straight" ? ` × ${p.dimensions.b}` : ""}${p.layout === "u" ? ` × ${p.dimensions.c}` : ""} см. Высота: ${p.dimensions.height} см. Глубина: ${p.dimensions.depth} см.</p><p>Фасады: ${FACADES.find((f) => f.id === p.facade)!.name}. Цвет: ${escape(p.color)}. Покрытие: ${p.finish === "matte" ? "матовое" : "глянцевое"}. Столешница: ${COUNTERTOPS.find((t) => t.id === p.countertop)!.name}.</p><table>${e.lines.map((l) => `<tr><td>${l.name}</td><td>${money(l.amount)}</td></tr>`).join("")}<tr><th>Итого</th><td><strong>${money(e.total)}</strong></td></tr></table><p>Ориентировочный диапазон: ${money(e.min)} — ${money(e.max)}.</p><h2>Модули</h2><table>${p.modules.map((m) => `<tr><td>Стена ${m.wall.toUpperCase()} · ${m.offset} см</td><td>${MODULES[m.type].name}</td></tr>`).join("")}</table><p class="note">Демонстрационные цены. Расчёт носит ориентировочный характер и не является коммерческим предложением. Техника и монтаж не включены. Точная стоимость определяется после замера и согласования проекта.</p><button onclick="window.print()">Печать / сохранить в PDF</button></html>`,
  );
  win.document.close();
}
