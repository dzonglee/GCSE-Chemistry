export const alkaliReference = [
  ["Lithium", "Li", 3],
  ["Sodium", "Na", 11],
  ["Potassium", "K", 19],
  ["Rubidium", "Rb", 37],
  ["Caesium", "Cs", 55],
  ["Francium", "Fr", 87],
] as const;

export function AlkaliReference() {
  return (
    <details className="alkali-reference">
      <summary>Alkali-metal names and symbols</summary>
      <table>
        <caption>Supplied reference: alkali metals, down Group 1</caption>
        <thead>
          <tr>
            <th scope="col">Element</th>
            <th scope="col">Symbol</th>
            <th scope="col">Atomic number</th>
          </tr>
        </thead>
        <tbody>
          {alkaliReference.map(([name, symbol, number]) => (
            <tr key={symbol}>
              <th scope="row">{name}</th>
              <td>{symbol}</td>
              <td>{number}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Symbols use an uppercase first letter and a lowercase second letter.
        Hydrogen is a non-metal, so it is not one of these alkali metals.
        Reaction evidence in this lesson is limited to lithium, sodium and
        potassium; the heavier names support table use and trend predictions.
      </p>
    </details>
  );
}
