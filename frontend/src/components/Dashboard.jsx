// components/Dashboard.jsx - COMPLETE VERSION WITH ANALYTICS
import React, { useState, useEffect, useCallback } from 'react';
import CandidateDetail from './CandidateDetail';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import AnonymizationToggle from './AnonymizationToggle';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
import KanbanBoard from './KanbanBoard';
import { useSearch } from '../hooks/useSearch';
import candidateService from '../services/candidateService';
import { getScoreColor, calculateOverallScore } from '../utils/candidateUtils';
import './Dashboard.css';

const Dashboard = () => {
  const [allCandidates, setAllCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('overall_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'board'
  const [isAnonymized, setIsAnonymized] = useState(() => {
    return localStorage.getItem('anonymizationEnabled') === 'true';
  });

  // Use search hook for filtering
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredCandidates,
    availableSkills,
    availableJobRoles,
    totalCandidates,
    filteredCount
  } = useSearch(allCandidates);

  // OPTIMIZED: Single fetch function using service
  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const candidates = await candidateService.fetchAllCandidates(100);
      setAllCandidates(candidates);
    } catch (err) {
      setError(`Failed to load candidates: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // OPTIMIZED: Client-side sorting
  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }, [sortBy, sortOrder]);

  // FIXED: Memoized sorted candidates with updated overall scores
  const sortedCandidates = React.useMemo(() => {
    // FIXED: Ensure all candidates have updated overall scores
    const candidatesWithScores = filteredCandidates.map(candidate => ({
      ...candidate,
      overall_score: calculateOverallScore(candidate) // Recalculate on every render
    }));
    
    if (!sortBy) return candidatesWithScores;
    
    return [...candidatesWithScores].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'match_score':
          aValue = a.match_score || 0;
          bValue = b.match_score || 0;
          break;
        case 'experience_years':
          aValue = a.experience_years || 0;
          bValue = b.experience_years || 0;
          break;
        case 'overall_score':
          aValue = a.overall_score || 0;
          bValue = b.overall_score || 0;
          break;
        case 'job_role':
          aValue = (a.job_role || 'Unassigned').toLowerCase();
          bValue = (b.job_role || 'Unassigned').toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      } else {
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      }
    });
  }, [filteredCandidates, sortBy, sortOrder]);

  // OPTIMIZED: Memoized statistics
  const dashboardStats = React.useMemo(() => ({
    totalFiltered: sortedCandidates.length,
    highScores: sortedCandidates.filter(c => c.overall_score >= 70).length,
    experienced: sortedCandidates.filter(c => c.experience_years >= 5).length,
    topMatches: sortedCandidates.filter(c => c.match_score >= 0.8).length
  }), [sortedCandidates]);

  const handleCandidateClick = useCallback((candidateId) => {
    setSelectedCandidateId(candidateId);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedCandidateId(null);
  }, []);

  const handleAnonymizationToggle = useCallback((enabled) => {
    setIsAnonymized(enabled);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Analytics handlers
  const handleShowAnalytics = useCallback(() => {
    setShowAnalytics(true);
  }, []);

  const handleCloseAnalytics = useCallback(() => {
    setShowAnalytics(false);
  }, []);

  // Update Candidate Role (Kanban D&D)
  const handleUpdateCandidateRole = useCallback(async (candidateId, newRole) => {
    try {
      // Optimistic update
      setAllCandidates(prev => 
        prev.map(c => c.id === candidateId ? { ...c, job_role: newRole } : c)
      );
      
      // API call
      await candidateService.updateCandidate(candidateId, { job_role: newRole });
    } catch (err) {
      console.error("Failed to update role:", err);
      // Revert on failure
      fetchCandidates();
      throw err;
    }
  }, [fetchCandidates]);

  // Delete Candidate
  const handleDeleteCandidate = useCallback(async (candidateId, event) => {
    if (event) {
      event.stopPropagation();
    }
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        await candidateService.deleteCandidate(candidateId);
        fetchCandidates();
      } catch (err) {
        alert("Failed to delete candidate: " + err.message);
      }
    }
  }, [fetchCandidates]);

  // OPTIMIZED: Memoized highlight function
  const highlightText = React.useCallback((text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : (
        part
      )
    );
  }, []);

  // OPTIMIZED: Clear all filters function
  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({
      experienceMin: 0,
      experienceMax: 20,
      matchScoreMin: 0,
      skills: []
    });
  }, [setSearchTerm, setFilters]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={handleRefresh} className="retry-btn">
              Retry
            </button>
            <button onClick={() => setError('')} className="dismiss-btn">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-top">
          <h1>Candidate Dashboard</h1>
          <div className="header-controls">
            <button 
              onClick={handleShowAnalytics} 
              className="analytics-btn" 
              title="View Analytics Dashboard"
            >
              <i className="fi fi-rr-stats"></i>
              Analytics
            </button>
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <i className="fi fi-rr-list"></i>
              </button>
              <button 
                className={`view-btn ${viewMode === 'board' ? 'active' : ''}`}
                onClick={() => setViewMode('board')}
                title="Board View"
              >
                <i className="fi fi-rr-apps"></i>
              </button>
            </div>
            <AnonymizationToggle 
              isAnonymized={isAnonymized}
              onToggle={handleAnonymizationToggle}
            />
            <button onClick={handleRefresh} className="refresh-btn" title="Refresh Data">
              <i className="fi fi-rr-refresh"></i>
            </button>
          </div>
        </div>

        <div className="search-filter-section">
          <SearchBar 
            onSearch={setSearchTerm}
            searchTerm={searchTerm}
            placeholder="Search by name, skills, or experience..."
          />
          <FilterPanel 
            filters={filters}
            onFiltersChange={setFilters}
            availableSkills={availableSkills}
            availableJobRoles={availableJobRoles}
          />
        </div>

        <div className="results-summary">
          <span className="results-count">
            Showing {dashboardStats.totalFiltered} of {totalCandidates} candidates
          </span>
          {(searchTerm || Object.values(filters).some(f => 
            Array.isArray(f) ? f.length > 0 : f > 0
          )) && (
            <button className="clear-all-btn" onClick={clearAllFilters}>
              Clear All Filters
            </button>
          )}
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>{dashboardStats.totalFiltered}</h3>
            <p>Filtered Results</p>
          </div>
          <div className="stat-card">
            <h3>{dashboardStats.highScores}</h3>
            <p>High Scores (70+)</p>
          </div>
          <div className="stat-card">
            <h3>{dashboardStats.experienced}</h3>
            <p>Experienced (5+ years)</p>
          </div>
          <div className="stat-card">
            <h3>{dashboardStats.topMatches}</h3>
            <p>Top Matches (80%+)</p>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="candidates-table-container">
          <table className="candidates-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Name {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
              </th>
              <th onClick={() => handleSort('match_score')} className="sortable">
                Match Score {sortBy === 'match_score' && (sortOrder === 'desc' ? '↓' : '↑')}
              </th>
              <th onClick={() => handleSort('experience_years')} className="sortable">
                Experience {sortBy === 'experience_years' && (sortOrder === 'desc' ? '↓' : '↑')}
              </th>
              <th>Skills</th>
              <th onClick={() => handleSort('job_role')} className="sortable">
                Job Role {sortBy === 'job_role' && (sortOrder === 'desc' ? '↓' : '↑')}
              </th>
              <th onClick={() => handleSort('overall_score')} className="sortable">
                Overall Score {sortBy === 'overall_score' && (sortOrder === 'desc' ? '↓' : '↑')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCandidates.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  {searchTerm || Object.values(filters).some(f => 
                    Array.isArray(f) ? f.length > 0 : f > 0
                  ) 
                    ? "No candidates match your search criteria."
                    : "No candidates found. Upload some resumes to get started!"
                  }
                </td>
              </tr>
            ) : (
              sortedCandidates.map((candidate) => (
                <tr key={candidate.id} className="candidate-row">
                  <td className="candidate-name">
                    {highlightText(
                      isAnonymized ? candidate.anonymized_id : (candidate.name || 'Anonymous'), 
                      searchTerm
                    )}
                  </td>
                  <td className="match-score">
                    <span 
                      className="score-badge"
                      style={{ backgroundColor: getScoreColor(candidate.match_score * 100) }}
                    >
                      {(candidate.match_score * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="experience">
                    {highlightText(candidate.formatted_experience, searchTerm)}
                  </td>
                  <td className="skills">
                    <div className="skills-container">
                      {candidate.skills && candidate.skills.length > 0 ? (
                        candidate.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {highlightText(skill, searchTerm)}
                          </span>
                        ))
                      ) : (
                        <span className="no-skills">No skills extracted</span>
                      )}
                      {candidate.skills && candidate.skills.length > 3 && (
                        <span className="more-skills">
                          +{candidate.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="job-role">
                    <span className="skill-tag" style={{ backgroundColor: '#e9ecef', color: '#495057' }}>
                      {highlightText(candidate.job_role || 'Unassigned', searchTerm)}
                    </span>
                  </td>
                  <td className="overall-score">
                    <span 
                      className="score-badge overall"
                      style={{ backgroundColor: getScoreColor(candidate.overall_score) }}
                    >
                      {candidate.overall_score}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className="view-detail-btn"
                      onClick={() => handleCandidateClick(candidate.id)}
                      title="View candidate details"
                      style={{ marginRight: '8px' }}
                    >
                      <i className="fi fi-rr-search-alt"></i>
                    </button>
                    <button
                      className="view-detail-btn"
                      onClick={(e) => handleDeleteCandidate(candidate.id, e)}
                      title="Delete candidate"
                      style={{ color: '#e74c3c' }}
                    >
                      <i className="fi fi-rr-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      ) : (
        <KanbanBoard 
          candidates={sortedCandidates}
          availableJobRoles={availableJobRoles}
          onUpdateCandidateRole={handleUpdateCandidateRole}
          onCandidateClick={handleCandidateClick}
          onDeleteCandidate={handleDeleteCandidate}
          isAnonymized={isAnonymized}
        />
      )}

      {selectedCandidateId && (
        <CandidateDetail 
          candidateId={selectedCandidateId}
          onClose={handleCloseDetail}
          onDelete={() => { handleDeleteCandidate(selectedCandidateId); handleCloseDetail(); }}
          isAnonymized={isAnonymized}
        />
      )}

      {showAnalytics && (
        <AnalyticsDashboard 
          candidates={sortedCandidates}
          isVisible={showAnalytics}
          onClose={handleCloseAnalytics}
        />
      )}
    </div>
  );
};

export default Dashboard;
