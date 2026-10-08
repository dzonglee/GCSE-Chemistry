import {
  stateDiagramParticles,
  type ParticlePhase,
} from "@/lib/states-of-matter";
export function StateParticleDiagram({
  phase = "solid",
  frame = 0,
  assessment = false,
}: {
  phase?: ParticlePhase;
  frame?: number;
  assessment?: boolean;
}) {
  const particles = stateDiagramParticles(phase, frame);
  return (
    <figure className="state-particle-diagram">
      <svg
        viewBox="0 0 360 340"
        role="img"
        aria-label={
          assessment
            ? "24 equal-sized particle circles in a container. " +
              (phase === "solid"
                ? "A close regular group lies near the bottom."
                : phase === "liquid"
                  ? "A close disordered group lies near the bottom."
                  : "Separated circles occupy the available container region.")
            : `Illustrative ${phase} particle drawing, frame ${frame}. Same 24 particle identities and circle sizes. Gold marks tracked particle zero.`
        }
      >
        <rect
          x="20"
          y="20"
          width="320"
          height="290"
          rx="8"
          fill="#f6f8fc"
          stroke="#9ba8bf"
          strokeWidth="2"
        />
        {particles.map((p) => (
          <circle
            key={p.id}
            data-state-particle={p.id}
            cx={p.x}
            cy={p.y}
            r={p.radius}
            fill={p.id === 0 ? "#e9c052" : "#63748f"}
            stroke={p.id === 0 ? "#af7d1c" : "#455671"}
            strokeWidth="1"
          />
        ))}
      </svg>
      <figcaption>
        {assessment
          ? "Circles represent particles; the rectangle represents a container. Positions and sizes are schematic. Colour tracks one particle, not a different substance."
          : `A separate flat schematic of ${phase}, not a literal projection of the 3D positions. Frames illustrate movement, not measured speed. All 24 particle identities and circle sizes are retained; spheres do not mean real particles are solid balls. Forces are not drawn.`}
      </figcaption>
    </figure>
  );
}
