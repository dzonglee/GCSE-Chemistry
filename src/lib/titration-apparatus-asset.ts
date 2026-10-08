import * as T from "three";
import { titrationBuretteAsset } from "./titration-burette-asset";
export function titrationApparatusAsset(initial: number, final: number) {
  const states = titrationBuretteAsset(initial, final),
    root = new T.Group();
  root.name = "titration-apparatus-selected-final-state";
  root.userData = {
    initialCm3: initial,
    finalCm3: final,
    deliveredCm3: final - initial,
    representation:
      "Macroscopic schematic apparatus in the selected final state. Burette calibration increases downwards; actual supplied readings retained. Flask is open and uncalibrated; solution is not particles. Indicative dimensions and tinted clear-solution visibility, not indicator colour.",
  };
  const after = states.getObjectByName("burette-after")!;
  states.remove(after);
  after.position.x = 0.8;
  root.add(after);
  const glass = new T.MeshStandardMaterial({
    color: 0xb8c6d9,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    roughness: 0.3,
  });
  const support = new T.MeshStandardMaterial({
    color: 0x536078,
    roughness: 0.5,
  });
  const white = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  function box(
    name: string,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    material: T.Material,
  ) {
    const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    root.add(mesh);
    return mesh;
  }
  box("white-tile", 2, 0.12, 1.6, 0.8, -4.78, 0, white);
  box("stand-base", 0.9, 0.14, 1.5, -0.85, -4.77, 0, support);
  const rod = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 7.7, 12), support);
  rod.name = "vertical-support";
  rod.position.set(-0.85, -0.85, 0);
  root.add(rod);
  box("clamp-arm", 1.5, 0.08, 0.08, -0.1, 1.6, 0, support);
  const clamp = new T.Mesh(new T.TorusGeometry(0.14, 0.025, 8, 24), support);
  clamp.rotation.x = Math.PI / 2;
  clamp.name = "burette-clamp";
  clamp.position.set(0.8, 1.6, 0);
  root.add(clamp);
  const floor = -4.72;
  const profile = [
    new T.Vector2(0, floor),
    new T.Vector2(0.64, floor),
    new T.Vector2(0.68, floor + 0.06),
    new T.Vector2(0.66, floor + 0.25),
    new T.Vector2(0.23, floor + 1.1),
    new T.Vector2(0.19, floor + 1.17),
    new T.Vector2(0.19, floor + 1.44),
    new T.Vector2(0.155, floor + 1.44),
    new T.Vector2(0.155, floor + 1.17),
    new T.Vector2(0.2, floor + 1.09),
    new T.Vector2(0.62, floor + 0.23),
    new T.Vector2(0.625, floor + 0.05),
    new T.Vector2(0, floor + 0.05),
  ];
  const flask = new T.Mesh(new T.LatheGeometry(profile, 48), glass);
  flask.name = "open-conical-flask";
  flask.position.x = 0.8;
  flask.userData = {
    openTop: true,
    bottomY: floor,
    neckTopY: floor + 1.44,
    innerNeckRadius: 0.155,
    notCalibrated: true,
  };
  root.add(flask);
  const fluid = new T.Mesh(
    new T.CylinderGeometry(0.45, 0.615, 0.38, 48),
    new T.MeshStandardMaterial({
      color: 0x93a7d3,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      roughness: 0.3,
    }),
  );
  fluid.name = "flask-clear-solution-visibility-tint";
  fluid.position.set(0.8, floor + 0.24, 0);
  fluid.userData = {
    initialAliquotCm3: 25,
    deliveredTitrantCm3: final - initial,
    illustrativeSurface: true,
    notIndicatorColour: true,
  };
  root.add(fluid);
  root.updateMatrixWorld(true);
  return root;
}
