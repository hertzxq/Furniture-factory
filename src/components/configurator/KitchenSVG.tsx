import { useId } from "react";
import { corners, moduleRect, wallRuns } from "../../domain/geometry";
import { MODULES } from "../../data/materials";
import type { KitchenModule, Project } from "../../domain/types";
export function LayoutIcon({ layout }: { layout: Project["layout"] }) {
  return (
    <svg viewBox="0 0 80 60" fill="none" aria-hidden="true">
      <path
        d="M12 44V12H68"
        stroke="currentColor"
        strokeWidth="1"
        opacity=".25"
      />
      <path
        d={
          layout === "straight"
            ? "M15 19H65"
            : layout === "l"
              ? "M15 19H61V47"
              : "M19 47V19H61V47"
        }
        stroke="currentColor"
        strokeWidth="11"
      />
      <path
        d={
          layout === "straight"
            ? "M32 14V24M49 14V24"
            : layout === "l"
              ? "M32 14V24M48 14V24M56 35H66"
              : "M14 34H24M34 14V24M46 14V24M56 34H66"
        }
        stroke="var(--paper)"
        strokeWidth="1"
      />
    </svg>
  );
}
function Equipment({ m, w, h }: { m: KitchenModule; w: number; h: number }) {
  if (m.type === "sink")
    return (
      <g>
        <rect
          x={w * 0.2}
          y={h * 0.19}
          width={w * 0.6}
          height={h * 0.58}
          rx="5"
          fill="#e4e4dd"
          stroke="#73756d"
          strokeWidth="1"
        />
        <rect
          x={w * 0.26}
          y={h * 0.26}
          width={w * 0.48}
          height={h * 0.43}
          rx="4"
          fill="#bdc1b7"
        />
        <path
          d={`M${w * 0.5} ${h * 0.26}v-9q8-5 8 3`}
          fill="none"
          stroke="#6c7167"
          strokeWidth="2"
        />
      </g>
    );
  if (m.type === "hob")
    return (
      <g>
        <rect
          x={w * 0.13}
          y={h * 0.15}
          width={w * 0.74}
          height={h * 0.7}
          rx="3"
          fill="#343731"
        />
        {[
          [0.33, 0.35],
          [0.67, 0.35],
          [0.33, 0.65],
          [0.67, 0.65],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={w * x}
            cy={h * y}
            r={Math.min(w, h) * 0.12}
            fill="none"
            stroke="#a6aa9e"
            strokeWidth="1"
          />
        ))}
      </g>
    );
  if (m.type === "fridge")
    return (
      <g stroke="#6c7167" fill="none">
        <path d={`M6 6L${w - 6} ${h - 6}M${w - 6} 6L6 ${h - 6}`} />
        <text
          x={w / 2}
          y={h / 2 + 3}
          textAnchor="middle"
          stroke="none"
          fill="#454a3e"
          fontSize="8"
        >
          ХОЛ.
        </text>
      </g>
    );
  if (m.type === "tall")
    return (
      <g stroke="#827965" fill="none">
        <path d={`M4 4L${w - 4} ${h - 4}M${w - 4} 4L4 ${h - 4}`} />
      </g>
    );
  return (
    <path
      d={`M${w * 0.22} ${h - 7}H${w * 0.78}`}
      stroke="#655e4f"
      strokeWidth="1.5"
    />
  );
}
export function KitchenSVG({
  project: p,
  view = "top",
  selected,
  onSelect,
  zoom = 1,
  mini = false,
}: {
  project: Project;
  view?: "top" | "front";
  selected?: string;
  onSelect?: (id: string) => void;
  zoom?: number;
  mini?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const grid = `grid${uid}`,
    wood = `wood${uid}`;
  const d = p.dimensions.depth;
  const runs = wallRuns(p);
  const roomH =
    p.layout === "straight"
      ? 190
      : Math.max(p.dimensions.b, p.layout === "u" ? p.dimensions.c : 0);
  const ceiling = p.dimensions.height;
  const height =
    view === "top" ? roomH + 105 : (ceiling + 40) * runs.length + 50;
  const width =
    (view === "top" ? p.dimensions.a : Math.max(...runs.map((r) => r.length))) +
    110;
  const moduleAction = (id: string) => ({
    onClick: () => onSelect?.(id),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect?.(id);
      }
    },
    tabIndex: onSelect ? 0 : undefined,
    role: onSelect ? "button" : undefined,
    "aria-label": `${MODULES[p.modules.find((m) => m.id === id)!.type].name}, выбрать модуль`,
  });
  return (
    <svg
      className={`kitchen-svg ${mini ? "mini-svg" : ""}`}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${view === "top" ? "План кухни сверху" : "Фасады кухни"}, размеры в сантиметрах`}
    >
      <defs>
        <pattern id={grid} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#deddd4" strokeWidth=".5" />
        </pattern>
        <pattern id={wood} width="12" height="40" patternUnits="userSpaceOnUse">
          <rect width="12" height="40" fill={p.color} />
          <path
            d="M2 0v40M5 0q4 15 0 40M10 0v40"
            stroke="#6b4b2b"
            strokeOpacity=".16"
            fill="none"
            strokeWidth=".7"
          />
        </pattern>
      </defs>
      <g
        transform={`translate(${width / 2} ${height / 2}) scale(${zoom}) translate(${-width / 2} ${-height / 2})`}
      >
        {view === "top" ? (
          <g transform="translate(55 50)">
            <rect
              x="-22"
              y="-22"
              width={p.dimensions.a + 44}
              height={roomH + 44}
              fill={`url(#${grid})`}
            />
            <path
              d={`M0 ${roomH}V0H${p.dimensions.a}V${roomH}`}
              fill="none"
              stroke="#7d8174"
              strokeWidth="4"
            />
            <path
              d={`M0 -24H${p.dimensions.a}M0 -29V-19M${p.dimensions.a} -29V-19`}
              stroke="#909481"
              strokeWidth="1"
            />
            <text
              x={p.dimensions.a / 2}
              y="-31"
              textAnchor="middle"
              fontSize="11"
              fill="#626855"
            >
              A · {p.dimensions.a} см
            </text>
            {runs
              .filter((r) => r.wall !== "a")
              .map((r) => (
                <g
                  key={r.wall}
                  transform={`translate(${r.wall === "c" || p.layout === "l" ? p.dimensions.a + 25 : -25} 0)`}
                >
                  <path
                    d={`M0 0V${r.length}M-5 0H5M-5 ${r.length}H5`}
                    stroke="#909481"
                  />
                  <text
                    transform={`translate(${r.wall === "b" && p.layout === "u" ? -8 : 12} ${r.length / 2}) rotate(-90)`}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#626855"
                  >
                    {r.wall.toUpperCase()} · {r.length} см
                  </text>
                </g>
              ))}
            {corners(p).map((r, i) => (
              <g key={i}>
                <rect
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  fill={p.countertop === "quartz" ? "#e8e4d9" : "#c8c4b5"}
                  stroke="#858775"
                />
                <path
                  d={`M${r.x + 4} ${r.y + 4}L${r.x + r.w - 4} ${r.y + r.h - 4}`}
                  stroke="#9a9b8d"
                />
                <text
                  x={r.x + r.w / 2}
                  y={r.y + r.h / 2}
                  fontSize="7"
                  textAnchor="middle"
                  fill="#626855"
                >
                  УГОЛ
                </text>
              </g>
            ))}
            {p.modules.map((m) => {
              const r = moduleRect(p, m);
              const active = selected === m.id;
              return (
                <g
                  key={m.id}
                  transform={`translate(${r.x} ${r.y})`}
                  className="svg-module"
                  {...moduleAction(m.id)}
                >
                  <rect
                    x="1"
                    y="1"
                    width={r.w - 2}
                    height={r.h - 2}
                    fill={p.texture === "wood" ? `url(#${wood})` : p.color}
                    stroke={active ? "#424936" : "#878978"}
                    strokeWidth={active ? 3 : 1}
                  />
                  {m.type !== "tall" && m.type !== "fridge" && (
                    <rect
                      x="3"
                      y="3"
                      width={r.w - 6}
                      height={r.h - 6}
                      fill="none"
                      stroke={
                        p.countertop === "quartz"
                          ? "#eeebe3"
                          : p.countertop === "stone"
                            ? "#c1bbac"
                            : p.countertop === "compact"
                              ? "#5b5d54"
                              : "#a68b6c"
                      }
                      strokeWidth="3"
                    />
                  )}
                  {p.finish === "gloss" && (
                    <path
                      d={`M3 3H${r.w - 3}L3 ${r.h - 3}Z`}
                      fill="white"
                      opacity=".16"
                    />
                  )}
                  <Equipment m={m} w={r.w} h={r.h} />
                  {!mini && (
                    <text
                      x={r.w / 2}
                      y={r.h + 13}
                      textAnchor="middle"
                      fontSize="7"
                      fill="#777c6b"
                    >
                      {m.wall === "a" ? MODULES[m.type].width : ""}
                    </text>
                  )}
                </g>
              );
            })}
            {!mini && (
              <>
                <text
                  x={p.dimensions.a / 2}
                  y={roomH - 25}
                  textAnchor="middle"
                  fontFamily="Georgia,serif"
                  fontSize="18"
                  fill="#9b9d8d"
                >
                  Ваша будущая кухня
                </text>
                <text
                  x={p.dimensions.a / 2}
                  y={roomH - 8}
                  textAnchor="middle"
                  fontSize="8"
                  letterSpacing="2"
                  fill="#9b9d8d"
                >
                  ВИД СВЕРХУ · СЕТКА 20 × 20 СМ
                </text>
              </>
            )}
          </g>
        ) : (
          runs.map((r, i) => (
            <g
              key={r.wall}
              transform={`translate(55 ${45 + i * (ceiling + 40)})`}
            >
              <text x="0" y="-10" fontSize="11" fill="#626855">
                СТЕНА {r.wall.toUpperCase()} · {r.length} см
              </text>
              <path
                d={`M0 0V${ceiling}H${r.length}V0`}
                fill="none"
                stroke="#d2d1c5"
              />
              {p.modules
                .filter((m) => m.wall === r.wall)
                .map((m) => {
                  const w = MODULES[m.type].width,
                    tall = m.type === "tall" || m.type === "fridge",
                    h = tall ? 220 : 86,
                    y = ceiling - h;
                  return (
                    <g
                      key={m.id}
                      transform={`translate(${m.offset} ${y})`}
                      className="svg-module"
                      {...moduleAction(m.id)}
                    >
                      <rect
                        width={w - 1}
                        height={h}
                        fill={p.texture === "wood" ? `url(#${wood})` : p.color}
                        stroke={selected === m.id ? "#424936" : "#8c8b7b"}
                        strokeWidth={selected === m.id ? 3 : 1}
                      />
                      {p.finish === "gloss" && (
                        <path
                          d={`M0 0H${w - 1}L0 ${h}Z`}
                          fill="white"
                          opacity=".15"
                        />
                      )}
                      {m.type === "oven" ? (
                        <rect
                          x="5"
                          y="15"
                          width={w - 11}
                          height="45"
                          rx="2"
                          fill="#343731"
                        />
                      ) : m.type === "fridge" ? (
                        <>
                          <path d={`M0 135H${w}`} stroke="#8c8b7b" />
                          <path
                            d="M8 85v35M8 145v35"
                            stroke="#5b5f51"
                            strokeWidth="2"
                          />
                        </>
                      ) : (
                        <>
                          <path d={`M${w / 2} 0V${h}`} stroke="#8c8b7b" />
                          <path
                            d={
                              p.handles === "profile"
                                ? `M0 5H${w}`
                                : p.handles === "knob"
                                  ? `M${w / 2 - 5} 15h2M${w / 2 + 4} 15h2`
                                  : `M${w / 2 - 6} 12v16M${w / 2 + 5} 12v16`
                            }
                            stroke="#5b5f51"
                            strokeWidth="2"
                          />
                        </>
                      )}
                      {!tall && (
                        <rect
                          x="-1"
                          y="-4"
                          width={w + 1}
                          height="5"
                          fill={
                            p.countertop === "quartz" ? "#eae7dd" : "#b4b0a1"
                          }
                          stroke="#a6a596"
                        />
                      )}
                      {m.type === "hob" && (
                        <rect
                          x="6"
                          y="-6"
                          width={w - 12}
                          height="3"
                          fill="#292d25"
                        />
                      )}
                    </g>
                  );
                })}
              <text
                x={r.length / 2}
                y={ceiling + 18}
                textAnchor="middle"
                fontSize="9"
                fill="#777c6b"
              >
                Высота помещения {p.dimensions.height} см · глубина {d} см
              </text>
            </g>
          ))
        )}
      </g>
    </svg>
  );
}
