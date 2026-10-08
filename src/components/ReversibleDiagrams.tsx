import type {
  EvidenceRecord,
  TurnoverRecord,
  EnergyRecord,
} from "../lib/reversible-equilibrium";
import { tokenSnapshot } from "../lib/reversible-equilibrium";
export function TurnoverMap({
  record,
  step,
}: {
  record: TurnoverRecord;
  step: number;
}) {
  const tokens = tokenSnapshot(record, step),
    a = tokens.filter((x) => x.state === "A").length;
  return (
    <figure className="reversible-token-figure">
      <div
        className="reversible-vessel"
        aria-label="Closed schematic vessel: conserved numbered tokens"
      >
        <div className="reversible-token-grid">
          {tokens.map((x) => (
            <span
              key={x.id}
              className={`reversible-token ${x.state === "A" ? "token-a" : "token-b"} ${x.changed ? "token-changed" : ""}`}
              aria-label={`Token ${x.id}: ${x.state}${x.changed ? ", changed direction this interval" : ""}`}
            >
              <b>{x.state}</b>
              <small>{x.id}</small>
            </span>
          ))}
        </div>
      </div>
      {step > 0 && (
        <p>
          Latest interval: A → B tokens{" "}
          {tokens
            .filter((x) => x.changed && x.state === "B")
            .map((x) => x.id)
            .join(", ") || "none"}
          ; B → A tokens{" "}
          {tokens
            .filter((x) => x.changed && x.state === "A")
            .map((x) => x.id)
            .join(", ") || "none"}
          .
        </p>
      )}
      <figcaption>
        Constructed 1:1 A ⇌ B, fixed closed volume. Each numbered token retains
        the same conserved material; its A/B identity can change. Outlined
        tokens changed in the last interval. This is not a real molecule,
        spatial trajectory or measured rate law.
      </figcaption>
      <table>
        <caption>Amounts and gross reaction events</caption>
        <thead>
          <tr>
            <th>Quantity</th>
            <th>Initially</th>
            <th>Now</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>A tokens</th>
            <td>{record.a}</td>
            <td>{a}</td>
          </tr>
          <tr>
            <th>B tokens</th>
            <td>{record.b}</td>
            <td>{tokens.length - a}</td>
          </tr>
          <tr>
            <th>A → B events</th>
            <td>0</td>
            <td>{record.forward * step}</td>
          </tr>
          <tr>
            <th>B → A events</th>
            <td>0</td>
            <td>{record.reverse * step}</td>
          </tr>
        </tbody>
      </table>
    </figure>
  );
}
export function ReversalEnergy({
  record,
  direction,
}: {
  record: EnergyRecord;
  direction: string;
}) {
  const left = direction === "reverse" ? record.right : record.left,
    right = direction === "reverse" ? record.left : record.right,
    max = Math.max(left, right) + 20;
  const y = (n: number) => 175 - (n / max) * 140;
  return (
    <figure>
      <svg
        viewBox="0 0 350 220"
        role="img"
        aria-label={`Selected ${direction} energy endpoints, ${left} to ${right} kJ for the reference batch`}
      >
        <line x1="42" y1="22" x2="42" y2="180" stroke="currentColor" />
        <text x="43" y="18">
          Energy / kJ
        </text>
        {[0, max / 2, max].map((v) => (
          <g key={v}>
            <line x1="39" y1={y(v)} x2="44" y2={y(v)} stroke="currentColor" />
            <text x="34" y={y(v) + 4} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        <line
          x1="60"
          y1={y(left)}
          x2="150"
          y2={y(left)}
          stroke="#3544c9"
          strokeWidth="3"
        />
        <line
          x1="218"
          y1={y(right)}
          x2="320"
          y2={y(right)}
          stroke="#08756f"
          strokeWidth="3"
        />
        <line
          x1="184"
          y1={y(left)}
          x2="184"
          y2={y(right)}
          stroke="#967323"
          strokeWidth="2"
        />
        <path
          d={`M178 ${y(right) + (right > left ? 7 : -7)} L184 ${y(right)} L190 ${y(right) + (right > left ? 7 : -7)}`}
          fill="none"
          stroke="#967323"
          strokeWidth="2"
        />
        <text x="65" y={y(left) + 18}>
          Start {left}
        </text>
        <text x="221" y={y(right) + 18}>
          End {right}
        </text>
        <text x="178" y="210" textAnchor="middle">
          Selected direction of change
        </text>
      </svg>
      <figcaption>
        Relative energy endpoints for a reference batch containing{" "}
        {record.amount} g of total reacting material, including all substances
        on either side. Target batch: {record.targetAmount} g of the same total
        material. Reverse swaps endpoints. No activation peak is supplied;
        endpoint change is not activation energy.
      </figcaption>
    </figure>
  );
}
function SeriesPlot({
  times,
  first,
  second,
  maximum,
  title,
  unit,
  labels,
}: {
  times: number[];
  first: number[];
  second: number[];
  maximum: number;
  title: string;
  unit: string;
  labels: [string, string];
}) {
  const x = (t: number) => 44 + (t / Math.max(...times)) * 265,
    y = (v: number) => 170 - (v / maximum) * 125;
  return (
    <figure>
      <svg
        viewBox="0 0 350 220"
        role="img"
        aria-label={`${title}; blue ${labels[0]}, dashed green ${labels[1]}. Exact supplied readings in table below.`}
      >
        <text x="44" y="17">
          {unit}
        </text>
        <line x1="44" y1="35" x2="44" y2="171" stroke="currentColor" />
        <line x1="44" y1="171" x2="320" y2="171" stroke="currentColor" />
        {[0, maximum / 2, maximum].map((v) => (
          <g key={v}>
            <line x1="44" y1={y(v)} x2="320" y2={y(v)} stroke="#e2e6ee" />
            <text x="36" y={y(v) + 4} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {times.map((t) => (
          <text key={t} x={x(t)} y="191" textAnchor="middle">
            {t}
          </text>
        ))}
        {[first, second].map((data, i) => (
          <g key={i}>
            <polyline
              points={data.map((v, j) => `${x(times[j])},${y(v)}`).join(" ")}
              fill="none"
              stroke={i ? "#08756f" : "#3544c9"}
              strokeWidth="3"
              strokeDasharray={i ? "6 4" : undefined}
            />
            {data.map((v, j) => (
              <circle
                key={j}
                cx={x(times[j])}
                cy={y(v)}
                r={i ? 3 : 4}
                fill={i ? "#08756f" : "#3544c9"}
              />
            ))}
          </g>
        ))}
        <text x="180" y="214" textAnchor="middle">
          Time / s
        </text>
      </svg>
      <figcaption>
        {title}: blue solid {labels[0]}; green dashed {labels[1]}. Lines join
        supplied illustrative readings; they are not a fitted kinetic law.
      </figcaption>
      <table>
        <caption>{title} readings</caption>
        <thead>
          <tr>
            <th>Time / s</th>
            <th>{labels[0]}</th>
            <th>{labels[1]}</th>
          </tr>
        </thead>
        <tbody>
          {times.map((t, i) => (
            <tr key={t}>
              <th>{t}</th>
              <td>{first[i]}</td>
              <td>{second[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
export function EquilibriumTraces({ record: r }: { record: EvidenceRecord }) {
  return (
    <div className="reversible-traces">
      <SeriesPlot
        times={r.times}
        first={r.a}
        second={r.b}
        maximum={20}
        title="Amounts"
        unit="Illustrative amount / tokens"
        labels={["A", "B"]}
      />
      <SeriesPlot
        times={r.times}
        first={r.forward}
        second={r.reverse}
        maximum={Math.max(2, ...r.forward, ...r.reverse)}
        title="Directional rates"
        unit="Illustrative events per second"
        labels={["Forward", "Reverse"]}
      />
      <p>
        System boundary:{" "}
        {r.closed
          ? "closed — reacting matter retained"
          : "open — external flow"}
        . Amount traces and gross rates are different quantities.
      </p>
    </div>
  );
}
