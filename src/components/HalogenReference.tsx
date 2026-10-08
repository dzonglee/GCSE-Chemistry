export const halogenReference = [
  ["Fluorine", "F", 9],
  ["Chlorine", "Cl", 17],
  ["Bromine", "Br", 35],
  ["Iodine", "I", 53],
  ["Astatine", "At", 85],
  ["Tennessine", "Ts", 117],
] as const;
export function HalogenReference() {
  return (
    <details className="halogen-reference">
      <summary>Group 7 names and symbols</summary>
      <table>
        <caption>Supplied reference, in periodic-table order</caption>
        <thead>
          <tr>
            <th scope="col">Element</th>
            <th scope="col">Symbol</th>
            <th scope="col">Atomic number</th>
          </tr>
        </thead>
        <tbody>
          {halogenReference.map(([name, symbol, z]) => (
            <tr key={symbol}>
              <th scope="row">{name}</th>
              <td>{symbol}</td>
              <td>{z}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        A symbol starts with an uppercase letter; a second letter is lowercase.
        The symbol identifies an element. A subscript or charge is additional
        information, as in Cl₂ or Cl⁻.
      </p>
      <p>
        This is a name-and-symbol reference, not measured reaction or state
        data. The reaction models compare chlorine, bromine and iodine.
      </p>
    </details>
  );
}
