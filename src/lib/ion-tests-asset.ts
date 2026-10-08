import * as T from "three";
import { validIon, type IonBoard } from "./ion-tests";
export function makeIonPortions(board: IonBoard) {
  if (!validIon("anion", board))
    throw Error("Unreadable ion-test portion proposal");
  const root = new T.Group();
  root.name = "Student ion-test portion proposal";
  root.userData = {
    version: 1,
    units: "metres",
    record: board.record,
    portion: board.portion || null,
    acid: board.acid || null,
    reagent: board.reagent || null,
    observationsSimulated: false,
  };
  const glass = new T.MeshStandardMaterial({
      color: 0xb8d8e7,
      transparent: true,
      opacity: 0.25,
      roughness: 0.35,
      side: T.DoubleSide,
    }),
    rack = new T.MeshStandardMaterial({ color: 0x273955 }),
    liquid = new T.MeshStandardMaterial({
      color: 0x81bad5,
      transparent: true,
      opacity: 0.32,
    }),
    rubber = new T.MeshStandardMaterial({ color: 0x303d61 });
  const add = (
    g: T.BufferGeometry,
    m: T.Material,
    name: string,
    x: number,
    y: number,
    z = 0,
  ) => {
    const o = new T.Mesh(g, m);
    o.name = name;
    o.position.set(x, y, z);
    root.add(o);
    return o;
  };
  const profile = [
    new T.Vector2(0, 0),
    new T.Vector2(0.004, 0),
    new T.Vector2(0.007, 0.003),
    new T.Vector2(0.009, 0.009),
    new T.Vector2(0.009, 0.12),
    new T.Vector2(0.008, 0.12),
    new T.Vector2(0.008, 0.01),
    new T.Vector2(0.006, 0.005),
    new T.Vector2(0.003, 0.002),
    new T.Vector2(0, 0.002),
  ];
  for (const [i, x] of [-0.048, 0, 0.048].entries()) {
    add(
      new T.LatheGeometry(profile, 32),
      glass,
      `Open portion tube ${i + 1}`,
      x,
      0,
    );
    add(
      new T.CylinderGeometry(0.0075, 0.0075, 0.022, 24),
      liquid,
      `Original aqueous portion ${i + 1}`,
      x,
      0.024,
    );
    const collar = add(
      new T.TorusGeometry(0.011, 0.002, 10, 32),
      rack,
      `Connected support collar ${i + 1}`,
      x,
      0.046,
    );
    collar.rotation.x = Math.PI / 2;
  }
  add(new T.BoxGeometry(0.15, 0.006, 0.044), rack, "Rack base", 0, -0.005);
  for (const x of [-0.069, 0.069])
    add(
      new T.CylinderGeometry(0.002, 0.002, 0.051, 12),
      rack,
      `Rack upright ${x}`,
      x,
      0.0205,
      0.011,
    );
  // The upper bar passes through every collar at its outer edge and each upright.
  add(
    new T.BoxGeometry(0.142, 0.004, 0.004),
    rack,
    "Connected upper rack bar",
    0,
    0.046,
    0.011,
  );
  if (board.portion) {
    const x = board.portion === "fresh" ? -0.048 : 0;
    add(
      new T.CylinderGeometry(0.001, 0.0025, 0.037, 16),
      glass,
      "Selected dropping pipette",
      x,
      0.1425,
    );
    const bulb = add(
      new T.SphereGeometry(0.006, 16, 12),
      rubber,
      "Pipette bulb",
      x,
      0.166,
    );
    bulb.scale.y = 1.4;
    root.userData.selectedTube = board.portion === "fresh" ? 1 : 2;
    root.userData.pipetteTip = [x, 0.124, 0];
  }
  return root;
}
export function disposeIonPortions(root: T.Group) {
  const materials = new Set<T.Material>();
  root.traverse((o) => {
    if (o instanceof T.Mesh) {
      o.geometry.dispose();
      for (const m of Array.isArray(o.material) ? o.material : [o.material])
        materials.add(m);
    }
  });
  materials.forEach((m) => m.dispose());
}
