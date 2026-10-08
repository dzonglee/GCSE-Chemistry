import * as T from "three";
export function hydroxideOxidationAsset() {
  const root = new T.Group();
  root.name = "hydroxide-half-equation-atomic-reference";
  root.userData = {
    equation: "4OH− → O2 + 2H2O + 4e−",
    atomicInventory: "O4H4",
    combinedChargeIncludingExternal: -4,
    representation:
      "Selected atomic constituents only; background water and hydration shells omitted. Electrons leave to the external circuit and are accounted for separately, not modelled as atoms or dissolved spheres.",
  };
  const geometry = new T.SphereGeometry(1, 24, 18),
    oxygen = new T.MeshStandardMaterial({ color: 0xc05464 }),
    hydrogen = new T.MeshStandardMaterial({ color: 0xb8c6dd }),
    link = new T.MeshStandardMaterial({ color: 0x8996ac });
  for (const state of ["before", "after"] as const) {
    const g = new T.Group();
    g.name = state;
    g.position.x = state === "before" ? -1.7 : 1.7;
    g.userData = {
      state,
      atomicInventory: "O4H4",
      chemicalCharge: state === "before" ? -4 : 0,
      externalElectrons: state === "before" ? 0 : 4,
      externalCharge: state === "before" ? 0 : -4,
      totalIncludingExternal: -4,
    };
    root.add(g);
    function part(
      name: string,
      centre: T.Vector3,
      charge: number,
      rotates = false,
    ) {
      const p = new T.Group();
      p.name = state + "-" + name;
      p.position.copy(centre);
      p.userData = {
        species: name,
        ionicCharge: charge,
        rotateAsSubstance: rotates,
        phase: name.startsWith("hydroxide")
          ? "aqueous"
          : name === "O2"
            ? "gas"
            : "liquid",
      };
      g.add(p);
      return p;
    }
    function atom(
      parent: T.Group,
      id: string,
      element: "O" | "H",
      position: T.Vector3,
    ) {
      const a = new T.Mesh(geometry, element === "O" ? oxygen : hydrogen);
      a.position.copy(position);
      a.scale.setScalar(element === "O" ? 0.15 : 0.075);
      a.name = state + "-" + id;
      a.userData = {
        atomicId: id,
        element,
        species: parent.userData.species,
        representation: "atomic constituent, not an electron or mass portion",
      };
      parent.add(a);
      return a;
    }
    function bond(
      parent: T.Group,
      a: T.Vector3,
      b: T.Vector3,
      from: string,
      to: string,
      order: number,
      offset = 0,
    ) {
      const d = b.clone().sub(a),
        rod = new T.Mesh(
          new T.CylinderGeometry(0.025, 0.025, d.length(), 12),
          link,
        );
      rod.position.copy(a.clone().add(b).multiplyScalar(0.5));
      rod.position.x += offset;
      rod.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize());
      rod.userData = {
        kind: "covalent-bond-rod",
        fromAtom: from,
        toAtom: to,
        bondOrder: order,
      };
      parent.add(rod);
    }
    if (state === "before") {
      for (let i = 0; i < 4; i++) {
        const p = part(
            "hydroxide-" + (i + 1),
            new T.Vector3(
              i % 2 ? 0.7 : -0.7,
              i < 2 ? 0.55 : -0.6,
              i === 0 || i === 3 ? -0.14 : 0.14,
            ),
            -1,
          ),
          a = new T.Vector3(),
          b = new T.Vector3(0, 0.4, 0);
        atom(p, "O-" + (i + 1), "O", a);
        atom(p, "H-" + (i + 1), "H", b);
        bond(p, a, b, "O-" + (i + 1), "H-" + (i + 1), 1);
      }
    } else {
      const oxygenMolecule = part("O2", new T.Vector3(0, 0.65, 0), 0, true),
        a = new T.Vector3(0, 0.35, 0.12),
        b = new T.Vector3(0, -0.35, -0.12);
      atom(oxygenMolecule, "O-1", "O", a);
      atom(oxygenMolecule, "O-2", "O", b);
      bond(oxygenMolecule, a, b, "O-1", "O-2", 2, 0.035);
      bond(oxygenMolecule, a, b, "O-1", "O-2", 2, -0.035);
      const half = (104.5 * Math.PI) / 360;
      for (let i = 0; i < 2; i++) {
        const p = part(
            "H2O-" + (i + 1),
            new T.Vector3(i === 0 ? -0.75 : 0.75, -0.65, 0),
            0,
            true,
          ),
          orientation = new T.Group();
        orientation.name = state + "-water-geometry-" + (i + 1);
        orientation.rotation.y = Math.PI / 4;
        orientation.userData = { species: "H2O-" + (i + 1), phase: "liquid" };
        p.add(orientation);
        const origin = new T.Vector3(),
          vs = [
            new T.Vector3(0.48 * Math.sin(half), 0.48 * Math.cos(half), 0),
            new T.Vector3(-0.48 * Math.sin(half), 0.48 * Math.cos(half), 0),
          ];
        atom(orientation, "O-" + (i + 3), "O", origin);
        vs.forEach((v, j) => {
          const id = "H-" + (i * 2 + j + 1);
          atom(orientation, id, "H", v);
          bond(orientation, origin, v, "O-" + (i + 3), id, 1);
        });
      }
    }
    const frame = new T.LineSegments(
      new T.EdgesGeometry(new T.BoxGeometry(2.8, 2.8, 1.5)),
      new T.LineBasicMaterial({ color: 0xc8d0df }),
    );
    frame.name = state + "-visual-frame";
    frame.userData = { kind: "visual-guide-not-bonds" };
    g.add(frame);
  }
  return root;
}
