import { useState, useEffect } from 'react';
import Header from './components/Header';
import PartyStrip from './components/PartyStrip';
import AskAI from './components/AskAI';
import CompareTopics from './components/CompareTopics';
import type { Party, Topic, ActiveTab } from './types';
import { fetchParties, fetchTopics } from './data/api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ask');
  const [parties, setParties] = useState<Party[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    Promise.all([fetchParties(), fetchTopics()])
      .then(([p, t]) => {
        setParties(p);
        setTopics(t);
      })
      .catch(() => {
        setLoadError(
          'Cannot connect to the backend. Make sure the Flask server is running on port 5000.'
        );
      });
  }, []);

  return (
    <div className="app">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <PartyStrip parties={parties} />

      {loadError && (
        <div className="load-error">
          <strong>⚠️ Backend not connected</strong>
          <p>{loadError}</p>
          <code>cd backend && python app.py</code>
        </div>
      )}

      <main>
        {activeTab === 'ask' && <AskAI parties={parties} />}
        {activeTab === 'compare' && <CompareTopics topics={topics} />}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <p>🗳️ Nepal Manifesto AI — Built for informed voters</p>
          <p className="footer-note">
            This tool is nonpartisan. It only reflects what parties have written in their manifestos.
          </p>
        </div>
      </footer>
    </div>
  );
}
