import { elements } from "@/content/elements";
export function periodicPosition(atomicNumber: number) {
  const element = elements.find((e) => e.protons === atomicNumber);
  if (!element) throw new Error("Position model covers the first 20 elements");
  return {
    group:
      element.column === 18
        ? 0
        : element.column >= 13
          ? element.column - 10
          : element.column,
    period: element.period,
  };
}
