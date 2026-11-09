/** Navigation only: these examples are not questions or assessment evidence. */
export interface WorkedCursor {
  version: 1;
  example: "main" | "difficult";
  step: number;
}

export const WORKED_STEP_COUNT = 3;

export const initialWorkedCursor = (): WorkedCursor => ({
  version: 1,
  example: "main",
  step: 0,
});

export function isWorkedLesson(slug: string): boolean {
  return slug === "relative-atomic-mass" || slug === "inside-an-atom";
}

export function validWorkedCursor(value: unknown): value is WorkedCursor {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const cursor = value as Record<string, unknown>;
  return (
    Object.keys(cursor).length === 3 &&
    cursor.version === 1 &&
    (cursor.example === "main" || cursor.example === "difficult") &&
    Number.isSafeInteger(cursor.step) &&
    Number(cursor.step) >= 0 &&
    Number(cursor.step) < WORKED_STEP_COUNT
  );
}
