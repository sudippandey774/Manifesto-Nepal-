import { useState, useEffect } from 'react';
import type { Topic, PolicyComparison } from '../types';
import { fetchComparison } from '../data/api';
import styles from './CompareTopics.module.css';

interface Props {
  topics: Topic[];
}

export default function CompareTopics({ topics }: Props) {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [comparisons, setComparisons] = useState<PolicyComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectTopic = async (topicId: string) => {
    setSelectedTopic(topicId);
    setLoading(true);
    setError('');
    try {
      const data = await fetchComparison(topicId);
      setComparisons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (topics.length > 0) {
      handleSelectTopic(topics[0].id);
    }
  }, [topics]);

  const currentTopic = topics.find(t => t.id === selectedTopic);

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <h2 className={styles.heading}>Side-by-side topic comparison</h2>
        <p className={styles.desc}>Select a topic to see what every party has promised.</p>

        <div className={styles.topicGrid}>
          {topics.map(topic => (
            <button
              key={topic.id}
              className={`${styles.topicBtn} ${selectedTopic === topic.id ? styles.active : ''}`}
              onClick={() => handleSelectTopic(topic.id)}
            >
              <span className={styles.topicEmoji}>{topic.emoji}</span>
              <span>{topic.label}</span>
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading manifesto data...</p>
        </div>
      )}

      {error && (
        <div className={styles.error}>❌ {error}</div>
      )}

      {!loading && comparisons.length > 0 && currentTopic && (
        <div className={styles.compareSection}>
          <h3 className={styles.compareHeading}>
            {currentTopic.emoji} {currentTopic.label} — All Parties
          </h3>

          <div className={styles.grid}>
            {comparisons.map(item => (
              <div
                key={item.short_name}
                className={styles.partyCard}
                style={{ '--color': item.color } as React.CSSProperties}
              >
                <div className={styles.partyHeader}>
                  <span className={styles.partySymbol}>{item.symbol}</span>
                  <div>
                    <div className={styles.partyName}>{item.party_name}</div>
                    <div
                      className={styles.partyBadge}
                      style={{ background: item.color }}
                    >
                      {item.short_name}
                    </div>
                  </div>
                </div>
                <div className={styles.partyContent}>
                  {item.content.split('\n').filter(l => l.trim()).map((line, i) => (
                    <p key={i} className={styles.contentLine}>{line.trim()}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className={styles.note}>
            📌 All content is sourced directly from party manifestos. No editorial additions.
          </p>
        </div>
      )}
    </div>
  );
}
