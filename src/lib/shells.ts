/** Ground-state GCSE shell representation for neutral atoms Z = 1…20 only. */
export function firstTwentyArrangement(atomicNumber: number): number[] {
  if (!Number.isInteger(atomicNumber) || atomicNumber < 1 || atomicNumber > 20)
    throw new RangeError("This shell model covers neutral atoms 1–20.");
  let remaining = atomicNumber;
  const result: number[] = [];
  for (const capacity of [2, 8, 8, 2]) {
    const count = Math.min(remaining, capacity);
    if (count) result.push(count);
    remaining -= count;
  }
  return result;
}

/** Read counts, not a decimal: both AQA comma and Pearson dot notation work. */
export function readArrangement(raw: string): number[] | null {
  const text = raw.trim();
  if (!/^\d{1,2}(?:\s*[,\.]\s*\d{1,2}){0,3}$/.test(text)) return null;
  const counts = text.split(/\s*[,\.]\s*/).map(Number);
  if (counts.some((n) => n > 20) || counts.reduce((a, b) => a + b, 0) > 20)
    return null;
  // An explicitly empty outer guide does not change an arrangement.
  while (counts.at(-1) === 0) counts.pop();
  return counts.length ? counts : null;
}
