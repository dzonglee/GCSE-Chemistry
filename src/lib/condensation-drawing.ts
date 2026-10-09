import type { PolyesterDrawingData } from "./polyester";
import { blankPolyesterDrawing, readPolyesterDrawing } from "./polyester";

export type ChainAtom = {
  atom: "CH2" | "C" | "O" | "H";
  oxygen: "0" | "1" | "2";
  hydrogen: "0" | "1";
};
export const groupChoices: Record<string, string[]> = Object.fromEntries(
  ["diolLeft", "diolRight", "acidLeft", "acidRight"].flatMap((end) => [
    [end + "O", ["0", "1", "2"]],
    [end + "H", ["0", "1"]],
    ...(end.startsWith("acid") ? [[end + "Carbonyl", ["0", "1", "2"]]] : []),
  ]),
);
export function blankCondensationDrawing(
  kind: "groups" | "sequence",
): Record<string, string> {
  return kind === "groups"
    ? {
        kind,
        ...Object.fromEntries(
          Object.keys(groupChoices).map((key) => [key, "0"]),
        ),
      }
    : {
        kind,
        chain: "[]",
        left: "0",
        right: "0",
        brackets: "0",
        countMark: "none",
      };
}
export function readChain(raw: string): ChainAtom[] | null {
  try {
    const chain = JSON.parse(raw);
    if (!Array.isArray(chain) || chain.length > 16) return null;
    return chain.every(
      (a) =>
        a &&
        typeof a === "object" &&
        !Array.isArray(a) &&
        Object.keys(a).length === 3 &&
        ["CH2", "C", "O", "H"].includes(a.atom) &&
        ["0", "1", "2"].includes(a.oxygen) &&
        ["0", "1"].includes(a.hydrogen) &&
        (a.atom === "C" || a.oxygen === "0") &&
        (a.atom === "O" || a.hydrogen === "0"),
    )
      ? chain
      : null;
  } catch {
    return null;
  }
}
export function readCondensationDrawing(
  raw: string,
  kind: "groups" | "sequence",
): Record<string, string> | null {
  try {
    const d = JSON.parse(raw),
      blank = blankCondensationDrawing(kind);
    if (
      !d ||
      typeof d !== "object" ||
      Array.isArray(d) ||
      d.kind !== kind ||
      Object.keys(d).length !== Object.keys(blank).length ||
      !Object.keys(blank).every(
        (k) => Object.hasOwn(d, k) && typeof d[k] === "string",
      )
    )
      return null;
    if (kind === "groups")
      return Object.entries(groupChoices).every(([k, choices]) =>
        choices.includes(d[k]),
      )
        ? d
        : null;
    return readChain(d.chain) &&
      [d.left, d.right, d.brackets].every((v) => ["0", "1"].includes(v)) &&
      ["none", "n", "N", "inside"].includes(d.countMark)
      ? { ...d, chain: JSON.stringify(readChain(d.chain)) }
      : null;
  } catch {
    return null;
  }
}
export function blankPolyesterResponse(data: PolyesterDrawingData) {
  return data.construction
    ? blankCondensationDrawing(data.construction)
    : blankPolyesterDrawing();
}
export function readPolyesterResponse(raw: string, data: PolyesterDrawingData) {
  return data.construction
    ? readCondensationDrawing(raw, data.construction)
    : readPolyesterDrawing(raw);
}
export function describePolyesterResponse(
  raw: string,
  data: PolyesterDrawingData,
) {
  const d = readPolyesterResponse(raw, data);
  if (!d) return "Unreadable saved structure; original response retained.";
  if (data.construction === "groups") {
    const bond = (order: string) =>
      order === "0" ? "absent" : order === "1" ? "single" : "double";
    return ["diolLeft", "diolRight", "acidLeft", "acidRight"]
      .map(
        (end) =>
          `${end.startsWith("diol") ? "Diol" : "Diacid"}, ${end.endsWith("Left") ? "left" : "right"} end: outward C–O ${bond(d[end + "O"])}, O–H ${d[end + "H"] === "1" ? "chosen" : "absent"}${end.startsWith("acid") ? `, separate C–O ${bond(d[end + "Carbonyl"])}` : ""}`,
      )
      .join("; ");
  }
  if (data.construction === "sequence")
    return `${
      readChain(d.chain)!
        .map(
          (a) =>
            a.atom +
            (a.oxygen !== "0" ? `(C–O order ${a.oxygen})` : "") +
            (a.hydrogen === "1" ? "(O–H)" : ""),
        )
        .join("–") || "Empty backbone"
    }; continuation ${d.left}/${d.right}, brackets ${d.brackets}, count ${d.countMark}.`;
  return "Retained polyester structure; compare its atoms, connections and notation with the reference.";
}
