import * as T from "three";
/** Representative hydrated proton transfer, not complete solvent or a kinetic mechanism. */
export function neutralisationAsset() {
  const root = new T.Group();
  root.name = "hydrated-neutralisation-same-Na-Cl-O2-H4";
  root.userData = {
    equation: "H3O+ + OH− → 2H2O; Na+ and Cl− unchanged",
    gcseEquation: "H+ + OH− → H2O",
    atomicConstituentsPerState: 8,
    totalChargePerState: 0,
    representation:
      "H+ aqueous shorthand is shown hydrated as H3O+. One representative solvent water is explicit; the remaining solvent/hydration shells are omitted. Sodium and chloride remain separate aqueous ions. Static identity correspondence is not a microscopic kinetic mechanism.",
  };
  const geometry = new T.SphereGeometry(1, 24, 18),
    materials = {
      H: new T.MeshStandardMaterial({ color: 0xb8c6dd }),
      O: new T.MeshStandardMaterial({ color: 0xc05464 }),
      Na: new T.MeshStandardMaterial({ color: 0x7550ae }),
      Cl: new T.MeshStandardMaterial({ color: 0x388765 }),
    },
    link = new T.MeshStandardMaterial({ color: 0x8996ac });
  const length = 0.48,
    half = (104.5 * Math.PI) / 360;
  const waterVectors = [
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
    radial = Math.sqrt(1 - cosine * cosine);
  const hydroniumVectors = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map(
    (phi) =>
      new T.Vector3(
        length * radial * Math.cos(phi),
        -length * cosine,
        length * radial * Math.sin(phi),
      )
        .applyAxisAngle(new T.Vector3(0, 0, 1), Math.PI / 4)
        .applyAxisAngle(new T.Vector3(0, 1, 0), Math.PI / 9),
  );
  for (const [index, state] of ["before", "after"].entries()) {
    const container = new T.Group();
    container.name = `neutralisation-${state}`;
    container.position.x = index === 0 ? -1.7 : 1.7;
    root.add(container);
    function part(name: string, centre: T.Vector3, speciesCharge: number) {
      const g = new T.Group();
      g.name = `${state}-${name}`;
      g.position.copy(centre);
      g.userData = {
        rotateAsSubstance: true,
        representedSubstance: name,
        speciesCharge,
      };
      container.add(g);
      return g;
    }
    function atom(
      parent: T.Group,
      id: string,
      element: keyof typeof materials,
      position: T.Vector3,
      formalCharge: number,
    ) {
      const m = new T.Mesh(geometry, materials[element]);
      m.name = `${state}-atom-${id}`;
      m.position.copy(position);
      m.scale.setScalar(
        element === "H" ? 0.075 : element === "O" ? 0.15 : 0.17,
      );
      m.userData = {
        particleId: id,
        element,
        formalCharge,
        parentSpecies: parent.userData.representedSubstance,
        phase: String(parent.userData.representedSubstance).startsWith("water-")
          ? "liquid"
          : "aqueous",
      };
      parent.add(m);
      return m;
    }
    function bond(
      parent: T.Group,
      from: string,
      to: string,
      a: T.Vector3,
      b: T.Vector3,
    ) {
      const d = b.clone().sub(a),
        m = new T.Mesh(
          new T.CylinderGeometry(0.025, 0.025, d.length(), 12),
          link,
        );
      m.position.copy(a.clone().add(b).multiplyScalar(0.5));
      m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize());
      m.name = `${state}-OH-bond-${from}-${to}`;
      m.userData = { bondOrder: 1, fromAtom: from, toAtom: to };
      parent.add(m);
    }
    const acid = part(
        state === "before" ? "hydronium" : "water-from-hydronium",
        new T.Vector3(-0.65, -0.18, 0),
        state === "before" ? 1 : 0,
      ),
      base = part(
        state === "before" ? "hydroxide" : "water-from-hydroxide",
        new T.Vector3(0.65, -0.18, 0),
        state === "before" ? -1 : 0,
      );
    atom(acid, "O-acid", "O", new T.Vector3(), state === "before" ? 1 : 0);
    atom(base, "O-base", "O", new T.Vector3(), state === "before" ? -1 : 0);
    if (state === "before") {
      for (const [i, id] of ["H-acid-0", "H-acid-1", "H-transfer"].entries()) {
        atom(acid, id, "H", hydroniumVectors[i], 0);
        bond(acid, "O-acid", id, new T.Vector3(), hydroniumVectors[i]);
      }
      const p = new T.Vector3(0, 0.48, 0);
      atom(base, "H-base", "H", p, 0);
      bond(base, "O-base", "H-base", new T.Vector3(), p);
    } else {
      for (const [i, id] of ["H-acid-0", "H-acid-1"].entries()) {
        atom(acid, id, "H", waterVectors[i], 0);
        bond(acid, "O-acid", id, new T.Vector3(), waterVectors[i]);
      }
      for (const [i, id] of ["H-base", "H-transfer"].entries()) {
        atom(base, id, "H", waterVectors[i], 0);
        bond(base, "O-base", id, new T.Vector3(), waterVectors[i]);
      }
    }
    const sodium = part("sodium-spectator", new T.Vector3(-0.65, 0.85, 0), 1),
      chloride = part("chloride-spectator", new T.Vector3(0.65, 0.85, 0), -1);
    atom(sodium, "Na-0", "Na", new T.Vector3(), 1);
    atom(chloride, "Cl-0", "Cl", new T.Vector3(), -1);
    const frame = new T.LineSegments(
      new T.EdgesGeometry(new T.BoxGeometry(2.8, 2.35, 1.5)),
      new T.LineBasicMaterial({ color: 0xaab5c8 }),
    );
    frame.position.y = 0.12;
    frame.name = `${state}-comparison-frame`;
    frame.userData = { notChemicalBonds: true };
    container.add(frame);
  }
  return root;
}
