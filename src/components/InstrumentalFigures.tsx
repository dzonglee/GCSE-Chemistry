"use client";
import { useState } from "react";
import {
  metalKeys,
  metalNames,
  referenceLines,
  proposalLines,
  type SpectrumData,
  type CalibrationData,
  type InstrumentalGiven,
} from "@/lib/instrumental";
const symbols: Record<string, string> = {
  li: "Li⁺",
  na: "Na⁺",
  k: "K⁺",
  ca: "Ca²⁺",
  cu: "Cu²⁺",
};
function Pan({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="instrumental-pan"
      tabIndex={0}
      role="group"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          e.currentTarget.scrollBy({ left: e.key === "ArrowLeft" ? -60 : 60 });
        }
      }}
    >
      {children}
    </div>
  );
}
export function SpectrumFigure({
  data,
  ions,
  table = data.table ?? false,
  compact = false,
}: {
  data: SpectrumData;
  ions?: string;
  table?: boolean;
  compact?: boolean;
}) {
  const rows = [
    ...metalKeys.map((k) => ({
      label: symbols[k],
      key: k,
      lines: referenceLines[k],
    })),
    { label: "Unknown", key: "unknown", lines: data.lines },
    ...(ions !== undefined
      ? [{ label: "Your set", key: "proposal", lines: proposalLines(ions) }]
      : []),
  ];
  return (
    <figure className="instrumental-spectrum">
      <figcaption>{data.conditions}</figcaption>
      {!compact && (
        <p className="instrumental-small">
          Original teaching diagram: positions 1–12 are schematic display
          positions, not real wavelengths to memorise. All rows use the same
          scale.
        </p>
      )}
      {table && compact ? (
        <Pan label="Supplied teaching line positions; scroll horizontally">
          <table className="assessment-spectrum-table">
            <caption>Teaching positions · scroll →</caption>
            <thead>
              <tr>
                {rows.map((r) => (
                  <th key={r.key} scope="col">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {rows.map((r) => (
                  <td key={r.key} data-spectrum-row={r.key}>
                    {r.lines.join(", ") || "No positions selected"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Pan>
      ) : table ? (
        <div className="instrumental-table">
          <table>
            <caption>
              {compact
                ? "Supplied teaching line positions"
                : "Reference and original unknown positions"}
            </caption>
            <thead>
              <tr>
                <th scope="col">Ion / record</th>
                <th scope="col">Display positions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} data-spectrum-row={r.key}>
                  <th scope="row">
                    {compact
                      ? r.label
                      : r.key in metalNames
                        ? metalNames[r.key]
                        : r.label}
                  </th>
                  <td>{r.lines.join(", ") || "No positions selected"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <p className="instrumental-small">
            Swipe sideways to inspect all positions, or focus the chart and use
            arrow keys. The same data are also available in the table below.
          </p>
          <div className="instrumental-chart">
            <div className="instrumental-row-labels" aria-hidden="true">
              {rows.map((r) => (
                <span key={r.key}>{r.label}</span>
              ))}
            </div>
            <Pan label="Aligned reference spectra; scroll horizontally with arrows or touch">
              <svg
                data-instrumental-svg="spectrum"
                viewBox={`66 0 314 ${rows.length * 42 + 54}`}
                className="instrumental-spectrum-svg"
                role="img"
                aria-label="Same-scale reference spectra, original unknown and any student proposal"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="380" height={rows.length * 42 + 54} fill="#fff" />
                {rows.map((r, i) => (
                  <g key={r.key} data-spectrum-row={r.key}>
                    <text x="0" y={i * 42 + 29} fontSize="14" fill="#23314c">
                      {r.label}
                    </text>
                    <rect
                      x="78"
                      y={i * 42 + 8}
                      width="280"
                      height="28"
                      rx="4"
                      fill={
                        r.key === "unknown"
                          ? "#e5edf9"
                          : r.key === "proposal"
                            ? "#fff0d2"
                            : "#f0f3f8"
                      }
                    />
                    {r.lines.map((p) => (
                      <line
                        key={p}
                        data-position={p}
                        x1={78 + (p - 1) * 25}
                        x2={78 + (p - 1) * 25}
                        y1={i * 42 + 11}
                        y2={i * 42 + 33}
                        stroke={
                          r.key === "proposal"
                            ? "#87540c"
                            : r.key === "unknown"
                              ? "#3545c5"
                              : "#34445b"
                        }
                        strokeWidth="3"
                      />
                    ))}
                  </g>
                ))}
                {Array.from({ length: 12 }, (_, i) => (
                  <text
                    key={i}
                    x={78 + i * 25}
                    y={rows.length * 42 + 20}
                    textAnchor="middle"
                    fontSize="15"
                    fill="#23314c"
                  >
                    {i + 1}
                  </text>
                ))}
                <text
                  x="210"
                  y={rows.length * 42 + 45}
                  textAnchor="middle"
                  fontSize="15"
                  fill="#23314c"
                >
                  Schematic display position
                </text>
              </svg>
            </Pan>
          </div>
        </>
      )}
      {!table && (
        <details>
          <summary>Read the same record as a table</summary>
          <div className="instrumental-table">
            <table>
              <caption>Same supplied positions</caption>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key}>
                    <th scope="row">
                      {r.key in metalNames ? metalNames[r.key] : r.label}
                    </th>
                    <td>{r.lines.join(", ") || "No positions selected"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      {ions !== undefined && (
        <p className="instrumental-small">
          The original unknown stays fixed. The separate proposal shows only
          your selected references; it is not a new measurement.
        </p>
      )}
    </figure>
  );
}
export function CalibrationFigure({
  data,
  concentration,
  onPoint,
}: {
  data: CalibrationData;
  concentration?: string;
  onPoint?: (x: string) => void;
}) {
  const max = data.standards.at(-1)!.concentration,
    px = (x: number) => 48 + (x / max) * 234,
    py = (y: number) => 250 - (y / data.maxResponse) * 212;
  const number =
    concentration !== undefined &&
    /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(concentration)
      ? Number(concentration)
      : NaN;
  const inRange = Number.isFinite(number) && number >= 0 && number <= max;
  return (
    <figure className="instrumental-calibration">
      <figcaption>{metalNames[data.ion] ?? data.ion} · calibration</figcaption>
      <p className="instrumental-small">{data.conditions}</p>
      <p>
        <strong>Unknown response: {data.unknown} arbitrary units.</strong>
      </p>
      <Pan label="Supplied calibration plot; scroll horizontally with arrows or touch">
        <svg
          data-instrumental-svg="calibration"
          viewBox="0 0 310 320"
          className="instrumental-calibration-svg"
          role="img"
          aria-label="Supplied calibration standards, unknown response and any student concentration marker"
          xmlns="http://www.w3.org/2000/svg"
          onPointerDown={
            onPoint
              ? (e) => {
                  const b = e.currentTarget.getBoundingClientRect(),
                    x = ((e.clientX - b.left) / b.width) * 310,
                    y = ((e.clientY - b.top) / b.height) * 320;
                  if (x < 48 || x > 282 || y < 38 || y > 250) return;
                  onPoint(String(Math.round(((x - 48) / 234) * max * 2) / 2));
                }
              : undefined
          }
        >
          <rect width="310" height="320" fill="#fff" />
          <text x="48" y="17" fontSize="14" fill="#23314c">
            Response / arbitrary units
          </text>
          {Array.from({ length: 5 }, (_, i) => (
            <g key={i}>
              <line
                x1="48"
                x2="282"
                y1={py((i * data.maxResponse) / 4)}
                y2={py((i * data.maxResponse) / 4)}
                stroke="#dce2ee"
              />
              <text
                x="41"
                y={py((i * data.maxResponse) / 4) + 5}
                textAnchor="end"
                fontSize="14"
                fill="#23314c"
              >
                {(i * data.maxResponse) / 4}
              </text>
            </g>
          ))}
          {Array.from({ length: max + 1 }, (_, i) => (
            <g key={i}>
              <line x1={px(i)} x2={px(i)} y1="38" y2="250" stroke="#e5e9f1" />
              <text
                x={px(i)}
                y="273"
                textAnchor="middle"
                fontSize="14"
                fill="#23314c"
              >
                {i}
              </text>
            </g>
          ))}
          <path
            d="M48 38V250H282"
            fill="none"
            stroke="#34445b"
            strokeWidth="2"
          />
          <polyline
            data-standard-line="true"
            points={data.standards
              .map((p) => `${px(p.concentration)},${py(p.response)}`)
              .join(" ")}
            fill="none"
            stroke="#34445b"
            strokeWidth="2"
          />
          {data.standards.map((p, i) => (
            <circle
              key={i}
              data-standard-concentration={p.concentration}
              data-standard-response={p.response}
              cx={px(p.concentration)}
              cy={py(p.response)}
              r="4"
              fill="#34445b"
            />
          ))}
          <line
            data-unknown-response={data.unknown}
            x1="48"
            x2="282"
            y1={py(data.unknown)}
            y2={py(data.unknown)}
            stroke="#3545c5"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          {inRange && (
            <g data-student-marker={concentration}>
              <line
                x1={px(number)}
                x2={px(number)}
                y1={py(data.unknown)}
                y2="250"
                stroke="#87540c"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle
                cx={px(number)}
                cy={py(data.unknown)}
                r="6"
                fill="#fff0d2"
                stroke="#87540c"
                strokeWidth="2"
              />
            </g>
          )}
          <text
            x="165"
            y="298"
            textAnchor="middle"
            fontSize="14"
            fill="#23314c"
          >
            Concentration / mg/dm³
          </text>
        </svg>
      </Pan>
      {concentration !== undefined && (
        <p data-marker-description="true">
          {!concentration
            ? "No concentration marker placed."
            : inRange
              ? `Your marker: ${concentration} mg/dm³. The dashed blue line is the original unknown response.`
              : `Your entry “${concentration}” is outside the plotted scale or is not a valid number. It is retained as entered.`}
        </p>
      )}
      <details>
        <summary>Read the supplied standards as a table</summary>
        <div className="instrumental-table">
          <table>
            <caption>Known concentration standards</caption>
            <thead>
              <tr>
                <th scope="col">Concentration / mg/dm³</th>
                <th scope="col">Response / arbitrary units</th>
              </tr>
            </thead>
            <tbody>
              {data.standards.map((p, i) => (
                <tr key={i}>
                  <td>{p.concentration}</td>
                  <td>{p.response}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
export function InstrumentalGivenFigure({
  data,
  compact = false,
}: {
  data: InstrumentalGiven;
  compact?: boolean;
}) {
  return (
    <div className="instrumental-given">
      {!compact && <h3>{data.title}</h3>}
      {data.spectrum && (
        <SpectrumFigure data={data.spectrum} compact={compact} />
      )}{" "}
      {data.calibration && <CalibrationFigure data={data.calibration} />}{" "}
      {data.rows && (
        <dl>
          {data.rows.map((r, i) => (
            <div key={i}>
              <dt>{r.label}</dt>
              <dd>{r.text}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
export function SpectrumDisplay({
  data,
  ions,
}: {
  data: SpectrumData;
  ions: string;
}) {
  const [table, setTable] = useState(data.table ?? false);
  return (
    <>
      <div
        className="instrumental-actions"
        role="group"
        aria-label="Format of supplied spectra"
      >
        <button
          type="button"
          aria-pressed={!table}
          onClick={() => setTable(false)}
        >
          Aligned chart
        </button>
        <button
          type="button"
          aria-pressed={table}
          onClick={() => setTable(true)}
        >
          Position table
        </button>
      </div>
      <SpectrumFigure data={data} ions={ions} table={table} />
    </>
  );
}
