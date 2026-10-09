"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress, setWork, expose, emptyWork } from "@/lib/progress";
import {
  atomLedger,
  changeTransfer,
  compounds,
  initialLab,
  LAB_DRAFT,
  LAB_WORK,
  newRun,
  readLab,
  recordable,
  reviewDue,
  runCompound,
  SEVEN_DAYS,
  submitRun,
  type Charge,
  type Compound,
  type Drawing,
  type LabRun,
  type LabState,
} from "@/lib/experiments/ionic-lab";
import {
  chapters,
  challengePrompts,
  drawingCriteria,
  experimentExposure,
  forceOptions,
  latticeFeedback,
  magnesiumFeedback,
  sodiumFeedback,
  writingReference,
} from "@/content/experiments/ionic-lab";
import { AtomDiagram } from "./AtomDiagram";
import { LatticeScene } from "./LatticeScene";
import { LabIcon } from "./LabIcon";
import styles from "./IonicLab.module.css";
const choices: [Charge, string][] = [
  ["-2", "2−"],
  ["-1", "1−"],
  ["0", "0"],
  ["1", "1+"],
  ["2", "2+"],
];
function Choice({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [string, string][];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className={styles.choice}>
      <legend>{label}</legend>
      <div>
        {options.map(([key, text]) => (
          <button
            type="button"
            key={key}
            aria-pressed={value === key}
            onClick={() => onChange(key)}
            data-answer-control="true"
          >
            {text}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
function Feedback({
  good,
  title,
  detail,
}: {
  good: boolean;
  title: string;
  detail: string;
}) {
  return (
    <div
      role="status"
      className={`${styles.feedback} ${good ? styles.feedbackGood : styles.feedbackTry}`}
    >
      <span aria-hidden="true">{good ? "✓" : "↻"}</span>
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
    </div>
  );
}
function Board({
  compound,
  transfers,
  onChange,
  proposal,
  detail = true,
  revealCharges = true,
}: {
  compound: Compound;
  transfers: number[];
  onChange?: (transfers: number[]) => void;
  proposal?: Drawing;
  detail?: boolean;
  revealCharges?: boolean;
}) {
  const s = compounds[compound],
    atoms = atomLedger(compound, transfers);
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
    onChange(next);
  };
  const atom = atoms.find((a) => `${a.side}-${a.index}` === inspected);
  const electronTotal = atoms.reduce((sum, a) => sum + a.electrons, 0);
  return (
    <div className={styles.transferBoard} data-compound={compound}>
      {onChange && (
        <div className={styles.transferControls}>
          {s.edges.map(([donor, receiver], i) => {
            const recipient = `${s.nonmetalName.toLowerCase()}${s.receivers > 1 ? ` ${receiver + 1}` : ""}`;
            const source = `${s.metalName.toLowerCase()}${s.donors > 1 ? ` ${donor + 1}` : ""}`;
            const canSend =
              changeTransfer(compound, transfers, i, 1) !== transfers;
            return (
              <div key={i}>
                <button
                  className={styles.sendButton}
                  disabled={!canSend}
                  onClick={() => move(i, 1)}
                  aria-label={`Send an electron from ${source} to ${recipient}`}
                  data-answer-control="true"
                >
                  <span aria-hidden="true">×</span>
                  {s.receivers > 1
                    ? `To chlorine ${receiver + 1}`
                    : s.donors > 1
                      ? `From sodium ${donor + 1}`
                      : "Send an electron"}
                  <LabIcon />
                </button>
                <button
                  className={styles.returnButton}
                  disabled={transfers[i] === 0}
                  onClick={() => move(i, -1)}
                  aria-label={`Return an electron from ${recipient} to ${source}`}
                >
                  ↶ <span>Return</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div
        className={`${styles.atomRow} ${atoms.length === 3 ? styles.threeAtoms : ""}`}
      >
        {atoms.map((a) => {
          const id = `${a.side}-${a.index}`;
          const proposedCharge =
            a.side === "metal"
              ? proposal?.metalCharge
              : proposal?.nonmetalCharge;
          const shown = proposal
            ? proposedCharge === ""
              ? null
              : Number(proposedCharge)
            : revealCharges
              ? a.charge
              : null;
          const brackets = proposal
            ? proposal.brackets === "yes"
            : a.charge !== 0;
          return (
            <div className={styles.atomTile} key={id}>
              <button
                className={styles.atomInspect}
                aria-label={`Inspect ${a.name.toLowerCase()}${a.side === "metal" ? (s.donors > 1 ? ` ${a.index + 1}` : "") : s.receivers > 1 ? ` ${a.index + 1}` : ""}`}
                aria-expanded={id === inspected}
                onClick={() => setInspected(id === inspected ? null : id)}
              >
                <AtomDiagram
                  atom={a}
                  brackets={brackets}
                  charge={shown}
                  hiddenChargeLabel={
                    revealCharges
                      ? undefined
                      : "charge awaiting your prediction"
                  }
                  selected={id === inspected}
                />
                <span className={styles.atomName}>
                  {a.name}
                  {(a.side === "metal" ? s.donors : s.receivers) > 1
                    ? ` ${a.index + 1}`
                    : ""}
                </span>
              </button>
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
      <div
        className={`${styles.electronTrail} ${motion ? styles.hasTransfer : ""} ${motion?.direction === "return" ? styles.returnTransfer : ""}`}
        key={motion?.step ?? 0}
        aria-hidden="true"
      >
        <span>×</span>
        <i />
        <span>○</span>
      </div>
      <p className={styles.originKey}>
        <span>× from metal</span>
        <span>• from non-metal</span>
      </p>
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
            charge={
              proposal
                ? (atom.side === "metal"
                    ? proposal.metalCharge
                    : proposal.nonmetalCharge) === ""
                  ? null
                  : Number(
                      atom.side === "metal"
                        ? proposal.metalCharge
                        : proposal.nonmetalCharge,
                    )
                : revealCharges
                  ? atom.charge
                  : null
            }
            hiddenChargeLabel={
              revealCharges ? undefined : "charge awaiting your prediction"
            }
          />
        </div>
      )}
      {detail && (
        <div className={styles.conserved} data-electron-total={electronTotal}>
          <span aria-hidden="true">◎</span>
          <p>
            <strong>{electronTotal} electrons. All accounted for.</strong>
            <span>No nucleus changes. Only electrons move.</span>
          </p>
        </div>
      )}
      <p className={styles.diagramNote}>
        Shell diagrams show electron counts, not real electron paths. Dots and
        crosses track origin; all are electrons.
      </p>
    </div>
  );
}
function DrawingControls({
  drawing,
  onChange,
}: {
  drawing: Drawing;
  onChange: (d: Drawing) => void;
}) {
  return (
    <div className={styles.drawingChoices}>
      <Choice
        label="Metal-ion charge"
        value={drawing.metalCharge}
        options={choices}
        onChange={(v) => onChange({ ...drawing, metalCharge: v as Charge })}
      />
      <Choice
        label="Non-metal-ion charge"
        value={drawing.nonmetalCharge}
        options={choices}
        onChange={(v) => onChange({ ...drawing, nonmetalCharge: v as Charge })}
      />
      <Choice
        label="How will you show the particles?"
        value={drawing.brackets}
        options={[
          ["yes", "Square brackets"],
          ["no", "No brackets"],
        ]}
        onChange={(v) =>
          onChange({ ...drawing, brackets: v as Drawing["brackets"] })
        }
      />
    </div>
  );
}
function Review({ run }: { run: LabState["runs"][number] }) {
  const spec = runCompound(run.kind),
    transfer = run.kind === "check" ? [2] : [1, 1];
  return (
    <section className={styles.review} aria-label="Whole challenge review">
      <div className={styles.reviewHero}>
        <span className={styles.bigTick} aria-hidden="true">
          ✓
        </span>
        <div>
          <p className={styles.kicker}>ALL THREE RESPONSES SAVED</p>
          <h2>Let’s look at your reasoning.</h2>
          <p>
            Your full diagram and explanation are for self-review. No automatic
            examiner marks.
          </p>
        </div>
      </div>
      <article className={styles.reviewCard}>
        <span className={styles.reviewNumber}>01</span>
        <h3>Your ion diagram</h3>
        <Board
          compound={spec}
          transfers={run.drawing.transfers}
          proposal={run.drawing}
          detail={false}
        />
        <details open>
          <summary>Compare with the reference</summary>
          <Board
            compound={spec}
            transfers={transfer}
            proposal={{
              transfers: transfer,
              metalCharge: run.kind === "check" ? "2" : "1",
              nonmetalCharge: "-2",
              brackets: "yes",
            }}
            detail={false}
          />
          <ul>
            {drawingCriteria(run.kind).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </details>
      </article>
      <article className={styles.reviewCard}>
        <span className={styles.reviewNumber}>02</span>
        <h3>What is the bond?</h3>
        <p className={styles.savedAnswer}>
          {forceOptions.find((o) => o.id === run.force)?.title}
        </p>
        <Feedback
          good={run.force === "attraction"}
          title={
            run.force === "attraction"
              ? "Yes: electrostatic attraction."
              : "The bond is attraction between opposite charges."
          }
          detail="Electron transfer forms the ions. The strong electrostatic attraction between oppositely charged ions is ionic bonding."
        />
      </article>
      <article className={styles.reviewCard}>
        <span className={styles.reviewNumber}>03</span>
        <h3>Your explanation</h3>
        <p className={styles.savedAnswer}>{run.writing}</p>
        <div className={styles.referenceWriting}>
          <strong>A reference to compare with</strong>
          <p>{writingReference(run.kind)}</p>
          <p>
            Check the direction and number of electrons, and connect their loss
            or gain to the ion charges.
          </p>
        </div>
      </article>
    </section>
  );
}
function useCurrentTime(dueAt: number | undefined) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const frame = requestAnimationFrame(refresh);
    const timer =
      dueAt === undefined
        ? undefined
        : window.setTimeout(
            refresh,
            Math.min(2147483647, Math.max(0, dueAt - Date.now())),
          );
    window.addEventListener("focus", refresh);
    return () => {
      cancelAnimationFrame(frame);
      if (timer !== undefined) clearTimeout(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [dueAt]);
  return now;
}
export function IonicLab() {
  const { data, ready, blocked } = useProgress();
  const work = data.work[LAB_WORK] ?? emptyWork(),
    raw = work.drafts[LAB_DRAFT],
    state = readLab(raw);
  const [notice, setNotice] = useState("");
  const learningScene = !!state && state.scene < 3;
  const now = useCurrentTime(
    state?.runs.at(-1)?.submitted === undefined
      ? undefined
      : state.runs.at(-1)!.submitted + SEVEN_DAYS,
  );
  useEffect(() => {
    if (ready && learningScene) expose(experimentExposure);
  }, [ready, learningScene]);
  const edit = (change: (current: LabState) => LabState) => {
    setNotice("");
    setWork(LAB_WORK, (w) => {
      const current = readLab(w.drafts[LAB_DRAFT]);
      return current
        ? {
            ...w,
            drafts: {
              ...w.drafts,
              [LAB_DRAFT]: JSON.stringify(change(current)),
            },
          }
        : w;
    });
  };
  const navigate = (scene: number) => {
    edit((s) => ({
      ...s,
      scene: scene >= 3 && s.run ? (s.run.kind === "check" ? 3 : 4) : scene,
    }));
    requestAnimationFrame(() => {
      document.getElementById("ionic-lab-title")?.focus();
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  };
  const archiveGuided = (
    id: string,
    change: (current: LabState) => LabState,
  ) => {
    setWork(LAB_WORK, (w) => {
      const s = readLab(w.drafts[LAB_DRAFT]);
      if (!s) return w;
      return {
        ...w,
        drafts: { ...w.drafts, [LAB_DRAFT]: JSON.stringify(change(s)) },
        attempts: {
          ...w.attempts,
          [id]: [
            ...(w.attempts[id] ?? []),
            {
              answer: JSON.stringify(s),
              correct: false,
              helped: true,
              fresh: false,
              at: Date.now(),
            },
          ],
        },
      };
    });
  };
  const start = (kind: LabRun["kind"]) => {
    if (!state || (kind === "review" && !reviewDue(state, now))) return;
    edit((s) => {
      const run = s.run ?? newRun(kind, Date.now());
      return { ...s, scene: run.kind === "check" ? 3 : 4, run };
    });
    requestAnimationFrame(() => {
      document.getElementById("ionic-lab-title")?.focus();
      window.scrollTo(0, 0);
    });
  };
  const runEdit = (change: (run: LabRun) => LabRun) =>
    edit((s) => (s.run ? { ...s, run: change(s.run) } : s));
  const record = () => {
    if (!state?.run || !recordable(state.run)) {
      setNotice(
        "Complete this response before recording it. Your draft stays saved.",
      );
      return;
    }
    runEdit((r) => ({
      ...r,
      recorded: r.recorded.map((b, i) => (i === r.index ? true : b)),
    }));
    setNotice("Response recorded. Feedback appears after the whole challenge.");
  };
  const whole = () => {
    if (!state?.run?.recorded.every(Boolean)) {
      setNotice("Record all three responses before reviewing the challenge.");
      return;
    }
    edit((s) => submitRun(s, Math.max(Date.now(), s.run!.started)));
    requestAnimationFrame(() => {
      document.getElementById("ionic-lab-title")?.focus();
      window.scrollTo(0, 0);
    });
  };
  if (!ready)
    return (
      <div className={styles.lab}>
        <p role="status">Loading your saved learning…</p>
      </div>
    );
  if (!state)
    return (
      <div className={styles.lab}>
        <Link href="/lessons/ionic-bonding" className={styles.back}>
          ← Ionic bonding lesson
        </Link>
        <h1>Your saved experiment stays safe.</h1>
        <p>
          This experiment’s record cannot be read. It has been kept unchanged.
        </p>
        <button
          className={styles.primary}
          onClick={() =>
            setWork(LAB_WORK, (w) => ({
              ...w,
              drafts: {
                ...w.drafts,
                [LAB_DRAFT]: JSON.stringify(initialLab()),
              },
              attempts: {
                ...w.attempts,
                "ionic-lab-archived": [
                  ...(w.attempts["ionic-lab-archived"] ?? []),
                  {
                    answer: w.drafts[LAB_DRAFT],
                    correct: false,
                    helped: true,
                    fresh: false,
                    at: Date.now(),
                  },
                ],
              },
            }))
          }
        >
          Start a new experiment; archive this record
        </button>
      </div>
    );
  const scene = state.scene,
    chapter = chapters[scene],
    run = state.run;
  const last = state.runs.at(-1),
    due = reviewDue(state, now);
  const challenge = (scene === 3 || scene === 4) && run !== null;
  const index = run?.index ?? 0;
  const messages = [
    sodiumFeedback(state.nacl),
    magnesiumFeedback(state.mgcl),
    latticeFeedback(state.lattice),
  ];
  const completed = [
    state.nacl.checked && messages[0].good,
    state.mgcl.checked && messages[1].good,
    state.lattice.checked && messages[2].good,
    !!last,
    last?.kind === "review",
  ];
  return (
    <div className={styles.lab} data-scene={scene}>
      <header className={styles.labHeader}>
        <Link href="/lessons/ionic-bonding" className={styles.back}>
          ← Ionic bonding
        </Link>
        <span className={styles.labTag}>
          <i aria-hidden="true" />
          An interactive lesson
        </span>
      </header>
      <nav className={styles.chapterNav} aria-label="Ionic bonding chapters">
        {chapters.map((c, i) => (
          <button
            key={c.label}
            onClick={() => navigate(i)}
            aria-label={`Open ${c.label} chapter`}
            aria-current={scene === i ? "step" : undefined}
          >
            <span className={styles.chapterNumber}>
              {completed[i] ? <span aria-hidden="true">✓</span> : `0${i + 1}`}
            </span>
            <span className={styles.chapterLabel}>{c.label}</span>
            {scene === i && (
              <i aria-hidden="true" className={styles.chapterDot} />
            )}
          </button>
        ))}
      </nav>
      <div
        className={`${styles.workArea} ${scene >= 3 ? styles.challengeArea : ""}`}
      >
        <div className={styles.story}>
          <p className={styles.kicker}>{chapter.kicker}</p>
          <h1 id="ionic-lab-title" tabIndex={-1}>
            {chapter.title}
          </h1>
          <p className={styles.storyCopy}>{chapter.description}</p>
          {scene < 3 && (
            <div className={styles.ideaCard}>
              <span className={styles.ideaIcon} aria-hidden="true">
                {scene === 0 ? (
                  <>
                    e⁻ <LabIcon />
                  </>
                ) : scene === 1 ? (
                  "+ − −"
                ) : (
                  <LabIcon kind="network" />
                )}
              </span>
              <p>
                {scene === 0 ? (
                  <>
                    The atom stays the same element.
                    <br />
                    <strong>Its charge changes.</strong>
                  </>
                ) : scene === 1 ? (
                  <>
                    Follow each electron.
                    <br />
                    <strong>Then balance each charge.</strong>
                  </>
                ) : (
                  <>
                    Transfer makes the ions.
                    <br />
                    <strong>Attraction makes the bond.</strong>
                  </>
                )}
              </p>
            </div>
          )}
          {scene < 3 && (
            <p className={styles.storyFoot}>
              Make a move. Notice what changes. Explain why.
            </p>
          )}
        </div>
        <section
          className={`${styles.stage} ${styles[chapter.colour]}`}
          aria-label="Current learning activity"
        >
          {scene === 0 && (
            <>
              <div className={styles.stageHeading}>
                <span className={styles.activityLabel}>
                  THE ELECTRON EXCHANGE
                </span>
                <span className={styles.compoundPill}>Na + Cl</span>
              </div>
              <Board
                compound="NaCl"
                transfers={[state.nacl.sent]}
                revealCharges={state.nacl.checked}
                onChange={(t) =>
                  edit((s) => ({
                    ...s,
                    nacl: { ...s.nacl, sent: t[0], checked: false },
                  }))
                }
              />
              <Choice
                label="What charge does sodium have now?"
                value={state.nacl.charge}
                options={[
                  ["-1", "1−"],
                  ["0", "0"],
                  ["1", "1+"],
                ]}
                onChange={(v) =>
                  edit((s) => ({
                    ...s,
                    nacl: { ...s.nacl, charge: v as Charge, checked: false },
                  }))
                }
              />
              <button
                className={styles.primary}
                onClick={() =>
                  archiveGuided("ionic-lab-transfer", (s) => ({
                    ...s,
                    nacl: { ...s.nacl, checked: true },
                  }))
                }
              >
                Check my prediction <LabIcon />
              </button>
              {state.nacl.checked && <Feedback {...messages[0]} />}
              {completed[0] && (
                <button
                  className={styles.continueButton}
                  onClick={() => navigate(1)}
                >
                  What if there are two electrons? →
                </button>
              )}
            </>
          )}
          {scene === 1 && (
            <>
              <div className={styles.stageHeading}>
                <span className={styles.activityLabel}>FIND TWO RECEIVERS</span>
                <span className={styles.compoundPill}>Mg + 2Cl</span>
              </div>
              <Board
                compound="MgCl2"
                transfers={state.mgcl.transfers}
                onChange={(t) =>
                  edit((s) => ({
                    ...s,
                    mgcl: { ...s.mgcl, transfers: t, checked: false },
                  }))
                }
              />
              <Choice
                label="Chloride ions per magnesium ion"
                value={state.mgcl.ratio}
                options={[
                  ["1", "1"],
                  ["2", "2"],
                  ["3", "3"],
                ]}
                onChange={(v) =>
                  edit((s) => ({
                    ...s,
                    mgcl: { ...s.mgcl, ratio: v, checked: false },
                  }))
                }
              />
              <div
                className={styles.formulaDisplay}
                aria-label={`Your proposed formula: MgCl${state.mgcl.ratio === "1" ? "" : state.mgcl.ratio || "not chosen"}`}
              >
                <span>YOUR FORMULA</span>
                <strong>
                  MgCl
                  {state.mgcl.ratio && state.mgcl.ratio !== "1" ? (
                    <sub>{state.mgcl.ratio}</sub>
                  ) : !state.mgcl.ratio ? (
                    <sub>?</sub>
                  ) : null}
                </strong>
              </div>
              <button
                className={styles.primary}
                onClick={() =>
                  archiveGuided("ionic-lab-balance", (s) => ({
                    ...s,
                    mgcl: { ...s.mgcl, checked: true },
                  }))
                }
              >
                Check my arrangement <LabIcon />
              </button>
              {state.mgcl.checked && <Feedback {...messages[1]} />}
              {completed[1] && (
                <button
                  className={styles.continueButton}
                  onClick={() => navigate(2)}
                >
                  Zoom out to a solid →
                </button>
              )}
            </>
          )}
          {scene === 2 && (
            <>
              <div className={styles.stageHeading}>
                <span className={styles.activityLabel}>
                  A GIANT NETWORK OF IONS
                </span>
                <span className={styles.compoundPill}>NaCl</span>
              </div>
              <Choice
                label="Nearest opposite-charge neighbours in 3D?"
                value={state.lattice.guess}
                options={[
                  ["4", "4"],
                  ["6", "6"],
                  ["8", "8"],
                ]}
                onChange={(v) =>
                  edit((s) => ({
                    ...s,
                    lattice: { ...s.lattice, guess: v, checked: false },
                  }))
                }
              />
              <LatticeScene depth={state.lattice.depth} />
              <button
                className={styles.depthButton}
                aria-pressed={state.lattice.depth}
                onClick={() =>
                  edit((s) => ({
                    ...s,
                    lattice: { ...s.lattice, depth: !s.lattice.depth },
                  }))
                }
              >
                <span aria-hidden="true">◇</span>
                {state.lattice.depth
                  ? "Return to the flat slice"
                  : "Reveal the third dimension"}
              </button>
              <p className={styles.diagramNote}>
                A cut-out of a repeating lattice, not separate NaCl molecules.
                The highlighted neighbours show only the nearest opposite-charge
                ions; forces also act beyond them.
              </p>
              <button
                className={styles.primary}
                onClick={() =>
                  archiveGuided("ionic-lab-lattice", (s) => ({
                    ...s,
                    lattice: { ...s.lattice, depth: true, checked: true },
                  }))
                }
              >
                Check my prediction <LabIcon />
              </button>
              {state.lattice.checked && <Feedback {...messages[2]} />}
              {completed[2] && (
                <button
                  className={styles.continueButton}
                  onClick={() => {
                    navigate(3);
                  }}
                >
                  Try it without the worked feedback →
                </button>
              )}
            </>
          )}
          {scene === 3 && !run && !last && (
            <div className={styles.challengeIntro}>
              <div className={styles.challengeArt} aria-hidden="true">
                <span>×</span>
                <i />
                <span>•</span>
                <b>?</b>
              </div>
              <h2>Three responses. Your own reasoning.</h2>
              <p>
                Construct the ions, identify the force, then put electron
                transfer into words.
              </p>
              <button className={styles.primary} onClick={() => start("check")}>
                Start the challenge <LabIcon />
              </button>
              <p className={styles.quiet}>
                Responses stay editable. References appear after all three are
                submitted.
              </p>
            </div>
          )}
          {challenge && run && (
            <>
              <div className={styles.stageHeading}>
                <span className={styles.activityLabel}>
                  {run.kind === "review"
                    ? "DELAYED RETRIEVAL"
                    : "YOUR CHALLENGE"}
                </span>
                <span className={styles.compoundPill}>{index + 1} / 3</span>
              </div>
              <nav
                className={styles.questionNav}
                aria-label="Challenge responses"
              >
                {["Diagram", "Force", "Explain"].map((label, i) => (
                  <button
                    key={label}
                    aria-label={`Open ${label} response`}
                    aria-current={index === i ? "step" : undefined}
                    onClick={() => runEdit((r) => ({ ...r, index: i }))}
                  >
                    {i + 1}
                    {run.recorded[i] && <span aria-label="recorded"> ✓</span>}
                    <span className={styles.questionLabel}>{label}</span>
                  </button>
                ))}
              </nav>
              <h2 className={styles.challengePrompt}>
                {challengePrompts(run.kind)[index]}
              </h2>
              {index === 0 && (
                <>
                  <Board
                    compound={runCompound(run.kind)}
                    transfers={run.drawing.transfers}
                    proposal={run.drawing}
                    detail={false}
                    onChange={(t) =>
                      runEdit((r) => ({
                        ...r,
                        drawing: { ...r.drawing, transfers: t },
                        recorded: r.recorded.map((b, i) =>
                          i === 0 ? false : b,
                        ),
                      }))
                    }
                  />
                  <DrawingControls
                    drawing={run.drawing}
                    onChange={(d) =>
                      runEdit((r) => ({
                        ...r,
                        drawing: d,
                        recorded: r.recorded.map((b, i) =>
                          i === 0 ? false : b,
                        ),
                      }))
                    }
                  />
                </>
              )}
              {index === 1 && (
                <fieldset className={styles.forceChoices}>
                  <legend className={styles.srOnly}>
                    Your choice of bonding force
                  </legend>
                  {forceOptions.map((o) => (
                    <label key={o.id}>
                      <input
                        type="radio"
                        name="ionic-lab-force"
                        value={o.id}
                        checked={run.force === o.id}
                        onChange={() =>
                          runEdit((r) => ({
                            ...r,
                            force: o.id,
                            recorded: r.recorded.map((b, i) =>
                              i === 1 ? false : b,
                            ),
                          }))
                        }
                        data-answer-control="true"
                      />
                      <span>
                        <strong>{o.title}</strong>
                        <small>{o.detail}</small>
                      </span>
                    </label>
                  ))}
                </fieldset>
              )}
              {index === 2 && (
                <div className={styles.writing}>
                  <label htmlFor="ionic-lab-explanation">
                    Your explanation
                  </label>
                  <textarea
                    id="ionic-lab-explanation"
                    rows={5}
                    value={run.writing}
                    data-answer-control="true"
                    onChange={(e) =>
                      runEdit((r) => ({
                        ...r,
                        writing: e.target.value,
                        recorded: r.recorded.map((b, i) =>
                          i === 2 ? false : b,
                        ),
                      }))
                    }
                  />
                  <p>Use your own words. Your writing is saved as you work.</p>
                </div>
              )}
              <button
                className={styles.primary}
                onClick={record}
                disabled={run.recorded[index]}
              >
                Record this response <span aria-hidden="true">✓</span>
              </button>
              {notice && (
                <p role="status" className={styles.notice}>
                  {notice}
                </p>
              )}
              {run.recorded[index] && (
                <p className={styles.recordedNote}>
                  Recorded. Feedback stays hidden until whole submission.
                </p>
              )}
              {index < 2 ? (
                <button
                  className={styles.continueButton}
                  disabled={!run.recorded[index]}
                  onClick={() => {
                    runEdit((r) => ({ ...r, index: r.index + 1 }));
                    requestAnimationFrame(() => window.scrollTo(0, 0));
                  }}
                >
                  Next response →
                </button>
              ) : (
                <button
                  className={styles.continueButton}
                  disabled={!run.recorded.every(Boolean)}
                  onClick={whole}
                >
                  Submit all three and review →
                </button>
              )}
            </>
          )}
          {scene === 3 && !run && last && (
            <>
              <Review run={last} />
              <div className={styles.afterReview}>
                <button className={styles.primary} onClick={() => navigate(4)}>
                  Plan a seven-day revisit →
                </button>
                <button
                  className={styles.continueButton}
                  onClick={() => start("check")}
                >
                  Try the challenge again
                </button>
                <p className={styles.quiet}>
                  Previous attempts stay saved. Repeating the challenge is
                  practice.
                </p>
                <details>
                  <summary>Saved attempts ({state.runs.length})</summary>
                  {state.runs.map((r, i) => (
                    <p key={`${r.started}-${i}`}>
                      {r.kind === "review" ? "Delayed retrieval" : "Challenge"}{" "}
                      {i + 1} ·{" "}
                      {new Date(r.submitted).toLocaleDateString("en-GB")} ·
                      three responses retained
                    </p>
                  ))}
                </details>
              </div>
            </>
          )}
          {scene === 4 && !run && (
            <div className={styles.revisitCard}>
              <div className={styles.calendarArt} aria-hidden="true">
                <span>COME BACK</span>
                <strong>7</strong>
                <span>DAYS LATER</span>
              </div>
              <h2>
                {last
                  ? due
                    ? "Your revisit is ready."
                    : "Give the idea a little space."
                  : "Start with a challenge."}
              </h2>
              <button
                className={styles.primary}
                disabled={!!last && !due}
                onClick={() => (last ? start("review") : navigate(3))}
              >
                {last ? "Start delayed retrieval" : "Go to the challenge"}{" "}
                <span aria-hidden="true">→</span>
              </button>
              <p>
                {last
                  ? due
                    ? "Retrieve the transfer, diagram and charge ideas for a different combination of atoms."
                    : "Your delayed challenge opens seven days after your last submission. Your saved work and earlier attempts stay here."
                  : "Submit your first three responses to schedule a delayed revisit."}
              </p>
              {last && !due && (
                <p className={styles.revisitDate}>
                  Opens{" "}
                  {new Date(last.submitted + SEVEN_DAYS).toLocaleDateString(
                    "en-GB",
                    { weekday: "short", day: "numeric", month: "long" },
                  )}
                </p>
              )}
              <button
                className={styles.continueButton}
                onClick={() => navigate(0)}
              >
                Explore the models again
              </button>
            </div>
          )}
        </section>
      </div>
      <div className={styles.lessonFooter}>
        <span>
          <i aria-hidden="true" />
          {blocked
            ? "Work is kept for this visit"
            : data.work[LAB_WORK]
              ? "Your work is kept on this device"
              : "Explore at your own pace"}
        </span>
        <Link href="/lessons/ionic-bonding">
          Continue in the course lesson →
        </Link>
      </div>
    </div>
  );
}
