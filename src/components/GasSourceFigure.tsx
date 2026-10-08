"use client";
import { gasReservedRecords, type GasGivenData } from "@/lib/gas-tests-givens";
import { gasChoiceLabels } from "@/lib/gas-tests-domain";
export function GasSourceFigure({ data }: { data: GasGivenData }) {
  return (
    <section
      className="gas-original gas-cold-original"
      aria-label="Original question figures"
    >
      <p>
        Original givens: each sample is one of hydrogen, oxygen, carbon dioxide
        or chlorine.
      </p>
      <div className="gas-cold-pair">
        {gasReservedRecords[data.record].map((record) => {
          const liquid = record.material === "limewater",
            paper = record.material === "dampBlueLitmus",
            burning = record.material === "burningSplint",
            tip = burning ? 60 : 105;
          return (
            <article key={record.label}>
              <h3>Record {record.label}</h3>
              <div
                className="gas-cold-svg"
                role="region"
                tabIndex={0}
                aria-label={`Original record ${record.label} figure; pan horizontally to inspect`}
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                    event.preventDefault();
                    event.currentTarget.scrollBy({
                      left: event.key === "ArrowRight" ? 80 : -80,
                    });
                  }
                }}
              >
                <svg
                  width="250"
                  height="205"
                  viewBox="0 0 250 205"
                  role="img"
                  aria-label={`Original record ${record.label}. ${gasChoiceLabels[record.material]}. ${gasChoiceLabels[record.placement]}.`}
                >
                  <rect width="250" height="205" rx="10" fill="#fff" />
                  <path
                    d="M90 60 V159 Q90 178 108 178 Q126 178 126 159 V60"
                    fill="#e5edf6"
                    fillOpacity=".45"
                    stroke="#49627e"
                    strokeWidth="2"
                  />
                  <ellipse
                    cx="108"
                    cy="60"
                    rx="18"
                    ry="4"
                    fill="none"
                    stroke="#49627e"
                  />
                  <line x1="128" y1="60" x2="158" y2="60" stroke="#6c7889" />
                  <text x="164" y="65" fontSize="14">
                    Open end
                  </text>
                  {!liquid && !paper && (
                    <>
                      <line
                        x1="108"
                        y1={tip}
                        x2={burning ? 160 : 108}
                        y2="16"
                        stroke="#b98a4e"
                        strokeWidth="5"
                      />
                      <circle cx="108" cy={tip} r="3" fill="#e06a26" />
                      {burning && (
                        <path
                          d="M103 60 Q100 47 108 38 Q116 47 113 60 Z"
                          fill="#edac24"
                        />
                      )}
                    </>
                  )}
                  {paper && (
                    <>
                      <rect
                        x="103"
                        y="92"
                        width="10"
                        height="32"
                        fill="#4266bc"
                        stroke="#273955"
                      />
                      <line
                        x1="108"
                        y1="92"
                        x2="108"
                        y2="28"
                        stroke="#273955"
                        strokeWidth="2"
                      />
                      <text x="151" y="112" fontSize="14">
                        Damp paper
                      </text>
                    </>
                  )}
                  {liquid && (
                    <>
                      <path
                        d="M93 142 H123 V159 Q123 175 108 175 Q93 175 93 159 Z"
                        fill="#a9d7e0"
                      />
                      <path
                        d="M50 18 H108 V158"
                        fill="none"
                        stroke="#6d91a9"
                        strokeWidth="4"
                      />
                      <circle
                        cx="108"
                        cy="158"
                        r="3"
                        fill="#fff"
                        stroke="#506d86"
                      />
                      <line
                        x1="126"
                        y1="142"
                        x2="151"
                        y2="142"
                        stroke="#6c7889"
                      />
                      <text x="155" y="147" fontSize="14">
                        Liquid level
                      </text>
                    </>
                  )}
                  <text x="15" y="195" fontSize="14">
                    Supplied method; schematic
                  </text>
                </svg>
              </div>
              <p>
                <strong>Method: </strong>
                {gasChoiceLabels[record.material]};{" "}
                {gasChoiceLabels[record.placement]}.
              </p>
              <p>
                <strong>Recorded observation: </strong>
                {record.result}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
