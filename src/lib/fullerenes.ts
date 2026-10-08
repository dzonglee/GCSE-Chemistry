/** Original ideal C60 graph from truncating every directed icosahedron edge.
 * Geometry is regular and schematic, not measured C60 bond lengths/orders. */
const phi = (1 + Math.sqrt(5)) / 2;
const icosahedron = ([-1, 1] as const).flatMap((a) =>
  ([-1, 1] as const).flatMap(
    (b) =>
      [
        [0, a, b * phi],
        [a, b * phi, 0],
        [a * phi, 0, b],
      ] as [number, number, number][],
  ),
);
const distance2 = (a: number[], b: number[]) =>
  a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0);
const icoEdges = icosahedron.flatMap((p, a) =>
  icosahedron
    .slice(a + 1)
    .flatMap((q, j) =>
      Math.abs(distance2(p, q) - 4) < 1e-9 ? [{ a, b: a + 1 + j }] : [],
    ),
);
export const fullereneAtoms = icoEdges
  .flatMap((e) =>
    [
      [e.a, e.b],
      [e.b, e.a],
    ].map(([from, to]) => ({
      from,
      to,
      position: icosahedron[from].map(
        (v, i) => (2 * v + icosahedron[to][i]) / 3,
      ) as [number, number, number],
    })),
  )
  .map((a, id) => ({ ...a, id }));
const atomId = (from: number, to: number) =>
  fullereneAtoms.find((a) => a.from === from && a.to === to)!.id;
export const fullereneBonds = fullereneAtoms.flatMap((a, i) =>
  fullereneAtoms
    .slice(i + 1)
    .filter(
      (b) =>
        (a.from === b.to && a.to === b.from) ||
        (a.from === b.from &&
          Math.abs(distance2(icosahedron[a.to], icosahedron[b.to]) - 4) < 1e-9),
    )
    .map((b) => ({ a: a.id, b: b.id })),
);
export function fullereneNeighbours(id: number) {
  return fullereneBonds
    .filter((b) => b.a === id || b.b === id)
    .map((b) => fullereneAtoms[b.a === id ? b.b : b.a]);
}
function orderRing(ids: number[]) {
  const ring = [ids[0]];
  while (ring.length < ids.length) {
    const next = fullereneNeighbours(ring.at(-1)!).find(
      (a) => ids.includes(a.id) && !ring.includes(a.id),
    );
    if (!next) throw Error("Cage face must be a connected ring");
    ring.push(next.id);
  }
  if (!fullereneNeighbours(ring.at(-1)!).some((a) => a.id === ring[0]))
    throw Error("Cage face must close");
  return ring;
}
const pentagons = icosahedron.map((_, from) =>
  orderRing(fullereneAtoms.filter((a) => a.from === from).map((a) => a.id)),
);
const triangles = icosahedron.flatMap((_, a) =>
  icosahedron.slice(a + 1).flatMap((_, j) => {
    const b = a + 1 + j;
    return icosahedron.slice(b + 1).flatMap((_, k) => {
      const c = b + 1 + k;
      return distance2(icosahedron[a], icosahedron[b]) < 4 + 1e-9 &&
        distance2(icosahedron[a], icosahedron[c]) < 4 + 1e-9 &&
        distance2(icosahedron[b], icosahedron[c]) < 4 + 1e-9
        ? [[a, b, c]]
        : [];
    });
  }),
);
const hexagons = triangles.map(([a, b, c]) => [
  atomId(a, b),
  atomId(b, a),
  atomId(b, c),
  atomId(c, b),
  atomId(c, a),
  atomId(a, c),
]);
export const fullereneFaces = [...pentagons, ...hexagons];
const front = (ring: number[]) =>
  ring.reduce((s, id) => s + fullereneAtoms[id].position[2], 0) / ring.length;
export const fullereneFocusRings = [...pentagons]
  .sort((a, b) => front(b) - front(a))
  .slice(0, 1)
  .concat([...hexagons].sort((a, b) => front(b) - front(a)).slice(0, 2));
export type FullereneMode = "cage" | "separation" | "carrier";
export function initialFullereneBoard(
  mode: FullereneMode,
): Record<string, string | number> {
  switch (mode) {
    case "cage":
      return { ring: 0, count: 0, extent: "unset" };
    case "separation":
      return { force: "unset", internal: "unset", gap: 0 };
    case "carrier":
      return { feature: "unset", guarantee: "unset", payload: 0 };
  }
}
export function validFullereneBoard(mode: FullereneMode, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    initial = initialFullereneBoard(mode);
  if (
    Object.keys(b).length !== Object.keys(initial).length ||
    Object.keys(initial).some((k) => !(k in b))
  )
    return false;
  const member = (key: string, values: unknown[]) => values.includes(b[key]);
  switch (mode) {
    case "cage":
      return (
        member("ring", [0, 1, 2]) &&
        member("count", [0, 5, 6, 7]) &&
        member("extent", ["unset", "molecule", "sheet"])
      );
    case "separation":
      return (
        member("force", ["unset", "between", "covalent"]) &&
        member("internal", ["unset", "intact", "break"]) &&
        member("gap", [0, 1, 2, 3])
      );
    case "carrier":
      return (
        member("feature", ["unset", "hollow", "colour", "sliding"]) &&
        member("guarantee", ["unset", "no", "yes"]) &&
        member("payload", [0, 1])
      );
  }
}
export function fullerenePrediction(
  mode: FullereneMode,
  b: Record<string, string | number>,
) {
  switch (mode) {
    case "cage": {
      const size = fullereneFocusRings[Number(b.ring)]?.length;
      const correct = b.extent === "molecule" && b.count === size;
      return {
        correct,
        feedback: correct
          ? `This is a discrete hollow C₆₀ molecule. The selected ring contains ${size} carbons. Rings are connected within the closed sixty-carbon cage; a selected ring is not a separate ${size}-carbon molecule.`
          : "Your predictions are retained. Inspect the selected ring’s closed perimeter, then distinguish this finite hollow molecule from an extended planar sheet. The whole C₆₀ molecule contains sixty carbons.",
      };
    }
    case "separation": {
      const correct = b.force === "between" && b.internal === "intact";
      return {
        correct,
        feedback: correct
          ? "Separating intact C₆₀ molecules overcomes attractions between molecules. Their strong internal covalent bonds stay intact. The complete cages remain sixty-carbon molecules."
          : "Your predictions are retained. Separating unchanged molecules does not require every internal covalent bond to break; distinguish between-molecule attraction from bonds within a cage.",
      };
    }
    case "carrier": {
      const correct = b.feature === "hollow" && b.guarantee === "no";
      return {
        correct,
        feedback: correct
          ? "A hollow cage can potentially enclose a suitable payload. Shape alone does not establish fit, release, chemical compatibility or safety. The marker illustrates enclosure, not a real drug or a clinical test."
          : "Your predictions are retained. Hollow shape supports a possible carrier role, but does not prove every payload fits or every fullerene is safe. Colour or graphite-style layer sliding does not give the relevant explanation.",
      };
    }
  }
}
