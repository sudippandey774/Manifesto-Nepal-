import React from "react";
import { manifestos } from "../data/manifestos";

interface Props {
  question: string;
}

const ComparisonView: React.FC<Props> = ({ question }) => {
  return (
    <div>
      <h3>Comparison for: "{question}"</h3>
      <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
        {Object.entries(manifestos).map(([party, text]) => (
          <div
            key={party}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              width: "200px"
            }}
          >
            <h4>{party}</h4>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonView;
