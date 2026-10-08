import * as THREE from "three";
import {
  oilColumns,
  oilTraces,
  columnOrder,
  traceOutcome,
  type OilMode,
} from "./crude-oil";
export type ColumnView = {
  kind: "column" | "trace";
  record: string;
  temperatures?: number[];
  step?: number;
};
export function traceDisplay(record: string, step: number) {
  const r = oilTraces[record],
    o = traceOutcome(r),
    s = Math.max(0, Math.min(6, Math.floor(step)));
  if (o.path === "residue")
    return {
      phase: "liquid",
      station: "Liquid residue retained below the trays",
      point: [0.08, -1.72, 0.13],
      formula: r.formula,
      collectedTray: 0,
    };
  if (o.path === "condensed" && s >= o.tray)
    return {
      phase: "liquid",
      station: `Collected as liquid at tray ${o.tray}; it does not continue rising`,
      point: [0.96, -1.3 + (o.tray - 1) * 0.65, 0.1],
      formula: r.formula,
      collectedTray: o.tray,
    };
  if (s === 6)
    return {
      phase: "gas",
      station: "Leaves through the top gas outlet",
      point: [1.02, 2.12, 0.1],
      formula: r.formula,
      collectedTray: 0,
    };
  if (s === 0)
    return {
      phase: "gas",
      station: "Vaporised supplied feed component",
      point: [-0.98, -1.54, 0.1],
      formula: r.formula,
      collectedTray: 0,
    };
  return {
    phase: "gas",
    station: `Vapour reaches tray ${s} at ${r.trays[s - 1]} °C`,
    point: [0.08, -1.3 + (s - 1) * 0.65, 0.13],
    formula: r.formula,
    collectedTray: 0,
  };
}
export function buildOilColumn(view: ColumnView): THREE.Group {
  const group = new THREE.Group();
  group.name = "Cutaway fractionating column";
  group.userData = {
    schematic: true,
    cutaway: true,
    notToScale: true,
    kind: view.kind,
    record: view.record,
  };
  const steel = new THREE.MeshStandardMaterial({
      color: 0x9cafc4,
      metalness: 0.45,
      roughness: 0.35,
      side: THREE.DoubleSide,
    }),
    dark = new THREE.MeshStandardMaterial({ color: 0x34445d }),
    liquid = new THREE.MeshStandardMaterial({
      color: 0x557fca,
      transparent: true,
      opacity: 0.8,
    }),
    hot = new THREE.MeshStandardMaterial({ color: 0xcf6d3e });
  const add = (
    name: string,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: number[],
  ) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(position[0], position[1], position[2]);
    group.add(mesh);
    return mesh;
  };
  add(
    "Half-shell cutaway",
    new THREE.CylinderGeometry(
      0.51,
      0.51,
      3.72,
      40,
      1,
      true,
      Math.PI / 2,
      Math.PI,
    ),
    steel,
    [0, 0, 0],
  );
  add(
    "Column base",
    new THREE.CylinderGeometry(0.51, 0.51, 0.1, 40),
    dark,
    [0, -1.88, 0],
  );
  add(
    "Column cap",
    new THREE.CylinderGeometry(0.51, 0.51, 0.08, 40),
    steel,
    [0, 1.9, 0],
  );
  const curveTube = (name: string, points: THREE.Vector3[], material = dark) =>
    add(
      name,
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points),
        32,
        0.055,
        10,
        false,
      ),
      material,
      [0, 0, 0],
    );
  curveTube("Top gas outlet", [
    new THREE.Vector3(0, 1.94, 0),
    new THREE.Vector3(0, 2.12, 0),
    new THREE.Vector3(0.35, 2.16, 0),
    new THREE.Vector3(1.18, 2.16, 0),
  ]);
  curveTube("Residue outlet", [
    new THREE.Vector3(0, -1.94, 0),
    new THREE.Vector3(0, -2.13, 0),
    new THREE.Vector3(0.34, -2.2, 0),
    new THREE.Vector3(0.85, -2.2, 0),
  ]);
  add(
    "Feed heater schematic",
    new THREE.BoxGeometry(0.56, 0.74, 0.66),
    hot,
    [-1.12, -1.55, 0],
  );
  curveTube("Heated feed inlet", [
    new THREE.Vector3(-1.12, -1.18, 0),
    new THREE.Vector3(-0.84, -1.22, 0),
    new THREE.Vector3(-0.57, -1.42, 0),
    new THREE.Vector3(-0.39, -1.52, 0),
  ]);
  const temps =
    view.kind === "trace"
      ? oilTraces[view.record].trays
      : (view.temperatures ?? columnOrder(oilColumns[view.record]))
          .slice()
          .reverse();
  const low = Math.min(...temps),
    high = Math.max(...temps);
  temps.forEach((temperature, i) => {
    const y = view.kind === "trace" ? -1.3 + i * 0.65 : -1.3 + i * 0.87;
    const tray = add(
      `Tray${i + 1}`,
      new THREE.CylinderGeometry(0.46, 0.46, 0.06, 40),
      steel,
      [0, y, 0],
    );
    tray.userData = {
      tray: i + 1,
      temperature,
      unit: "°C",
      notAnExactIndustrialCut: true,
    };
    // Each stage has an outlet and a schematic bubble-cap marker; the shell is deliberately cut away.
    curveTube(`Tray${i + 1} liquid outlet`, [
      new THREE.Vector3(0.37, y, 0),
      new THREE.Vector3(0.66, y - 0.06, 0),
      new THREE.Vector3(1.14, y - 0.06, 0),
    ]);
    add(
      `Tray${i + 1} bubble-cap schematic`,
      new THREE.CylinderGeometry(0.12, 0.12, 0.12, 20),
      dark,
      [-0.18, y + 0.09, 0],
    );
    const color = new THREE.Color(0x4b7cd3).lerp(
      new THREE.Color(0xdf7039),
      (temperature - low) / (high - low || 1),
    );
    add(
      `Temperature marker${i + 1}`,
      new THREE.BoxGeometry(0.08, 0.34, 0.1),
      new THREE.MeshStandardMaterial({ color }),
      [-0.57, y + 0.15, 0],
    ).userData = { temperature, unit: "°C" };
  });
  if (view.kind === "trace") {
    const display = traceDisplay(view.record, view.step ?? 0);
    group.userData = {
      ...group.userData,
      formula: display.formula,
      phase: display.phase,
      station: display.station,
      step: view.step ?? 0,
      feedTemperature: oilTraces[view.record].feed,
      boilingPoint: oilTraces[view.record].bp,
    };
    const marker = add(
      "Selected component tracer — not an atom",
      new THREE.SphereGeometry(0.115, 24, 16),
      new THREE.MeshStandardMaterial({
        color: display.phase === "gas" ? 0xe2b53c : 0x3e74bf,
      }),
      display.point,
    );
    marker.userData = {
      formula: display.formula,
      markerNotMolecularScale: true,
      identityUnchanged: true,
    };
    if (display.collectedTray) {
      const y = -1.3 + (display.collectedTray - 1) * 0.65;
      add(
        "Selected component condensed liquid schematic",
        new THREE.CylinderGeometry(0.43, 0.43, 0.025, 40),
        liquid,
        [0, y + 0.055, 0],
      );
    }
    if (traceOutcome(oilTraces[view.record]).path === "residue")
      add(
        "Unvaporised residue schematic",
        new THREE.CylinderGeometry(0.43, 0.43, 0.12, 40),
        liquid,
        [0, -1.77, 0],
      );
  }
  return group;
}
export const oilAssetModes: OilMode[] = ["column", "trace"];
