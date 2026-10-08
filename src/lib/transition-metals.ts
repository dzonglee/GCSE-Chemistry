export const physicalComparisons = [
  "melting",
  "density",
  "hardness",
  "strength",
] as const;
export const comparisonStatements = {
  melting: "Generally higher melting points",
  density: "Generally higher densities",
  hardness: "Generally harder",
  strength: "Generally stronger",
  reactivity: "Generally less reactive with cold water",
  colour: "Many form coloured compounds",
  charge: "Many form ions with different charges",
};
export const transitionExamples = [
  { symbol: "Cr", name: "Chromium", melting: 1907, density: 7.19 },
  { symbol: "Mn", name: "Manganese", melting: 1246, density: 7.21 },
  { symbol: "Fe", name: "Iron", melting: 1538, density: 7.874 },
  { symbol: "Co", name: "Cobalt", melting: 1495, density: 8.9 },
  { symbol: "Ni", name: "Nickel", melting: 1455, density: 8.908 },
  { symbol: "Cu", name: "Copper", melting: 1085, density: 8.96 },
];
export const catalystData = [
  { time: 0, without: 0, with: 0 },
  { time: 10, without: 8, with: 16 },
  { time: 20, without: 14, with: 22 },
  { time: 30, without: 18, with: 24 },
  { time: 40, without: 21, with: 24 },
  { time: 50, without: 23, with: 24 },
  { time: 60, without: 24, with: 24 },
];
