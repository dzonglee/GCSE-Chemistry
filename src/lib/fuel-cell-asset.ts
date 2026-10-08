import * as T from "three";
export interface FuelRouteState {
  carrier: string;
  path: string;
  direction: string;
  hydrogenSign: string;
  oxygenSign: string;
}
/** Macroscopic acidic-cell cutaway. Arrows are a student's proposed route, not moving particles. */
export function fuelCellAsset(route: FuelRouteState) {
  const root = new T.Group();
  root.name = "acidic-fuel-cell-cutaway";
  root.userData = {
    ...route,
    representation:
      "Supplied acidic fuel-cell layer/feed/external-circuit topology. Route arrows are proposed schematic annotations, not measured particle speed or a voltage computed from geometry. H+/electron atom-charge accounting is independent of apparatus dimensions.",
  };
  const mat = (color: number, opacity = 1) =>
    new T.MeshStandardMaterial({
      color,
      transparent: opacity < 1,
      opacity,
      roughness: 0.65,
      side: T.DoubleSide,
      depthWrite: opacity === 1,
    });
  const graphite = mat(0x46526c),
    proton = mat(0xbda5d7, 0.65),
    gas = mat(0xbecede, 0.25),
    hydrogen = mat(0x3d52cb),
    oxygen = mat(0xd09a37),
    water = mat(0x50a0c7),
    dark = mat(0x25314c);
  const mesh = (
    name: string,
    geometry: T.BufferGeometry,
    material: T.Material,
    p: T.Vector3,
    kind: string,
  ) => {
    const m = new T.Mesh(geometry, material);
    m.name = name;
    m.position.copy(p);
    m.userData = { kind, representation: "macroscopic apparatus" };
    root.add(m);
    return m;
  };
  mesh(
    "hydrogen-anode-layer",
    new T.BoxGeometry(0.12, 1.5, 1.15),
    graphite,
    new T.Vector3(-0.2, 0, 0),
    "hydrogen-electrode",
  );
  mesh(
    "proton-conducting-electrolyte",
    new T.BoxGeometry(0.26, 1.5, 1.15),
    proton,
    new T.Vector3(0, 0, 0),
    "electrolyte",
  );
  mesh(
    "oxygen-cathode-layer",
    new T.BoxGeometry(0.12, 1.5, 1.15),
    graphite,
    new T.Vector3(0.2, 0, 0),
    "oxygen-electrode",
  );
  mesh(
    "hydrogen-feed-chamber",
    new T.BoxGeometry(0.64, 1.5, 1.15),
    gas,
    new T.Vector3(-0.62, 0, 0),
    "gas-feed-chamber",
  );
  mesh(
    "oxygen-feed-product-chamber",
    new T.BoxGeometry(0.64, 1.5, 1.15),
    gas,
    new T.Vector3(0.62, 0, 0),
    "gas-feed-product-chamber",
  );
  const port = (
    name: string,
    x: number,
    y: number,
    material: T.Material,
    kind: string,
  ) => {
    const m = mesh(
      name,
      new T.CylinderGeometry(0.1, 0.1, 0.75, 24),
      material,
      new T.Vector3(x, y, 0),
      kind,
    );
    m.rotation.z = Math.PI / 2;
    return m;
  };
  port("hydrogen-inlet", -1.22, 0.3, hydrogen, "hydrogen-feed");
  port("oxygen-air-inlet", 1.22, 0.3, oxygen, "oxygen-feed");
  port("water-outlet", 1.22, -0.4, water, "water-product-outlet");
  mesh(
    "support-base",
    new T.BoxGeometry(2.2, 0.1, 1.45),
    mat(0xe1e7f0),
    new T.Vector3(0, -0.82, 0),
    "support",
  );
  const wire = (name: string, points: T.Vector3[]) =>
    mesh(
      name,
      new T.TubeGeometry(new T.CatmullRomCurve3(points), 32, 0.028, 8),
      dark,
      new T.Vector3(),
      "external-wire",
    );
  wire("hydrogen-external-wire", [
    new T.Vector3(-0.2, 0.75, 0),
    new T.Vector3(-0.75, 1.2, 0.1),
    new T.Vector3(-0.4, 1.55, 0.1),
    new T.Vector3(-0.22, 1.6, 0.1),
  ]);
  wire("oxygen-external-wire", [
    new T.Vector3(0.2, 0.75, 0),
    new T.Vector3(0.75, 1.2, 0.1),
    new T.Vector3(0.4, 1.55, 0.1),
    new T.Vector3(0.22, 1.6, 0.1),
  ]);
  mesh(
    "external-electrical-load",
    new T.BoxGeometry(0.45, 0.28, 0.25),
    mat(0x657394),
    new T.Vector3(0, 1.6, 0.1),
    "external-load",
  );
  const arrow = (
    name: string,
    start: T.Vector3,
    end: T.Vector3,
    color: number,
  ) => {
    const delta = end.clone().sub(start),
      length = delta.length(),
      a = new T.ArrowHelper(
        delta.normalize(),
        start,
        length,
        color,
        0.13,
        0.09,
      );
    a.name = name;
    a.userData = {
      kind: "proposed-route-annotation",
      carrier: route.carrier,
      path: route.path,
      direction: route.direction,
      representation:
        "Student's proposed schematic transport route; not measured flow speed or an atom-scale position",
    };
    root.add(a);
  };
  const forward = route.direction === "hydrogen-to-oxygen";
  if (
    route.carrier !== "unset" &&
    route.direction !== "unset" &&
    route.path !== "unset"
  ) {
    const color =
      route.carrier === "protons"
        ? 0x7250bd
        : route.carrier === "electrons"
          ? 0x3d52cb
          : 0xb5791e;
    const y =
      route.path === "external-wire"
        ? 1.8
        : route.path === "electrolyte"
          ? 0
          : 0.3;
    const x = route.path === "gas-inlet" ? -0.95 : 0;
    arrow(
      "proposed-carrier-route",
      new T.Vector3(x + (forward ? -0.35 : 0.35), y, 0.58),
      new T.Vector3(x + (forward ? 0.35 : -0.35), y, 0.58),
      color,
    );
  }
  root.updateMatrixWorld(true);
  return root;
}
