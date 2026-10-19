import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Expand,
  FolderOpen,
  Minus,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Share2,
  Trash2,
  Undo2,
  Download,
  Info,
  MoveHorizontal,
  Sparkles,
  Ruler,
} from "lucide-react";
import { NumberInput } from "../ui/number-input";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { KitchenSVG, LayoutIcon } from "./KitchenSVG";
import {
  autoFill,
  firstPosition,
  wallRuns,
  freeIntervals,
} from "../../domain/geometry";
import { createProject, serialize } from "../../domain/project";
import { estimate } from "../../domain/pricing";
import {
  COLORS,
  COUNTERTOPS,
  EXTRA_LABELS,
  FACADES,
  HARDWARE,
  MODULES,
  money,
  layoutName,
} from "../../data/materials";
import { readProjects, writeProjects } from "../../services/storage";
import { printEstimate } from "../../services/print";
import type { ModuleType, Project, Wall } from "../../domain/types";
export interface ConfiguratorProps {
  project: Project;
  update: (p: Project, group?: string) => boolean;
  replace: (p: Project, record?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onBack: () => void;
  onBook: () => void;
  notify: (message: string) => void;
  openProjects: boolean;
  setOpenProjects: (open: boolean) => void;
}
export function Configurator({
  project: p,
  update,
  replace,
  undo,
  redo,
  canUndo,
  canRedo,
  onBack,
  onBook,
  notify,
  openProjects,
  setOpenProjects,
}: ConfiguratorProps) {
  const [step, setStep] = useState(0),
    [view, setView] = useState<"top" | "front">("top"),
    [zoom, setZoom] = useState(1),
    [selected, setSelected] = useState<string>(),
    [wall, setWall] = useState<Wall>("a"),
    [expanded, setExpanded] = useState(false),
    [pending, setPending] = useState<{
      label: string;
      action: () => void;
    } | null>(null);
  const [projects, setProjects] = useState<Project[]>(() => readProjects());
  const e = estimate(p);
  const steps = ["Планировка", "Размеры", "Модули", "Фасады", "Детали"];
  const runs = wallRuns(p);
  const activeWall = runs.some((r) => r.wall === wall) ? wall : "a";
  const selectedModule = p.modules.find((m) => m.id === selected);
  const gesture = useRef(0);
  const change = <K extends keyof Project>(key: K, value: Project[K]) =>
    update({ ...p, [key]: value });
  const dimension = (
    key: keyof Project["dimensions"],
    v: number,
    slider = false,
  ) => {
    return update(
      { ...p, dimensions: { ...p.dimensions, [key]: Math.round(v) } },
      slider ? `${key}:${gesture.current}` : undefined,
    );
  };
  function setLayout(layout: Project["layout"]) {
    if (layout === p.layout) return;
    const next: Project = { ...p, layout, modules: [] };
    const apply = () => {
      let modules = next.modules;
      for (const r of wallRuns(next))
        modules = autoFill({ ...next, modules }, r.wall);
      update({ ...next, modules });
      setSelected(undefined);
    };
    if (p.modules.length)
      setPending({
        label:
          "Смена планировки перестроит расположение модулей. Материалы и отделка сохранятся. Продолжить?",
        action: apply,
      });
    else apply();
  }
  function add(type: ModuleType) {
    const offset = firstPosition(p, activeWall, MODULES[type].width);
    if (offset === null) {
      notify(
        "Недостаточно свободного места. Удалите модуль или увеличьте стену.",
      );
      return;
    }
    const m = { id: crypto.randomUUID(), type, wall: activeWall, offset };
    if (update({ ...p, modules: [...p.modules, m] })) setSelected(m.id);
  }
  function save(duplicate = false, confirmed = false) {
    if (!duplicate && !confirmed && projects.some((pr) => pr.id === p.id)) {
      setPending({
        label: `Перезаписать сохранённый проект «${p.name}» текущими изменениями?`,
        action: () => save(false, true),
      });
      return;
    }
    const saved = {
      ...p,
      id: duplicate ? crypto.randomUUID() : p.id,
      name: duplicate ? `${p.name.slice(0, 65)} — копия` : p.name,
      savedAt: new Date().toISOString(),
    };
    const list = [saved, ...projects.filter((x) => x.id !== saved.id)];
    try {
      writeProjects(list);
      setProjects(list);
      replace(saved, false);
      notify(
        duplicate
          ? "Копия проекта сохранена"
          : "Проект сохранён на этом устройстве",
      );
    } catch (err) {
      notify((err as Error).message);
    }
  }
  async function share() {
    const url = new URL(window.location.href);
    url.hash = `project=${serialize(p)}`;
    try {
      await navigator.clipboard.writeText(url.toString());
      notify("Ссылка на проект скопирована");
    } catch {
      setShareUrl(url.toString());
    }
  }
  const [shareUrl, setShareUrl] = useState("");
  const canvas = (
    <>
      <div className="canvas-toolbar">
        <div className="segmented">
          <button
            className={view === "top" ? "active" : ""}
            onClick={() => setView("top")}
          >
            Вид сверху
          </button>
          <button
            className={view === "front" ? "active" : ""}
            onClick={() => setView("front")}
          >
            Фасады
          </button>
        </div>
        <button
          className="icon-button"
          title="Развернуть чертёж"
          aria-label="Развернуть чертёж"
          onClick={() => setExpanded(!expanded)}
        >
          <Expand size={17} />
        </button>
      </div>
      <div className={`drawing ${view === "front" ? "elevation" : ""}`}>
        <KitchenSVG
          project={p}
          view={view}
          selected={selected}
          onSelect={(id) => {
            setSelected(id);
            setStep(2);
          }}
          zoom={zoom}
        />
      </div>
      <div className="canvas-bottom">
        <span>
          <span className="status-dot" /> Масштабная схема · см
        </span>
        <div className="zoom">
          <button
            aria-label="Уменьшить масштаб"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          >
            <Minus size={14} />
          </button>
          <button onClick={() => setZoom(1)} title="Сбросить масштаб">
            {Math.round(zoom * 100)}%
          </button>
          <button
            aria-label="Увеличить масштаб"
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </>
  );
  return (
    <main className="config-page">
      <div className="config-heading">
        <div>
          <button className="text-link back-link" onClick={onBack}>
            <ArrowLeft size={14} /> На главную
          </button>
          <h1>
            Кухня начинается <em>с вас.</em>
          </h1>
          <p>От идеи до первых очертаний — всего несколько шагов.</p>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => {
            setProjects(readProjects());
            setOpenProjects(true);
          }}
        >
          <FolderOpen size={16} /> Мои проекты{" "}
          <span className="count">{projects.length}</span>
        </button>
      </div>
      <div className="project-bar">
        <label className="project-name">
          <input
            aria-label="Название проекта"
            maxLength={80}
            value={p.name}
            onChange={(ev) => change("name", ev.target.value || "Моя кухня")}
          />
        </label>
        <div className="project-actions">
          <button
            className="icon-button"
            aria-label="Отменить"
            disabled={!canUndo}
            onClick={undo}
          >
            <Undo2 size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="Повторить"
            disabled={!canRedo}
            onClick={redo}
          >
            <Redo2 size={18} />
          </button>
          <span className="vertical-rule" />
          <button className="text-link" onClick={share}>
            <Share2 size={15} />
            <span>Поделиться</span>
          </button>
          <Button variant="outline" size="small" onClick={() => save()}>
            <Save size={15} /> Сохранить
          </Button>
        </div>
      </div>
      <div className="planner-grid">
        <aside className="settings-panel">
          <div className="steps" role="group" aria-label="Шаги проектирования">
            {steps.map((s, i) => (
              <button
                key={s}
                type="button"
                title={s}
                aria-label={`Шаг ${i + 1}: ${s}`}
                aria-current={i === step ? "step" : undefined}
                className={i === step ? "active" : i < step ? "complete" : ""}
                onClick={() => setStep(i)}
              />
            ))}
          </div>
          <motion.div
            className="step-title"
            key={step}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <span className="eyebrow">ШАГ 0{step + 1} / 05</span>
            <h2>
              {
                [
                  "Форма вашей кухни",
                  "Точность в деталях",
                  "Каждому своё место",
                  "Характер и фактура",
                  "Последние штрихи",
                ][step]
              }
            </h2>
            <p>
              {
                [
                  "Начните с планировки, которая подходит вашему пространству.",
                  "Введите размеры помещения в сантиметрах.",
                  "Выберите стену и добавьте модуль в свободное место.",
                  "Найдите сочетание, к которому хочется прикасаться.",
                  "Выберите столешницу и комфорт в ежедневных мелочах.",
                ][step]
              }
            </p>
          </motion.div>
          {step === 0 && (
            <div className="layout-choices">
              {(["straight", "l", "u"] as const).map((l) => (
                <button
                  key={l}
                  className={`layout-choice ${p.layout === l ? "selected" : ""}`}
                  onClick={() => setLayout(l)}
                >
                  <LayoutIcon layout={l} />
                  <span>{layoutName(l)}</span>
                  <span className="radio-dot" />
                </button>
              ))}
            </div>
          )}
          {step === 1 && (
            <div className="dimension-fields">
              {(
                [
                  ["a", "Стена A", 180, 600],
                  ...(p.layout !== "straight"
                    ? [["b", "Стена B", 180, 600]]
                    : []),
                  ...(p.layout === "u" ? [["c", "Стена C", 180, 600]] : []),
                  ["height", "Высота помещения", 220, 350],
                  ["depth", "Глубина шкафов", 45, 75],
                ] as [keyof Project["dimensions"], string, number, number][]
              ).map(([key, label, min, max]) => (
                <div className="dimension-field" key={key}>
                  <label htmlFor={`dim-${key}`}>{label}</label>
                  <div className="number-field">
                    <Ruler size={15} />
                    <NumberInput
                      id={`dim-${key}`}
                      min={min}
                      max={max}
                      value={p.dimensions[key]}
                      onCommit={(value) => dimension(key, value)}
                    />
                    <span>см</span>
                  </div>
                  <input
                    aria-label={`${label}, ползунок`}
                    type="range"
                    min={min}
                    max={max}
                    value={p.dimensions[key]}
                    onPointerDown={() => {
                      gesture.current++;
                    }}
                    onKeyDown={(ev) => {
                      if (!ev.repeat) gesture.current++;
                    }}
                    onChange={(ev) =>
                      dimension(key, ev.target.valueAsNumber, true)
                    }
                  />
                  <div className="range-labels">
                    <span>{min} см</span>
                    <span>{max} см</span>
                  </div>
                </div>
              ))}
              <p className="hint-text">
                Размеры применяются по Enter или при выходе из поля. Если шкафы
                не помещаются, переместите или удалите их на шаге «Модули».
              </p>
            </div>
          )}
          {step === 2 && (
            <>
              <label className="field-label" htmlFor="active-wall">
                Стена для размещения
              </label>
              <div className="select-wrap">
                <select
                  id="active-wall"
                  value={activeWall}
                  onChange={(ev) => setWall(ev.target.value as Wall)}
                >
                  {runs.map((r) => (
                    <option value={r.wall} key={r.wall}>
                      Стена {r.wall.toUpperCase()} · {r.length} см
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} />
              </div>
              <div className="free-space">
                <span>Свободно на стене</span>
                <b>
                  {freeIntervals(p, activeWall).reduce(
                    (s, [a, b]) => s + b - a,
                    0,
                  )}{" "}
                  см
                </b>
              </div>
              <div className="module-library">
                {Object.entries(MODULES).map(([type, m]) => (
                  <button key={type} onClick={() => add(type as ModuleType)}>
                    <span className="module-symbol">{m.short}</span>
                    <span>
                      {m.name}
                      <small>{m.width} см</small>
                    </span>
                    <Plus size={14} />
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                className="full-width"
                onClick={() => {
                  const modules = autoFill(p, activeWall);
                  if (modules.length === p.modules.length)
                    notify("На стене нет места для стандартных модулей.");
                  else update({ ...p, modules });
                }}
              >
                <Sparkles size={15} /> Заполнить стену
              </Button>
              {selectedModule && (
                <div className="module-settings">
                  <div className="flex-between">
                    <h3>{MODULES[selectedModule.type].name}</h3>
                    <button
                      className="icon-button danger"
                      aria-label="Удалить выбранный модуль"
                      onClick={() => {
                        update({
                          ...p,
                          modules: p.modules.filter((m) => m.id !== selected),
                        });
                        setSelected(undefined);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <label className="field-label">
                    Стена
                    <select
                      value={selectedModule.wall}
                      onChange={(ev) =>
                        update({
                          ...p,
                          modules: p.modules.map((m) =>
                            m.id === selected
                              ? { ...m, wall: ev.target.value as Wall }
                              : m,
                          ),
                        })
                      }
                    >
                      {runs.map((r) => (
                        <option key={r.wall} value={r.wall}>
                          {r.wall.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-label">
                    Отступ от начала стены, см
                    <NumberInput
                      key={selectedModule.id}
                      min={0}
                      max={600}
                      value={selectedModule.offset}
                      onCommit={(value) =>
                        update({
                          ...p,
                          modules: p.modules.map((m) =>
                            m.id === selected ? { ...m, offset: value } : m,
                          ),
                        })
                      }
                    />
                  </label>
                  <div className="flex-between">
                    <Button
                      size="small"
                      variant="outline"
                      onClick={() =>
                        update({
                          ...p,
                          modules: p.modules.map((m) =>
                            m.id === selected
                              ? { ...m, offset: m.offset - 10 }
                              : m,
                          ),
                        })
                      }
                    >
                      <ArrowLeft size={13} /> 10 см
                    </Button>
                    <MoveHorizontal size={16} />
                    <Button
                      size="small"
                      variant="outline"
                      onClick={() =>
                        update({
                          ...p,
                          modules: p.modules.map((m) =>
                            m.id === selected
                              ? { ...m, offset: m.offset + 10 }
                              : m,
                          ),
                        })
                      }
                    >
                      10 см <ArrowRight size={13} />
                    </Button>
                  </div>
                </div>
              )}
              <button
                className="text-link muted-link"
                onClick={() =>
                  setPending({
                    label: "Удалить все модули? Угловые элементы сохранятся.",
                    action: () => update({ ...p, modules: [] }),
                  })
                }
              >
                <Trash2 size={13} /> Очистить кухню
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <label className="field-label" htmlFor="facade">
                Материал фасадов
              </label>
              <select
                id="facade"
                value={p.facade}
                onChange={(ev) =>
                  change("facade", ev.target.value as Project["facade"])
                }
              >
                {FACADES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} · {money(f.price)}/м
                  </option>
                ))}
              </select>
              <label className="field-label">
                Цвет · {COLORS.find((c) => c.value === p.color)?.name}
              </label>
              <div className="color-choices">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    title={c.name}
                    aria-label={c.name}
                    aria-pressed={p.color === c.value}
                    className={p.color === c.value ? "active" : ""}
                    style={{ background: c.value }}
                    onClick={() => change("color", c.value)}
                  >
                    {p.color === c.value && (
                      <Check
                        size={17}
                        color={c.value === "#454742" ? "white" : "#424936"}
                      />
                    )}
                  </button>
                ))}
              </div>
              <div
                className="material-preview"
                style={{ backgroundColor: p.color }}
                data-texture={p.texture}
              >
                <span>{FACADES.find((f) => f.id === p.facade)?.name}</span>
              </div>
              <label className="field-label">Фактура</label>
              <div className="segmented full-width">
                <button
                  className={p.texture === "smooth" ? "active" : ""}
                  onClick={() => change("texture", "smooth")}
                >
                  Гладкая
                </button>
                <button
                  className={p.texture === "wood" ? "active" : ""}
                  onClick={() => change("texture", "wood")}
                >
                  Древесная
                </button>
              </div>
              <label className="field-label">Покрытие</label>
              <div className="segmented full-width">
                <button
                  className={p.finish === "matte" ? "active" : ""}
                  onClick={() => change("finish", "matte")}
                >
                  Матовое
                </button>
                <button
                  className={p.finish === "gloss" ? "active" : ""}
                  onClick={() => change("finish", "gloss")}
                >
                  Глянцевое +12%
                </button>
              </div>
              <label className="field-label" htmlFor="handles">
                Ручки
              </label>
              <select
                id="handles"
                value={p.handles}
                onChange={(ev) =>
                  change("handles", ev.target.value as Project["handles"])
                }
              >
                <option value="profile">Интегрированный профиль</option>
                <option value="rail">Лаконичные скобы</option>
                <option value="knob">Кнопки</option>
              </select>
            </>
          )}
          {step === 4 && (
            <>
              <label className="field-label">Столешница</label>
              <div className="option-list">
                {COUNTERTOPS.map((t) => (
                  <button
                    className={p.countertop === t.id ? "selected" : ""}
                    key={t.id}
                    onClick={() => change("countertop", t.id)}
                  >
                    <span>
                      {t.name}
                      <small>{money(t.price)} / м</small>
                    </span>
                    <span className="radio-dot" />
                  </button>
                ))}
              </div>
              <label className="field-label">Фурнитура</label>
              <div className="segmented full-width">
                {HARDWARE.map((h) => (
                  <button
                    className={p.hardware === h.id ? "active" : ""}
                    key={h.id}
                    onClick={() => change("hardware", h.id)}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
              <label className="field-label">Больше комфорта</label>
              <div className="extras">
                {(Object.keys(p.extras) as (keyof Project["extras"])[]).map(
                  (key) => (
                    <label key={key}>
                      <input
                        type="checkbox"
                        checked={p.extras[key]}
                        onChange={(ev) =>
                          change("extras", {
                            ...p.extras,
                            [key]: ev.target.checked,
                          })
                        }
                      />
                      <span>{EXTRA_LABELS[key]}</span>
                      <small>{money(e.optionCosts[key])}</small>
                    </label>
                  ),
                )}
              </div>
            </>
          )}
          <div className="step-navigation">
            {step > 0 && (
              <Button
                variant="ghost"
                size="small"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft size={14} /> Назад
              </Button>
            )}
            <Button
              size="small"
              className="next-step"
              onClick={() => (step < 4 ? setStep(step + 1) : onBook())}
            >
              {step < 4 ? "Продолжить" : "Записаться на замер"}
              <ArrowRight size={15} />
            </Button>
          </div>
        </aside>
        <section className="canvas-panel" aria-label="Чертёж кухни">
          {canvas}
          <div className="drawing-hint">
            <Info size={14} />
            {step === 2
              ? "Нажмите на модуль, чтобы переместить или удалить его."
              : "Размеры, материалы и модули обновляются на схеме сразу."}
          </div>
          <div className="project-summary">
            <span>{layoutName(p.layout)} кухня</span>
            <span>{p.modules.length} модулей</span>
            <span>{e.meters.toFixed(2)} пог. м</span>
          </div>
        </section>
        <aside className="estimate-panel">
          <h2>
            Предварительный
            <br />
            <em>расчёт</em>
          </h2>
          <div className="estimate-total" aria-live="polite">
            {money(e.total)}
          </div>
          <p className="estimate-range">
            от {money(e.min)} до {money(e.max)}
          </p>
          <div className="estimate-lines">
            {e.lines.map((l) => (
              <div key={l.name}>
                <span>{l.name}</span>
                <b>{money(l.amount)}</b>
              </div>
            ))}
          </div>
          {Object.entries(e.optionCosts).some(([, v]) => v > 0) && (
            <details className="option-details">
              <summary>Стоимость опций</summary>
              {Object.entries(e.optionCosts)
                .filter(([, v]) => v > 0)
                .map(([k, v]) => (
                  <div key={k}>
                    <span>{EXTRA_LABELS[k as keyof Project["extras"]]}</span>
                    <b>{money(v)}</b>
                  </div>
                ))}
            </details>
          )}
          <Button className="full-width" onClick={onBook}>
            Бесплатный замер <ArrowRight size={16} />
          </Button>
          <button
            className="text-link print-link"
            onClick={() => printEstimate(p, notify)}
          >
            <Download size={14} /> Скачать смету / PDF
          </button>
        </aside>
      </div>
      <div className="config-bottom-actions">
        <button className="text-link" onClick={() => save(true)}>
          <Copy size={14} /> Дублировать проект
        </button>
        <button
          className="text-link"
          onClick={() =>
            setPending({
              label:
                "Создать новый проект? Текущий черновик будет заменён. Сохранённые проекты останутся.",
              action: () => {
                replace(createProject());
                setStep(0);
              },
            })
          }
        >
          <Plus size={14} /> Создать новый
        </button>
        <button
          className="text-link"
          onClick={() =>
            setPending({
              label:
                "Сбросить изменения к последнему сохранению? Если сохранения нет, откроется исходная кухня.",
              action: () =>
                replace(projects.find((x) => x.id === p.id) ?? createProject()),
            })
          }
        >
          <RotateCcw size={14} /> Сбросить изменения
        </button>
      </div>
      <Dialog
        open={openProjects}
        onOpenChange={setOpenProjects}
        title="Мои проекты"
        description="Кухни, сохранённые в этом браузере."
        wide
      >
        <div className="saved-projects">
          {projects.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={36} />
              <h3>Здесь будет ваша история</h3>
              <p>Сохраните первую кухню, чтобы вернуться к ней позже.</p>
              <Button onClick={() => setOpenProjects(false)}>
                Вернуться к проекту
              </Button>
            </div>
          ) : (
            projects.map((pr) => (
              <article key={pr.id}>
                <div className="project-thumb">
                  <KitchenSVG project={pr} mini />
                </div>
                <div>
                  <h3>{pr.name}</h3>
                  <p>
                    {layoutName(pr.layout)} ·{" "}
                    {new Date(pr.savedAt).toLocaleDateString("ru-RU")}
                  </p>
                  <b>{money(estimate(pr).total)}</b>
                  <div className="saved-actions">
                    <Button
                      size="small"
                      onClick={() => {
                        setOpenProjects(false);
                        setPending({
                          label:
                            "Открыть сохранённый проект? Несохранённый черновик будет заменён.",
                          action: () => replace(pr),
                        });
                      }}
                    >
                      Открыть <ArrowRight size={13} />
                    </Button>
                    <button
                      className="icon-button danger"
                      aria-label={`Удалить проект ${pr.name}`}
                      onClick={() =>
                        setPending({
                          label: `Удалить сохранённый проект «${pr.name}»?`,
                          action: () => {
                            const list = projects.filter((x) => x.id !== pr.id);
                            try {
                              writeProjects(list);
                              setProjects(list);
                            } catch (err) {
                              notify((err as Error).message);
                            }
                          },
                        })
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </Dialog>
      <Dialog
        open={!!pending}
        onOpenChange={(v) => {
          if (!v) setPending(null);
        }}
        title="Изменить проект?"
        description={pending?.label}
      >
        <div className="dialog-actions">
          <Button variant="outline" onClick={() => setPending(null)}>
            Отмена
          </Button>
          <Button
            onClick={() => {
              pending?.action();
              setPending(null);
            }}
          >
            Продолжить <ArrowRight size={14} />
          </Button>
        </div>
      </Dialog>
      <Dialog
        open={expanded}
        onOpenChange={setExpanded}
        title="Чертёж вашей кухни"
        wide
      >
        {canvas}
      </Dialog>
      <Dialog
        open={!!shareUrl}
        onOpenChange={(v) => {
          if (!v) setShareUrl("");
        }}
        title="Ссылка на проект"
        description="Скопируйте ссылку. Она содержит только настройки кухни."
      >
        <textarea
          readOnly
          value={shareUrl}
          onFocus={(ev) => ev.target.select()}
          aria-label="Ссылка на проект"
        />
        <Button onClick={() => setShareUrl("")}>Готово</Button>
      </Dialog>
    </main>
  );
}
