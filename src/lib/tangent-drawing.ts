export const emptyTangentDrawing = () => ({
  tx0: "",
  ty0: "",
  tx1: "",
  ty1: "",
});

export function readTangentDrawing(
  value: string,
): Record<string, string> | null {
  if (!value) return emptyTangentDrawing();
  try {
    const b = JSON.parse(value),
      keys = Object.keys(emptyTangentDrawing());
    return b &&
      typeof b === "object" &&
      !Array.isArray(b) &&
      Object.keys(b).length === keys.length &&
      keys.every((k) => typeof b[k] === "string" && b[k].length <= 50)
      ? b
      : null;
  } catch {
    return null;
  }
}
