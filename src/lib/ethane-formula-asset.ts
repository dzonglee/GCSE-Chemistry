import * as T from "three";
export function ethaneFormulaAsset() {
  const root = new T.Group();
  root.name = "one-intact-ethane-molecule";
  root.userData = {
    molecularFormula: "C2H6",
    empiricalFormula: "CH3",
    representation:
      "One actual molecule; simplest ratio 1:3 is not a separate CH3 molecule. Schematic atomic sizes and lengths; real tetrahedral connectivity.",
  };
  const positions = [new T.Vector3(-0.77, 0, 0), new T.Vector3(0.77, 0, 0)];
  for (const side of [-1, 1])
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3 + (side === 1 ? Math.PI / 3 : 0),
        direction = new T.Vector3(
          side / 3,
          (Math.sqrt(8) / 3) * Math.cos(angle),
          (Math.sqrt(8) / 3) * Math.sin(angle),
        );
      positions.push(
        new T.Vector3(side * 0.77, 0, 0).addScaledVector(direction, 1.09),
      );
    }
  const elements = ["C", "C", "H", "H", "H", "H", "H", "H"],
    pairs = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [1, 5],
      [1, 6],
      [1, 7],
    ];
  const sphere = new T.SphereGeometry(1, 24, 18),
    carbon = new T.MeshStandardMaterial({ color: 0x344254, roughness: 0.4 }),
    hydrogen = new T.MeshStandardMaterial({ color: 0xaebbd4, roughness: 0.4 }),
    bondMaterial = new T.MeshStandardMaterial({ color: 0x79849a });
  positions.forEach((position, index) => {
    const mesh = new T.Mesh(
      sphere,
      elements[index] === "C" ? carbon : hydrogen,
    );
    mesh.position.copy(position);
    mesh.scale.setScalar(elements[index] === "C" ? 0.24 : 0.15);
    mesh.name = `ethane-atom-${index}-${elements[index]}`;
    mesh.userData = { element: elements[index], atomId: `ethane-${index}` };
    root.add(mesh);
  });
  for (const [from, to] of pairs) {
    const delta = positions[to].clone().sub(positions[from]),
      bond = new T.Mesh(
        new T.CylinderGeometry(0.045, 0.045, delta.length(), 12),
        bondMaterial,
      );
    bond.position.copy(positions[from]).add(positions[to]).multiplyScalar(0.5);
    bond.quaternion.setFromUnitVectors(
      new T.Vector3(0, 1, 0),
      delta.clone().normalize(),
    );
    bond.name = `ethane-single-bond-${from}-${to}`;
    bond.userData = { bond: true, order: 1, from, to };
    root.add(bond);
  }
  return root;
}
