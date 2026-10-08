"use client";
import { useRef } from "react";
import {
  readChromaNumber,
  type ChromaBoard,
} from "@/lib/chromatography-domain";
import type { MeasurementSource } from "@/lib/chromatography-cases";
export function ChromaMeasurement({
  source,
  board,
  onZero,
}: {
  source: MeasurementSource;
  board: ChromaBoard;
  onZero: (raw: string) => void;
}) {
  const svg = useRef<SVGSVGElement>(null),
    drag = useRef<{ startY: number; zero: number } | null>(null);
  const zero = readChromaNumber(board.rulerZero, true),
    scale = 2.7,
    maximum = Math.max(source.front ?? source.spot, source.spot) + 20;
  const height = maximum * scale + 70,
    y = (n: number) => 30 + (maximum - n) * scale;
  const extent =
    zero !== null && Math.abs(zero) <= maximum * 2
      ? {
          low: Math.max(0, Math.ceil(-zero / 10) * 10),
          high: Math.floor((maximum - zero) / 10) * 10,
          minorLow: Math.max(0, Math.ceil(-zero)),
          minorHigh: Math.floor(maximum - zero),
        }
      : null;
  const move = (delta: number) => {
    if (zero !== null) onZero(String(zero + delta));
  };
  const pointY = (clientX: number, clientY: number) => {
    const matrix = svg.current?.getScreenCTM();
    return matrix
      ? new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse()).y
      : null;
  };
  const closeUp = (name: string, coordinate: number) => {
    if (zero === null || !extent) return null;
    const reading = coordinate - zero,
      first = Math.ceil(reading - 6),
      last = Math.floor(reading + 6);
    return (
      <figure
        key={name}
        className="chroma-ruler-closeup"
        tabIndex={0}
        aria-label={`Ruler close-up at original ${name}; scroll horizontally to inspect`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            e.currentTarget.scrollBy({
              left: e.key === "ArrowRight" ? 80 : -80,
            });
          }
        }}
      >
        <figcaption>Ruler close-up at original {name}</figcaption>
        <svg
          width="220"
          style={{ width: 220, minWidth: 220, height: 100 }}
          height="100"
          viewBox="0 0 220 100"
          role="img"
          aria-label={`Ruler scale near original ${name}. Zero remains at coordinate ${zero} millimetres.`}
        >
          <rect
            x="0"
            y="25"
            width="220"
            height="65"
            fill="#fff2ae"
            stroke="#b48d32"
          />
          {Array.from({ length: last - first + 1 }, (_, i) => first + i)
            .filter((n) => n >= 0)
            .map((n) => {
              const x = 110 + (n - reading) * 14;
              return (
                <g key={n}>
                  <line
                    x1={x}
                    x2={x}
                    y1="25"
                    y2={n % 10 === 0 ? 59 : n % 5 === 0 ? 50 : 41}
                    stroke="#69571a"
                    strokeWidth={n % 10 === 0 ? 2 : 1}
                  />
                  {n % 5 === 0 && (
                    <text
                      x={x}
                      y="78"
                      textAnchor="middle"
                      fontSize="14"
                      fill="#534619"
                    >
                      {n}
                    </text>
                  )}
                </g>
              );
            })}
          <line
            x1="110"
            x2="110"
            y1="5"
            y2="36"
            stroke="#3345c9"
            strokeWidth="3"
          />
          <circle cx="110" cy="12" r="4" fill="#3345c9" />
          <text x="200" y="18" textAnchor="end" fontSize="14" fill="#253047">
            mm
          </text>
        </svg>
        {reading < 0 && (
          <p>The original {name} lies before this ruler’s zero.</p>
        )}
      </figure>
    );
  };
  return (
    <section className="chroma-measurement">
      <p>
        <strong>Original spot and front stay fixed.</strong> Drag the yellow
        ruler or use the buttons. The ruler moves independently. Its zero is
        currently{" "}
        {zero === null
          ? "not a complete number"
          : `${zero} mm above the paper bottom`}
        .
      </p>
      <div className="chroma-ruler-buttons">
        <button
          type="button"
          disabled={zero === null}
          onClick={() => move(-1)}
          aria-label="Move ruler zero down 1 millimetre"
        >
          −1 mm
        </button>
        <button
          type="button"
          disabled={zero === null}
          onClick={() => move(1)}
          aria-label="Move ruler zero up 1 millimetre"
        >
          +1 mm
        </button>
      </div>
      <p className="chroma-pan-hint">
        Swipe the diagram sideways, or focus it and use the arrow keys, to
        inspect the full width.
      </p>
      <div
        className="chroma-given-scroll"
        role="region"
        tabIndex={0}
        aria-label="Chromatogram with movable ruler; arrow up and down move zero by one millimetre"
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            move(e.key === "ArrowUp" ? 1 : -1);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            e.currentTarget.scrollBy({
              left: e.key === "ArrowRight" ? 80 : -80,
            });
          }
        }}
      >
        <svg
          ref={svg}
          width="390"
          style={{ width: 390, minWidth: 390, height }}
          height={height}
          viewBox={`0 0 390 ${height}`}
          role="img"
          aria-label={`Original origin ${source.origin} millimetres; centre ${source.spot} millimetres; ${source.front === null ? "front unrecorded" : `front ${source.front} millimetres`}. Ruler zero ${zero === null ? "unfinished" : zero + " millimetres"}.`}
        >
          <rect
            x="100"
            y="30"
            width="225"
            height={maximum * scale}
            rx="3"
            fill="#fff"
            stroke="#c3cbd8"
          />
          <line
            x1="100"
            x2="325"
            y1={y(source.origin)}
            y2={y(source.origin)}
            stroke="#566173"
            strokeWidth="2"
          />
          <text
            x="210"
            y={y(source.origin) + 20}
            textAnchor="middle"
            fontSize="14"
            fill="#253047"
          >
            Original origin
          </text>
          {source.front !== null && (
            <>
              <line
                x1="100"
                x2="325"
                y1={y(source.front)}
                y2={y(source.front)}
                stroke="#2358ba"
                strokeDasharray="8 4"
                strokeWidth="2"
              />
              <text
                x="210"
                y={y(source.front) - 9}
                textAnchor="middle"
                fontSize="14"
                fill="#2358ba"
              >
                Original front
              </text>
            </>
          )}
          <circle
            cx="210"
            cy={y(source.spot)}
            r={source.radius * scale}
            fill="#aa86d9"
            stroke="#7343ba"
          />
          <line
            x1="205"
            x2="215"
            y1={y(source.spot)}
            y2={y(source.spot)}
            stroke="#302049"
            strokeWidth="2"
          />
          <line
            x1="210"
            x2="210"
            y1={y(source.spot) - 5}
            y2={y(source.spot) + 5}
            stroke="#302049"
            strokeWidth="2"
          />
          {zero !== null && extent && (
            <g
              className="chroma-ruler-drag"
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                const at = pointY(event.clientX, event.clientY);
                if (at === null) return;
                event.preventDefault();
                event.currentTarget.setPointerCapture?.(event.pointerId);
                drag.current = { startY: at, zero };
              }}
              onPointerMove={(event) => {
                const at = pointY(event.clientX, event.clientY);
                if (at === null || !drag.current) return;
                const next = String(
                  Math.round(
                    drag.current.zero + (drag.current.startY - at) / scale,
                  ),
                );
                if (next !== board.rulerZero) onZero(next);
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
              onPointerCancel={() => {
                drag.current = null;
              }}
              onLostPointerCapture={() => {
                drag.current = null;
              }}
            >
              <rect
                x="33"
                y="30"
                width="52"
                height={maximum * scale}
                rx="3"
                fill="#fff2ae"
                stroke="#b48d32"
              />
              {Array.from(
                { length: Math.max(0, extent.minorHigh - extent.minorLow + 1) },
                (_, i) => extent.minorLow + i,
              )
                .filter((t) => t % 10 !== 0)
                .map((t) => (
                  <line
                    key={"minor-" + t}
                    x1={t % 5 === 0 ? 75 : 80}
                    x2="85"
                    y1={y(zero + t)}
                    y2={y(zero + t)}
                    stroke="#69571a"
                  />
                ))}
              {Array.from(
                {
                  length: Math.max(
                    0,
                    Math.floor((extent.high - extent.low) / 10) + 1,
                  ),
                },
                (_, i) => extent.low + i * 10,
              ).map((t) => (
                <g key={t}>
                  <line
                    x1="70"
                    x2="85"
                    y1={y(zero + t)}
                    y2={y(zero + t)}
                    stroke="#69571a"
                  />
                  <text
                    x="63"
                    y={y(zero + t) + 5}
                    fontSize="14"
                    textAnchor="end"
                    fill="#534619"
                  >
                    {t}
                  </text>
                </g>
              ))}
              {zero >= 0 && zero <= maximum && (
                <line
                  x1="85"
                  x2="100"
                  y1={y(zero)}
                  y2={y(zero)}
                  stroke="#c56227"
                  strokeWidth="3"
                />
              )}
            </g>
          )}
          <text x="60" y="18" textAnchor="middle" fontSize="14" fill="#253047">
            mm
          </text>
          <text
            x="210"
            y={height - 12}
            textAnchor="middle"
            fontSize="14"
            fill="#253047"
          >
            Paper bottom: original coordinate 0 mm
          </text>
        </svg>
      </div>
      <div className="chroma-ruler-closeups">
        {closeUp("origin", source.origin)}
        {closeUp("centre", source.spot)}
        {source.front !== null && closeUp("front", source.front)}
      </div>
      {zero !== null && (zero < 0 || zero > maximum) && (
        <p className="chroma-off-scale">
          The ruler zero is outside the displayed paper coordinates at {zero}{" "}
          mm. It is retained, and no substitute zero position is drawn.
        </p>
      )}
      {source.front === null && (
        <p>Original record: the solvent front was not marked.</p>
      )}
      <p>
        The dark cross identifies the original spot centre. The drawing uses
        calibrated coordinates rather than physical screen millimetres.
      </p>
    </section>
  );
}
