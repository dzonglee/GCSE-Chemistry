"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { PolyesterDrawingData } from "../lib/polyester";
import {
  blankCondensationDrawing,
  readCondensationDrawing,
  readChain,
  type ChainAtom,
} from "../lib/condensation-drawing";
import { polyesterReferenceChain } from "../content/journeys/condensation-writing";
const styles = {
  root: "condensation-construction",
  tools: "condensation-tools",
  scroll: "condensation-scroll",
  ends: "condensation-ends",
  end: "condensation-end",
};

// Follow the student's selection horizontally without moving page focus or
// correcting their drawing. Manual panning remains available between edits.
function useVisibleSelection(
  first: number | undefined,
  last: number | undefined,
  count: number,
  revision: string,
) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const region = ref.current;
    if (!region || first === undefined || last === undefined || !count) return;
    const left = 55 + first * 80 - 32;
    const right = 55 + last * 80 + 32;
    // An edit may happen while a native keyboard pan is still moving. Stop
    // that pan and centre the edited part; manual panning remains available
    // until the next selection or edit.
    let cancelled = false;
    const reveal = () => {
      if (!cancelled)
        region.scrollTo({
          left: Math.max(0, (left + right - region.clientWidth) / 2),
          behavior: "instant",
        });
    };
    reveal();
    void document.fonts.ready.then(reveal);
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(reveal);
    observer?.observe(region);
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [first, last, count, revision]);
  return ref;
}

function Selection({ first, last }: { first: number; last: number }) {
  return (
    <rect
      className="condensation-selection"
      data-condensation-selected="true"
      aria-hidden="true"
      x={55 + first * 80 - 32}
      y="14"
      width={(last - first) * 80 + 64}
      height="148"
      rx="8"
    />
  );
}

