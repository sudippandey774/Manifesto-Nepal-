import type { Party } from '../types';
import styles from './PartyStrip.module.css';

interface Props {
  parties: Party[];
}

export default function PartyStrip({ parties }: Props) {
  if (parties.length === 0) return null;

  return (
    <div className={styles.strip}>
      <div className={styles.inner}>
        <span className={styles.label}>Parties covered:</span>
        <div className={styles.parties}>
          {parties.map(p => (
            <div key={p.id} className={styles.party}>
              <span
                className={styles.dot}
                style={{ background: p.color }}
              />
              <span className={styles.name}>{p.party_name}</span>
              <span className={styles.symbol}>{p.symbol}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
