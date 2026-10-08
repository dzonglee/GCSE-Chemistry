import * as T from "three";
import { targetCarbonHydrogens, type OrganicFamily } from "./alcohols";
import { organicProposal, type AlcoholBoard } from "./alcohol-board";
export type OrganicAtom = {
  id: string;
  element: "C" | "H" | "O";
  point: T.Vector3;
  extra?: boolean;
};
export type OrganicBond = { a: string; b: string; order: 1 | 2 };
const CC = 1.3,
  CH = 0.8,
  CO = 1.05,
  OH = 0.65;
function threeFree(u: T.Vector3) {
  const p = new T.Vector3(-u.y, u.x, 0),
    z = new T.Vector3(0, 0, 1);
  return [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((a) =>
    u
      .clone()
      .multiplyScalar(-1 / 3)
      .add(p.clone().multiplyScalar(Math.sqrt(8 / 9) * Math.cos(a)))
      .add(z.clone().multiplyScalar(Math.sqrt(8 / 9) * Math.sin(a))),
  );
}
function chain(n: number) {
  if (n === 1)
    return {
      points: [new T.Vector3()],
      free: [
        [
          new T.Vector3(1, 1, 1),
          new T.Vector3(-1, -1, 1),
          new T.Vector3(1, -1, -1),
          new T.Vector3(-1, 1, -1),
        ].map((v) => v.normalize()),
      ],
    };
  const dx = CC * Math.sqrt(2 / 3),
    dy = CC / Math.sqrt(3),
    points = Array.from(
      { length: n },
      (_, i) =>
        new T.Vector3((i - (n - 1) / 2) * dx, i % 2 ? dy / 2 : -dy / 2, 0),
    );
  const free = points.map((p, i) => {
    if (i === 0 || i === n - 1)
      return threeFree(points[i === 0 ? 1 : i - 1].clone().sub(p).normalize());
    const u = points[i - 1].clone().sub(p).normalize(),
      v = points[i + 1].clone().sub(p).normalize(),
      base = u.add(v).multiplyScalar(-0.5);
    return [
      base.clone().add(new T.Vector3(0, 0, Math.sqrt(2 / 3))),
      base.clone().add(new T.Vector3(0, 0, -Math.sqrt(2 / 3))),
    ];
  });
  return { points, free };
}
function rotatePlane(v: T.Vector3, angle: number) {
  return v.clone().applyAxisAngle(new T.Vector3(0, 0, 1), angle);
}
function bentHydrogen(
  origin: T.Vector3,
  toCarbon: T.Vector3,
  others: OrganicAtom[],
  planar: boolean,
) {
  const candidates = planar
    ? [
        rotatePlane(toCarbon, (108 * Math.PI) / 180),
        rotatePlane(toCarbon, (-108 * Math.PI) / 180),
      ]
    : [0, Math.PI].map((angle) => {
        const p = new T.Vector3(0, 0, 1).cross(toCarbon).normalize();
        if (p.length() < 0.5) p.set(1, 0, 0).cross(toCarbon).normalize();
        const z = toCarbon.clone().cross(p).normalize();
        return toCarbon
          .clone()
          .multiplyScalar(Math.cos((108 * Math.PI) / 180))
          .add(
            p.multiplyScalar(Math.sin((108 * Math.PI) / 180) * Math.cos(angle)),
          )
          .add(
            z.multiplyScalar(Math.sin((108 * Math.PI) / 180) * Math.sin(angle)),
          );
      });
  return candidates.sort(
    (a, b) =>
      Math.min(
        ...others.map((x) =>
          origin.clone().add(b.clone().multiplyScalar(OH)).distanceTo(x.point),
        ),
      ) -
      Math.min(
        ...others.map((x) =>
          origin.clone().add(a.clone().multiplyScalar(OH)).distanceTo(x.point),
        ),
      ),
  )[0];
}
function extraDirection(used: T.Vector3[]) {
  const candidates = Array.from({ length: 40 }, (_, i) => {
    const z = 1 - (2 * (i + 0.5)) / 40,
      angle = i * Math.PI * (3 - Math.sqrt(5)),
      r = Math.sqrt(1 - z * z);
    return new T.Vector3(r * Math.cos(angle), r * Math.sin(angle), z);
  });
  return candidates.sort(
    (a, b) =>
      Math.max(...used.map((v) => a.dot(v))) -
      Math.max(...used.map((v) => b.dot(v))),
  )[0];
}
export function organicAssembly(
  n: number,
  family: OrganicFamily,
  board: AlcoholBoard,
) {
  if (!Number.isInteger(n) || n < 1 || n > 4)
    throw Error("Original first-four scaffold required");
  const g = chain(n),
    atoms: OrganicAtom[] = g.points.map((point, i) => ({
      id: "C" + (i + 1),
      element: "C",
      point: point.clone(),
    })),
    bonds: OrganicBond[] = Array.from({ length: n - 1 }, (_, i) => ({
      a: "C" + (i + 1),
      b: "C" + (i + 2),
      order: 1,
    })),
    terminal = g.points[n - 1],
    carbonId = "C" + n;
  let hydroxylDirection: T.Vector3, carbonylDirection: T.Vector3;
  const hDirections = g.free.map((a) => a.map((v) => v.clone()));
  if (family === "alcohol") {
    hydroxylDirection = hDirections[n - 1].shift()!;
    carbonylDirection = extraDirection([
      hydroxylDirection,
      ...(n > 1 ? [g.points[n - 2].clone().sub(terminal).normalize()] : []),
    ]);
  } else {
    if (n === 1) {
      hydroxylDirection = new T.Vector3(1, 0, 0);
      carbonylDirection = new T.Vector3(-0.5, Math.sqrt(3) / 2, 0);
      hDirections[0] = [new T.Vector3(-0.5, -Math.sqrt(3) / 2, 0)];
    } else {
      const u = g.points[n - 2].clone().sub(terminal).normalize();
      hydroxylDirection = rotatePlane(u, (2 * Math.PI) / 3);
      carbonylDirection = rotatePlane(u, (-2 * Math.PI) / 3);
      hDirections[n - 1] = [];
    }
  }
  if (board.hydroxyl === "yes") {
    atoms.push({
      id: "O-hydroxyl",
      element: "O",
      point: terminal.clone().add(hydroxylDirection.clone().multiplyScalar(CO)),
    });
    bonds.push({ a: carbonId, b: "O-hydroxyl", order: 1 });
  }
  const order = Number(board.carbonyl);
  if (order > 0) {
    atoms.push({
      id: "O-carbonyl",
      element: "O",
      point: terminal.clone().add(carbonylDirection.clone().multiplyScalar(CO)),
    });
    bonds.push({ a: carbonId, b: "O-carbonyl", order: order === 2 ? 2 : 1 });
  }
  for (let c = 0; c < n; c++) {
    const selected = [0, 1, 2, 3].filter(
        (slot) => board["h" + (c * 4 + slot)] === "yes",
      ),
      used = [
        ...(c > 0
          ? [g.points[c - 1].clone().sub(g.points[c]).normalize()]
          : []),
        ...(c < n - 1
          ? [g.points[c + 1].clone().sub(g.points[c]).normalize()]
          : []),
        ...(c === n - 1 && board.hydroxyl === "yes" ? [hydroxylDirection] : []),
        ...(c === n - 1 && order > 0 ? [carbonylDirection] : []),
      ];
    for (let j = 0; j < selected.length; j++) {
      const extra = j >= targetCarbonHydrogens(n, family, c),
        direction = hDirections[c][j] ?? extraDirection(used);
      used.push(direction);
      const id = "H" + (c + 1) + "." + selected[j];
      atoms.push({
        id,
        element: "H",
        extra,
        point: g.points[c].clone().add(direction.clone().multiplyScalar(CH)),
      });
      bonds.push({ a: "C" + (c + 1), b: id, order: 1 });
    }
  }
  const oxygen = atoms.find((a) => a.id === "O-hydroxyl");
  if (oxygen && board.oxygenH === "yes") {
    const toCarbon = terminal.clone().sub(oxygen.point).normalize(),
      direction = bentHydrogen(
        oxygen.point,
        toCarbon,
        atoms.filter((a) => a.id !== oxygen.id),
        family === "acid",
      );
    atoms.push({
      id: "H-hydroxyl",
      element: "H",
      point: oxygen.point.clone().add(direction.multiplyScalar(OH)),
    });
    bonds.push({ a: oxygen.id, b: "H-hydroxyl", order: 1 });
  }
  const centre = new T.Box3()
    .setFromPoints(atoms.map((a) => a.point))
    .getCenter(new T.Vector3());
  for (const atom of atoms) atom.point.sub(centre);
  return { atoms, bonds };
}
export function buildAlcoholAsset(
  n: number,
  family: OrganicFamily,
  board: AlcoholBoard,
) {
  const assembly = organicAssembly(n, family, board),
    group = new T.Group();
  group.name = "Connected organic functional-group proposal";
  const geometries = {
      C: new T.SphereGeometry(0.19, 24, 18),
      O: new T.SphereGeometry(0.17, 24, 18),
      H: new T.SphereGeometry(0.115, 24, 18),
    },
    materials = {
      C: new T.MeshStandardMaterial({ color: 0x34445a, roughness: 0.5 }),
      O: new T.MeshStandardMaterial({ color: 0xb33e4e, roughness: 0.5 }),
      H: new T.MeshStandardMaterial({ color: 0xf0f3f8, roughness: 0.4 }),
      extra: new T.MeshStandardMaterial({ color: 0xd89e25, roughness: 0.4 }),
    },
    bondGeometry = new T.CylinderGeometry(0.032, 0.032, 1, 12),
    normal = new T.MeshStandardMaterial({ color: 0x99a8c1, roughness: 0.45 }),
    double = new T.MeshStandardMaterial({ color: 0x3349bd, roughness: 0.45 }),
    byId = Object.fromEntries(assembly.atoms.map((a) => [a.id, a])),
    degree: Record<string, number> = {};
  for (const atom of assembly.atoms) {
    const mesh = new T.Mesh(
      geometries[atom.element],
      atom.extra ? materials.extra : materials[atom.element],
    );
    mesh.name = "Atom " + atom.id;
    mesh.position.copy(atom.point);
    mesh.userData = {
      atom: true,
      atomId: atom.id,
      element: atom.element,
      extraCarbonHydrogen: !!atom.extra,
    };
    group.add(mesh);
  }
  for (const edge of assembly.bonds) {
    const a = byId[edge.a].point,
      b = byId[edge.b].point,
      delta = b.clone().sub(a),
      u = delta.clone().normalize(),
      p = new T.Vector3(-u.y, u.x, 0).normalize();
    degree[edge.a] = (degree[edge.a] || 0) + edge.order;
    degree[edge.b] = (degree[edge.b] || 0) + edge.order;
    for (const offset of edge.order === 2 ? [-0.05, 0.05] : [0]) {
      const mesh = new T.Mesh(bondGeometry, edge.order === 2 ? double : normal);
      mesh.name = `Bond ${edge.a}–${edge.b}${edge.order === 2 ? (offset < 0 ? " double A" : " double B") : ""}`;
      mesh.position
        .copy(a)
        .add(b)
        .multiplyScalar(0.5)
        .add(p.clone().multiplyScalar(offset));
      mesh.scale.y = delta.length();
      mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), u);
      mesh.userData = {
        chemicalBond: true,
        edgeId: edge.a + "-" + edge.b,
        atomA: edge.a,
        atomB: edge.b,
        order: edge.order,
        schematicLine: offset,
      };
      group.add(mesh);
    }
  }
  const proposal = organicProposal(n, board),
    counts = {
      C: n,
      H: assembly.atoms.filter((a) => a.element === "H").length,
      O: assembly.atoms.filter((a) => a.element === "O").length,
    };
  group.userData = {
    schematic: true,
    notToScale: true,
    proposal: true,
    originalTargetFamily: family,
    originalScaffoldCarbons: n,
    counts,
    hydroxylPresent: board.hydroxyl === "yes",
    carbonylOrder: Number(board.carbonyl),
    oxygenHydrogenPresent: board.hydroxyl === "yes" && board.oxygenH === "yes",
    retainedOxygenHydrogenChoice: board.oxygenH,
    localCarbonValences: proposal.carbons.map((c) => c.total),
    completeValence: assembly.atoms.every(
      (a) =>
        degree[a.id] === (a.element === "C" ? 4 : a.element === "O" ? 2 : 1),
    ),
    atomIds: assembly.atoms.map((a) => a.id),
    idealizedGeometry: true,
    carbonCarbonLength: CC,
    carbonHydrogenLength: CH,
    carbonOxygenLength: CO,
    oxygenHydrogenLength: OH,
  };
  return group;
}
