import * as T from "three";
import { concentrationLedger } from "./solution-concentration";
export function solutionVolumeAsset(soluteGrams: number, solutionCm3: number) {
  if (
    !Number.isInteger(soluteGrams) ||
    soluteGrams < 1 ||
    soluteGrams > 20 ||
    ![100, 200, 250, 500, 1000].includes(solutionCm3)
  )
    throw Error("Use supported supplied mass and final volume");
  const d = concentrationLedger(soluteGrams, solutionCm3),
    side = 4 * Math.cbrt(d.dm3),
    root = new T.Group();
  root.name = "solution-volume-accounting";
  root.userData = {
    ...d,
    sideDm: Math.cbrt(d.dm3),
    rendererUnitsPerDm: 4,
    representation:
      "Each identified marker accounts for 1 g dissolved solute; not a single molecule, ion or literal volume fraction. Solvent omitted.",
  };
  const glass = new T.MeshStandardMaterial({
      color: 0x9ebde8,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
      side: T.DoubleSide,
    }),
    box = new T.Mesh(new T.BoxGeometry(side, side, side), glass);
  box.name = "final-solution-volume";
  box.position.y = -2 + side / 2;
  box.userData = { solutionCm3, dm3: d.dm3 };
  root.add(box);
  const edge = new T.LineSegments(
    new T.EdgesGeometry(box.geometry),
    new T.LineBasicMaterial({ color: 0x3f4fd0 }),
  );
  edge.name = "solution-volume-boundary";
  edge.position.copy(box.position);
  root.add(edge);
  const geometry = new T.SphereGeometry(0.07, 20, 16),
    material = new T.MeshStandardMaterial({ color: 0xbd8c24 });
  const fraction = (id: number, base: number) => {
    let n = id + 1,
      factor = 1 / base,
      result = 0;
    while (n) {
      result += (n % base) * factor;
      n = Math.floor(n / base);
      factor /= base;
    }
    return result;
  };
  for (let id = 0; id < soluteGrams; id++) {
    const dot = new T.Mesh(geometry, material);
    dot.name = `dissolved-solute-portion-${id}`;
    dot.userData = { portionId: id, grams: 1 };
    dot.position.set(
      (fraction(id, 2) - 0.5) * side * 0.72,
      -2 + side / 2 + (fraction(id, 3) - 0.5) * side * 0.72,
      (fraction(id, 5) - 0.5) * side * 0.72,
    );
    root.add(dot);
  }
  return root;
}
