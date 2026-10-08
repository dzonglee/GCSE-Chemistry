// A supplied example inside the specification's approximate upper scale:
// atom radius 1e-10 m; nucleus radius 5e-15 m; ratio 20 000.
export const EXAMPLE_RADIUS_RATIO = 20000;
export function enlargedNucleusRadius(atomRadius: number) {
  return atomRadius / EXAMPLE_RADIUS_RATIO;
}
export function nanoToMetres(value: number, exponent = -9) {
  return value * 10 ** exponent;
}
export function standardForm(value: number): [string, number] {
  const [coefficient, power] = value.toExponential(8).split("e");
  return [String(Number(coefficient)), Number(power)];
}
