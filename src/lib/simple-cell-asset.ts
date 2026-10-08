import * as T from "three";
type Metal = "copper" | "zinc" | "magnesium" | "cobalt";
const colours: Record<Metal, number> = {
  copper: 0xbb713e,
  zinc: 0xa3aebd,
  magnesium: 0xd4dbe4,
  cobalt: 0x737d94,
};
/** Real macroscopic apparatus. No computed voltage or electron-particle animation. */
export function simpleCellAsset(
  left: Metal = "copper",
  right: Metal = "zinc",
  liquid = "sodium-chloride",
) {
  if (
    !(left in colours) ||
    !(right in colours) ||
    !["sodium-chloride", "copper-sulfate", "distilled-water"].includes(liquid)
  )
    throw Error("Unknown supplied cell constituent");
  const root = new T.Group();
  root.name = "macroscopic-simple-cell-cutaway";
  root.userData = {
    leftElectrode: left,
    rightElectrode: right,
    electrolyte: liquid,
    representation:
      "Macroscopic apparatus cutaway. Immersed separate metal plates and external high-impedance voltmeter. No current or voltage derived from geometry. Cutaway is for visibility, not an open-front vessel.",
  };
  const add = (
    name: string,
    g: T.BufferGeometry,
    m: T.Material,
    p: T.Vector3,
    kind: string,
  ) => {
    const mesh = new T.Mesh(g, m);
    mesh.name = name;
    mesh.position.copy(p);
    mesh.userData = { kind, representation: "macroscopic apparatus" };
    root.add(mesh);
    return mesh;
  };
  const glass = new T.MeshStandardMaterial({
    color: 0xc7d9ef,
    transparent: true,
    opacity: 0.3,
    side: T.DoubleSide,
    depthWrite: false,
  });
  const solution = new T.MeshStandardMaterial({
    color: liquid === "copper-sulfate" ? 0x529fe0 : 0xbadbe1,
    transparent: true,
    opacity: 0.38,
    side: T.DoubleSide,
    depthWrite: false,
  });
  const dark = new T.MeshStandardMaterial({ color: 0x26314c });
  add(
    "beaker-wall-cutaway",
    new T.LatheGeometry(
      [
        new T.Vector2(0.8, -1),
        new T.Vector2(0.86, 1),
        new T.Vector2(0.9, 1),
        new T.Vector2(0.84, -1),
        new T.Vector2(0.8, -1),
      ],
      48,
      Math.PI / 4,
      Math.PI * 1.5,
    ),
    glass,
    new T.Vector3(),
    "vessel",
  );
  add(
    "beaker-floor",
    new T.CylinderGeometry(0.82, 0.82, 0.06, 48),
    glass,
    new T.Vector3(0, -1, 0),
    "vessel-floor",
  );
  add(
    "electrolyte-volume",
    new T.CylinderGeometry(0.84, 0.8, 1.1, 48),
    solution,
    new T.Vector3(0, -0.4, 0),
    "ionic-electrolyte",
  );
  for (const [side, metal, x] of [
    ["left", left, -0.43],
    ["right", right, 0.43],
  ] as const) {
    const plate = add(
      `${side}-${metal}-electrode`,
      new T.BoxGeometry(0.25, 1.65, 0.09),
      new T.MeshStandardMaterial({
        color: colours[metal],
        metalness: 0.55,
        roughness: 0.35,
      }),
      new T.Vector3(x, 0.05, 0),
      "metal-electrode",
    );
    plate.userData = {
      ...plate.userData,
      metal,
      immersedBottom: -0.775,
      solutionSurface: 0.15,
    };
  }
  const wire = (name: string, points: T.Vector3[], colour: number) =>
    add(
      name,
      new T.TubeGeometry(new T.CatmullRomCurve3(points), 32, 0.026, 8, false),
      new T.MeshStandardMaterial({ color: colour }),
      new T.Vector3(),
      "external-wire",
    );
  wire(
    "left-external-wire",
    [
      new T.Vector3(-0.43, 0.88, 0),
      new T.Vector3(-0.7, 1.35, 0),
      new T.Vector3(-0.5, 1.75, 0),
      new T.Vector3(-0.26, 1.85, 0),
    ],
    0x3b48cc,
  );
  wire(
    "right-external-wire",
    [
      new T.Vector3(0.43, 0.88, 0),
      new T.Vector3(0.7, 1.35, 0),
      new T.Vector3(0.5, 1.75, 0),
      new T.Vector3(0.26, 1.85, 0),
    ],
    0xa44450,
  );
  add(
    "voltmeter-body",
    new T.BoxGeometry(0.82, 0.5, 0.3),
    dark,
    new T.Vector3(0, 1.85, 0),
    "high-impedance-voltmeter",
  );
  add(
    "voltmeter-face",
    new T.BoxGeometry(0.65, 0.33, 0.02),
    new T.MeshStandardMaterial({ color: 0xe8efd9 }),
    new T.Vector3(0, 1.85, 0.161),
    "meter-face",
  );
  // Physical V symbol rather than an invented numeric reading.
  const ink = new T.MeshBasicMaterial({ color: 0x273249 });
  for (const [x, angle] of [
    [-0.065, 0.35],
    [0.065, -0.35],
  ]) {
    const stroke = add(
      `V-symbol-${x}`,
      new T.BoxGeometry(0.027, 0.23, 0.02),
      ink,
      new T.Vector3(x, 1.85, 0.18),
      "voltage-symbol",
    );
    stroke.rotation.z = angle;
  }
  root.updateMatrixWorld(true);
  return root;
}
