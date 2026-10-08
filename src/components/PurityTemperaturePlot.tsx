"use client";
import { useEffect, useId, useRef, useState } from "react";
import { parsePurityNumber } from "../lib/purity-domain";
type Props = {
  low: number;
  high: number;
  step: number;
  reference: number;
  start: string;
  finish: string;
  finishAvailable: boolean;
  interactive: boolean;
  onChange?: (field: "start" | "finish", value: string) => void;
};
const valueText = (n: number) => String(Math.round(n * 1e8) / 1e8);
export function PurityTemperaturePlot(p: Props) {
  const ref = useRef<HTMLDivElement>(null),
    id = useId();
  const [width, setWidth] = useState(320),
    [activeChoice, setActive] = useState<"start" | "finish">("start");
  const active = p.finishAvailable ? activeChoice : "start";
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const resize = () =>
      setWidth(Math.max(100, Math.round(el.getBoundingClientRect().width)));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const left = 24,
    right = width - 24,
    span = p.high - p.low,
    count = Math.round(span / p.step);
  const x = (v: number) => left + ((v - p.low) / span) * (right - left);
  const start = parsePurityNumber(p.start, true),
    finish = parsePurityNumber(p.finish, true);
  const inside = (v: number | null): v is number =>
    v !== null && v >= p.low - 1e-8 && v <= p.high + 1e-8;
  const choose = (n: number) => {
    if (
      p.interactive &&
      p.onChange &&
      (active === "start" || p.finishAvailable)
    )
      p.onChange(active, valueText(n));
  };
  const move = (direction: -1 | 1) => {
    const raw = active === "start" ? start : finish;
    const next = raw === null ? p.low : raw + direction * p.step;
    if (Number.isFinite(next) && Math.abs(next) <= 1e12) choose(next);
  };
  const points = [
    { name: "Start", value: start, y: 56, labelY: 32, colour: "#3345c9" },
    { name: "Finish", value: finish, y: 94, labelY: 125, colour: "#7651a8" },
  ];
  const outside = points.filter(
    (point) => point.value !== null && !inside(point.value),
  );
  return (
    <div className="purity-temperature" ref={ref}>
      {p.interactive && (
        <>
          <div
            className="purity-marker-tools"
            aria-label="Temperature marker controls"
          >
            <button
              type="button"
              aria-label={`Move ${active} temperature left`}
              onClick={() => move(-1)}
            >
              Move left
            </button>
            <button
              type="button"
              aria-label={`Move ${active} temperature right`}
              onClick={() => move(1)}
            >
              Move right
            </button>
            <button
              type="button"
              aria-pressed={active === "start"}
              onClick={() => setActive("start")}
            >
              Start mark
            </button>
            <button
              type="button"
              disabled={!p.finishAvailable}
              aria-pressed={active === "finish"}
              onClick={() => setActive("finish")}
            >
              Finish mark
            </button>
          </div>
          <p id={id}>
            Tap the plot or use its arrow keys to place the active mark. Each
            small gap is {p.step}°C.
          </p>
        </>
      )}
      <div
        className="purity-temperature-surface"
        role={p.interactive ? "group" : undefined}
        aria-label={
          p.interactive
            ? `Place the ${active} temperature mark`
            : "Supplied temperature readings"
        }
        aria-describedby={p.interactive ? id : undefined}
        tabIndex={p.interactive ? 0 : undefined}
        onKeyDown={(e) => {
          if (!p.interactive) return;
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            move(-1);
          } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            move(1);
          } else if (e.key === "Home") {
            e.preventDefault();
            choose(p.low);
          } else if (e.key === "End") {
            e.preventDefault();
            choose(p.high);
          }
        }}
      >
        <svg
          viewBox={`0 0 ${width} 170`}
          style={{ width: "100%", height: 170 }}
          role="img"
          aria-label={`Temperature scale ${p.low} to ${p.high} degrees Celsius; reference ${p.reference} degrees. Start ${start === null ? "not chosen" : p.start}; finish ${finish === null ? "not recorded or not chosen" : p.finish}.`}
          onClick={(e) => {
            if (!p.interactive) return;
            const box = e.currentTarget.getBoundingClientRect(),
              local = ((e.clientX - box.left) / box.width) * width;
            const index = Math.min(
              count,
              Math.max(
                0,
                Math.round(((local - left) / (right - left)) * count),
              ),
            );
            choose(p.low + index * p.step);
          }}
        >
          <text
            x={x(p.reference)}
            y="16"
            textAnchor="middle"
            fontSize="14"
            fill="#52607c"
          >
            Reference {p.reference}°C
          </text>
          <line
            x1={x(p.reference)}
            x2={x(p.reference)}
            y1="40"
            y2="108"
            stroke="#8790a9"
            strokeDasharray="4 4"
          />
          {inside(start) && inside(finish) && (
            <rect
              x={Math.min(x(start), x(finish))}
              y="63"
              width={Math.max(1, Math.abs(x(finish) - x(start)))}
              height="24"
              fill={finish >= start ? "#dedffb" : "#f5dba8"}
            />
          )}
          <line
            x1={left}
            x2={right}
            y1="76"
            y2="76"
            stroke="#35425f"
            strokeWidth="2"
          />
          {Array.from({ length: count + 1 }, (_, i) => (
            <line
              key={i}
              x1={x(p.low + i * p.step)}
              x2={x(p.low + i * p.step)}
              y1={i % 10 === 0 ? 68 : 72}
              y2={i % 10 === 0 ? 84 : 80}
              stroke="#35425f"
            />
          ))}
          {[p.low, (p.low + p.high) / 2, p.high].map((v, i) => (
            <text
              key={i}
              x={x(v)}
              y="159"
              textAnchor="middle"
              fontSize="14"
              fill="#263451"
            >
              {valueText(v)}
            </text>
          ))}
          {points.map((point) =>
            inside(point.value) ? (
              <g key={point.name}>
                <line
                  x1={x(point.value)}
                  x2={x(point.value)}
                  y1={point.y}
                  y2="76"
                  stroke={point.colour}
                  strokeWidth="2"
                />
                <circle
                  cx={x(point.value)}
                  cy={point.y}
                  r="6"
                  fill="white"
                  stroke={point.colour}
                  strokeWidth="3"
                />
                <text
                  x={Math.max(45, Math.min(width - 45, x(point.value)))}
                  y={point.labelY}
                  textAnchor="middle"
                  fontSize="14"
                  fill={point.colour}
                >
                  {point.name} {valueText(point.value)}
                </text>
              </g>
            ) : null,
          )}
        </svg>
      </div>
      {!p.interactive && (
        <p>
          Each small gap is {p.step}°C. These are supplied readings for your
          comparison.
        </p>
      )}
      {outside.map((point) => (
        <p key={point.name}>
          {point.name}: {point.value}°C lies outside the illustrated scale. Your
          value is retained.
        </p>
      ))}
      {start !== null && finish !== null && finish < start && (
        <p>
          Your finish is before your start. The proposed order is retained;
          check what an interval means.
        </p>
      )}
      {!p.finishAvailable && <p>Only the start was recorded.</p>}
    </div>
  );
}
