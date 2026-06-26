import React, { useState } from "react";
import "./style.css";

const App: React.FC = () => {
  const [question, setQuestion] = useState("");
  
  // 1. New state to track which accordion item is open
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // 2. Transformed topics into actual questions and answers
  const faqData = [
    {
      q: "What is the policy on employment and job creation?",
      a: "Our tool pulls directly from party manifestos. Search above to compare their promises on job creation!"
    },
    {
      q: "What support is promised for farmers and agriculture?",
      a: "Different parties offer varying subsidies and land reforms. Use the search to see exact quotes."
    },
    {
      q: "How will the parties tackle corruption and governance?",
      a: "Transparency and anti-corruption policies vary widely. Enter this topic in the search bar to compare."
    },
    {
      q: "What is the stance on youth and technology policy?",
      a: "You can find out how each party plans to support IT infrastructure and youth employment by searching above."
    }
  ];

  // 3. Function to toggle the accordion open/closed
  const toggleAccordion = (index: number) => {
    // If clicking the already open item, close it. Otherwise, open the new one.
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div>
      <header className="app-header">
        <h1>Manifesto Nepal</h1>
        <p className="tagline">All parties, all promises — one question</p>
      </header>

      <main className="main-section">
        <h2>What do Nepal’s parties actually promise?</h2>
        <p className="subtitle">
          Ask anything. Get a party-by-party answer drawn directly from their manifestos — no spin, no interpretation.
        </p>

        <div className="search-box">
          <input
            type="text"
            placeholder="e.g. What does each party say about unemployment?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button>Compare parties</button>
        </div>

        {/* --- UPDATED FAQ SECTION --- */}
        <div className="faq-wrapper">
          <div className="faq-header">
            <p className="pre-heading">GOT QUESTIONS?</p>
            <h3>Frequently Asked <span className="highlight">Questions</span></h3>
          </div>

          <div className="accordion">
            {faqData.map((item, index) => (
              <div key={index} className="accordion-item">
                <button
                  className={`accordion-btn ${activeIndex === index ? "active" : ""}`}
                  onClick={() => toggleAccordion(index)}
                >
                  {item.q}
                  <span className="icon">+</span>
                </button>
                
                {/* 4. The expandable content area */}
                <div 
                  className="accordion-content"
                  style={{
                    maxHeight: activeIndex === index ? "200px" : "0px",
                    paddingBottom: activeIndex === index ? "24px" : "0px"
                  }}
                >
                  <p>{item.a}</p>
                  
                  {/* Bonus: Kept your auto-fill feature inside the answer! */}
                  <button 
                    className="auto-fill-btn"
                    onClick={() => {
                      setQuestion(item.q);
                      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll back up to search
                    }}
                  >
                    Search this question ↗
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* --- END FAQ SECTION --- */}

      </main>
    </div>
  );
};

export default App;