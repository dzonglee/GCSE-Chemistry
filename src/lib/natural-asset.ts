import * as THREE from "three";
import { dnaCases, type NaturalBoard } from "./natural";
export function naturalDNAAsset(b: NaturalBoard) {
  const r = dnaCases[b.record as keyof typeof dnaCases];
  const root = new THREE.Group();
  root.name = "Schematic DNA excerpt";
  root.userData = {
    kind: "nucleotide-level schematic",
    notAtomic: true,
    source: r.source,
    proposal: { ...b },
    unitCount: r.source.length * Number(b.strands || 2),
    associationIsNotBackboneBond: true,
  };
  const strands = Number(b.strands || 2),
    angleStep = b.shape === "flatLadder" ? 0 : 0.8;
  const colors: Record<string, number> = {
    A: 0xd69b35,
    T: 0x5867d4,
    C: 0x26988a,
    G: 0xbb5278,
    "?": 0xabb4c8,
  };
  const sphere = new THREE.SphereGeometry(0.24, 20, 14),
    cylinder = new THREE.CylinderGeometry(0.055, 0.055, 1, 10),
    baseGeo = new THREE.BoxGeometry(0.42, 0.28, 0.2);
  const mats = new Map<number, THREE.MeshStandardMaterial>();
  const mat = (c: number) => {
    if (!mats.has(c))
      mats.set(
        c,
        new THREE.MeshStandardMaterial({ color: c, roughness: 0.65 }),
      );
    return mats.get(c)!;
  };
  function link(
    a: THREE.Vector3,
    z: THREE.Vector3,
    name: string,
    color: number,
  ) {
    const v = z.clone().sub(a),
      mesh = new THREE.Mesh(cylinder, mat(color));
    mesh.name = name;
    mesh.position.copy(a).add(z).multiplyScalar(0.5);
    mesh.scale.y = v.length();
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      v.normalize(),
    );
    root.add(mesh);
    return mesh;
  }
  const positions: THREE.Vector3[][] = [];
  for (let s = 0; s < strands; s++) {
    const ps: THREE.Vector3[] = [];
    for (let i = 0; i < r.source.length; i++) {
      const separate = b.shape === "singleHelix",
        flat = b.shape === "flatLadder",
        axisX = separate ? (s - (strands - 1) / 2) * 4 : 0;
      const angle =
          i * angleStep + (separate ? 0 : (s * 2 * Math.PI) / strands),
        p = new THREE.Vector3(
          flat ? (s - (strands - 1) / 2) * 3 : axisX + Math.cos(angle) * 1.5,
          (i - (r.source.length - 1) / 2) * 0.75,
          flat ? 0 : Math.sin(angle) * 1.5,
        );
      ps.push(p);
      const group = new THREE.Group();
      group.name = `strand-${s + 1}-nucleotide-${i + 1}`;
      const letter = s === 0 ? r.source[i] : b["p" + i] || "?";
      group.userData = {
        unit: "one nucleotide",
        strand: s + 1,
        position: i + 1,
        base: letter,
        original: s === 0,
      };
      const chosen =
        i === 0 &&
        (b.unit === "rung" ||
          (b.unit === "leftNucleotide" && s === 0) ||
          (b.unit === "rightNucleotide" && s === 1));
      const bead = new THREE.Mesh(
        sphere,
        mat(chosen ? 0x3949d9 : s === 0 ? 0x3b6882 : 0x8b5a91),
      );
      bead.name = "schematic backbone contribution";
      bead.position.copy(p);
      group.add(bead);
      const base = new THREE.Mesh(
        baseGeo,
        mat(
          b.unit === "baseOnly" && i === 0 && s === 0
            ? 0xffff55
            : chosen
              ? 0x3949d9
              : colors[letter] || colors["?"],
        ),
      );
      group.userData.highlightedWholeUnit = chosen;
      base.userData.highlightedBaseOnly =
        b.unit === "baseOnly" && i === 0 && s === 0;
      base.name = "schematic base component";
      base.position.copy(p);
      base.position.x = axisX + (p.x - axisX) * 0.66;
      base.position.z *= 0.66;
      base.position.y = p.y;
      base.rotation.y = -angle;
      group.add(base);
      root.add(group);
      if (i) link(ps[i - 1], p, `strand-${s + 1}-backbone-${i}`, 0x637389);
      link(p, base.position, `strand-${s + 1}-within-unit-${i + 1}`, 0x8590a4);
    }
    positions.push(ps);
  }
  if (strands === 2 && b.shape !== "singleHelix")
    for (let i = 0; i < r.source.length; i++) {
      const a = positions[0][i].clone().multiplyScalar(0.48),
        z = positions[1][i].clone().multiplyScalar(0.48);
      a.y = z.y = positions[0][i].y;
      const l = link(a, z, `paired-base-association-${i + 1}`, 0xb8c2d4);
      l.userData = { association: true, covalentBackboneBond: false };
    }
  return root;
}
export function disposeNaturalAsset(root: THREE.Object3D) {
  const gs = new Set<THREE.BufferGeometry>(),
    ms = new Set<THREE.Material>();
  root.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      gs.add(o.geometry);
      for (const m of Array.isArray(o.material) ? o.material : [o.material])
        ms.add(m);
    }
  });
  gs.forEach((g) => g.dispose());
  ms.forEach((m) => m.dispose());
}
