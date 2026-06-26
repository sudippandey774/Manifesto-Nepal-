import { useState } from 'react';
import type { AIResponse, Party } from '../types';
import { askAI } from '../data/api';
import styles from './AskAI.module.css';

const PARTY_COLORS: Record<string, string> = {
  NC: '#1a56db',
  UML: '#e02424',
  Maoist: '#ff5722',
  RSP: '#7c3aed',
  RPP: '#d97706',
};

const SUGGESTED = [
  'Which party has the best plan for youth employment?',
  'What do parties promise for farmers and agriculture?',
  'Which party has the strongest anti-corruption policy?',
  'How do parties plan to improve education?',
  'What are party positions on women\'s rights?',
  'Which party has the best environmental policy?',
  'What infrastructure projects do parties promise?',
];

interface Props {
  parties: Party[];
}

export default function AskAI({ parties }: Props) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [error, setError] = useState('');

  const handleAsk = async (q?: string) => {
    const finalQ = (q || question).trim();
    if (!finalQ) return;

    setLoading(true);
    setError('');
    setResult(null);
    setQuestion(finalQ);

    try {
      const data = await askAI(finalQ);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const getPartyColor = (shortName: string): string => {
    // Find by exact match or partial
    const key = Object.keys(PARTY_COLORS).find(k =>
      shortName.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(shortName.toLowerCase())
    );
    return key ? PARTY_COLORS[key] : '#64748b';
  };

  const getPartyFromResult = (shortName: string) => {
    return parties.find(p =>
      p.short_name.toLowerCase() === shortName.toLowerCase() ||
      shortName.toLowerCase().includes(p.short_name.toLowerCase())
    );
  };

  return (
    <div className={styles.container}>
      {/* Search box */}
      <div className={styles.searchBox}>
        <h2 className={styles.heading}>Ask anything about party manifestos</h2>
        <p className={styles.desc}>Get an instant, nonpartisan comparison across all 5 major parties.</p>

        <div className={styles.inputRow}>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. Which party has the best plan for youth employment?"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
          />
          <button
            className={styles.askBtn}
            onClick={() => handleAsk()}
            disabled={loading || !question.trim()}
          >
            {loading ? '⏳' : '🔍'} Ask
          </button>
        </div>

        {/* Suggested questions */}
        <div className={styles.suggestions}>
          <span className={styles.suggestLabel}>Try:</span>
          {SUGGESTED.map(s => (
            <button
              key={s}
              className={styles.chip}
              onClick={() => handleAsk(s)}
              disabled={loading}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Analyzing manifestos with AI...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className={styles.error}>
          <strong>❌ Error:</strong> {error}
          {error.includes('API key') && (
            <p className={styles.errorHint}>
              Add your Gemini API key to <code>backend/.env</code> file:
              <br /><code>GEMINI_API_KEY=your_key_here</code>
            </p>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={styles.result}>
          <div className={styles.summary}>
            <h3>📋 Summary</h3>
            <p>{result.summary}</p>
          </div>

          <h3 className={styles.partyHeading}>Party-by-Party Comparison</h3>

          <div className={styles.cards}>
            {result.party_answers.map(pa => {
              const party = getPartyFromResult(pa.short_name);
              const color = party?.color || getPartyColor(pa.short_name);
              const symbol = party?.symbol || '🏛️';

              return (
                <div key={pa.party} className={styles.card} style={{ '--party-color': color } as React.CSSProperties}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardSymbol}>{symbol}</span>
                    <div>
                      <div className={styles.cardName}>{pa.party}</div>
                      <div className={styles.cardShort}>{pa.short_name}</div>
                    </div>
                  </div>
                  <p className={styles.cardBody}>{pa.answer}</p>
                </div>
              );
            })}
          </div>

          <p className={styles.disclaimer}>
            ℹ️ {result.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
