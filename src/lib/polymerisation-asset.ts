import * as T from "three";
import { boardGroups, type PolymerisationBoard } from "./polymerisation-board";
import type { SideGroup } from "./polymerisation";
export type PolymerisationAtom = {
  id: string;
  element: "C" | "H" | "Cl" | "F";
  point: T.Vector3;
  incomplete?: boolean;
};
export type PolymerisationBond = { a: string; b: string; order: 1 | 2 };
const CC = 1.3,
  CH = 0.8,
  HAL = 1.02;
function tetraFree(back: T.Vector3) {
  let p = new T.Vector3(0, 0, 1).cross(back).normalize();
  if (p.length() < 0.5) p = new T.Vector3(1, 0, 0).cross(back).normalize();
  const z = back.clone().cross(p).normalize();
  return [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((a) =>
    back
      .clone()
      .multiplyScalar(-1 / 3)
      .add(p.clone().multiplyScalar(Math.sqrt(8 / 9) * Math.cos(a)))
      .add(z.clone().multiplyScalar(Math.sqrt(8 / 9) * Math.sin(a))),
  );
}
export function polymerisationGeometry(
  b: PolymerisationBoard,
  units = 3,
  monomer = false,
) {
  const planarPair = monomer || b.bond === "2";
  const count = monomer ? 2 : units * 2,
    dx = CC * Math.sqrt(2 / 3),
    dy = CC / Math.sqrt(3),
    groups = boardGroups(b),
    atoms: PolymerisationAtom[] = [],
    bonds: PolymerisationBond[] = [],
    continuations: { from: string; point: T.Vector3 }[] = [];
  const points = Array.from({ length: count }, (_, i) =>
    planarPair
      ? new T.Vector3((i - (count - 1) / 2) * CC, 0, 0)
      : new T.Vector3((i - (count - 1) / 2) * dx, i % 2 ? dy / 2 : -dy / 2, 0),
  );
  function addAtom(
    id: string,
    element: PolymerisationAtom["element"],
    point: T.Vector3,
    incomplete = false,
  ) {
    atoms.push({ id, element, point, incomplete });
    return id;
  }
  function bond(a: string, bb: string, order: 1 | 2 = 1) {
    bonds.push({ a, b: bb, order });
  }
  function attach(
    parent: string,
    origin: T.Vector3,
    d: T.Vector3,
    g: SideGroup,
    id: string,
  ) {
    if (g === "none") return;
    if (g === "H" || g === "Cl" || g === "F") {
      const p = origin.clone().addScaledVector(d, g === "H" ? CH : HAL);
      bond(parent, addAtom(id, g, p));
      return;
    }
    const carbon = origin.clone().addScaledVector(d, CC),
      cid = addAtom(id + ".C0", "C", carbon);
    bond(parent, cid);
    const free = tetraFree(d.clone().negate());
    if (g === "CH3") {
      free.forEach((v, j) =>
        bond(
          cid,
          addAtom(id + ".H" + j, "H", carbon.clone().addScaledVector(v, CH)),
        ),
      );
      return;
    }
    free
      .slice(1)
      .forEach((v, j) =>
        bond(
          cid,
          addAtom(id + ".H" + j, "H", carbon.clone().addScaledVector(v, CH)),
        ),
      );
    const terminal = carbon.clone().addScaledVector(free[0], CC),
      tid = addAtom(id + ".C1", "C", terminal);
    bond(cid, tid);
    tetraFree(free[0].clone().negate()).forEach((v, j) =>
      bond(
        tid,
        addAtom(
          id + ".terminalH" + j,
          "H",
          terminal.clone().addScaledVector(v, CH),
        ),
      ),
    );
  }
  for (let i = 0; i < count; i++)
    addAtom("backbone" + i, "C", points[i], false);
  for (let i = 0; i < count; i++) {
    const dirs = planarPair
      ? [
          new T.Vector3(i % 2 === 0 ? -0.5 : 0.5, Math.sqrt(3) / 2, 0),
          new T.Vector3(i % 2 === 0 ? -0.5 : 0.5, -Math.sqrt(3) / 2, 0),
        ]
      : [
          new T.Vector3(
            0,
            i % 2 ? 1 / Math.sqrt(3) : -1 / Math.sqrt(3),
            Math.sqrt(2 / 3),
          ),
          new T.Vector3(
            0,
            i % 2 ? 1 / Math.sqrt(3) : -1 / Math.sqrt(3),
            -Math.sqrt(2 / 3),
          ),
        ];
    dirs.forEach((d, j) =>
      attach(
        "backbone" + i,
        points[i],
        d,
        groups[(i % 2) * 2 + j],
        "backbone" + i + ".side" + j,
      ),
    );
    if (i % 2 === 0 && i + 1 < count && b.bond !== "0")
      bond("backbone" + i, "backbone" + (i + 1), Number(b.bond) as 1 | 2);
    if (i % 2 === 1 && i + 1 < count && b.left === "1" && b.right === "1")
      bond("backbone" + i, "backbone" + (i + 1));
  }
  if (b.left === "1")
    continuations.push({
      from: "backbone0",
      point: points[0]
        .clone()
        .add(new T.Vector3(monomer ? -CC : -dx, monomer ? 0 : dy, 0)),
    });
  if (b.right === "1")
    continuations.push({
      from: "backbone" + (count - 1),
      point: points[count - 1]
        .clone()
        .add(new T.Vector3(monomer ? CC : dx, monomer ? 0 : -dy, 0)),
    });
  // Rotate only the supplied ethyl side-group conformation about its C–C
  // attachment axis. Atom identities, every bond length and tetrahedral
  // angles remain unchanged; choose a visible non-overlapping schematic.
  const connected = new Set(
    bonds.flatMap((bb) => [bb.a + "|" + bb.b, bb.b + "|" + bb.a]),
  );
  for (let pass = 0; pass < 2; pass++)
    for (let i = 0; i < count; i++)
      for (let slot = 0; slot < 2; slot++) {
        if (groups[(i % 2) * 2 + slot] !== "C2H5") continue;
        const prefix = "backbone" + i + ".side" + slot,
          members = atoms.filter((a) => a.id.startsWith(prefix + ".")),
          origin = atoms.find((a) => a.id === prefix + ".C0")!.point.clone(),
          axis = origin.clone().sub(points[i]).normalize(),
          originals = members.map((a) => a.point.clone()),
          others = atoms.filter((a) => !members.includes(a));
        let best = -Infinity,
          bestPoints = originals;
        for (let step = 0; step < 12; step++) {
          const candidate = originals.map((p) =>
            p
              .clone()
              .sub(origin)
              .applyAxisAngle(axis, (step * Math.PI) / 6)
              .add(origin),
          );
          let score = Infinity;
          for (let k = 0; k < members.length; k++)
            for (const other of others) {
              if (connected.has(members[k].id + "|" + other.id)) continue;
              const radius = (e: string) =>
                e === "H" ? 0.13 : e === "C" ? 0.23 : e === "Cl" ? 0.25 : 0.21;
              score = Math.min(
                score,
                candidate[k].distanceTo(other.point) /
                  (radius(members[k].element) + radius(other.element)),
              );
            }
          if (score > best + 1e-9) {
            best = score;
            bestPoints = candidate;
          }
        }
        members.forEach((a, k) => a.point.copy(bestPoints[k]));
      }
  const local = new Map(atoms.map((a) => [a.id, 0]));
  for (const bb of bonds) {
    local.set(bb.a, local.get(bb.a)! + bb.order);
    local.set(bb.b, local.get(bb.b)! + bb.order);
  }
  for (const c of continuations) local.set(c.from, local.get(c.from)! + 1);
  for (const a of atoms)
    a.incomplete = local.get(a.id) !== (a.element === "C" ? 4 : 1);
  return { atoms, bonds, continuations, units: monomer ? 1 : units, monomer };
}
export function buildPolymerisationAsset(
  b: PolymerisationBoard,
  units = 3,
  monomer = false,
) {
  const model = polymerisationGeometry(b, units, monomer),
    group = new T.Group(),
    sphere = new T.SphereGeometry(1, 16, 12),
    cylinder = new T.CylinderGeometry(1, 1, 1, 10),
    materials = new Map<string, T.MeshStandardMaterial>();
  const color = { C: 0x46536c, H: 0xffffff, Cl: 0x219768, F: 0x87d5c6 };
  function material(key: string, c: number) {
    if (!materials.has(key))
      materials.set(
        key,
        new T.MeshStandardMaterial({ color: c, roughness: 0.38 }),
      );
    return materials.get(key)!;
  }
  for (const a of model.atoms) {
    const mesh = new T.Mesh(
      sphere,
      material(
        a.incomplete ? "incomplete" : a.element,
        a.incomplete ? 0xc68a26 : color[a.element],
      ),
    );
    mesh.name = a.id;
    mesh.position.copy(a.point);
    mesh.scale.setScalar(
      a.element === "H"
        ? 0.13
        : a.element === "C"
          ? 0.23
          : a.element === "Cl"
            ? 0.25
            : 0.21,
    );
    mesh.userData = {
      kind: "atom",
      id: a.id,
      element: a.element,
      incomplete: !!a.incomplete,
    };
    group.add(mesh);
  }
  const byId = new Map(model.atoms.map((a) => [a.id, a]));
  function line(
    a: T.Vector3,
    bb: T.Vector3,
    name: string,
    continuation = false,
  ) {
    const delta = bb.clone().sub(a),
      mesh = new T.Mesh(
        cylinder,
        material(
          continuation ? "continuation" : "bond",
          continuation ? 0x8a9bb7 : 0x9aabc4,
        ),
      );
    mesh.name = name;
    mesh.position.copy(a).add(bb).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(
      new T.Vector3(0, 1, 0),
      delta.clone().normalize(),
    );
    mesh.scale.set(0.035, delta.length(), 0.035);
    mesh.userData = { kind: continuation ? "continuation" : "bond" };
    group.add(mesh);
  }
  for (const bb of model.bonds) {
    const a = byId.get(bb.a)!.point,
      z = byId.get(bb.b)!.point;
    if (bb.order === 1) line(a, z, bb.a + "--" + bb.b);
    else {
      let offset = z
        .clone()
        .sub(a)
        .cross(new T.Vector3(0, 0, 1))
        .normalize()
        .multiplyScalar(0.07);
      if (offset.length() < 0.01) offset = new T.Vector3(0.07, 0, 0);
      for (const s of [-1, 1])
        line(
          a.clone().addScaledVector(offset, s),
          z.clone().addScaledVector(offset, s),
          bb.a + "--" + bb.b + "." + s,
        );
    }
  }
  for (const c of model.continuations)
    line(byId.get(c.from)!.point, c.point, c.from + ".continuation", true);
  group.userData = {
    model: "Original idealized polymerisation proposal",
    croppedEnds: !monomer,
    atoms: model.atoms.map((a) => ({ id: a.id, element: a.element })),
    bonds: model.bonds,
    continuations: model.continuations.map((c) => c.from),
    units: model.units,
    geometry:
      "Idealized tetrahedral chain and planar alkene; schematic sizes, no measured conformation or end-group formula claim",
  };
  return group;
}
