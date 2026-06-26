import React, { useState } from "react";

interface Props {
  onAsk: (question: string) => void;
}

const QuestionForm: React.FC<Props> = ({ onAsk }) => {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onAsk(question);
      setQuestion("");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask about youth employment, health, etc."
        style={{ padding: "8px", width: "70%" }}
      />
      <button type="submit" style={{ padding: "8px 12px", marginLeft: "10px" }}>
        Ask
      </button>
    </form>
  );
};

export default QuestionForm;
