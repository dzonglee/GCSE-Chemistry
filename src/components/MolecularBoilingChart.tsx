import { unbranchedAlkaneBoilingData } from "@/lib/molecular-properties";
export function MolecularBoilingChart() {
  const x = (t: number) => 45 + ((t + 100) / 110) * 330;
  return (
    <figure className="molecular-phase-diagram">
      <svg
        viewBox="0 0 420 170"
        role="img"
        aria-label="Supplied boiling temperatures on a signed scale: ethane minus 89, propane minus 42, butane minus 1 degrees Celsius. Temperature increases to the right."
      >
        <line
          x1="35"
          y1="115"
          x2="390"
          y2="115"
          stroke="#657189"
          strokeWidth="2"
        />
        <path
          d="M380 108l10 7-10 7"
          fill="none"
          stroke="#657189"
          strokeWidth="2"
        />
        {[-100, -50, 0].map((t) => (
          <g key={t}>
            <line
              x1={x(t)}
              x2={x(t)}
              y1="108"
              y2="122"
              stroke="#657189"
              strokeWidth="2"
            />
            <text
              x={x(t)}
              y="150"
              textAnchor="middle"
              fontSize="22"
              fill="#34405a"
            >
              {t}
            </text>
          </g>
        ))}
        {unbranchedAlkaneBoilingData.map((d) => (
          <g key={d.name} data-boiling-temperature={d.boiling}>
            <line
              x1={x(d.boiling)}
              x2={x(d.boiling)}
              y1="55"
              y2="115"
              stroke="#a6b0e3"
              strokeWidth="2"
            />
            <circle cx={x(d.boiling)} cy="55" r="6" fill="#3548ca" />
            <text
              x={x(d.boiling)}
              y="30"
              textAnchor="middle"
              fontSize="22"
              fill="#26334c"
            >
              {d.name}
            </text>
            <text
              x={x(d.boiling)}
              y="88"
              textAnchor="middle"
              fontSize="22"
              fill="#34405a"
            >
              {d.boiling} °C
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        Temperature increases to the right. −1 °C is higher than −42 °C and −89
        °C; compare signed positions, not the size of the digits.
      </figcaption>
    </figure>
  );
}
