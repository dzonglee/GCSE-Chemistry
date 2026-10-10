// Mechanics for the experimental ionic-bonding lesson. No examiner scoring.
export const LAB_WORK = "experiment-ionic-bonding";
export const LAB_DRAFT = "ionic-lab-v1";
export const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
export type Compound = "NaCl" | "MgCl2" | "MgO" | "Na2O";
export type Charge = "" | "-2" | "-1" | "0" | "1" | "2";
export type Drawing = {
  transfers: number[];
  metalCharge: Charge;
  nonmetalCharge: Charge;
  brackets: "" | "yes" | "no";
};
export type LabRun = {
  kind: "check" | "review";
  started: number;
  index: number;
  drawing: Drawing;
  force: string;
  writing: string;
  recorded: boolean[];
};
export type FinishedRun = LabRun & {
  submitted: number;
  helped: true;
  fresh: false;
};
export type LabState = {
  version: 1;
  scene: number;
  nacl: { sent: number; charge: Charge; checked: boolean };
  mgcl: { transfers: number[]; ratio: string; checked: boolean };
  lattice: {
    depth: boolean;
    guess: string;
    checked: boolean;
    focus?: "sodium" | "chloride";
    forces?: boolean;
    relationship?: "donor" | "network";
    relationshipChecked?: boolean;
  };
  run: LabRun | null;
  runs: FinishedRun[];
};
export const compounds = {
  NaCl: {
    metal: "Na",
    metalName: "Sodium",
    metalZ: 11,
    metalShells: [2, 8, 1],
    nonmetal: "Cl",
    nonmetalName: "Chlorine",
    nonmetalZ: 17,
    nonmetalShells: [2, 8, 7],
    edges: [[0, 0]],
    donors: 1,
    receivers: 1,
  },
  MgCl2: {
    metal: "Mg",
    metalName: "Magnesium",
    metalZ: 12,
    metalShells: [2, 8, 2],
    nonmetal: "Cl",
    nonmetalName: "Chlorine",
    nonmetalZ: 17,
    nonmetalShells: [2, 8, 7],
    edges: [
      [0, 0],
      [0, 1],
    ],
    donors: 1,
    receivers: 2,
  },
  MgO: {
    metal: "Mg",
    metalName: "Magnesium",
    metalZ: 12,
    metalShells: [2, 8, 2],
    nonmetal: "O",
    nonmetalName: "Oxygen",
    nonmetalZ: 8,
    nonmetalShells: [2, 6],
    edges: [[0, 0]],
    donors: 1,
    receivers: 1,
  },
  Na2O: {
    metal: "Na",
    metalName: "Sodium",
    metalZ: 11,
    metalShells: [2, 8, 1],
    nonmetal: "O",
    nonmetalName: "Oxygen",
    nonmetalZ: 8,
    nonmetalShells: [2, 6],
    edges: [
      [0, 0],
      [1, 0],
    ],
    donors: 2,
    receivers: 1,
  },
} as const;
export type Atom = {
  symbol: string;
  name: string;
  protons: number;
  electrons: number;
  charge: number;
  shells: number[];
  crosses: number[];
  side: "metal" | "nonmetal";
  index: number;
};
export function atomLedger(compound: Compound, transfers: number[]): Atom[] {
  const s = compounds[compound];
  const lost = Array(s.donors).fill(0) as number[],
    gained = Array(s.receivers).fill(0) as number[];
  s.edges.forEach(([d, r], i) => {
    lost[d] += transfers[i] ?? 0;
    gained[r] += transfers[i] ?? 0;
  });
  return [
    ...lost.map((n, index): Atom => {
      const shells: number[] = [...s.metalShells];
      shells[shells.length - 1] -= n;
      if (shells.at(-1) === 0) shells.pop();
      return {
        symbol: s.metal,
        name: s.metalName,
        protons: s.metalZ,
        electrons: s.metalZ - n,
        charge: n,
        shells,
        crosses: [...shells],
        side: "metal",
        index,
      };
    }),
    ...gained.map((n, index): Atom => {
      const shells: number[] = [...s.nonmetalShells];
      shells[shells.length - 1] += n;
      return {
        symbol: s.nonmetal,
        name: s.nonmetalName,
        protons: s.nonmetalZ,
        electrons: s.nonmetalZ + n,
        charge: -n,
        shells,
        crosses: shells.map((_, i) => (i === shells.length - 1 ? n : 0)),
        side: "nonmetal",
        index,
      };
    }),
  ];
}
export function changeTransfer(
  compound: Compound,
  transfers: number[],
  edge: number,
  delta: -1 | 1,
): number[] {
  const s = compounds[compound];
  if (!s.edges[edge]) return transfers;
  const [donor] = s.edges[edge];
  const lost = s.edges.reduce(
    (total, [d], i) => total + (d === donor ? transfers[i] : 0),
    0,
  );
  if (
    (delta === -1 && transfers[edge] === 0) ||
    (delta === 1 && lost >= s.metalShells.at(-1)!)
  )
    return transfers;
  return transfers.map((n, i) => (i === edge ? n + delta : n));
}
export const initialLab = (): LabState => ({
  version: 1,
  scene: 0,
  nacl: { sent: 0, charge: "", checked: false },
  mgcl: { transfers: [0, 0], ratio: "", checked: false },
  lattice: { depth: false, guess: "", checked: false },
  run: null,
  runs: [],
});
export function newRun(kind: LabRun["kind"], now: number): LabRun {
  return {
    kind,
    started: now,
    index: 0,
    drawing: {
      transfers: kind === "review" ? [0, 0] : [0],
      metalCharge: "",
      nonmetalCharge: "",
      brackets: "",
    },
    force: "",
    writing: "",
    recorded: [false, false, false],
  };
}
export function runCompound(kind: LabRun["kind"]): Compound {
  return kind === "check" ? "MgO" : "Na2O";
}
export function recordable(run: LabRun): boolean {
  return run.index === 0
    ? run.drawing.metalCharge !== "" &&
        run.drawing.nonmetalCharge !== "" &&
        run.drawing.brackets !== ""
    : run.index === 1
      ? ["attraction", "shared", "protons"].includes(run.force)
      : run.writing.trim().length > 0;
}
export function submitRun(s: LabState, now: number): LabState {
  if (!s.run || !s.run.recorded.every(Boolean)) return s;
  return {
    ...s,
    scene: 3,
    runs: [...s.runs, { ...s.run, submitted: now, helped: true, fresh: false }],
    run: null,
  };
}
export function reviewDue(s: LabState, now: number): boolean {
  return s.runs.length > 0 && now >= s.runs.at(-1)!.submitted + SEVEN_DAYS;
}
const object = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object" && !Array.isArray(x);
const integer = (x: unknown, max: number) =>
  Number.isSafeInteger(x) && Number(x) >= 0 && Number(x) <= max;
