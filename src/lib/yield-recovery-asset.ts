import * as T from "three";
export function yieldRecoveryAsset(recovered: number) {
  if (!Number.isSafeInteger(recovered) || recovered < 0 || recovered > 10)
    throw Error("Recovered portion count0–10 required");
  const root = new T.Group();
  root.name = "product-recovery-inventory";
  root.userData = {
    representation:
      "Ten identified illustrative2-g mass portions shown before and after collection; not atoms, molecules, product crystals or a physical gram-to-volume scale",
    formedGrams: 20,
    recoveredGrams: recovered * 2,
  };
  const portion = new T.BoxGeometry(0.48, 0.48, 0.48),
    blue = new T.MeshStandardMaterial({ color: 0x3c62cf, roughness: 0.5 }),
    gold = new T.MeshStandardMaterial({ color: 0xc7972a, roughness: 0.5 });
  for (const side of ["before", "after"])
    for (let i = 0; i < 10; i++) {
      const collected = side === "after" && i < recovered,
        retained = side === "after" && i >= recovered,
        j = retained ? i - recovered : i;
      const mesh = new T.Mesh(portion, retained ? gold : blue);
      mesh.name = `${side}-portion-${i}`;
      mesh.userData = {
        side,
        portionId: `product-portion-${i}`,
        grams: 2,
        location:
          side === "before"
            ? "formed product"
            : collected
              ? "collected sample"
              : "retained in apparatus",
      };
      mesh.position.set(
        (side === "before" ? -4 : collected ? 2.3 : 5.4) + (j % 2) * 0.85,
        Math.floor(j / 2) * 0.65 - 1.3,
        Math.floor(j / 2) * 0.2 - 0.4,
      );
      root.add(mesh);
    }
  const glass = new T.MeshStandardMaterial({
    color: 0x8ba7c4,
    transparent: true,
    opacity: 0.16,
    side: T.DoubleSide,
    depthWrite: false,
  });
  for (const [name, x, width] of [
    ["formed-product-boundary", -3.55, 2.5],
    ["collected-sample-boundary", 2.7, 2.5],
    ["retained-apparatus-boundary", 5.8, 2.1],
  ] as const) {
    const boundary = new T.Mesh(new T.BoxGeometry(width, 3.5, 2.3), glass);
    boundary.name = name;
    boundary.position.set(x, 0, 0);
    boundary.userData = { schematicContainer: true, notToScale: true };
    root.add(boundary);
  }
  return root;
}
