"use client";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { WorkbenchState } from "@/content/types";

const DraftContext = createContext<{
  value: Record<string, string> | null;
  save: (value: Record<string, string> | null) => void;
} | null>(null);

// Raw input is a draft, separate from the validated scientific model/history.
// Restore only bounded fields belonging to this particular model and record.
export function WorkbenchInputDraft({
  draft,
  board,
  onSave,
  children,
}: {
  draft?: string;
  board: WorkbenchState;
  onSave: (draft: string) => void;
  children: ReactNode;
}) {
  let value: Record<string, string> | null = null;
  let unreadable = false;
  if (draft) {
    try {
      const parsed: unknown = JSON.parse(draft);
      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed) ||
        Object.getPrototypeOf(parsed) !== Object.prototype
      )
        throw new Error("shape");
      const entries = Object.entries(parsed);
      if (
        entries.length > 128 ||
        !entries.every(
          ([key, text]) =>
            Object.hasOwn(board, key) &&
            typeof text === "string" &&
            text.length <= 64 &&
            (!["record", "mode", "version", "kind"].includes(key) ||
              text === String(board[key])),
        )
      )
        throw new Error("fields");
      value = parsed as Record<string, string>;
    } catch {
      unreadable = true;
    }
  }
  return (
    <DraftContext.Provider
      value={{
        value,
        save: (next) => {
          // An unreadable original is replaced only by an explicit clear operation.
          if (!unreadable)
            onSave(
              next && Object.keys(next).length ? JSON.stringify(next) : "",
            );
        },
      }}
    >
      {unreadable && (
        <div className="feedback bad" role="status">
          <strong>A saved model input draft could not be read.</strong>
          <p>
            Its original text is retained. You can study, but new raw input
            drafts cannot replace it until you clear this draft.
          </p>
          <button
            type="button"
            className="button secondary"
            onClick={() => onSave("")}
          >
            Clear this saved model input draft
          </button>
        </div>
      )}
      {children}
    </DraftContext.Provider>
  );
}

export function useWorkbenchInputDraft<T extends Record<string, string> | null>(
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const context = useContext(DraftContext);
  const [state, setState] = useState<T>(() => (context?.value ?? initial) as T);
  const current = useRef(state);
  const set: Dispatch<SetStateAction<T>> = (action) => {
    const next =
      typeof action === "function" ? action(current.current) : action;
    if (
      next &&
      (!Object.values(next).every(
        (text) => typeof text === "string" && text.length <= 64,
      ) ||
        Object.keys(next).length > 128)
    )
      return;
    current.current = next;
    setState(next);
    context?.save(next);
  };
  return [state, set];
}
