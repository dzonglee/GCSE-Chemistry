import * as T from "three";
/** Selected hydrated proton transfer; static atom correspondence, not bulk ionisation statistics. */
export function acidIonisationAsset() {
  const root = new T.Group();
  root.name = "HCl-water-hydrated-proton-transfer";
  root.userData = {
    equation: "HCl + H2O → H3O+ + Cl−",
    atomicConstituentsPerState: 5,
    totalChargePerState: 0,
    representation:
      "Selected before/after proton transfer. Before is a representative reactant configuration, not persistent HCl molecules in an equilibrated strong-acid solution. Remaining solvent and hydration omitted; no numerical pH or population ionisation fraction inferred.",
  };
  const sphere = new T.SphereGeometry(1, 24, 18),
    materials = {
      H: new T.MeshStandardMaterial({ color: 0xb8c6dd }),
      O: new T.MeshStandardMaterial({ color: 0xc05464 }),
      Cl: new T.MeshStandardMaterial({ color: 0x388765 }),
    },
    bondMat = new T.MeshStandardMaterial({ color: 0x8996ac });
  const length = 0.48,
    half = (104.5 * Math.PI) / 360,
    water = [
      new T.Vector3(
        length * Math.sin(half),
        (length * Math.cos(half)) / Math.sqrt(2),
        (length * Math.cos(half)) / Math.sqrt(2),
      ),
      new T.Vector3(
        -length * Math.sin(half),
        (length * Math.cos(half)) / Math.sqrt(2),
        (length * Math.cos(half)) / Math.sqrt(2),
      ),
    ].map((v) => v.applyAxisAngle(new T.Vector3(0, 0, 1), Math.PI / 4));
  const cosine = Math.sqrt((1 + 2 * Math.cos((113 * Math.PI) / 180)) / 3),
    radial = Math.sqrt(1 - cosine * cosine),
    hydronium = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((phi) =>
      new T.Vector3(
        length * radial * Math.cos(phi),
        -length * cosine,
        length * radial * Math.sin(phi),
      )
        .applyAxisAngle(new T.Vector3(0, 0, 1), Math.PI / 4)
        .applyAxisAngle(new T.Vector3(0, 1, 0), Math.PI / 9),
    );
  for (const [index, state] of ["before", "after"].entries()) {
    const frame = new T.Group();
    frame.name = state;
    frame.position.x = index === 0 ? -1.7 : 1.7;
    frame.userData = {
      state,
      totalCharge: 0,
      atomicInventory: "H3OCl",
      rotationCentre: "each represented substance",
    };
    root.add(frame);
    const part = (name: string, x: number, charge: number) => {
      const g = new T.Group();
      g.name = state + "-" + name;
      g.position.set(x, 0, 0);
      g.userData = {
        representedSubstance: name,
        speciesCharge: charge,
        rotateAsSubstance: true,
      };
      frame.add(g);
      return g;
    };
    const atom = (
      g: T.Group,
      id: string,
      element: keyof typeof materials,
      p: T.Vector3,
    ) => {
      const m = new T.Mesh(sphere, materials[element]);
      m.name = state + "-" + id;
      m.position.copy(p);
      m.scale.setScalar(
        element === "H" ? 0.075 : element === "O" ? 0.15 : 0.17,
      );
      m.userData = { atomicId: id, element, kind: "atomic-constituent" };
      g.add(m);
      return m;
    };
    const bond = (g: T.Group, a: T.Vector3, b: T.Vector3) => {
      const m = new T.Mesh(
        new T.CylinderGeometry(0.025, 0.025, a.distanceTo(b), 12),
        bondMat,
      );
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(
        new T.Vector3(0, 1, 0),
        b.clone().sub(a).normalize(),
      );
      m.userData = { kind: "covalent-bond-rod" };
      g.add(m);
    };
    if (state === "before") {
      const acid = part("HCl", -0.65, 0),
        cl = new T.Vector3(-0.25, 0, -0.14),
        h = new T.Vector3(0.25, 0, 0.14);
      atom(acid, "chloride", "Cl", cl);
      atom(acid, "acid-hydrogen", "H", h);
      bond(acid, cl, h);
      const w = part("H2O", 0.6, 0);
      atom(w, "solvent-oxygen", "O", new T.Vector3());
      for (let i = 0; i < 2; i++) {
        atom(w, "solvent-hydrogen-" + (i + 1), "H", water[i]);
        bond(w, new T.Vector3(), water[i]);
      }
    } else {
      const c = part("Cl−", -0.85, -1);
      atom(c, "chloride", "Cl", new T.Vector3());
      const h = part("H3O+", 0.55, 1);
      atom(h, "solvent-oxygen", "O", new T.Vector3());
      for (let i = 0; i < 3; i++) {
        atom(
          h,
          i === 0 ? "acid-hydrogen" : "solvent-hydrogen-" + i,
          "H",
          hydronium[i],
        );
        bond(h, new T.Vector3(), hydronium[i]);
      }
    }
  }
  return root;
}
