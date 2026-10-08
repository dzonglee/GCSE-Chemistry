"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useId, useState } from "react";
import {
  practicalRecords,
  practicalPlans,
  practicalApparatus,
  practicalDilutions,
  practicalEndpoints,
  practicalPlots,
  practicalRepeats,
  type PracticalMode,
} from "../lib/rates-practical";
import {
  initialPracticalBoard,
  validPracticalBoard,
  checkPracticalBoard,
  type PracticalBoard,
} from "../lib/rates-practical-board";
import { practicalFitPoints } from "../lib/practical-fit";
import { PracticalScene3D } from "./PracticalScene3D";
type Saved = Record<string, string | number>;
const labels: Record<string, string> = {
  concentration: "Reactant concentration",
  temperature: "Temperature",
  particleSize: "Solid particle size",
  gasVolume: "Gas volume",
  endpointTime: "Time to a fixed endpoint",
  gasVolumeTime: "Gas volume at timed intervals",
  massTime: "Mass at timed intervals",
  lighting: "Lighting",
  solidMass: "Solid mass",
  none: "No supplied fault or additional changed factor",
  sameTemperature: "Use the same temperature",
  sameParticleSize: "Use the same particle size",
  sameSolidMass: "Use the same solid mass",
  sameConcentration: "Use the same concentration",
  sameLighting: "Use the same lighting",
  retainControls: "Retain these controlled conditions",
  higherConcentrationFaster: "Higher concentration: faster initial reaction",
  smallerParticlesFaster: "Smaller particles: faster initial reaction",
  higherTemperatureFaster: "Higher temperature: faster initial reaction",
  higherConcentrationShorter: "Higher concentration: shorter endpoint time",
  higherConcentrationSlower: "Higher concentration: slower initial reaction",
  leak: "Gas leaks at the connection",
  stuckPiston: "Syringe piston cannot move freely",
  delay: "Sealing and timing begin late",
  sealedMass: "Gas cannot escape from the weighed apparatus",
  sealConnection: "Make the delivery connections gas-tight",
  freePiston: "Support the syringe without jamming the piston",
  startWithMixing: "Synchronise mixing, sealing and timing",
  allowGasEscape: "Use the appropriate open gas path for mass loss",
  retainSetup: "Retain this working arrangement",
  volumeTime: "Gas volume against elapsed time",
  gasUnderestimated: "Some gas escapes unmeasured: collected volume is too low",
  unreliableVolume:
    "Piston movement is unreliable; the reading cannot track gas freely",
  earlyEvidenceLost: "Early gas/time evidence is lost",
  gasDisplacesWater: "Collected gas displaces water in the cylinder",
  gasEscapesMassFalls: "Gas escapes, so balance mass falls",
  sealedMassUnchanged: "Whole sealed apparatus retains its mass",
  gasCreatesMass: "Producing gas creates extra total mass",
  beforeAcid: "Premix concentration before adding acid",
  afterAcid: "Reaction-mixture concentration after adding acid",
  sameBoth: "Both concentrations are exactly the same",
  sampleInterval:
    "Endpoint lies between the last visible/above-threshold and first reached sample",
  recordedEndpoint:
    "A separate continuous endpoint time is explicitly recorded",
  exactSampleEndpoint:
    "The first reached sample is the exact continuous disappearance time",
  productVolumeRate: "Reciprocal time is a measured product-volume rate",
  smoothPlateau: "Smooth increasing best-fit curve towards a plateau",
  smoothFalling: "Smooth decreasing best-fit curve towards a plateau",
  investigateSmooth:
    "Keep the suspect point visible; investigate and fit the supported smooth trend",
  joinEveryPoint: "Join every observation, bending towards the suspect point",
  straightRising: "Use a straight-line fit throughout",
  all: "All original trials",
  omit0: "Exclude trial 1 with a documented reason",
  omit1: "Exclude trial 2 with a documented reason",
  omit2: "Exclude trial 3 with a documented reason",
  excludeIdentified:
    "Follow the explicitly identified anomaly exclusion for the requested mean",
  excludeDocumented:
    "Exclude the documented invalid trial; retain its raw record",
  investigateRetain:
    "Retain the original results and investigate/repeat the suspect trial",
  retainAll: "Retain all valid original trials",
  systematicFault: "Agreement does not repair the common systematic fault",
  discardInconvenient: "Delete any result that makes the trend less tidy",
  synchroniseStart: "Start timing consistently when mixing begins",
  investigateRepeat: "Check the method and obtain further evidence",
  repeatCompare: "Use repeated trials to assess random variation",
  repairLeak: "Repair and check the gas leak before repeating",
  preventSpray: "Prevent spray loss while allowing gas to escape",
  reproducibility: "Compare valid results obtained by different groups",
};
const titles: Record<PracticalMode, string> = {
  plan: "Construct a fair comparison",
  apparatus: "Inspect the measurement path",
  dilution: "Prepare a controlled dilution",
  endpoint: "Use a consistent endpoint",
  plot: "Construct the evidence graph",
  repeats: "Evaluate original repeated measurements",
};
export function RatesPracticalWorkbench({
  mode,
  history,
  onChange,
  record: original = "initial",
  instruction,
}: {
  mode: PracticalMode;
  history: Saved[];
  onChange: (v: Saved[]) => void;
  record?: string;
  instruction?: string;
}) {
  const uid = useId(),
    value = (history.at(-1) ??
      initialPracticalBoard(mode, original)) as PracticalBoard;
  const [raw, setRaw] = useWorkbenchInputDraft<PracticalBoard | null>(null),
    [feedback, setFeedback] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    [sample, setSample] = useState(0);
  const b = raw ?? value,
    id = b.record;
  function append(next: PracticalBoard) {
    if (
      history.length < 500 &&
      Object.keys(next).some((k) => next[k] !== value[k])
    )
      onChange([...history, next]);
  }
  function update(k: string, v: string) {
    const next = { ...b, [k]: v };
    setFeedback(null);
    if (validPracticalBoard(mode, next)) {
      setRaw(null);
      append(next);
    } else setRaw(next);
  }
  function select(k: string, label: string, options: string[]) {
    return (
      <div key={k}>
        <label htmlFor={uid + "-" + k}>{label}</label>
        <select
          id={uid + "-" + k}
          value={b[k]}
          onChange={(e) => update(k, e.target.value)}
        >
          <option value="">Choose your conclusion</option>
          {options.map((v) => (
            <option key={v} value={v}>
              {labels[v] ?? v}
            </option>
          ))}
        </select>
        {b[k] && (
          <p className="practical-selection">
            Selected: {labels[b[k]] ?? b[k]}
          </p>
        )}
      </div>
    );
  }
  function number(k: string, label: string) {
    return (
      <div key={k}>
        <label htmlFor={uid + "-" + k}>{label}</label>
        <input
          id={uid + "-" + k}
          inputMode="decimal"
          value={b[k]}
          onChange={(e) => update(k, e.target.value)}
        />
      </div>
    );
  }
  let content;
  if (mode === "plan") {
    const r = practicalPlans[id];
    content = (
      <>
        <h3>{r.question}</h3>
        <div
          className="practical-scroll"
          role="region"
          aria-label="Proposed comparison conditions"
          tabIndex={0}
        >
          <table>
            <caption>
              Proposed comparison: find the additional changed condition
            </caption>
            <thead>
              <tr>
                <th>Condition</th>
                <th>Run A</th>
                <th>Run B</th>
              </tr>
            </thead>
            <tbody>
              {r.rows.map(([label, a, c]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>{a}</td>
                  <td>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="practical-fields">
          {select("dependent", "Measurement used to compare rates", [
            "gasVolumeTime",
            "massTime",
            "endpointTime",
            "temperature",
          ])}
          {select("confound", "Additional changed condition", [
            "temperature",
            "particleSize",
            "solidMass",
            "concentration",
            "lighting",
            "none",
          ])}
          {select("repair", "Repair the comparison", [
            "sameTemperature",
            "sameParticleSize",
            "sameSolidMass",
            "sameConcentration",
            "sameLighting",
            "retainControls",
          ])}
          {select("hypothesis", "Testable prediction", [
            "higherConcentrationFaster",
            "smallerParticlesFaster",
            "higherTemperatureFaster",
            "higherConcentrationShorter",
            "higherConcentrationSlower",
          ])}
        </div>
      </>
    );
  }
  if (mode === "apparatus") {
    const r = practicalApparatus[id];
    content = (
      <>
        <p className="practical-equation">{r.reaction}</p>
        <p>{r.note}</p>
        {r.method === "syringe" && <PracticalScene3D record={r} />}
        <figure>
          {r.method === "water" && <p>Collected gas volume / cm³</p>}
          <svg
            viewBox={r.method === "water" ? "0 0 480 320" : "0 0 480 180"}
            role="img"
            aria-label={
              r.method === "mass"
                ? "Balance readings supplied in the description"
                : `${r.method === "water" ? "Inverted cylinder" : "Syringe"} reading. Scale labels every 10 cubic centimetres, minor divisions ${r.division} cubic centimetres.`
            }
          >
            {r.method === "mass" ? (
              <>
                <rect
                  x="110"
                  y="35"
                  width="260"
                  height="95"
                  rx="14"
                  fill="#eef1fb"
                  stroke="#334155"
                />
                <text x="160" y="90">
                  {r.title === "Sealed flask on a balance" ? "125.4" : "125.0"}{" "}
                  g
                </text>
                <text x="100" y="164">
                  Initial reading: 125.4 g
                </text>
              </>
            ) : r.method === "water" ? (
              <>
                <path
                  d="M210 270 V30 H280 V270"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="3"
                />
                <rect
                  x="212"
                  y="32"
                  width="66"
                  height={Math.max(0, r.gasReading * 4 - 2)}
                  fill="#f7dc69"
                />
                <rect
                  x="212"
                  y={30 + r.gasReading * 4}
                  width="66"
                  height={240 - r.gasReading * 4}
                  fill="#d7e9f4"
                />
                {Array.from({ length: 31 }, (_, i) => (
                  <line
                    key={i}
                    data-scale-tick={i * 2}
                    x1="210"
                    x2={i % 5 === 0 ? 235 : 223}
                    y1={30 + i * 8}
                    y2={30 + i * 8}
                    stroke="#334155"
                  />
                ))}
                {Array.from({ length: 7 }, (_, i) => (
                  <text key={i} x="180" y={42 + i * 40} textAnchor="end">
                    {i * 10}
                  </text>
                ))}
                <line
                  data-scale-boundary
                  x1="210"
                  x2="280"
                  y1={30 + r.gasReading * 4}
                  y2={30 + r.gasReading * 4}
                  stroke="#2434bb"
                  strokeWidth="4"
                />
              </>
            ) : (
              <>
                <rect
                  x="55"
                  y="55"
                  width="360"
                  height="58"
                  fill="#f5f6fc"
                  stroke="#334155"
                />
                <rect
                  x="55"
                  y="57"
                  width={(r.gasReading / 60) * 360}
                  height="54"
                  fill="#f7dc69"
                />
                {Array.from({ length: 31 }, (_, i) => (
                  <line
                    key={i}
                    data-scale-tick={i * 2}
                    x1={55 + i * 12}
                    x2={55 + i * 12}
                    y1="55"
                    y2={i % 5 === 0 ? 83 : 70}
                    stroke="#334155"
                  />
                ))}
                {Array.from({ length: 7 }, (_, i) => (
                  <text key={i} x={55 + i * 60} y="40" textAnchor="middle">
                    {i * 10}
                  </text>
                ))}
                <line
                  data-scale-boundary
                  x1={55 + (r.gasReading / 60) * 360}
                  x2={55 + (r.gasReading / 60) * 360}
                  y1="55"
                  y2="113"
                  stroke="#2434bb"
                  strokeWidth="4"
                />
                <text x="120" y="155">
                  Collected gas / cm³
                </text>
              </>
            )}
          </svg>
          <figcaption>
            {r.method === "mass"
              ? "Calculate the decrease in the whole-apparatus reading."
              : "Read the marked gas boundary on this 2D supplied scale. The drawing is not a kinetic simulation."}
          </figcaption>
        </figure>
        <div className="practical-fields">
          {number("reading", "Measured " + r.unit)}
          {select("signal", "What should be recorded over time?", [
            "volumeTime",
            "massTime",
            "endpointTime",
          ])}
          {select("fault", "Identify the supplied measurement fault", [
            "leak",
            "stuckPiston",
            "delay",
            "sealedMass",
            "none",
          ])}
          {select("correction", "Choose the appropriate correction", [
            "sealConnection",
            "freePiston",
            "startWithMixing",
            "allowGasEscape",
            "retainSetup",
          ])}
          {select("consequence", "Explain the reading or fault", [
            "gasUnderestimated",
            "unreliableVolume",
            "earlyEvidenceLost",
            "gasDisplacesWater",
            "gasEscapesMassFalls",
            "sealedMassUnchanged",
            "gasCreatesMass",
          ])}
        </div>
        <p className="practical-note">
          School practical context: use eye protection. Gas tubing must not be
          blocked. Hydrogen is flammable; keep ignition sources away. These are
          supplied observations for analysis.
        </p>
      </>
    );
  }
  if (mode === "dilution") {
    const r = practicalDilutions[id];
    const amountsValid =
      /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(b.stock) &&
      /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(b.water);
    const stockAmount = amountsValid ? Number(b.stock) : 0,
      waterAmount = amountsValid ? Number(b.water) : 0,
      unfilled = Math.max(0, r.total - stockAmount - waterAmount);
    content = (
      <>
        <p>
          Stock thiosulfate:{" "}
          <strong>
            {r.stock} {r.unit}
          </strong>
          . Target premix:{" "}
          <strong>
            {r.target} {r.unit}
          </strong>
          , in <strong>{r.total} cm³</strong>. The same{" "}
          <strong>{r.acid} cm³ acid</strong> will then be added to each run.
        </p>
        <p>
          Premix concentration = stock concentration × stock volume ÷ total
          premix volume. Construct the stock and water amounts. Volumes are
          assumed additive. The target concentration describes the premix before
          adding acid.
        </p>
        <div className="practical-dilution" aria-hidden="true">
          <div
            style={{
              width: `${Math.min((stockAmount / r.total) * 100, 100)}%`,
            }}
          >
            {stockAmount / r.total >= 0.2 ? "Stock" : ""}
          </div>
          <div
            style={{
              width: `${Math.min((waterAmount / r.total) * 100, 100)}%`,
            }}
          >
            {waterAmount / r.total >= 0.2 ? "Water" : ""}
          </div>
          <div
            className="practical-unfilled"
            style={{ width: `${(unfilled / r.total) * 100}%` }}
          >
            {unfilled / r.total >= 0.2 ? "Unfilled" : ""}
          </div>
        </div>
        <p>
          {amountsValid
            ? `Your selected stock + water: ${stockAmount + waterAmount} cm³; required premix total: ${r.total} cm³.`
            : "Complete ordinary stock and water values to display their total."}{" "}
          {stockAmount + waterAmount > r.total
            ? "The selected total exceeds the fixed capacity; the bar is clipped to that capacity."
            : ""}
        </p>
        <div className="practical-fields">
          {number("stock", "Stock solution / cm³")}
          {number("water", "Water / cm³")}
          {number("premix", "Premix concentration / " + r.unit)}
          {number("combinedVolume", "Total volume after acid / cm³")}
          {select("label", "Which mixture does the target label describe?", [
            "beforeAcid",
            "afterAcid",
            "sameBoth",
          ])}
        </div>
        <p>
          Adding acid increases total volume, so the thiosulfate concentration
          immediately after mixing is lower than its premix label. Use the same
          acid concentration and volume throughout.
        </p>
      </>
    );
  }
  if (mode === "endpoint") {
    const r = practicalEndpoints[id],
      s = Math.min(sample, r.times.length - 1);
    content = (
      <>
        <p>
          Same flask, depth, viewing direction, printed cross, lighting and
          reaction conditions.{" "}
          {r.method === "sensor"
            ? `Fixed endpoint: light reaching sensor at or below ${r.threshold}%.`
            : "Fixed endpoint: the printed cross can no longer be seen."}{" "}
          {r.issue === "recorded"
            ? "In addition to the samples, a continuous observer record states that the cross disappeared at exactly 25 s."
            : "These are discrete samples; they locate a time interval rather than an exact continuous endpoint."}
        </p>
        <section
          className="practical-observation"
          aria-label="Selected supplied endpoint observation"
        >
          <h3>Sample at {r.times[s]} s</h3>
          {r.method === "cross" ? (
            <>
              <div className="practical-cross" aria-hidden="true">
                {r.visible![s] ? "×" : "Cloudy"}
              </div>
              <p>
                {r.visible![s]
                  ? "Cross still visible"
                  : "Cross no longer visible"}
              </p>
            </>
          ) : (
            <p>
              Light reaching sensor: <strong>{r.light![s]}%</strong>
            </p>
          )}
          <div className="model-controls">
            <button
              type="button"
              disabled={s === 0}
              onClick={() => setSample(s - 1)}
            >
              Previous observation
            </button>
            <button
              type="button"
              disabled={s === r.times.length - 1}
              onClick={() => setSample(s + 1)}
            >
              Next observation
            </button>
          </div>
        </section>
        <table>
          <caption>Original supplied observations</caption>
          <thead>
            <tr>
              <th>Time / s</th>
              <th>{r.method === "cross" ? "Cross visible?" : "Light / %"}</th>
            </tr>
          </thead>
          <tbody>
            {r.times.map((t, i) => (
              <tr key={t}>
                <th scope="row">{t}</th>
                <td>
                  {r.method === "cross"
                    ? r.visible![i]
                      ? "Yes"
                      : "No"
                    : r.light![i]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="practical-fields">
          {number("sample", "First sampled time at endpoint / s")}
          {number("lower", "Lower endpoint bound / s")}
          {number("upper", "Upper endpoint bound or recorded time / s")}
          {number(
            "proxy",
            "Relative-rate proxy 1/t / s⁻¹ (use upper bound or recorded time)",
          )}
          {number(
            "ratio",
            `Proxy divided by a comparison using ${r.comparisonTime} s`,
          )}
          {select("interpretation", "What do these timings establish?", [
            "sampleInterval",
            "recordedEndpoint",
            "exactSampleEndpoint",
            "productVolumeRate",
          ])}
        </div>
        <p className="practical-note">
          1/t compares relative rate only for a consistent endpoint and
          comparable method; it is not gas volume per second. Sulfur dioxide
          forms in the school turbidity practical: ventilation and avoiding
          inhalation matter.
        </p>
      </>
    );
  }
  if (mode === "plot") {
    const r = practicalPlots[id],
      n = Number(b.selected),
      min = r.quantity === "Balance mass" ? 124.8 : 0,
      stepY = r.unit === "g" ? 0.1 : r.unit === "%" ? 2 : 2,
      gridStep = r.unit === "g" ? 0.2 : r.unit === "%" ? 20 : 10,
      gridTicks = Array.from(
        { length: Math.round((r.max - min) / gridStep) + 1 },
        (_, i) => Number((min + i * gridStep).toFixed(1)),
      ),
      stepX = r.times[1],
      x = (v: number) => 150 + (v / r.times.at(-1)!) * 350,
      y = (v: number) => 205 - ((v - min) / (r.max - min)) * 155;
    function place(px: number, py: number) {
      const next = {
        ...b,
        ["x" + n]: String(px),
        ["y" + n]: String(py),
        ["placed" + n]: "yes",
      };
      setFeedback(null);
      if (validPracticalBoard(mode, next)) {
        setRaw(null);
        append(next);
      }
    }
    const fitPoints = practicalFitPoints(r, b);
    const points = r.times.flatMap((_, i) =>
        b["placed" + i] === "yes"
          ? [{ i, x: Number(b["x" + i]), y: Number(b["y" + i]) }]
          : [],
      ),
      inBounds = (p: { x: number; y: number }) =>
        p.x >= 0 && p.x <= r.times.at(-1)! && p.y >= min && p.y <= r.max;
    content = (
      <>
        <p>
          {r.note} Plot all original observations, including any suspect point.
          Select a point, enter coordinates or tap the graph, then place it.
        </p>
        <table>
          <caption>Original {r.quantity.toLowerCase()} observations</caption>
          <thead>
            <tr>
              <th>Point</th>
              <th>Time / s</th>
              <th>
                {r.quantity} / {r.unit}
              </th>
            </tr>
          </thead>
          <tbody>
            {r.times.map((t, i) => (
              <tr key={t}>
                <th scope="row">{i + 1}</th>
                <td>{t}</td>
                <td>{r.readings[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Vertical axis bounds: {min} to {r.max} {r.unit}. Horizontal grid
          spacing: {gridStep} {r.unit}.
        </p>
        <p className="practical-chart-heading">
          {r.quantity} / {r.unit}
          {min > 0 ? ` (axis starts at ${min}, not zero)` : ""}
        </p>
        <figure>
          <svg
            viewBox="0 0 560 300"
            role="img"
            aria-label="Constructed graph; tap to place the selected point or use the coordinate fields and direction buttons."
            onClick={(e) => {
              if (raw) return;
              const rect = e.currentTarget.getBoundingClientRect(),
                sx = ((e.clientX - rect.left) * 560) / rect.width,
                sy = ((e.clientY - rect.top) * 300) / rect.height;
              const px =
                  Math.round((((sx - 150) / 350) * r.times.at(-1)!) / stepX) *
                  stepX,
                py =
                  Math.round(
                    (min + ((205 - sy) / 155) * (r.max - min)) / stepY,
                  ) * stepY;
              place(
                Math.max(0, Math.min(r.times.at(-1)!, px)),
                Number(Math.max(min, Math.min(r.max, py)).toFixed(4)),
              );
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i}>
                <line
                  x1={150 + i * 70}
                  y1="50"
                  x2={150 + i * 70}
                  y2="205"
                  stroke="#e1e5f0"
                />
                <text x={150 + i * 70} y="241" textAnchor="middle">
                  {Number(((r.times.at(-1)! * i) / 5).toFixed(1))}
                </text>
              </g>
            ))}
            {gridTicks.map((v, i) => (
              <g key={v}>
                <line x1="150" x2="500" y1={y(v)} y2={y(v)} stroke="#e1e5f0" />
                {[
                  0,
                  Math.floor((gridTicks.length - 1) / 2),
                  gridTicks.length - 1,
                ].includes(i) && (
                  <text x="140" y={y(v) + 6} textAnchor="end">
                    {v}
                  </text>
                )}
              </g>
            ))}
            <path d="M150 50 V205 H500" fill="none" stroke="#66768f" />
            <text x="250" y="277">
              Time / s
            </text>
            {fitPoints && (
              <polyline
                points={fitPoints
                  .filter(inBounds)
                  .map((p) => `${x(p.x)},${y(p.y)}`)
                  .join(" ")}
                fill="none"
                stroke="#bd8417"
                strokeWidth="4"
              />
            )}
            {points.filter(inBounds).map((p) => (
              <g key={p.i}>
                <circle
                  cx={x(p.x)}
                  cy={y(p.y)}
                  r={p.i === n ? 9 : 6}
                  fill={p.i === n ? "#c3901a" : "#3444c8"}
                />
                <title>
                  Point {p.i + 1}: {p.x} s, {p.y} {r.unit}
                </title>
              </g>
            ))}
          </svg>
          <figcaption>
            {points.length} of 6 original points placed.{" "}
            {points.some((p) => !inBounds(p))
              ? "Some constructed coordinates are outside the plotted axes; correct the saved values."
              : ""}{" "}
            Your points are not automatically moved onto the readings.
          </figcaption>
        </figure>
        <label htmlFor={uid + "-selected"}>Choose point to construct</label>
        <select
          id={uid + "-selected"}
          value={b.selected}
          onChange={(e) => update("selected", e.target.value)}
        >
          {r.times.map((_, i) => (
            <option key={i} value={i}>
              Point {i + 1}
              {b["placed" + i] === "yes" ? " — placed" : " — not placed"}
            </option>
          ))}
        </select>
        <div className="practical-fields">
          {number("x" + n, "Selected point: time / s")}
          {number("y" + n, "Selected point: " + r.quantity + " / " + r.unit)}
        </div>
        <div className="model-controls">
          <button
            type="button"
            disabled={raw !== null}
            onClick={() =>
              update("x" + n, String(Math.max(0, Number(b["x" + n]) - stepX)))
            }
          >
            Move left
          </button>
          <button
            type="button"
            disabled={raw !== null}
            onClick={() => update("x" + n, String(Number(b["x" + n]) + stepX))}
          >
            Move right
          </button>
          <button
            type="button"
            disabled={raw !== null}
            onClick={() =>
              update(
                "y" + n,
                String(Number((Number(b["y" + n]) + stepY).toFixed(4))),
              )
            }
          >
            Move up
          </button>
          <button
            type="button"
            disabled={raw !== null}
            onClick={() =>
              update(
                "y" + n,
                String(
                  Math.max(0, Number((Number(b["y" + n]) - stepY).toFixed(4))),
                ),
              )
            }
          >
            Move down
          </button>
          <button
            type="button"
            disabled={raw !== null}
            onClick={() => update("placed" + n, "yes")}
          >
            Place selected point
          </button>
        </div>
        <div className="practical-fields">
          {select("fit", "Choose a justified best-fit treatment", [
            "smoothPlateau",
            "smoothFalling",
            "investigateSmooth",
            "joinEveryPoint",
            "straightRising",
          ])}
          {number(
            "rate",
            `Magnitude of mean change from ${r.from} to ${r.to} s / ${r.unit}/s`,
          )}
        </div>
        <button
          type="button"
          disabled={raw !== null || !b.fit}
          onClick={() => update("fitView", b.fitView === "yes" ? "" : "yes")}
        >
          {b.fitView === "yes"
            ? "Hide chosen fit preview"
            : "Show chosen fit preview"}
        </button>
        {b.fitView === "yes" && (
          <p>
            {fitPoints
              ? "Gold: an illustrative smoothing or line preview of your constructed points and chosen treatment. Original blue points remain visible. This is not a unique statistical or examiner fit."
              : "Place six distinct horizontal coordinates before previewing a fit."}
          </p>
        )}
        <p>
          The chosen fit describes how to treat the observations. It does not
          replace any raw point. An optical percentage change is a signal change
          per second, not product mass or volume rate.
        </p>
      </>
    );
  }
  if (mode === "repeats") {
    const r = practicalRepeats[id],
      omit = b.selection.startsWith("omit") ? Number(b.selection.slice(4)) : -1;
    content = (
      <>
        <p>{r.note}</p>
        <table>
          <caption>
            Original repeated measurements — values remain visible
          </caption>
          <thead>
            <tr>
              <th>Trial</th>
              <th>Reading / {r.unit}</th>
              <th>Your mean selection</th>
            </tr>
          </thead>
          <tbody>
            {r.readings.map((v, i) => (
              <tr key={i}>
                <th scope="row">{i + 1}</th>
                <td>{v}</td>
                <td>
                  {b.selection
                    ? omit === i
                      ? "Excluded; raw record retained"
                      : "Included"
                    : "Undecided"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="practical-fields">
          {select("selection", "Choose trials for the stated calculation", [
            "all",
            "omit0",
            "omit1",
            "omit2",
          ])}
          {number("mean", "Mean of declared included trials / " + r.unit)}
          {number("range", "Range of declared included trials / " + r.unit)}
          {select("decision", "Justify the treatment", [
            "excludeDocumented",
            "excludeIdentified",
            "investigateRetain",
            "retainAll",
            "systematicFault",
            "discardInconvenient",
          ])}
          {select("improvement", "Relevant improvement or comparison", [
            "synchroniseStart",
            "investigateRepeat",
            "repeatCompare",
            "repairLeak",
            "preventSpray",
            "reproducibility",
          ])}
        </div>
        <p>
          Close repeats indicate agreement; they do not by themselves establish
          accuracy. Follow a question’s explicit anomaly instruction or
          justified criterion for its requested mean. Report exclusions and
          reasons, and keep the original evidence.
        </p>
      </>
    );
  }
  return (
    <section
      className="model task-workbench practical-workbench"
      aria-label="Task model"
    >
      {mode === "plan" &&
        select("independent", "Deliberately changed variable", [
          "concentration",
          "temperature",
          "particleSize",
          "gasVolume",
          "endpointTime",
        ])}
      <h3>{instruction ?? titles[mode]}</h3>
      {content}
      <div className="model-controls">
        <button
          type="button"
          className="button"
          onClick={() =>
            setFeedback({
              correct: checkPracticalBoard(mode, b),
              message: checkPracticalBoard(mode, b)
                ? (
                    {
                      plan: "The comparison isolates the intended variable after the stated repair, with an appropriate measurement and testable prediction.",
                      apparatus:
                        "The supplied reading, measurement path and fault explanation are consistent. Gas volume and mass-loss setups need different gas paths.",
                      dilution:
                        "Stock plus water gives the fixed premix volume and requested concentration. The label is before adding acid; acid increases the final volume.",
                      endpoint:
                        "The first sampled endpoint, timing bounds and reciprocal-time comparison are consistent. This is a fixed-endpoint relative-rate proxy.",
                      plot: "All six original observations are plotted at their supplied coordinates. The fit treatment and interval-change magnitude use the correct units; the raw points are retained.",
                      repeats:
                        "The declared trials, mean, range and evidence-based decision agree. Raw observations remain visible; repeats alone cannot repair a systematic fault.",
                    } as Record<PracticalMode, string>
                  )[mode]
                : (
                    {
                      plan: "Separate the deliberately changed and measured variables. Find any additional changed condition and select a repair that controls it.",
                      apparatus:
                        "Read the supplied scale or mass decrease, then follow the gas path. A volume measurement needs gas captured; mass loss requires gas to escape.",
                      dilution:
                        "Check stock plus water against the fixed total. Use the stock concentration times its share of premix volume, and distinguish before and after adding acid.",
                      endpoint:
                        "Use the first reached sample and the preceding sample to bound disappearance unless a separate endpoint is recorded. Use seconds and the stated upper/recorded time for 1/t.",
                      plot: "Plot every original reading, using time horizontally and the named quantity vertically. Check unit scaling, fit treatment and change divided by elapsed time.",
                      repeats:
                        "Use only the declared included trials for mean and range. An exclusion needs the supplied evidence or explicit anomaly instruction; close repeats do not remove a common fault.",
                    } as Record<PracticalMode, string>
                  )[mode],
            })
          }
        >
          Check model
        </button>
        <button
          type="button"
          disabled={!raw && history.length <= 1}
          onClick={() => {
            setFeedback(null);
            if (raw) setRaw(null);
            else onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => {
            setFeedback(null);
            setRaw(null);
            setSample(0);
            onChange([initialPracticalBoard(mode, original)]);
          }}
        >
          Reset model
        </button>
      </div>
      {raw && (
        <p role="status">
          Use ordinary non-negative decimal numbers. Fractions, exponents and
          incomplete entries remain visible but are not saved as model
          predictions.
        </p>
      )}
      {feedback && (
        <div
          role="status"
          className={
            "feedback " + (feedback.correct ? "correct" : "incorrect retry")
          }
        >
          {feedback.message}
        </div>
      )}
      <details>
        <summary>Choose another supplied comparison</summary>
        <label htmlFor={uid + "-record"}>Supplied comparison</label>
        <select
          id={uid + "-record"}
          value={id}
          onChange={(e) => {
            if (e.target.value === value.record) return;
            setFeedback(null);
            setRaw(null);
            setSample(0);
            append(initialPracticalBoard(mode, e.target.value));
          }}
        >
          {Object.entries(practicalRecords[mode]).map(([k, r]) => (
            <option key={k} value={k}>
              {r.title}
            </option>
          ))}
        </select>
      </details>
    </section>
  );
}
