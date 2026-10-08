import * as T from "three";
import { hydrocarbon } from "./cracking";
type Atom = {
  id: string;
  element: "C" | "H";
  point: T.Vector3;
  molecule: number;
};
type Bond = { a: string; b: string; order: 1 | 2 };
const CC = 1.3,
  CH = 0.8;
function threeFree(u: T.Vector3) {
  const perpendicular = new T.Vector3(-u.y, u.x, 0),
    z = new T.Vector3(0, 0, 1);
  return [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((a) =>
    u
      .clone()
      .multiplyScalar(-1 / 3)
      .add(perpendicular.clone().multiplyScalar(Math.sqrt(8 / 9) * Math.cos(a)))
      .add(z.clone().multiplyScalar(Math.sqrt(8 / 9) * Math.sin(a))),
  );
}
function twoFree(u: T.Vector3, v: T.Vector3) {
  const base = u.clone().add(v).multiplyScalar(-0.5);
  return [
    base.clone().add(new T.Vector3(0, 0, Math.sqrt(2 / 3))),
    base.clone().add(new T.Vector3(0, 0, -Math.sqrt(2 / 3))),
  ];
}
function alkaneGeometry(n: number) {
  if (n === 1)
    return {
      points: [new T.Vector3()],
      hydrogens: [
        [
          new T.Vector3(1, 1, 1),
          new T.Vector3(-1, -1, 1),
          new T.Vector3(1, -1, -1),
          new T.Vector3(-1, 1, -1),
        ].map((x) => x.normalize()),
      ],
    };
  const a = CC * Math.sqrt(2 / 3),
    b = CC / Math.sqrt(3),
    points = Array.from(
      { length: n },
      (_, i) => new T.Vector3((i - (n - 1) / 2) * a, i % 2 ? b / 2 : -b / 2, 0),
    );
  const hydrogens = points.map((p, i) =>
    i === 0
      ? threeFree(points[1].clone().sub(p).normalize())
      : i === n - 1
        ? threeFree(points[i - 1].clone().sub(p).normalize())
        : twoFree(
            points[i - 1].clone().sub(p).normalize(),
            points[i + 1].clone().sub(p).normalize(),
          ),
  );
  return { points, hydrogens };
}
function alkeneGeometry(n: number) {
  if (n < 2) throw Error("A C=C requires at least two carbons");
  const points = [new T.Vector3(), new T.Vector3(CC, 0, 0)];
  if (n >= 3)
    points.push(
      points[1]
        .clone()
        .add(new T.Vector3(0.5, Math.sqrt(3) / 2, 0).multiplyScalar(CC)),
    );
  for (let i = 2; i < n - 1; i++) {
    const u = points[i - 1].clone().sub(points[i]).normalize(),
      perp = new T.Vector3(-u.y, u.x, 0),
      v = u
        .clone()
        .multiplyScalar(-1 / 3)
        .add(perp.multiplyScalar(Math.sqrt(8 / 9) * (i % 2 === 0 ? 1 : -1)));
    points.push(points[i].clone().add(v.multiplyScalar(CC)));
  }
  const hydrogens = points.map((p, i) =>
    i === 0
      ? [
          new T.Vector3(-0.5, Math.sqrt(3) / 2, 0),
          new T.Vector3(-0.5, -Math.sqrt(3) / 2, 0),
        ]
      : i === 1
        ? n === 2
          ? [
              new T.Vector3(0.5, Math.sqrt(3) / 2, 0),
              new T.Vector3(0.5, -Math.sqrt(3) / 2, 0),
            ]
          : [new T.Vector3(0.5, -Math.sqrt(3) / 2, 0)]
        : i === n - 1
          ? threeFree(points[i - 1].clone().sub(p).normalize())
          : twoFree(
              points[i - 1].clone().sub(p).normalize(),
              points[i + 1].clone().sub(p).normalize(),
            ),
  );
  return { points, hydrogens };
}
function hydrogenIds(n: number) {
  return Array.from({ length: n }, (_, i) =>
    Array.from(
      { length: i === 0 || i === n - 1 ? 3 : 2 },
      (_, j) => `H${i + 1}.${j + 1}`,
    ),
  );
}
function molecule(
  carbonIds: string[],
  hIds: string[][],
  alkene: boolean,
  index: number,
) {
  const g = alkene
      ? alkeneGeometry(carbonIds.length)
      : alkaneGeometry(carbonIds.length),
    atoms: Atom[] = [],
    bonds: Bond[] = [];
  for (let c = 0; c < carbonIds.length; c++) {
    if (hIds[c].length !== g.hydrogens[c].length)
      throw Error("Incomplete stable state");
    atoms.push({
      id: carbonIds[c],
      element: "C",
      point: g.points[c].clone(),
      molecule: index,
    });
    if (c)
      bonds.push({
        a: carbonIds[c - 1],
        b: carbonIds[c],
        order: alkene && c === 1 ? 2 : 1,
      });
    for (let h = 0; h < hIds[c].length; h++) {
      atoms.push({
        id: hIds[c][h],
        element: "H",
        point: g.points[c]
          .clone()
          .add(g.hydrogens[c][h].clone().multiplyScalar(CH)),
        molecule: index,
      });
      bonds.push({ a: carbonIds[c], b: hIds[c][h], order: 1 });
    }
  }
  if (alkene && carbonIds.length >= 3) {
    const angle = -Math.atan2(
      g.points.at(-1)!.y - g.points[0].y,
      g.points.at(-1)!.x - g.points[0].x,
    );
    for (const a of atoms)
      a.point.applyAxisAngle(new T.Vector3(0, 0, 1), angle);
  }
  const box = new T.Box3().setFromPoints(atoms.map((x) => x.point)),
    centre = box.getCenter(new T.Vector3());
  for (const a of atoms) a.point.sub(centre);
  return { atoms, bonds, halfWidth: (box.max.x - box.min.x) / 2 + 0.2 };
}
export function crackingAssembly(
  n: number,
  cut: number,
  phase: "before" | "after",
) {
  if (
    !Number.isInteger(n) ||
    n < 3 ||
    n > 12 ||
    !Number.isInteger(cut) ||
    cut < 1 ||
    cut > n - 2
  )
    throw Error("Supplied split must leave a two-carbon-or-larger alkene");
  const carbons = Array.from({ length: n }, (_, i) => "C" + (i + 1)),
    h = hydrogenIds(n),
    donorIndex = cut + 1,
    transferred = h[donorIndex].at(-1)!;
  if (phase === "before") {
    const m = molecule(carbons, h, false, 0);
    return {
      ...m,
      transferred,
      removed: [carbons[cut - 1], carbons[cut]],
      increased: [carbons[cut], carbons[cut + 1]],
      newBond: [carbons[cut - 1], transferred],
    };
  }
  const leftH = h.slice(0, cut).map((x) => x.slice());
  leftH.at(-1)!.push(transferred);
  const rightH = h.slice(cut).map((x) => x.slice());
  rightH[1] = rightH[1].filter((x) => x !== transferred);
  const a = molecule(carbons.slice(0, cut), leftH, false, 0),
    b = molecule(carbons.slice(cut), rightH, true, 1),
    gap = 1.2;
  for (const atom of a.atoms) atom.point.x -= b.halfWidth + gap / 2;
  for (const atom of b.atoms) atom.point.x += a.halfWidth + gap / 2;
  return {
    atoms: [...a.atoms, ...b.atoms],
    bonds: [...a.bonds, ...b.bonds],
    transferred,
    removed: [carbons[cut - 1], carbons[cut]],
    increased: [carbons[cut], carbons[cut + 1]],
    newBond: [carbons[cut - 1], transferred],
  };
}
export function buildCrackingAsset(
  n: number,
  cut: number,
  phase: "before" | "after",
) {
  const assembly = crackingAssembly(n, cut, phase),
    group = new T.Group();
  group.name = "Complete cracking before-after comparison";
  const carbonGeometry = new T.SphereGeometry(0.19, 24, 18),
    hydrogenGeometry = new T.SphereGeometry(0.12, 24, 18),
    bondGeometry = new T.CylinderGeometry(0.035, 0.035, 1, 12);
  const carbon = new T.MeshStandardMaterial({
      color: 0x34445a,
      roughness: 0.5,
    }),
    hydrogen = new T.MeshStandardMaterial({ color: 0xf0f3f8, roughness: 0.4 }),
    gold = new T.MeshStandardMaterial({ color: 0xe0a329, roughness: 0.4 }),
    normal = new T.MeshStandardMaterial({ color: 0x99a8c1, roughness: 0.45 }),
    double = new T.MeshStandardMaterial({ color: 0x3349bd, roughness: 0.45 }),
    cutMaterial = new T.MeshStandardMaterial({
      color: 0xd98c46,
      roughness: 0.45,
    });
  const byId = Object.fromEntries(assembly.atoms.map((a) => [a.id, a]));
  for (const atom of assembly.atoms) {
    const mesh = new T.Mesh(
      atom.element === "C" ? carbonGeometry : hydrogenGeometry,
      atom.id === assembly.transferred
        ? gold
        : atom.element === "C"
          ? carbon
          : hydrogen,
    );
    mesh.name = "Atom " + atom.id;
    mesh.position.copy(atom.point);
    mesh.userData = {
      atom: true,
      atomId: atom.id,
      element: atom.element,
      molecule: atom.molecule,
      highlightedTransfer: atom.id === assembly.transferred,
    };
    group.add(mesh);
  }
  for (const edge of assembly.bonds) {
    const a = byId[edge.a].point,
      b = byId[edge.b].point,
      delta = b.clone().sub(a),
      unit = delta.clone().normalize(),
      perp = new T.Vector3(-unit.y, unit.x, 0).normalize(),
      isCut =
        phase === "before" &&
        edge.a === assembly.removed[0] &&
        edge.b === assembly.removed[1],
      moved = edge.a === assembly.newBond[0] && edge.b === assembly.newBond[1];
    for (const offset of edge.order === 2 ? [-0.055, 0.055] : [0]) {
      const mesh = new T.Mesh(
        bondGeometry,
        isCut ? cutMaterial : moved ? gold : edge.order === 2 ? double : normal,
      );
      mesh.name = `Bond ${edge.a}–${edge.b}${edge.order === 2 ? (offset < 0 ? " double line A" : " double line B") : ""}`;
      mesh.position
        .copy(a)
        .add(b)
        .multiplyScalar(0.5)
        .add(perp.clone().multiplyScalar(offset));
      mesh.scale.y = delta.length();
      mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), unit);
      mesh.userData = {
        chemicalBond: true,
        edgeId: edge.a + "-" + edge.b,
        atomA: edge.a,
        atomB: edge.b,
        order: edge.order,
        schematicLine: offset,
        selectedCut: isCut,
        newHydrogenPartner: moved,
      };
      group.add(mesh);
    }
  }
  group.userData = {
    schematic: true,
    notToScale: true,
    netRearrangementNotMechanism: true,
    completeStates: true,
    phase,
    feedCarbons: n,
    cut,
    originalFormula: hydrocarbon(n, 2 * n + 2),
    productFormulas: [
      hydrocarbon(cut, 2 * cut + 2),
      hydrocarbon(n - cut, 2 * (n - cut)),
    ],
    atomIds: assembly.atoms.map((a) => a.id),
    carbonAtoms: n,
    hydrogenAtoms: 2 * n + 2,
    moleculeCount: phase === "before" ? 1 : 2,
    transferredHydrogen: assembly.transferred,
    removedCarbonBond: assembly.removed,
    removedHydrogenBond: ["C" + (cut + 2), assembly.transferred],
    increasedCarbonBond: assembly.increased,
    newHydrogenBond: assembly.newBond,
    carbonCarbonLength: CC,
    carbonHydrogenLength: CH,
  };
  return group;
}
