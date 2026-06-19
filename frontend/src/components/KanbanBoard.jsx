import React, { useState, useEffect } from 'react';
import { getScoreColor } from '../utils/candidateUtils';
import './KanbanBoard.css';

const KanbanBoard = ({ candidates, availableJobRoles, onUpdateCandidateRole, onCandidateClick, onDeleteCandidate, isAnonymized }) => {
  const [columns, setColumns] = useState([]);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [draggedCandidateId, setDraggedCandidateId] = useState(null);

  // Initialize columns with available job roles
  useEffect(() => {
    // Collect all job roles from candidates and from availableJobRoles
    const candidateRoles = new Set(candidates.map(c => c.job_role || 'Unassigned'));
    availableJobRoles.forEach(r => candidateRoles.add(r));
    
    // Only update if columns changed
    const incomingRoles = Array.from(candidateRoles);
    setColumns(prevColumns => {
      // Keep existing custom columns that might be empty
      const combined = new Set([...prevColumns, ...incomingRoles]);
      return Array.from(combined);
    });
  }, [candidates, availableJobRoles]);

  const handleDragStart = (e, candidateId) => {
    setDraggedCandidateId(candidateId);
    // Needed for Firefox and standard HTML5 DnD
    e.dataTransfer.setData('text/plain', candidateId.toString());
    e.dataTransfer.effectAllowed = 'move';
    
    // Add a class to the original element
    setTimeout(() => {
      e.target.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedCandidateId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Add visual cue
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = async (e, targetRole) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (!draggedCandidateId) return;

    const candidateId = parseInt(draggedCandidateId);
    
    // Find candidate to check if role actually changed
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate || (candidate.job_role || 'Unassigned') === targetRole) {
      return; 
    }

    try {
      // Call parent handler
      await onUpdateCandidateRole(candidateId, targetRole);
    } catch (error) {
      console.error("Failed to move candidate:", error);
      // UI reverts automatically because parent state didn't change successfully
    }
  };

  const handleAddColumn = (e) => {
    e.preventDefault();
    if (newColumnName.trim() && !columns.includes(newColumnName.trim())) {
      setColumns([...columns, newColumnName.trim()]);
    }
    setNewColumnName('');
    setIsAddingColumn(false);
  };

  const generateAnonymousId = (id) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let seed = id * 12345;
    let result = '';
    for(let i=0; i<6; i++) {
      result += chars[seed % chars.length];
      seed += 7;
    }
    return result;
  };

  const getDisplayName = (candidate) => {
    return isAnonymized ? generateAnonymousId(candidate.id) : (candidate.name || 'Anonymous');
  };

  // Group candidates by role
  const candidatesByRole = columns.reduce((acc, role) => {
    acc[role] = candidates.filter(c => (c.job_role || 'Unassigned') === role);
    // Sort within column
    acc[role].sort((a, b) => b.overall_score - a.overall_score);
    return acc;
  }, {});

  return (
    <div className="kanban-wrapper">
      <div className="kanban-board">
        {columns.filter(role => !hiddenColumns.includes(role)).map(role => (
          <div 
            key={role} 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, role)}
          >
            <div className="column-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3>{role}</h3>
                <button 
                  onClick={() => setHiddenColumns(prev => [...prev, role])} 
                  title="Hide Column" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#95a5a6', fontSize: '14px', padding: '0' }}
                >
                  <i className="fi fi-rr-minus-circle"></i>
                </button>
              </div>
              <span className="candidate-count">{candidatesByRole[role].length}</span>
            </div>
            
            <div className="column-content">
              {candidatesByRole[role].map(candidate => (
                <div 
                  key={candidate.id}
                  className="kanban-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, candidate.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onCandidateClick(candidate.id)}
                >
                  <div className="card-header">
                    <h4>{getDisplayName(candidate)}</h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span 
                        className="card-score"
                        style={{ backgroundColor: getScoreColor(candidate.overall_score) }}
                      >
                        {candidate.overall_score}
                      </span>
                      {onDeleteCandidate && (
                        <button 
                          className="delete-card-btn" 
                          onClick={(e) => onDeleteCandidate(candidate.id, e)}
                          title="Delete Candidate"
                          style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: '0 2px' }}
                        >
                          <i className="fi fi-rr-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="card-detail">
                      <i className="fi fi-rr-briefcase"></i> 
                      {candidate.experience_years} years
                    </div>
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="card-skills">
                        {candidate.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="micro-skill">{skill}</span>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="micro-skill empty">+{candidate.skills.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {candidatesByRole[role].length === 0 && (
                <div className="empty-column-msg">Drop candidates here</div>
              )}
            </div>
          </div>
        ))}
        
        {/* Add new column area */}
        <div className="kanban-column add-column">
          {isAddingColumn ? (
            <form onSubmit={handleAddColumn} className="add-column-form">
              <input 
                type="text" 
                autoFocus
                placeholder="Job Role Name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
              />
              <div className="add-column-actions">
                <button type="submit" className="save-col-btn">Add</button>
                <button type="button" className="cancel-col-btn" onClick={() => setIsAddingColumn(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <button className="add-column-btn" onClick={() => setIsAddingColumn(true)}>
              <i className="fi fi-rr-plus"></i> Add Job Role
            </button>
          )}
        </div>

        {/* Hidden Columns Restore Area */}
        {hiddenColumns.length > 0 && (
          <div className="kanban-column hidden-columns" style={{ opacity: 0.8, backgroundColor: '#f8f9fa', border: '1px dashed #ced4da' }}>
            <div className="column-header">
              <h3>Hidden Roles</h3>
              <span className="candidate-count" style={{ backgroundColor: '#6c757d' }}>{hiddenColumns.length}</span>
            </div>
            <div className="column-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px' }}>
              {hiddenColumns.map(role => (
                <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'white', borderRadius: '6px', border: '1px solid #e9ecef', fontSize: '14px', fontWeight: '500' }}>
                  <span style={{ color: '#495057' }}>{role}</span>
                  <button 
                    onClick={() => setHiddenColumns(prev => prev.filter(c => c !== role))} 
                    title="Restore Column"
                    style={{ background: 'none', border: 'none', color: '#27ae60', cursor: 'pointer', padding: '0' }}
                  >
                    <i className="fi fi-rr-plus-circle" style={{ fontSize: '16px' }}></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
