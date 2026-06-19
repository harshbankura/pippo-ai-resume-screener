// frontend/src/components/analytics/AnalyticsDashboard.jsx
import React, { useState } from 'react';
import SkillsAnalytics from './SkillsAnalytics';
import ExperienceDistribution from './ExperienceDistribution';
import MatchScoreAnalytics from './MatchScoreAnalytics';
import './Analytics.css';

const AnalyticsDashboard = ({ candidates, isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isVisible) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'match-scores', label: 'Match Scores', icon: '🎯' },
    { id: 'skills', label: 'Skills Intelligence', icon: '🔧' },
    { id: 'experience', label: 'Experience', icon: '📈' },
  ];

  return (
    <div className="analytics-overlay">
      <div className="analytics-modal">
        <div className="analytics-header">
          <h1>📊 Candidate Analytics Dashboard</h1>
          <button onClick={onClose} className="analytics-close-btn">
            <i className="fi fi-rr-cross"></i>
          </button>
        </div>

        {/* Analytics Navigation */}
        <div className="analytics-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`analytics-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Analytics Content */}
        <div className="analytics-content">
          {activeTab === 'overview' && (
            <div className="overview-dashboard">
              <div className="overview-stats">
                <div className="overview-card">
                  <h3>Total Candidates</h3>
                  <span className="overview-number">{candidates.length}</span>
                </div>
                <div className="overview-card">
                  <h3>Avg Match Score</h3>
                  <span className="overview-number">
                    {(candidates.reduce((sum, c) => sum + (c.match_score || 0), 0) / candidates.length * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="overview-card">
                  <h3>Top Performers</h3>
                  <span className="overview-number">
                    {candidates.filter(c => (c.match_score || 0) >= 0.8).length}
                  </span>
                </div>
                <div className="overview-card">
                  <h3>Unique Skills</h3>
                  <span className="overview-number">
                    {new Set(candidates.flatMap(c => c.skills || [])).size}
                  </span>
                </div>
              </div>
              
              {/* Quick Overview Charts */}
              <div className="overview-charts">
                <div className="overview-chart-section">
                  <MatchScoreAnalytics candidates={candidates} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'match-scores' && (
            <MatchScoreAnalytics candidates={candidates} />
          )}

          {activeTab === 'skills' && (
            <SkillsAnalytics candidates={candidates} />
          )}

          {activeTab === 'experience' && (
            <ExperienceDistribution candidates={candidates} />
          )}
        </div>

        {/* Export Options */}
        <div className="analytics-footer">
          <button className="export-btn" onClick={() => exportAnalytics('pdf')}>
            📄 Export PDF Report
          </button>
          <button className="export-btn" onClick={() => exportAnalytics('csv')}>
            📊 Export Data CSV
          </button>
          <button className="export-btn" onClick={() => exportAnalytics('excel')}>
            📈 Export Excel
          </button>
        </div>
      </div>
    </div>
  );

  function exportAnalytics(format) {
    // Placeholder for export functionality
    alert(`Exporting analytics as ${format.toUpperCase()}...`);
    console.log(`Export ${format} functionality to be implemented`);
  }
};

export default AnalyticsDashboard;
