import React, { useState, useEffect, useRef } from 'react';
import './FilterPanel.css';

const FilterPanel = ({ filters, onFiltersChange, availableSkills = [], availableJobRoles = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [hasChanges, setHasChanges] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    setLocalFilters(filters);
    setHasChanges(false);
  }, [filters]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        // Reset to original filters if no apply was clicked
        if (hasChanges) {
          setLocalFilters(filters);
          setHasChanges(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, hasChanges, filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    setHasChanges(true);
  };

  const handleJobRoleToggle = (role) => {
    const currentRoles = localFilters.jobRoles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    
    handleFilterChange('jobRoles', newRoles);
  };

  const handleSkillToggle = (skill) => {
    const currentSkills = localFilters.skills || [];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    
    handleFilterChange('skills', newSkills);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setHasChanges(false);
    setIsOpen(false);
  };

  const cancelChanges = () => {
    setLocalFilters(filters);
    setHasChanges(false);
    setIsOpen(false);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      experienceMin: 0,
      experienceMax: 20,
      matchScoreMin: 0,
      skills: [],
      jobRoles: []
    };
    setLocalFilters(clearedFilters);
    setHasChanges(true);
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.experienceMin > 0 || filters.experienceMax < 20) count++;
    if (filters.matchScoreMin > 0) count++;
    if (filters.skills && filters.skills.length > 0) count++;
    if (filters.jobRoles && filters.jobRoles.length > 0) count++;
    return count;
  };

  return (
    <div className="filter-panel">
      <button 
        ref={buttonRef}
        className="filter-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fi fi-rr-filter"></i>
        Filters
        {activeFilterCount() > 0 && (
          <span className="filter-count">{activeFilterCount()}</span>
        )}
      </button>

      {isOpen && (
        <div ref={dropdownRef} className="filter-dropdown enhanced">
          <div className="filter-header">
            <h3>Filter Candidates</h3>
            <button className="clear-filters-btn" onClick={clearAllFilters}>
              Clear All
            </button>
          </div>

          {/* Experience Range Filter */}
          <div className="filter-section">
            <label className="filter-label">Experience (Years)</label>
            <div className="range-inputs">
              <input
                type="number"
                min="0"
                max="20"
                value={localFilters.experienceMin || 0}
                onChange={(e) => handleFilterChange('experienceMin', parseInt(e.target.value))}
                className="range-input"
                placeholder="Min"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                min="0"
                max="20"
                value={localFilters.experienceMax || 20}
                onChange={(e) => handleFilterChange('experienceMax', parseInt(e.target.value))}
                className="range-input"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Match Score Filter */}
          <div className="filter-section">
            <label className="filter-label">
              Minimum Match Score: {(localFilters.matchScoreMin || 0) * 100}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={localFilters.matchScoreMin || 0}
              onChange={(e) => handleFilterChange('matchScoreMin', parseFloat(e.target.value))}
              className="score-slider"
            />
          </div>

          {/* Job Roles Filter */}
          <div className="filter-section">
            <label className="filter-label">Job Roles</label>
            <div className="skills-filter-container">
              {availableJobRoles.map(role => (
                <button
                  key={role}
                  className={`skill-filter-btn ${
                    localFilters.jobRoles?.includes(role) ? 'active' : ''
                  }`}
                  onClick={() => handleJobRoleToggle(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Skills Filter */}
          <div className="filter-section">
            <label className="filter-label">Skills</label>
            <div className="skills-filter-container">
              {availableSkills.slice(0, 10).map(skill => (
                <button
                  key={skill}
                  className={`skill-filter-btn ${
                    localFilters.skills?.includes(skill) ? 'active' : ''
                  }`}
                  onClick={() => handleSkillToggle(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="filter-actions">
            <button 
              className="cancel-btn" 
              onClick={cancelChanges}
            >
              Cancel
            </button>
            <button 
              className={`apply-btn ${hasChanges ? 'has-changes' : ''}`}
              onClick={applyFilters}
              disabled={!hasChanges}
            >
              Apply Filters
              {hasChanges && <span className="changes-indicator">•</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
