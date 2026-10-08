import { covalentMolecules, type CovalentMolecule } from "@/lib/covalent";
type Point = [number, number];
export function CovalentDiagram({
  molecule,
  own,
  other,
  unshared,
  partnerUnshared,
  proposed = true,
  compact = false,
}: {
  molecule: CovalentMolecule;
  own: number[];
  other: number[];
  unshared: number;
  partnerUnshared: number[];
  proposed?: boolean;
  compact?: boolean;
}) {
  const spec = covalentMolecules[molecule],
    single = spec.partners.length === 1;
  const centre: Point = single ? [145, 170] : [200, 175],
    radius = spec.centre.symbol === "H" ? 42 : 64;
  const angles = single
    ? [0]
    : spec.partners.length === 2
      ? molecule === "CO2"
        ? [0, Math.PI]
        : [0.64, Math.PI - 0.64]
      : spec.partners.length === 3
        ? [-Math.PI / 6, Math.PI / 2, (7 * Math.PI) / 6]
        : [0, Math.PI / 2, Math.PI, -Math.PI / 2];
  const partnerPoints = angles.map((angle, i) => {
    const partnerRadius = spec.partners[i].symbol === "H" ? 42 : 64,
      distance =
        single && spec.centre.symbol === "H"
          ? 70
          : partnerRadius === 42
            ? 92
            : 100;
    return {
      point: [
        centre[0] + Math.cos(angle) * distance,
        centre[1] + Math.sin(angle) * distance,
      ] as Point,
      radius: partnerRadius,
      distance,
      angle,
    };
  });
  const bounds = [{ point: centre, radius }, ...partnerPoints];
  const left =
    Math.min(...bounds.map(({ point, radius }) => point[0] - radius)) - 8;
  const top =
    Math.min(...bounds.map(({ point, radius }) => point[1] - radius)) - 8;
  const right =
    Math.max(...bounds.map(({ point, radius }) => point[0] + radius)) + 8;
  const bottom =
    Math.max(...bounds.map(({ point, radius }) => point[1] + radius)) + 8;
  const marker = (point: Point, cross: boolean, key: string) =>
    cross ? (
      <path
        key={key}
        data-electron-origin="partner"
        d={`M${point[0] - 4} ${point[1] - 4}l8 8m0 -8l-8 8`}
        stroke="#783ac6"
        strokeWidth="2.5"
      />
    ) : (
      <circle
        key={key}
        data-electron-origin="reference"
        cx={point[0]}
        cy={point[1]}
        r="3.5"
        fill="#3f4fd0"
      />
    );
  const pool = (
    point: Point,
    count: number,
    cross: boolean,
    start: number,
    end: number,
    key: string,
    atomRadius: number,
  ) =>
    Array.from({ length: Math.max(0, count) }, (_, i) => {
      const pairs = Math.ceil(count / 2),
        pair = Math.floor(i / 2),
        angle =
          ((pairs === 1
            ? (start + end) / 2
            : start + (pair * (end - start)) / (pairs - 1)) *
            Math.PI) /
          180,
        r = atomRadius - 12;
      return marker(
        [
          point[0] + Math.cos(angle) * r + (i % 2 ? 4 : -4) * -Math.sin(angle),
          point[1] + Math.sin(angle) * r + (i % 2 ? 4 : -4) * Math.cos(angle),
        ],
        cross,
        `${key}-${i}`,
      );
    });
  return (
    <figure
      className="covalent-diagram"
      data-molecule={molecule}
      data-electrons={
        unshared +
        partnerUnshared.reduce((a, b) => a + b, 0) +
        own.reduce((a, b) => a + b, 0) +
        other.reduce((a, b) => a + b, 0)
      }
    >
      <svg
        viewBox={
          compact
            ? `${left} ${top} ${right - left} ${bottom - top}`
            : "0 0 400 350"
        }
        role="img"
        aria-label={`${proposed ? "Your proposed" : "Reference"} ${molecule} outer-electron diagram. Bond regions: ${own.map((n, i) => `${n} dots and ${other[i]} crosses`).join("; ")}. Unshared reference-atom electrons ${unshared}; partner electrons ${partnerUnshared.join(", ")}. Inner electrons omitted.`}
      >
        <circle
          cx={centre[0]}
          cy={centre[1]}
          r={radius}
          fill="#f4f6ff"
          fillOpacity=".6"
          stroke="#c7cedd"
        />
        {partnerPoints.map(({ point, radius }, i) => (
          <circle
            key={i}
            cx={point[0]}
            cy={point[1]}
            r={radius}
            fill="#f8f4ff"
            fillOpacity=".6"
            stroke="#c7cedd"
          />
        ))}
        <text
          x={centre[0]}
          y={centre[1] + 8}
          fontSize={compact ? 30 : 24}
          textAnchor="middle"
          fill="#1a2235"
        >
          {spec.centre.symbol}
        </text>
        {partnerPoints.map(({ point }, i) => (
          <text
            key={i}
            x={point[0]}
            y={point[1] + 8}
            fontSize={compact ? 30 : 24}
            textAnchor="middle"
            fill="#1a2235"
          >
            {spec.partners[i].symbol}
          </text>
        ))}
        {pool(
          centre,
          unshared,
          false,
          single ? 115 : 220,
          single ? 245 : 320,
          "centre",
          radius,
        )}
        {partnerPoints.map(({ point, radius, angle }, i) =>
          pool(
            point,
            partnerUnshared[i],
            true,
            (angle * 180) / Math.PI - 65,
            (angle * 180) / Math.PI + 65,
            `partner${i}`,
            radius,
          ),
        )}
        {partnerPoints.map(({ distance, radius: pr, angle }, i) => {
          const mid = (radius + distance - pr) / 2,
            count = Math.max(own[i], other[i]);
          return [false, true].flatMap((cross) =>
            Array.from({ length: cross ? other[i] : own[i] }, (_, j) => {
              const along = mid + (cross ? 4 : -4),
                across = (j - (count - 1) / 2) * 16;
              return marker(
                [
                  centre[0] +
                    Math.cos(angle) * along -
                    Math.sin(angle) * across,
                  centre[1] +
                    Math.sin(angle) * along +
                    Math.cos(angle) * across,
                ],
                cross,
                `shared-${i}-${cross}-${j}`,
              );
            }),
          );
        })}
      </svg>
      <figcaption>
        {proposed
          ? "Your proposed diagram is retained; it is not corrected automatically."
          : "Outer-electron reference diagram."}{" "}
        Dots come from the reference atom; crosses from its partners. All
        electrons are the same kind of particle. Circles and positions are
        schematic; inner electrons are omitted.
      </figcaption>
    </figure>
  );
}