const time = (x: unknown) =>
  typeof x === "number" && Number.isFinite(x) && x >= 0;
const charge = (x: unknown) =>
  ["", "-2", "-1", "0", "1", "2"].includes(String(x)) && typeof x === "string";
const keys = (x: Record<string, unknown>, expected: string[]) =>
  Object.keys(x).length === expected.length &&
  expected.every((k) => Object.hasOwn(x, k));
export function validTransfers(
  compound: Compound,
  value: unknown,
): value is number[] {
  if (
    !Array.isArray(value) ||
    value.length !== compounds[compound].edges.length ||
    !value.every((n) => integer(n, 2))
  )
    return false;
  return atomLedger(compound, value)
    .filter((a) => a.side === "metal")
    .every((a) => a.charge <= compounds[compound].metalShells.at(-1)!);
}
function validRun(x: unknown, finished = false): boolean {
  if (
    !object(x) ||
    !keys(x, [
      "kind",
      "started",
      "index",
      "drawing",
      "force",
      "writing",
      "recorded",
      ...(finished ? ["submitted", "helped", "fresh"] : []),
    ]) ||
    !["check", "review"].includes(String(x.kind)) ||
    !time(x.started) ||
    !integer(x.index, 2) ||
    !object(x.drawing)
  )
    return false;
  const d = x.drawing,
    compound = runCompound(x.kind as LabRun["kind"]);
  if (
    !keys(d, ["transfers", "metalCharge", "nonmetalCharge", "brackets"]) ||
    !validTransfers(compound, d.transfers) ||
    !charge(d.metalCharge) ||
    !charge(d.nonmetalCharge) ||
    !["", "yes", "no"].includes(String(d.brackets)) ||
    typeof d.brackets !== "string" ||
    typeof x.force !== "string" ||
    !["", "attraction", "shared", "protons"].includes(x.force) ||
    typeof x.writing !== "string" ||
    !Array.isArray(x.recorded) ||
    x.recorded.length !== 3 ||
    !x.recorded.every((b) => typeof b === "boolean")
  )
    return false;
  if (
    x.recorded.some(
      (b, i) => b && !recordable({ ...x, index: i } as unknown as LabRun),
    )
  )
    return false;
  return (
    !finished ||
    (time(x.submitted) &&
      Number(x.submitted) >= Number(x.started) &&
      x.helped === true &&
      x.fresh === false &&
      x.recorded.every(Boolean))
  );
}
// Decode for rendering only. Never write a normalised version over raw bytes.
export function readLab(raw: string | undefined): LabState | null {
  if (raw === undefined) return initialLab();
  try {
    const x: unknown = JSON.parse(raw);
    if (
      !object(x) ||
      !keys(x, [
        "version",
        "scene",
        "nacl",
        "mgcl",
        "lattice",
        "run",
        "runs",
      ]) ||
      x.version !== 1 ||
      !integer(x.scene, 4) ||
      !object(x.nacl) ||
      !keys(x.nacl, ["sent", "charge", "checked"]) ||
      !integer(x.nacl.sent, 1) ||
      !charge(x.nacl.charge) ||
      typeof x.nacl.checked !== "boolean" ||
      !object(x.mgcl) ||
      !keys(x.mgcl, ["transfers", "ratio", "checked"]) ||
      !validTransfers("MgCl2", x.mgcl.transfers) ||
      typeof x.mgcl.ratio !== "string" ||
      !["", "1", "2", "3"].includes(x.mgcl.ratio) ||
      typeof x.mgcl.checked !== "boolean" ||
      !object(x.lattice) ||
      !keys(x.lattice, [
        "depth",
        "guess",
        "checked",
        ...(Object.hasOwn(x.lattice, "focus") ? ["focus"] : []),
        ...(Object.hasOwn(x.lattice, "forces") ? ["forces"] : []),
        ...(Object.hasOwn(x.lattice, "relationship") ? ["relationship"] : []),
        ...(Object.hasOwn(x.lattice, "relationshipChecked")
          ? ["relationshipChecked"]
          : []),
      ]) ||
      typeof x.lattice.depth !== "boolean" ||
      typeof x.lattice.guess !== "string" ||
      !["", "4", "6", "8"].includes(x.lattice.guess) ||
      typeof x.lattice.checked !== "boolean" ||
      (x.lattice.focus !== undefined &&
        !["sodium", "chloride"].includes(x.lattice.focus as string)) ||
      (x.lattice.forces !== undefined &&
        typeof x.lattice.forces !== "boolean") ||
      (x.lattice.relationship !== undefined &&
        !["donor", "network"].includes(x.lattice.relationship as string)) ||
      (x.lattice.relationshipChecked !== undefined &&
        typeof x.lattice.relationshipChecked !== "boolean") ||
      (x.run !== null && !validRun(x.run)) ||
      !Array.isArray(x.runs) ||
      !x.runs.every((r) => validRun(r, true))
    )
      return null;
    return x as unknown as LabState;
  } catch {
    return null;
  }
}
export type Site = { x: number; y: number; z: number; charge: 1 | -1 };
export const latticeSites: Site[] = Array.from({ length: 64 }, (_, i) => {
  const x = i % 4,
    y = Math.floor(i / 4) % 4,
    z = Math.floor(i / 16);
  return { x, y, z, charge: (x + y + z) % 2 === 0 ? 1 : -1 };
});
export const focusSite: Site = { x: 2, y: 2, z: 2, charge: 1 };
export function isNeighbour(s: Site): boolean {
  return Math.abs(s.x - 2) + Math.abs(s.y - 2) + Math.abs(s.z - 2) === 1;
}
export function neighboursOf(focus: Site): Site[] {
  return latticeSites.filter(
    (s) =>
      Math.abs(s.x - focus.x) +
        Math.abs(s.y - focus.y) +
        Math.abs(s.z - focus.z) ===
      1,
  );
}
export function projectSite(s: Site, depth: boolean, view = 0) {
  const azimuth = ((35 + view * 18) * Math.PI) / 180;
  const dx = s.x - 2,
    dy = s.y - 2,
    dz = s.z - 2;
  return depth
    ? {
        x: 240 + (dx * Math.cos(azimuth) - dy * Math.sin(azimuth)) * 80,
        y:
          158 -
          (dx * Math.sin(azimuth) + dy * Math.cos(azimuth)) * 32 -
          dz * 74,
      }
    : { x: 108 + s.x * 88, y: 54 + s.y * 88 };
}