function Structure({
  chain,
  left = "0",
  right = "0",
  brackets = "0",
  countMark = "none",
  label,
  selectedPosition,
}: {
  chain: ChainAtom[];
  left?: string;
  right?: string;
  brackets?: string;
  countMark?: string;
  label: string;
  selectedPosition?: number;
}) {
  const w = Math.max(230, chain.length * 80 + 110),
    x = (i: number) => 55 + i * 80;
  const region = useVisibleSelection(
    selectedPosition,
    selectedPosition,
    chain.length,
    selectedPosition === undefined
      ? ""
      : JSON.stringify(chain[selectedPosition]),
  );
  return (
    <figure>
      <div
        ref={region}
        className={styles.scroll}
        tabIndex={0}
        role="region"
        aria-label={`${label}: scroll to inspect all atoms`}
      >
        <svg
          width={w}
          style={{ width: w, height: 170, maxWidth: "none" }}
          height="170"
          viewBox={`0 0 ${w} 170`}
          role="img"
          aria-label={label}
        >
          {selectedPosition !== undefined && chain[selectedPosition] && (
            <Selection first={selectedPosition} last={selectedPosition} />
          )}
          {chain.length === 0 ? (
            <text x="15" y="85">
              No backbone atoms chosen
            </text>
          ) : (
            chain.map((a, i) => (
              <g key={i}>
                <text x={x(i)} y="94" textAnchor="middle">
                  {a.atom === "CH2" ? "CH₂" : a.atom}
                </text>
                {i < chain.length - 1 && (
                  <line
                    x1={x(i) + (a.atom === "CH2" ? 24 : 14)}
                    x2={x(i + 1) - (chain[i + 1].atom === "CH2" ? 24 : 14)}
                    y1="88"
                    y2="88"
                  />
                )}
                {a.oxygen !== "0" && (
                  <>
                    <text x={x(i)} y="28" textAnchor="middle">
                      O
                    </text>
                    <line
                      x1={x(i) - (a.oxygen === "2" ? 3 : 0)}
                      x2={x(i) - (a.oxygen === "2" ? 3 : 0)}
                      y1="35"
                      y2="74"
                    />
                    {a.oxygen === "2" && (
                      <line x1={x(i) + 3} x2={x(i) + 3} y1="35" y2="74" />
                    )}
                  </>
                )}
                {a.hydrogen === "1" && (
                  <>
                    <line x1={x(i)} x2={x(i)} y1="104" y2="130" />
                    <text x={x(i)} y="150" textAnchor="middle">
                      H
                    </text>
                  </>
                )}
              </g>
            ))
          )}
          {chain.length > 0 && (
            <>
              {left === "1" && <line x1="4" x2="41" y1="88" y2="88" />}
              {right === "1" && (
                <line
                  x1={x(chain.length - 1) + 24}
                  x2={w - 14}
                  y1="88"
                  y2="88"
                />
              )}
              {brackets === "1" && (
                <path
                  d={`M36,8 h-8 v148 h8 M${x(chain.length - 1) + 36},8 h8 v148 h-8`}
                />
              )}
              {countMark !== "none" && (
                <text
                  x={x(chain.length - 1) + (countMark === "inside" ? 15 : 55)}
                  y={countMark === "inside" ? 120 : 165}
                >
                  {countMark === "N" ? "N" : "n"}
                </text>
              )}
            </>
          )}
        </svg>
      </div>
      <figcaption>
        {label}. CH₂ represents its two hydrogen atoms. Scroll sideways if
        needed; your choices are shown unchanged.
        {selectedPosition !== undefined && chain[selectedPosition] && (
          <> The outlined atom is position {selectedPosition + 1}.</>
        )}
      </figcaption>
    </figure>
  );
}
function groupChain(
  d: Record<string, string>,
  stem: "diol" | "acid",
  spacer: number,
): ChainAtom[] {
  const oxygen = (end: string): ChainAtom[] =>
    d[end + "O"] === "0"
      ? []
      : [{ atom: "O", oxygen: "0", hydrogen: d[end + "H"] as "0" | "1" }];
  // End oxygen bonds are rendered separately by FunctionalGroups below, not inferred from presence.
  return [
    ...oxygen(stem + "Left"),
    ...(stem === "acid"
      ? [
          {
            atom: "C" as const,
            oxygen: d.acidLeftCarbonyl as ChainAtom["oxygen"],
            hydrogen: "0" as const,
          },
        ]
      : []),
    ...Array.from({ length: spacer }, (): ChainAtom => ({
      atom: "CH2",
      oxygen: "0",
      hydrogen: "0",
    })),
    ...(stem === "acid"
      ? [
          {
            atom: "C" as const,
            oxygen: d.acidRightCarbonyl as ChainAtom["oxygen"],
            hydrogen: "0" as const,
          },
        ]
      : []),
    ...oxygen(stem + "Right"),
  ];
}
function FunctionalGroups({
  d,
  data,
  reference = false,
  activeEnd,
}: {
  d: Record<string, string>;
  data: PolyesterDrawingData;
  reference?: boolean;
  activeEnd?: string;
}) {
  const order: Array<"diol" | "acid"> = activeEnd?.startsWith("acid")
    ? ["acid", "diol"]
    : ["diol", "acid"];
  return (
    <div>
      {order.map((stem) => {
        const chain = groupChain(
          d,
          stem,
          stem === "diol" ? data.diolC : data.acidSpacerC,
        );
        return (
          <FunctionalGroupFigure
            key={stem}
            chain={chain}
            d={d}
            stem={stem}
            reference={reference}
            activeEnd={activeEnd}
          />
        );
      })}
    </div>
  );
}

