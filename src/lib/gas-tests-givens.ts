/** Reserved original question figures. No answer, hint, feedback or inferred gas names. */
export type GasGivenData = { record: "pairA" | "pairB" };
export const gasReservedRecords = {
  pairA: [
    {
      label: "A",
      material: "glowingSplint",
      placement: "inside",
      result: "The initially glowing splint relights.",
    },
    {
      label: "B",
      material: "dampBlueLitmus",
      placement: "gasContact",
      result: "Damp litmus is bleached white.",
    },
  ],
  pairB: [
    {
      label: "K",
      material: "burningSplint",
      placement: "mouth",
      result: "A pop is heard.",
    },
    {
      label: "L",
      material: "limewater",
      placement: "belowLiquid",
      result: "The limewater becomes milky.",
    },
  ],
} as const;
Object.values(gasReservedRecords).forEach((records) => {
  records.forEach(Object.freeze);
  Object.freeze(records);
});
Object.freeze(gasReservedRecords);
