import * as T from "three";
import { attachmentNames, attachmentRequired, subscript } from "./alkanes";
export function kitGeometry(n: number) {
  if (!Number.isInteger(n) || n < 1 || n > 6)
    throw Error("Supplied scaffold must have one to six carbons");
  const length = 1.3,
    a = length * Math.sqrt(2 / 3),
    b = length / Math.sqrt(3);
  const carbons = Array.from(
    { length: n },
    (_, i) =>
      new T.Vector3(
        (i - (n - 1) / 2) * a,
        n === 1 ? 0 : i % 2 ? b / 2 : -b / 2,
        0,
      ),
  );
  const directions = carbons.map((p, i) => {
    if (n === 1)
      return [
        new T.Vector3(1, 1, 1),
        new T.Vector3(-1, -1, 1),
        new T.Vector3(1, -1, -1),
        new T.Vector3(-1, 1, -1),
      ].map((v) => v.normalize());
    if (i > 0 && i < n - 1) {
      const left = carbons[i - 1].clone().sub(p).normalize(),
        right = carbons[i + 1].clone().sub(p).normalize();
      return [
        new T.Vector3(0, -left.y, Math.sqrt(2 / 3)),
        new T.Vector3(0, -left.y, -Math.sqrt(2 / 3)),
        left,
        right,
      ];
    }
    const neighbour = carbons[i === 0 ? 1 : n - 2].clone().sub(p).normalize(),
      perpendicular = new T.Vector3(-neighbour.y, neighbour.x, 0),
      z = new T.Vector3(0, 0, 1);
    const free = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle) =>
      neighbour
        .clone()
        .multiplyScalar(-1 / 3)
        .add(
          perpendicular
            .clone()
            .multiplyScalar(Math.sqrt(8 / 9) * Math.cos(angle)),
        )
        .add(z.clone().multiplyScalar(Math.sqrt(8 / 9) * Math.sin(angle))),
    );
    return i === 0
      ? [free[0], free[1], free[2], neighbour]
      : [free[0], free[1], neighbour, free[2]];
  });
  return { carbons, directions };
}
export function buildAlkaneKit(n: number, selected: ReadonlySet<string>) {
  const group = new T.Group(),
    { carbons, directions } = kitGeometry(n);
  group.name = "Connected alkane construction proposal";
  const carbonMaterial = new T.MeshStandardMaterial({
      color: 0x34445a,
      roughness: 0.5,
    }),
    hydrogenMaterial = new T.MeshStandardMaterial({
      color: 0xf0f3f8,
      roughness: 0.4,
    }),
    bondMaterial = new T.MeshStandardMaterial({
      color: 0x99a8c1,
      roughness: 0.45,
    }),
    extraMaterial = new T.MeshStandardMaterial({
      color: 0xc98045,
      roughness: 0.5,
    });
  function atom(
    name: string,
    element: "C" | "H",
    point: T.Vector3,
    key?: string,
  ) {
    const mesh = new T.Mesh(
      new T.SphereGeometry(element === "C" ? 0.19 : 0.12, 24, 18),
      element === "C" ? carbonMaterial : hydrogenMaterial,
    );
    mesh.name = name;
    mesh.position.copy(point);
    mesh.userData = {
      element,
      atom: true,
      ...(key ? { attachment: key } : {}),
    };
    group.add(mesh);
  }
  function bond(
    name: string,
    start: T.Vector3,
    end: T.Vector3,
    atomA: string,
    atomB: string,
    extra = false,
  ) {
    const vector = end.clone().sub(start),
      mesh = new T.Mesh(
        new T.CylinderGeometry(0.035, 0.035, vector.length(), 12),
        extra ? extraMaterial : bondMaterial,
      );
    mesh.name = name;
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(
      new T.Vector3(0, 1, 0),
      vector.normalize(),
    );
    mesh.userData = {
      covalentBond: true,
      order: 1,
      atomA,
      atomB,
      proposedExtraAttachment: extra,
    };
    group.add(mesh);
  }
  let hydrogens = 0,
    completeValence = true;
  carbons.forEach((point, i) => {
    const carbon = "Carbon C" + (i + 1);
    atom(carbon, "C", point);
    if (i)
      bond(
        "Single C–C bond " + i,
        carbons[i - 1],
        point,
        "Carbon C" + i,
        carbon,
      );
    let attached = 0;
    directions[i].forEach((direction, slot) => {
      const key = "h" + (i * 4 + slot);
      if (!selected.has(key)) return;
      attached++;
      hydrogens++;
      const name = "Hydrogen C" + (i + 1) + " " + attachmentNames[slot],
        position = point.clone().add(direction.clone().multiplyScalar(0.8));
      atom(name, "H", position, key);
      bond(
        "Single C–H attachment " + key,
        point,
        position,
        carbon,
        name,
        !attachmentRequired(n, i, slot),
      );
    });
    const neighbours = Number(i > 0) + Number(i < n - 1);
    if (neighbours + attached !== 4) completeValence = false;
  });
  group.userData = {
    schematic: true,
    ballAndStick: true,
    notToScale: true,
    proposal: true,
    carbons: n,
    hydrogens,
    formula:
      (n === 1 ? "C" : "C" + subscript(n)) +
      (hydrogens ? "H" + (hydrogens === 1 ? "" : subscript(hydrogens)) : ""),
    completeValence,
    carbonCarbonLength: 1.3,
    carbonHydrogenLength: 0.8,
  };
  return group;
}