function FunctionalGroupFigure({
  chain,
  d,
  stem,
  reference,
  activeEnd,
}: {
  chain: ChainAtom[];
  d: Record<string, string>;
  stem: "diol" | "acid";
  reference: boolean;
  activeEnd?: string;
}) {
  const w = chain.length * 80 + 110,
    x = (i: number) => 55 + i * 80,
    selected = activeEnd?.startsWith(stem) ?? false,
    right = activeEnd?.endsWith("Right") ?? false,
    first = selected
      ? right
        ? chain.length - (d[stem + "RightO"] === "0" ? 1 : 2)
        : 0
      : undefined,
    last = selected
      ? right
        ? chain.length - 1
        : d[stem + "LeftO"] === "0"
          ? 0
          : 1
      : undefined;
  const region = useVisibleSelection(
    first,
    last,
    chain.length,
    selected ? JSON.stringify(d) : "",
  );
  return (
    <figure>
      <div
        ref={region}
        className={styles.scroll}
        tabIndex={0}
        role="region"
        aria-label={`${reference ? "Reference" : "Your"} ${stem === "acid" ? "diacid" : "diol"} structure: scroll to inspect both ends`}
      >
        <svg
          width={w}
          style={{
            width: w,
            height: stem === "diol" ? 110 : 170,
            maxWidth: "none",
          }}
          height={stem === "diol" ? 110 : 170}
          viewBox={stem === "diol" ? `0 65 ${w} 110` : `0 0 ${w} 170`}
          role="img"
          aria-label={`${reference ? "Reference" : "Your"} ${stem === "acid" ? "diacid" : "diol"} functional groups`}
        >
          {first !== undefined && last !== undefined && (
            <Selection first={first} last={last} />
          )}
          {chain.map((a, i) => (
            <g key={i}>
              <text x={x(i)} y="94" textAnchor="middle">
                {a.atom === "CH2" ? "CH₂" : a.atom}
              </text>
              {i < chain.length - 1 &&
                (() => {
                  const order =
                    i === 0 && chain[0].atom === "O"
                      ? d[stem + "LeftO"]
                      : i === chain.length - 2 && chain.at(-1)!.atom === "O"
                        ? d[stem + "RightO"]
                        : "1";
                  return (
                    <>
                      <line
                        x1={x(i) + 24}
                        x2={x(i + 1) - 24}
                        y1={order === "2" ? 85 : 88}
                        y2={order === "2" ? 85 : 88}
                      />
                      {order === "2" && (
                        <line
                          x1={x(i) + 24}
                          x2={x(i + 1) - 24}
                          y1="91"
                          y2="91"
                        />
                      )}
                    </>
                  );
                })()}
              {a.oxygen !== "0" && (
                <>
                  <text x={x(i)} y="28" textAnchor="middle">
                    O
                  </text>
                  <line
                    x1={x(i) - (a.oxygen === "2" ? 3 : 0)}
                    x2={x(i) - (a.oxygen === "2" ? 3 : 0)}
                    y1="35"
                    y2="74"
                  />
                  {a.oxygen === "2" && (
                    <line x1={x(i) + 3} x2={x(i) + 3} y1="35" y2="74" />
                  )}
                </>
              )}
              {a.hydrogen === "1" && (
                <>
                  <line x1={x(i)} x2={x(i)} y1="104" y2="130" />
                  <text x={x(i)} y="150" textAnchor="middle">
                    H
                  </text>
                </>
              )}
            </g>
          ))}
        </svg>
      </div>
      <figcaption>
        {reference ? "Reference" : "Your"} {stem === "acid" ? "diacid" : "diol"}
        . Both supplied carbon ends remain. CH₂ abbreviates the spacer
        hydrogens.
      </figcaption>
    </figure>
  );
}
export function CondensationReference({
  data,
}: {
  data: PolyesterDrawingData;
}) {
  if (data.construction === "sequence")
    return (
      <div className={styles.root}>
        <Structure
          chain={polyesterReferenceChain(data)}
          left="1"
          right="1"
          brackets="1"
          countMark="n"
          label="Reference polyester repeat"
        />
      </div>
    );
  const d = blankCondensationDrawing("groups");
  for (const stem of ["diolLeft", "diolRight", "acidLeft", "acidRight"]) {
    d[stem + "O"] = "1";
    d[stem + "H"] = "1";
  }
  d.acidLeftCarbonyl = d.acidRightCarbonyl = "2";
  return (
    <div className={styles.root}>
      <FunctionalGroups d={d} data={data} reference />
    </div>
  );
}
export function CondensationConstruction({
  value,
  onChange,
  drawing: data,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  drawing: PolyesterDrawingData;
  disabled?: boolean;
}) {
  const uid = useId(),
    kind = data.construction!,
    [selected, setSelected] = useState(0),
    [activeEnd, setActiveEnd] = useState("diolLeft");
  const parsed = value
    ? readCondensationDrawing(value, kind)
    : blankCondensationDrawing(kind);
  const clear = () => {
    onChange(JSON.stringify(blankCondensationDrawing(kind)));
    setSelected(0);
    setActiveEnd("diolLeft");
  };
  if (!parsed)
    return (
      <section className={styles.root} data-condensation-construction={kind}>
        <p role="status">
          This work cannot be read. It stays saved until you start again.
        </p>
        <button type="button" disabled={disabled} onClick={clear}>
          Start a new condensation construction
        </button>
      </section>
    );
  const d = parsed;
  const update = (key: string, v: string) =>
    onChange(JSON.stringify({ ...d, [key]: v }));
  function select(key: string, label: string, choices: [string, string][]) {
    return (
      <div>
        <label htmlFor={uid + key}>
          {key.startsWith("diol") || key.startsWith("acid")
            ? label.split(": ")[1]
            : label}
        </label>
        <select
          id={uid + key}
          aria-label={label}
          value={d[key]}
          disabled={disabled}
          onChange={(e) => update(key, e.target.value)}
        >
          {choices.map(([v, text]) => (
            <option key={v} value={v}>
              {text}
            </option>
          ))}
        </select>
      </div>
    );
  }
  const bondChoices: [string, string][] = [
    ["0", "Absent"],
    ["1", "Single bond"],
    ["2", "Double bond"],
  ];
  const chain = kind === "sequence" ? readChain(d.chain)! : [],
    position = Math.min(selected, Math.max(0, chain.length - 1)),
    atom = chain[position];
  const setChain = (next: ChainAtom[]) => update("chain", JSON.stringify(next));
  return (
    <section
      className={styles.root}
      data-condensation-construction={kind}
      aria-label={
        kind === "groups"
          ? "Functional-group construction"
          : "Polyester repeat construction"
      }
    >
      {kind === "groups" ? (
        <div className="condensation-group-editor">
          <div className="condensation-group-controls">
            <div>
              {[activeEnd].map((stem) => (
                <section className={styles.end} key={stem}>
                  <h3>
                    {stem.startsWith("diol") ? "Diol" : "Diacid"}:{" "}
                    {stem.endsWith("Left") ? "left" : "right"} end
                  </h3>
                  {select(
                    stem + "O",
                    `${stem.startsWith("diol") ? "Diol" : "Diacid"} ${stem.endsWith("Left") ? "left" : "right"}: outward C–O bond`,
                    bondChoices,
                  )}
                  {select(
                    stem + "H",
                    `${stem.startsWith("diol") ? "Diol" : "Diacid"} ${stem.endsWith("Left") ? "left" : "right"}: H on that O`,
                    [
                      ["0", "Absent"],
                      ["1", "Present"],
                    ],
                  )}
                  {stem.startsWith("acid") &&
                    select(
                      stem + "Carbonyl",
                      `Diacid ${stem.endsWith("Left") ? "left" : "right"}: separate C–O bond`,
                      bondChoices,
                    )}
                </section>
              ))}
            </div>
            <div
              className={styles.tools}
              aria-label="Choose a functional-group end"
            >
              {["diolLeft", "diolRight", "acidLeft", "acidRight"].map(
                (stem) => (
                  <button
                    type="button"
                    key={stem}
                    aria-pressed={activeEnd === stem}
                    onClick={() => setActiveEnd(stem)}
                  >
                    Edit {stem.startsWith("diol") ? "diol" : "diacid"}{" "}
                    {stem.endsWith("Left") ? "left" : "right"}
                  </button>
                ),
              )}
            </div>
            <p>{data.note}</p>

            {["diolLeft", "diolRight", "acidLeft", "acidRight"].some(
              (stem) => d[stem + "O"] === "0" && d[stem + "H"] === "1",
            ) && (
              <p role="status">
                An H choice is retained on an absent O. It will reappear when
                you restore that O.
              </p>
            )}
          </div>
          <div className="condensation-group-diagrams">
            <FunctionalGroups d={d} data={data} activeEnd={activeEnd} />
          </div>
        </div>
      ) : (
        <>
          <div className={styles.tools}>
            {(["CH2", "O", "C", "H"] as const).map((a) => (
              <button
                key={a}
                type="button"
                disabled={disabled || chain.length >= 16}
                onClick={() => {
                  setChain([...chain, { atom: a, oxygen: "0", hydrogen: "0" }]);
                  setSelected(chain.length);
                }}
              >
                Add {a === "CH2" ? "CH₂" : a}
              </button>
            ))}
          </div>
          <Structure
            chain={chain}
            left={d.left}
            right={d.right}
            brackets={d.brackets}
            countMark={d.countMark}
            label="Your repeat construction"
            selectedPosition={atom ? position : undefined}
          />
          {atom && (
            <>
              <label htmlFor={uid + "position"}>
                Choose a backbone position to edit
              </label>
              <select
                id={uid + "position"}
                disabled={disabled}
                value={position}
                onChange={(e) => setSelected(Number(e.target.value))}
              >
                {chain.map((a, i) => (
                  <option key={i} value={i}>
                    {i + 1}: {a.atom}
                  </option>
                ))}
              </select>
              {atom.atom === "C" && (
                <>
                  <label htmlFor={uid + "branch"}>
                    Separate O attached to this C
                  </label>
                  <select
                    id={uid + "branch"}
                    disabled={disabled}
                    value={atom.oxygen}
                    onChange={(e) =>
                      setChain(
                        chain.map((a, i) =>
                          i === position
                            ? {
                                ...a,
                                oxygen: e.target.value as ChainAtom["oxygen"],
                              }
                            : a,
                        ),
                      )
                    }
                  >
                    {bondChoices.map(([v, text]) => (
                      <option key={v} value={v}>
                        {text}
                      </option>
                    ))}
                  </select>
                </>
              )}
              {atom.atom === "O" && (
                <>
                  <label htmlFor={uid + "hydrogen"}>H attached to this O</label>
                  <select
                    id={uid + "hydrogen"}
                    disabled={disabled}
                    value={atom.hydrogen}
                    onChange={(e) =>
                      setChain(
                        chain.map((a, i) =>
                          i === position
                            ? { ...a, hydrogen: e.target.value as "0" | "1" }
                            : a,
                        ),
                      )
                    }
                  >
                    <option value="0">Absent</option>
                    <option value="1">Present</option>
                  </select>
                </>
              )}
              <div className={styles.tools}>
                <button
                  type="button"
                  disabled={disabled || position === 0}
                  onClick={() => {
                    const next = [...chain];
                    [next[position - 1], next[position]] = [
                      next[position],
                      next[position - 1],
                    ];
                    setChain(next);
                    setSelected(position - 1);
                  }}
                >
                  Move selected atom left
                </button>
                <button
                  type="button"
                  disabled={disabled || position === chain.length - 1}
                  onClick={() => {
                    const next = [...chain];
                    [next[position + 1], next[position]] = [
                      next[position],
                      next[position + 1],
                    ];
                    setChain(next);
                    setSelected(position + 1);
                  }}
                >
                  Move selected atom right
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    setChain(chain.filter((_, i) => i !== position))
                  }
                >
                  Remove selected atom
                </button>
              </div>
            </>
          )}
          <div className={styles.ends}>
            {select("left", "Left continuation bond", [
              ["0", "Absent"],
              ["1", "Present"],
            ])}
            {select("right", "Right continuation bond", [
              ["0", "Absent"],
              ["1", "Present"],
            ])}
            {select("brackets", "Repeat brackets", [
              ["0", "Absent"],
              ["1", "Present"],
            ])}
            {select("countMark", "Repeat-count notation", [
              ["none", "Absent"],
              ["n", "n outside, lower right"],
              ["N", "N outside"],
              ["inside", "n inside"],
            ])}
          </div>
          <p>
            New atoms join by single bonds. Choose a C position to attach a
            separate O with your chosen bond order. You can move or remove
            atoms; no ester skeleton is supplied.
          </p>
        </>
      )}
      <p>
        Your structure is saved unchanged for manual review after submission.
      </p>
      <button type="button" disabled={disabled} onClick={clear}>
        Clear this condensation construction
      </button>
    </section>
  );
}
