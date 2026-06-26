import type { ActiveTab } from '../types';
import styles from './Header.module.css';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export default function Header({ activeTab, onTabChange }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.flag}>🇳🇵</span>
          <div>
            <h1 className={styles.title}>Nepal Manifesto AI</h1>
            <p className={styles.subtitle}>Compare party promises. Make informed choices.</p>
          </div>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.tab} ${activeTab === 'ask' ? styles.active : ''}`}
            onClick={() => onTabChange('ask')}
          >
            🤖 Ask AI
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'compare' ? styles.active : ''}`}
            onClick={() => onTabChange('compare')}
          >
            📊 Compare Topics
          </button>
        </nav>
      </div>

      <div className={styles.banner}>
        <span>⚖️ Fully nonpartisan — AI only reflects what manifestos actually say</span>
      </div>
    </header>
  );
}
