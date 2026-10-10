"use client";
import { useId, useRef, useState, type PointerEvent } from "react";
import {
  atomLedger,
  changeTransfer,
  compounds,
  type Compound,
  type Drawing,
} from "@/lib/experiments/ionic-lab";
import { AtomDiagram } from "./AtomDiagram";
import { LabIcon } from "./LabIcon";
import styles from "./IonicLab.module.css";

export function Board({
  compound,
  transfers,
  onChange,
  proposal,
  detail = true,
  revealCharges = true,
  note = true,
  compactControls = false,
}: {
  compound: Compound;
  transfers: number[];
  onChange?: (transfers: number[]) => void;
  proposal?: Drawing;
  detail?: boolean;
  revealCharges?: boolean;
  note?: boolean;
  compactControls?: boolean;
}) {
  const spec = compounds[compound];
  const atoms = atomLedger(compound, transfers);
  const hintId = useId();
  const row = useRef<HTMLDivElement>(null);
  const gesture = useRef<{
    donor: number;
    x: number;
    y: number;
    moved: boolean;
    wasPicked: boolean;
  } | null>(null);
  const [drag, setDrag] = useState<{
    donor: number;
    x: number;
    y: number;
  } | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [inspected, setInspected] = useState<string | null>(null);
  const [motion, setMotion] = useState<{
    direction: "send" | "return";
    step: number;
  } | null>(null);
  const move = (edge: number, delta: 1 | -1) => {
    const next = changeTransfer(compound, transfers, edge, delta);
    if (next === transfers || !onChange) return;
    setMotion((m) => ({
      direction: delta === 1 ? "send" : "return",
      step: (m?.step ?? 0) + 1,
    }));
    setPicked(null);
    onChange(next);
  };
  const finishAt = (x: number, y: number) => {
    const current = gesture.current;
    if (!current) return;
    gesture.current = null;
    setDrag(null);
    if (current.moved) {
      for (let receiver = 0; receiver < spec.receivers; receiver++) {
        const target = row.current?.querySelector<HTMLElement>(
          `[data-side="nonmetal"][data-atom-index="${receiver}"] button`,
        );
        const bounds = target?.getBoundingClientRect();
        if (
          bounds &&
          x >= bounds.left &&
          x <= bounds.right &&
          y >= bounds.top &&
          y <= bounds.bottom
        ) {
          const edge = spec.edges.findIndex(
            ([donor, recipient]) =>
              donor === current.donor && recipient === receiver,
          );
          if (edge >= 0) move(edge, 1);
          break;
        }
      }
      setPicked(null);
    } else if (current.wasPicked) {
      setPicked(null);
    }
  };
  const finish = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "touch") return;
    finishAt(event.clientX, event.clientY);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const atom = atoms.find((a) => `${a.side}-${a.index}` === inspected);
  const electronTotal = atoms.reduce((sum, a) => sum + a.electrons, 0);
  const shownCharge = (side: "metal" | "nonmetal", actual: number) => {
    if (!proposal) return revealCharges ? actual : null;
    const value =
      side === "metal" ? proposal.metalCharge : proposal.nonmetalCharge;
    return value === "" ? null : Number(value);
  };
  return (
    <div
      className={styles.transferBoard}
      data-compound={compound}
      data-moving={motion?.direction}
    >
      <div
        ref={row}
        className={`${styles.atomRow} ${atoms.length === 3 ? styles.threeAtoms : ""}`}
      >
        {atoms.map((a) => {
          const id = `${a.side}-${a.index}`;
          const suffix =
            (a.side === "metal" ? spec.donors : spec.receivers) > 1
              ? ` ${a.index + 1}`
              : "";
          const canSend =
            onChange &&
            a.side === "metal" &&
            spec.edges.some(
              ([donor], edge) =>
                donor === a.index &&
                changeTransfer(compound, transfers, edge, 1) !== transfers,
            );
          const receiving = picked !== null && a.side === "nonmetal";
          const radius = a.shells.length === 3 ? 68 : 64;
          return (
            <div
              className={styles.atomTile}
              key={id}
              data-side={a.side}
              data-atom-index={a.index}
            >
              <div className={styles.atomVisual} data-atom-visual="true">
                <button
                  className={styles.atomInspect}
                  aria-label={
                    receiving
                      ? `Give ${spec.metalName.toLowerCase()}’s electron to ${a.name.toLowerCase()}${suffix}`
                      : `Inspect ${a.name.toLowerCase()}${suffix}`
                  }
                  aria-expanded={receiving ? undefined : id === inspected}
                  data-receiving={receiving || undefined}
                  onClick={() => {
                    if (receiving) {
                      const edge = spec.edges.findIndex(
                        ([donor, receiver]) =>
                          donor === picked && receiver === a.index,
                      );
                      if (edge >= 0) move(edge, 1);
                      setPicked(null);
                    } else setInspected(id === inspected ? null : id);
                  }}
                >
                  <AtomDiagram
                    atom={a}
                    brackets={
                      proposal ? proposal.brackets === "yes" : a.charge !== 0
                    }
                    charge={shownCharge(a.side, a.charge)}
                    hiddenChargeLabel={
                      revealCharges
                        ? undefined
                        : "charge awaiting your prediction"
                    }
                    selected={id === inspected}
                    hidePickupElectron={!!canSend}
                  />
                </button>
                {onChange && a.side === "metal" && (
                  <button
                    className={styles.dragElectron}
                    aria-label={`Move an outer electron from ${a.name.toLowerCase()}${suffix}`}
                    aria-describedby={hintId}
                    aria-pressed={picked === a.index}
                    aria-disabled={!canSend || undefined}
                    tabIndex={canSend ? 0 : -1}
                    aria-hidden={!canSend || undefined}
                    data-drag-donor={canSend ? a.index : undefined}
                    data-answer-control={canSend ? "true" : undefined}
                    style={{
                      top: `${((90 - radius) / 180) * 100}%`,
                      transform: `translate(calc(-50% + ${drag?.donor === a.index ? drag.x : 0}px), calc(-50% + ${drag?.donor === a.index ? drag.y : 0}px))`,
                    }}
                    onPointerDown={(event) => {
                      if (!canSend || event.button !== 0 || !event.isPrimary)
                        return;
                      if (event.pointerType !== "touch")
                        event.currentTarget.setPointerCapture(event.pointerId);
                      gesture.current = {
                        donor: a.index,
                        x: event.clientX,
                        y: event.clientY,
                        moved: false,
                        wasPicked: picked === a.index,
                      };
                      setPicked(a.index);
                      setDrag({ donor: a.index, x: 0, y: 0 });
                    }}
                    onPointerMove={(event) => {
                      const current = gesture.current;
                      if (!current) return;
                      const x = event.clientX - current.x,
                        y = event.clientY - current.y;
                      if (Math.hypot(x, y) > 8) current.moved = true;
                      setDrag({ donor: a.index, x, y });
                    }}
                    onPointerUp={finish}
                    onTouchEnd={(event) => {
                      const point = event.changedTouches[0];
                      if (point) finishAt(point.clientX, point.clientY);
                    }}
                    onPointerCancel={() => {
                      gesture.current = null;
                      setDrag(null);
                      setPicked(null);
                    }}
                    onTouchCancel={() => {
                      gesture.current = null;
                      setDrag(null);
                      setPicked(null);
                    }}
                    onClick={(event) => {
                      if (event.detail === 0)
                        setPicked((p) => (p === a.index ? null : a.index));
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        gesture.current = null;
                        setDrag(null);
                        setPicked(null);
                      }
                    }}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                )}
              </div>
              <span className={styles.atomName}>
                {a.name}
                {suffix}
              </span>
              <span className={styles.arrangement}>{a.shells.join(",")}</span>
              {detail && (
                <span className={styles.particleCount}>
                  {a.protons} p⁺ · {a.electrons} e⁻
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className={styles.originKey}>
        <span>× metal electrons</span>
        <span>• non-metal electrons</span>
      </p>
      {onChange && (
        <div className={styles.boardActions}>
          <p id={hintId} role="status" className={styles.gestureHint}>
            {drag && Math.hypot(drag.x, drag.y) > 8
              ? "Release onto an atom to transfer. Escape cancels."
              : picked !== null
                ? "Choose a receiving atom. Tap × again or Escape to cancel."
                : "Drag the ×, or use Transfer."}
          </p>
          <div className={styles.transferControls}>
            {spec.edges.map(([donor, receiver], edge) => {
              const source = `${spec.metalName.toLowerCase()}${spec.donors > 1 ? ` ${donor + 1}` : ""}`;
              const recipient = `${spec.nonmetalName.toLowerCase()}${spec.receivers > 1 ? ` ${receiver + 1}` : ""}`;
              return (
                <div key={edge}>
                  <button
                    className={styles.sendButton}
                    disabled={
                      changeTransfer(compound, transfers, edge, 1) === transfers
                    }
                    onClick={() => {
                      setPicked(null);
                      move(edge, 1);
                    }}
                    aria-label={`Send an electron from ${source} to ${recipient}`}
                    data-answer-control="true"
                  >
                    {spec.receivers > 1
                      ? `To ${compactControls ? "Cl" : "chlorine"} ${receiver + 1}`
                      : spec.donors > 1
                        ? compactControls
                          ? `Na ${donor + 1}`
                          : `From sodium ${donor + 1}`
                        : "Transfer electron"}
                    <LabIcon />
                  </button>
                  <button
                    className={styles.returnButton}
                    disabled={transfers[edge] === 0}
                    onClick={() => {
                      setPicked(null);
                      move(edge, -1);
                    }}
                    aria-label={`Return an electron from ${recipient} to ${source}`}
                  >
                    ↶ <span>Undo</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {detail && (
        <div className={styles.conserved} data-electron-total={electronTotal}>
          <span aria-hidden="true">✓</span>
          <p>
            <strong>{electronTotal} electrons conserved</strong>
            <span>Same nuclei. Only electrons move.</span>
          </p>
        </div>
      )}
      {atom && (
        <div className={styles.inspector}>
          <div>
            <strong>{atom.name}, close up</strong>
            <p>
              {atom.protons} protons · {atom.electrons} electrons
            </p>
            <p>Arrangement: {atom.shells.join(",")}</p>
            <button
              onClick={() => setInspected(null)}
              className={styles.closeInspector}
            >
              Close atom view
            </button>
          </div>
          <AtomDiagram
            atom={atom}
            brackets={
              proposal ? proposal.brackets === "yes" : atom.charge !== 0
            }
            charge={shownCharge(atom.side, atom.charge)}
            hiddenChargeLabel={
              revealCharges ? undefined : "charge awaiting your prediction"
            }
          />
        </div>
      )}
      {note && <ModelNote />}
    </div>
  );
}

export function ModelNote() {
  return (
    <details className={styles.modelNote}>
      <summary>About this model</summary>
      <p className={styles.diagramNote}>
        Shell diagrams show electron counts, not real electron paths. Dots and
        crosses track origin; all are electrons.
      </p>
    </details>
  );
}
