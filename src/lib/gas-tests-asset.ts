import * as THREE from "three";
import { validGas, type GasBoard } from "./gas-tests-domain";
/** Metres; apparatus proposal, not a reaction or measured-result simulation. */
export const gasApparatusDimensions = Object.freeze({
  tubeHeight: 0.12,
  tubeOuterRadius: 0.009,
  tubeInnerRadius: 0.008,
  liquidSurface: 0.04,
  liquidBottom: 0.009,
  mouth: 0.12,
  insertedTip: 0.07,
  submergedOutlet: 0.021,
  aboveLiquidOutlet: 0.065,
});
const material = (
  colour: number,
  options: THREE.MeshStandardMaterialParameters = {},
) =>
  new THREE.MeshStandardMaterial({ color: colour, roughness: 0.5, ...options });
function mesh(
  group: THREE.Group,
  geometry: THREE.BufferGeometry,
  surface: THREE.Material,
  name: string,
  position: [number, number, number] = [0, 0, 0],
) {
  const object = new THREE.Mesh(geometry, surface);
  object.name = name;
  object.position.set(...position);
  group.add(object);
  return object;
}
function rod(
  group: THREE.Group,
  from: THREE.Vector3,
  to: THREE.Vector3,
  radius: number,
  surface: THREE.Material,
  name: string,
) {
  const direction = to.clone().sub(from),
    object = mesh(
      group,
      new THREE.CylinderGeometry(radius, radius, direction.length(), 16),
      surface,
      name,
    );
  object.position.copy(from.clone().add(to).multiplyScalar(0.5));
  object.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );
  return object;
}
export function makeGasApparatus(board: GasBoard): THREE.Group {
  if (!validGas("procedure", board))
    throw Error("Unreadable gas-test apparatus proposal.");
  const d = gasApparatusDimensions,
    group = new THREE.Group();
  group.name = "Student gas-test apparatus proposal";
  group.userData = {
    units: "metres",
    record: board.record,
    material: board.material || null,
    placement: board.placement || null,
    dimensions: d,
    observationsSimulated: false,
    description:
      "Geometry depicts retained starting choices. It does not alter original experiment observations.",
  };
  const glass = material(0xb9d6e8, {
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    metalness: 0.05,
  });
  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.004, 0),
    new THREE.Vector2(0.007, 0.003),
    new THREE.Vector2(d.tubeOuterRadius, 0.009),
    new THREE.Vector2(d.tubeOuterRadius, d.tubeHeight),
    new THREE.Vector2(d.tubeInnerRadius, d.tubeHeight),
    new THREE.Vector2(d.tubeInnerRadius, 0.01),
    new THREE.Vector2(0.006, 0.005),
    new THREE.Vector2(0.003, 0.002),
    new THREE.Vector2(0, 0.002),
  ];
  mesh(
    group,
    new THREE.LatheGeometry(profile, 40),
    glass,
    "Open test tube with closed rounded bottom",
  );
  const rack = material(0x273955),
    wood = material(0xb78c59);
  mesh(
    group,
    new THREE.BoxGeometry(0.065, 0.005, 0.047),
    rack,
    "Rack base",
    [0, -0.005, 0],
  );
  const collar = mesh(
    group,
    new THREE.TorusGeometry(0.011, 0.002, 12, 40),
    rack,
    "Tube support collar",
    [0, 0.047, 0],
  );
  collar.rotation.x = Math.PI / 2;
  for (const x of [-0.025, 0.025])
    rod(
      group,
      new THREE.Vector3(x, -0.005, 0),
      new THREE.Vector3(x, 0.047, 0),
      0.002,
      rack,
      `Rack upright ${x}`,
    );
  rod(
    group,
    new THREE.Vector3(-0.025, 0.047, 0),
    new THREE.Vector3(-0.011, 0.047, 0),
    0.002,
    rack,
    "Left collar support",
  );
  rod(
    group,
    new THREE.Vector3(0.011, 0.047, 0),
    new THREE.Vector3(0.025, 0.047, 0),
    0.002,
    rack,
    "Right collar support",
  );
  if (!board.material) return group;
  const point =
    board.placement === "inside"
      ? new THREE.Vector3(0, d.insertedTip, 0)
      : board.placement === "belowLiquid"
        ? new THREE.Vector3(0, d.submergedOutlet, 0)
        : board.placement === "aboveLiquid"
          ? new THREE.Vector3(0, d.aboveLiquidOutlet, 0)
          : board.placement === "gasContact"
            ? new THREE.Vector3(0, 0.105, 0)
            : board.placement === "away"
              ? new THREE.Vector3(0.048, 0.12, 0)
              : board.placement === "mouth"
                ? new THREE.Vector3(0, d.mouth, 0)
                : null;
  if (!point) return group; // An unanswered position is not silently inferred.
  group.userData.proposedContactPoint = point.toArray();
  if (board.material.endsWith("Splint")) {
    const far =
      point.y < d.mouth && point.x === 0
        ? point
            .clone()
            .add(
              new THREE.Vector3(
                0,
                Math.max(0.08, d.mouth - point.y + 0.025),
                0,
              ),
            )
        : point.clone().add(new THREE.Vector3(0.052, 0.058, 0));
    const splint = rod(
      group,
      point,
      far,
      0.0012,
      wood,
      "Selected wooden splint",
    );
    splint.userData.endpoints = [point.toArray(), far.toArray()];
    const tip = mesh(
      group,
      new THREE.SphereGeometry(0.0018, 16, 12),
      material(board.material === "unlitSplint" ? 0x65584b : 0xeb6b26, {
        emissive: board.material === "unlitSplint" ? 0x000000 : 0xb73b12,
        emissiveIntensity: 0.7,
      }),
      "Initial splint end",
      point.toArray() as [number, number, number],
    );
    tip.userData.initialState = board.material;
    if (board.material === "burningSplint") {
      const flame = mesh(
        group,
        new THREE.ConeGeometry(0.0035, 0.012, 16),
        material(0xffb32b, { emissive: 0xff8d00, emissiveIntensity: 0.7 }),
        "Initial visible flame",
        [point.x, point.y + 0.006, point.z],
      );
      flame.userData.kind =
        "Chosen initial burning state; not a simulated result";
    }
  } else if (board.material === "limewater" || board.material === "water") {
    const liquid = mesh(
      group,
      new THREE.CylinderGeometry(
        0.0077,
        0.0077,
        d.liquidSurface - d.liquidBottom,
        32,
      ),
      material(0x8ccdde, { transparent: true, opacity: 0.34 }),
      "Selected clear receiving liquid",
      [0, (d.liquidSurface + d.liquidBottom) / 2, 0],
    );
    liquid.userData.reagent = board.material;
    const outside = new THREE.Vector3(-0.03, 0.155, 0),
      bendStart = new THREE.Vector3(-0.004, 0.155, 0),
      bendEnd = new THREE.Vector3(0, 0.151, 0),
      delivery = material(0xa5bdcc, {
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      });
    const path = new THREE.CurvePath<THREE.Vector3>();
    path.add(new THREE.LineCurve3(outside, bendStart));
    path.add(
      new THREE.QuadraticBezierCurve3(
        bendStart,
        new THREE.Vector3(0, 0.155, 0),
        bendEnd,
      ),
    );
    path.add(new THREE.LineCurve3(bendEnd, point));
    mesh(
      group,
      new THREE.TubeGeometry(path, 80, 0.0018, 16, false),
      delivery,
      "Continuous delivery outer wall",
    );
    mesh(
      group,
      new THREE.TubeGeometry(path, 80, 0.0013, 16, false),
      delivery,
      "Continuous delivery inner wall",
    );
    const outlet = mesh(
      group,
      new THREE.TorusGeometry(0.00155, 0.00025, 8, 24),
      delivery,
      "Selected open outlet",
      point.toArray() as [number, number, number],
    );
    outlet.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      point.clone().sub(bendEnd).normalize(),
    );
    const inlet = mesh(
      group,
      new THREE.TorusGeometry(0.00155, 0.00025, 8, 24),
      delivery,
      "Open delivery inlet",
      outside.toArray() as [number, number, number],
    );
    inlet.rotation.y = Math.PI / 2;
  } else {
    const paper = mesh(
      group,
      new THREE.BoxGeometry(0.007, 0.023, 0.0003),
      material(0x4266bc),
      "Selected blue litmus strip",
      point.toArray() as [number, number, number],
    );
    paper.userData.condition =
      board.material === "dampBlueLitmus" ? "damp" : "dry";
    rod(
      group,
      new THREE.Vector3(point.x, point.y + 0.0115, point.z),
      new THREE.Vector3(point.x, Math.max(0.15, point.y + 0.035), point.z),
      0.0007,
      rack,
      "Paper holding stem",
    );
    if (board.material === "dampBlueLitmus")
      mesh(
        group,
        new THREE.SphereGeometry(0.001, 12, 10),
        material(0xaedce8, { transparent: true, opacity: 0.7 }),
        "Damp-paper surface marker",
        [point.x, point.y, point.z + 0.0005],
      );
  }
  return group;
}
export function disposeGasApparatus(group: THREE.Group) {
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    (Array.isArray(object.material)
      ? object.material
      : [object.material]
    ).forEach((surface) => surface.dispose());
  });
}
