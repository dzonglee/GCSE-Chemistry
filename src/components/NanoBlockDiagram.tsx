import { nanoBlocks } from "@/lib/nanoparticles";
export function NanoBlockDiagram({
  divisions,
  separated,
}: {
  divisions: number;
  separated: boolean;
}) {
  const blocks = nanoBlocks(divisions, separated);
  const project = (x: number, y: number, z: number) => [
    180 + 19 * (x - z),
    160 - 19 * y + 9 * (x + z),
  ];
  return (
    <figure className="nano-block-diagram">
      <svg
        viewBox="0 0 360 320"
        role="img"
        aria-label={`${blocks.length} ${separated ? "separated" : "touching"} illustrative cubic chunks, each side ${6 / divisions} units; total material volume unchanged.`}
      >
        {blocks
          .slice()
          .sort(
            (a, b) =>
              19 *
                (a.position[0] +
                  a.position[2] -
                  b.position[0] -
                  b.position[2]) +
              18 * (a.position[1] - b.position[1]),
          )
          .map((b) => {
            const [x, y, z] = b.position,
              s = b.side / 2;
            const faces = [
              [
                [x - s, y + s, z - s],
                [x + s, y + s, z - s],
                [x + s, y + s, z + s],
                [x - s, y + s, z + s],
              ],
              [
                [x - s, y - s, z + s],
                [x + s, y - s, z + s],
                [x + s, y + s, z + s],
                [x - s, y + s, z + s],
              ],
              [
                [x + s, y - s, z - s],
                [x + s, y - s, z + s],
                [x + s, y + s, z + s],
                [x + s, y + s, z - s],
              ],
            ];
            return (
              <g key={b.id} data-nano-block={b.id}>
                {faces.map((points, i) => (
                  <polygon
                    key={i}
                    points={points
                      .map((p) => project(p[0], p[1], p[2]).join(","))
                      .join(" ")}
                    fill={["#b9c5fa", "#7489e6", "#465ac4"][i]}
                    stroke="#24336e"
                    strokeWidth="1.3"
                  />
                ))}
              </g>
            );
          })}
      </svg>
      <figcaption>
        Ideal cubic chunks represent material, not individual atoms or a real
        crystal structure. Gaps expose cut faces without adding material. Hidden
        faces still contribute to a separated cube’s six-face surface area.
      </figcaption>
    </figure>
  );
}
