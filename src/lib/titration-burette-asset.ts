import * as T from "three";
import { deliveredTitre } from "./titration-calculations";
export function titrationBuretteAsset(initial: number, final: number) {
  const delivered = deliveredTitre(initial, final),
    root = new T.Group();
  root.name = "same-burette-before-and-after";
  root.userData = {
    initialCm3: initial,
    finalCm3: final,
    deliveredCm3: delivered,
    capacityCm3: 50,
    representation:
      "Two states of ONE schematic burette. Zero at top,50 at bottom; linear calibrated section. Supplied numerical readings define precision; rendered ticks are1 cm³,not an examiner reading scale. Remaining solution volumes proportional to calibrated column height; tip/stopcock schematic and excluded from volume scale.",
  };
  const glass = new T.MeshStandardMaterial({
      color: 0xb8c6d9,
      transparent: true,
      opacity: 0.18,
      roughness: 0.3,
      depthWrite: false,
    }),
    liquid = new T.MeshStandardMaterial({
      color: 0x748dcc,
      transparent: true,
      opacity: 0.8,
      roughness: 0.35,
    }),
    metal = new T.MeshStandardMaterial({ color: 0x526078 }),
    tickMaterial = new T.LineBasicMaterial({ color: 0x273449 });
  for (const [state, reading, x] of [
    ["before", initial, -1.2],
    ["after", final, 1.2],
  ] as const) {
    const g = new T.Group();
    g.name = `burette-${state}`;
    g.position.x = x;
    g.userData = {
      state,
      readingCm3: reading,
      remainingCalibratedCm3: 50 - reading,
    };
    root.add(g);
    const shell = new T.Mesh(
      new T.CylinderGeometry(0.115, 0.115, 5, 24, 1, true),
      glass,
    );
    shell.name = `${state}-glass-calibrated-column`;
    g.add(shell);
    const y = 2.5 - reading / 10,
      profile = [
        new T.Vector2(0, -2.5),
        new T.Vector2(0.09, -2.5),
        new T.Vector2(0.09, y + 0.025),
        new T.Vector2(0.07, y + 0.012),
        new T.Vector2(0.035, y + 0.003),
        new T.Vector2(0, y),
      ],
      fluid = new T.Mesh(new T.LatheGeometry(profile, 32), liquid);
    fluid.name = `${state}-solution-column-concave-meniscus`;
    fluid.userData = {
      readingCm3: reading,
      meniscusBottomY: y,
      bottomY: -2.5,
      calibrationCm3PerUnit: 10,
      notParticles: true,
    };
    g.add(fluid);
    const positions: number[] = [];
    for (let v = 0; v <= 50; v++) {
      const markY = 2.5 - v / 10,
        half = v % 5 === 0 ? 0.1 : 0.05;
      positions.push(-half, markY, 0.12, half, markY, 0.12);
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute(
      "position",
      new T.Float32BufferAttribute(positions, 3),
    );
    const ticks = new T.LineSegments(geometry, tickMaterial);
    ticks.name = `${state}-graduations-0-top-50-bottom`;
    ticks.userData = { majorStepCm3: 5, minorStepCm3: 1 };
    g.add(ticks);
    const tap = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 0.35, 12), metal);
    tap.rotation.z = Math.PI / 2;
    tap.position.y = -2.65;
    tap.name = `${state}-schematic-stopcock`;
    g.add(tap);
    const tip = new T.Mesh(new T.ConeGeometry(0.07, 0.4, 16), glass);
    tip.rotation.z = Math.PI;
    tip.position.y = -2.94;
    tip.name = `${state}-uncalibrated-tip`;
    g.add(tip);
  }
  return root;
}
