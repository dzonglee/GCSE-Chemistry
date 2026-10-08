export function FormulaMassGroups({ formula }: { formula: "CaOH" | "MgNO3" }) {
  const hydroxide = formula === "CaOH";
  return (
    <figure className="formula-group-figure">
      <div className="formula-group-tiles">
        <span className="formula-outside" data-formula-outside>
          {hydroxide ? "Ca" : "Mg"}
        </span>
        {[0, 1].map((i) => (
          <div className="formula-group-copy" data-formula-group={i} key={i}>
            <span data-formula-token>{hydroxide ? "O" : "N"}</span>
            {hydroxide ? (
              <span data-formula-token>H</span>
            ) : (
              [0, 1, 2].map((j) => (
                <span data-formula-token key={j}>
                  O
                </span>
              ))
            )}
          </div>
        ))}
      </div>
      <figcaption>
        Two copies of the bracketed {hydroxide ? "OH" : "NO₃"} group; the metal
        remains outside. Symbols count atoms in the formula ratio. Cards do not
        show an isolated ionic molecule or a measured crystal arrangement.
      </figcaption>
    </figure>
  );
}
