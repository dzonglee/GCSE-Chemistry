export function SolutionDensityDiagram({
  particles,
  volume,
}: {
  particles: number;
  volume: number;
}) {
  let seed = 8231;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const points: { x: number; y: number }[] = [];
  let tries = 0;
  while (points.length < particles) {
    if (++tries > 10000) throw Error("Invalid solution diagram.");
    const p = { x: 5 + random() * 38, y: 5 + random() * 86 };
    if (points.every((q) => Math.hypot(p.x - q.x, p.y - q.y) >= 7))
      points.push(p);
  }
  return (
    <figure style={{ margin: "16px 0" }}>
      <svg
        role="img"
        aria-label={`${particles} reacting symbols occupy${volume} schematic volume units. Reacting symbols stay the same size; solvent particles are omitted.`}
        viewBox="0 0 320 122"
        style={{ display: "block", width: "100%", maxHeight: 190 }}
      >
        <rect
          x={12}
          y={10}
          width={volume * 48}
          height={96}
          fill="#eef1fb"
          stroke="#8899b5"
        />
        <g fill="#3344c8">
          {points.map((p, i) => (
            <circle key={i} cx={12 + p.x * volume} cy={10 + p.y} r={3} />
          ))}
        </g>
      </svg>
      <figcaption>
        Reacting symbols in occupied solution volume; solvent particles omitted.
        This stationary diagram shows number density, not particle speed or a
        measured rate.
      </figcaption>
    </figure>
  );
}
