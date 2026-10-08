import * as T from "three";
import { originalHydrogens, type AdditionCase, type Element } from "./pathways";
import type { PathwayBoard } from "./pathway-board";
export interface PathwayAtom {
  id: string;
  element: Element;
  point: T.Vector3;
  origin: "original" | "added";
  incomplete: boolean;
}
export interface PathwayBond {
  a: string;
  b: string;
  order: 1 | 2;
  edited: boolean;
}
const CC = 1.3,
  CH = 0.8,
  CO = 1.05,
  CX = 1.12,
  OH = 0.68;
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
function carbonLayout(n: number, orders: number[]) {
  const points = [new T.Vector3()];
  if (n > 1) points.push(new T.Vector3(CC, 0, 0));
  for (let i = 1; i < n - 1; i++) {
    const forward = points[i]
        .clone()
        .sub(points[i - 1])
        .normalize(),
      sp2 = orders[i - 1] === 2 || orders[i] === 2,
      turn = sp2 ? Math.PI / 3 : Math.acos(1 / 3),
      v = forward.applyAxisAngle(
        new T.Vector3(0, 0, 1),
        (i % 2 ? 1 : -1) * turn,
      );
    points.push(points[i].clone().addScaledVector(v, CC));
  }
  const free = points.map((p, i) => {
    const neighbors = [] as T.Vector3[];
    if (i > 0) neighbors.push(points[i - 1].clone().sub(p).normalize());
    if (i < n - 1) neighbors.push(points[i + 1].clone().sub(p).normalize());
    const sp2 =
      (i > 0 && orders[i - 1] === 2) || (i < n - 1 && orders[i] === 2);
    if (neighbors.length === 1) {
      const u = neighbors[0];
      return sp2
        ? [
            u.clone().applyAxisAngle(new T.Vector3(0, 0, 1), (2 * Math.PI) / 3),
            u
              .clone()
              .applyAxisAngle(new T.Vector3(0, 0, 1), (-2 * Math.PI) / 3),
          ]
        : threeFree(u);
    }
    if (sp2)
      return [neighbors[0].clone().add(neighbors[1]).negate().normalize()];
    const base = neighbors[0].clone().add(neighbors[1]).multiplyScalar(-0.5);
    return [
      base.clone().add(new T.Vector3(0, 0, Math.sqrt(2 / 3))),
      base.clone().add(new T.Vector3(0, 0, -Math.sqrt(2 / 3))),
    ];
  });
  return { points, free };
}
export function pathwayGeometry(r: AdditionCase, b: PathwayBoard) {
  const validSite =
      b.site !== "" &&
      Number.isInteger(Number(b.site)) &&
      Number(b.site) >= 0 &&
      Number(b.site) < r.n - 1,
    site = validSite ? Number(b.site) : -1,
    orders = Array.from({ length: r.n - 1 }, (_, i) =>
      i === site ? Number(b.bond) : i === r.double ? 2 : 1,
    ),
    layout = carbonLayout(r.n, orders),
    atoms: PathwayAtom[] = layout.points.map((point, i) => ({
      id: "original.C" + i,
      element: "C",
      point: point.clone(),
      origin: "original",
      incomplete: false,
    })),
    bonds: PathwayBond[] = [];
  function add(
    id: string,
    element: Element,
    point: T.Vector3,
    origin: "original" | "added",
  ) {
    atoms.push({ id, element, point, origin, incomplete: false });
    return id;
  }
  function bond(a: string, b: string, order: 1 | 2 = 1, edited = false) {
    bonds.push({ a, b, order, edited });
  }
  for (let i = 0; i < r.n - 1; i++)
    if (orders[i])
      bond(
        "original.C" + i,
        "original.C" + (i + 1),
        orders[i] as 1 | 2,
        i === site,
      );
  const originalH = originalHydrogens(r);
  const pendingOH: { id: string; carbon: string }[] = [];
  for (let i = 0; i < r.n; i++) {
    const c = "original.C" + i,
      p = layout.points[i],
      directions = layout.free[i];
    let slot = 0;
    const nextDirection = () => {
      const v =
        directions[slot] ??
        new T.Vector3(
          Math.cos(slot * 2.399),
          Math.sin(slot * 2.399),
          slot % 2 ? 1 : -1,
        ).normalize();
      slot++;
      return v;
    };
    for (let h = 0; h < originalH[i]; h++)
      bond(
        c,
        add(
          "original.C" + i + ".H" + h,
          "H",
          p.clone().addScaledVector(nextDirection(), CH),
          "original",
        ),
      );
    if (validSite && (i === site || i === site + 1)) {
      const index = i - site,
        g = b[index === 0 ? "leftNew" : "rightNew"];
      if (g === "none") continue;
      const dir = nextDirection(),
        id = "added.C" + i;
      if (g === "H")
        bond(
          c,
          add(id + ".H", "H", p.clone().addScaledVector(dir, CH), "added"),
          1,
          true,
        );
      else if (g === "OH" || g === "O") {
        const oxygen = add(
          id + ".O",
          "O",
          p.clone().addScaledVector(dir, CO),
          "added",
        );
        bond(c, oxygen, 1, true);
        if (g === "OH" && b["ohH" + index] === "1")
          pendingOH.push({ id: oxygen, carbon: c });
      } else if (g === "Cl" || g === "Br" || g === "I")
        bond(
          c,
          add(id + "." + g, g, p.clone().addScaledVector(dir, CX), "added"),
          1,
          true,
        );
    }
  }
  // Choose a bent O–H direction using the real existing atoms, not a screen-space offset.
  const radius = (e: Element) =>
    e === "H"
      ? 0.13
      : e === "C"
        ? 0.23
        : e === "O"
          ? 0.22
          : e === "Cl"
            ? 0.25
            : e === "Br"
              ? 0.28
              : 0.31;
  for (const item of pendingOH) {
    const oxygen = atoms.find((a) => a.id === item.id)!,
      carbon = atoms.find((a) => a.id === item.carbon)!,
      u = carbon.point.clone().sub(oxygen.point).normalize(),
      seed =
        Math.abs(u.z) < 0.9 ? new T.Vector3(0, 0, 1) : new T.Vector3(0, 1, 0),
      p = seed.clone().cross(u).normalize(),
      q = u.clone().cross(p).normalize();
    let best = new T.Vector3(),
      score = -Infinity;
    for (let step = 0; step < 16; step++) {
      const angle = (step * Math.PI) / 8,
        d = u
          .clone()
          .multiplyScalar(Math.cos((104.5 * Math.PI) / 180))
          .add(
            p
              .clone()
              .multiplyScalar(
                Math.sin((104.5 * Math.PI) / 180) * Math.cos(angle),
              ),
          )
          .add(
            q
              .clone()
              .multiplyScalar(
                Math.sin((104.5 * Math.PI) / 180) * Math.sin(angle),
              ),
          ),
        point = oxygen.point.clone().addScaledVector(d, OH);
      let min = Infinity;
      for (const a of atoms)
        if (a.id !== oxygen.id)
          min = Math.min(
            min,
            point.distanceTo(a.point) / (0.13 + radius(a.element)),
          );
      if (min > score) {
        score = min;
        best = point;
      }
    }
    bond(oxygen.id, add(oxygen.id + ".H", "H", best, "added"), 1, false);
  }
  const valence = new Map(atoms.map((a) => [a.id, 0]));
  for (const edge of bonds) {
    valence.set(edge.a, valence.get(edge.a)! + edge.order);
    valence.set(edge.b, valence.get(edge.b)! + edge.order);
  }
  for (const a of atoms)
    a.incomplete =
      valence.get(a.id) !== (a.element === "C" ? 4 : a.element === "O" ? 2 : 1);
  return { atoms, bonds, orders, site };
}
export function buildPathwayAsset(r: AdditionCase, b: PathwayBoard) {
  const model = pathwayGeometry(r, b),
    root = new T.Group(),
    sphere = new T.SphereGeometry(1, 16, 12),
    cylinder = new T.CylinderGeometry(1, 1, 1, 10),
    colours: Record<Element, string> = {
      C: "#34445e",
      H: "#eaf0fa",
      O: "#d95651",
      Cl: "#23976d",
      Br: "#94613d",
      I: "#7555aa",
    },
    radii: Record<Element, number> = {
      C: 0.23,
      H: 0.13,
      O: 0.22,
      Cl: 0.25,
      Br: 0.28,
      I: 0.31,
    },
    materials = Object.fromEntries(
      (Object.keys(colours) as Element[]).map((e) => [
        e,
        new T.MeshStandardMaterial({
          color: colours[e],
          roughness: 0.58,
          metalness: 0,
        }),
      ]),
    ) as Record<Element, T.MeshStandardMaterial>,
    amber = new T.MeshStandardMaterial({ color: "#dd9a35" }),
    ordinaryBond = new T.MeshStandardMaterial({ color: "#7c8eab" }),
    editedBond = new T.MeshStandardMaterial({ color: "#3c66d0" }),
    byId = new Map(model.atoms.map((a) => [a.id, a]));
  for (const a of model.atoms) {
    const mesh = new T.Mesh(
      sphere,
      a.incomplete ? amber : materials[a.element],
    );
    mesh.name = a.id;
    mesh.position.copy(a.point);
    mesh.scale.setScalar(radii[a.element]);
    mesh.userData = {
      kind: "atom",
      id: a.id,
      element: a.element,
      origin: a.origin,
      incomplete: a.incomplete,
    };
    root.add(mesh);
  }
  for (const edge of model.bonds) {
    const a = byId.get(edge.a)!.point,
      bp = byId.get(edge.b)!.point,
      d = bp.clone().sub(a);
    for (let strand = 0; strand < edge.order; strand++) {
      const offset =
          edge.order === 2
            ? new T.Vector3(0, 0, strand === 0 ? -0.055 : 0.055)
            : new T.Vector3(),
        start = a.clone().add(offset),
        end = bp.clone().add(offset),
        mesh = new T.Mesh(cylinder, edge.edited ? editedBond : ordinaryBond);
      mesh.name = edge.a + "--" + edge.b + "." + strand;
      mesh.position.copy(start).add(end).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(
        new T.Vector3(0, 1, 0),
        d.clone().normalize(),
      );
      mesh.scale.set(0.035, d.length(), 0.035);
      mesh.userData = {
        kind: "bond",
        a: edge.a,
        b: edge.b,
        order: edge.order,
        strand,
        edited: edge.edited,
      };
      root.add(mesh);
    }
  }
  const center = new T.Box3().setFromObject(root).getCenter(new T.Vector3());
  for (const child of root.children) child.position.sub(center);
  root.userData = {
    centerOffset: center.toArray(),
    kind: "pathway-proposal",
    originalName: r.name,
    originalCarbons: r.n,
    originalDouble: r.double,
    providedReagent: r.reagent,
    chosenBoard: { ...b },
    atomCount: model.atoms.length,
    conformations: "schematic; not a stereochemical or kinetic prediction",
  };
  return root;
}
