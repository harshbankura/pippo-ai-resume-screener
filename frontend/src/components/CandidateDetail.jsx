import React, { useState, useEffect } from 'react';
import { calculateOverallScore, getScoreColor, formatExperience } from '../utils/candidateUtils';
import './CandidateDetail.css';

const CandidateDetail = ({ candidateId, onClose, onDelete, isAnonymized = false }) => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (candidateId) {
      fetchCandidateDetail();
    }
  }, [candidateId]);

  const fetchCandidateDetail = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `https://obtuse-browse-jigsaw.ngrok-free.dev/api/v1/candidates/${candidateId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load candidate details: ${response.status}`);
      }

      const data = await response.json();

      // FIXED: Calculate overall score after fetching data
      const candidateWithScore = {
        ...data,
        overall_score: calculateOverallScore(data)
      };

      setCandidate(candidateWithScore);
    } catch (err) {
      console.error('Error fetching candidate details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Simplified scroll lock that properly releases
  useEffect(() => {
    // Store original styles
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // Simple scroll lock
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // FIXED: Cleanup function that always runs
    return () => {
      // Force restore original styles
      document.body.style.overflow = originalBodyOverflow || '';
      document.documentElement.style.overflow = originalHtmlOverflow || '';

      // Force enable scrolling if still locked
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = 'auto';
      }
      if (document.documentElement.style.overflow === 'hidden') {
        document.documentElement.style.overflow = 'auto';
      }
    };
  }, []);

  // FIXED: Enhanced close handler that ensures modal release
  const handleClose = () => {
    // Force unlock scrolling immediately
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';

    // Call parent close function
    onClose();
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Ensure scrolling is restored on cleanup
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const generateAnonymizedId = (candidateId) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const seed = candidateId * 12345;
    let result = '';
    let tempSeed = seed;

    for (let i = 0; i < 6; i++) {
      result += chars[tempSeed % chars.length];
      tempSeed = Math.floor(tempSeed / chars.length) + 7;
    }
    return result;
  };

  const getScoreColorLocal = (score) => {
    if (score >= 0.8) return '#28a745';
    if (score >= 0.6) return '#ffc107';
    if (score >= 0.4) return '#fd7e14';
    return '#dc3545';
  };

  const getScoreLabel = (score) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    if (score >= 0.4) return 'Fair Match';
    return 'Poor Match';
  };

  // Working action button handlers
  const handleScheduleInterview = () => {
    console.log('Schedule Interview clicked for:', candidate.name);
    alert(`Scheduling interview with ${candidate.name || displayName}\nEmail: ${candidate.email}`);
  };

  const handleSendEmail = () => {
    console.log('Send Email clicked for:', candidate.email);
    const subject = encodeURIComponent(`Interview Opportunity - ${candidate.name || displayName}`);
    const body = encodeURIComponent(`Dear ${candidate.name || displayName},\n\nWe would like to schedule an interview with you.\n\nBest regards,\nHR Team`);
    const mailtoLink = `mailto:${candidate.email}?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
  };

  const handleDownloadResume = () => {
    console.log('Download Resume clicked for:', candidate.name);
    alert(`Downloading resume for ${candidate.name || displayName}`);
  };

  // FIXED: Overlay click handler that ensures proper close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (loading) {
    return (
      <div className="candidate-detail-overlay" onClick={handleOverlayClick}>
        <div className="candidate-detail-modal compact" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Loading...</h2>
            <button onClick={handleClose} className="close-btn" aria-label="Close modal">
              ×
            </button>
          </div>
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading candidate details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="candidate-detail-overlay" onClick={handleOverlayClick}>
        <div className="candidate-detail-modal compact" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Error</h2>
            <button onClick={handleClose} className="close-btn" aria-label="Close modal">
              ×
            </button>
          </div>
          <div className="error-container">
            <h3>Error Loading Details</h3>
            <p>{error}</p>
            <button onClick={handleClose} className="close-btn-error">Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="candidate-detail-overlay" onClick={handleOverlayClick}>
        <div className="candidate-detail-modal compact" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Not Found</h2>
            <button onClick={handleClose} className="close-btn" aria-label="Close modal">
              ×
            </button>
          </div>
          <div className="error-container">
            <h3>Candidate Not Found</h3>
            <p>The requested candidate could not be found.</p>
            <button onClick={handleClose} className="close-btn-error">Close</button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = isAnonymized ? generateAnonymizedId(candidate.id) : (candidate.name || 'Anonymous Candidate');

  return (
    <div className="candidate-detail-overlay" onClick={handleOverlayClick}>
      <div className="candidate-detail-modal compact" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{displayName}</h2>
          <button onClick={handleClose} className="close-btn" aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="modal-content">
          {/* Match Score Section - Compact */}
          <div className="detail-section">
            <h3>Match Analysis</h3>
            <div className="match-score-container compact">
              <div className="score-circle compact" style={{ borderColor: getScoreColorLocal(candidate.match_score || 0) }}>
                <span className="score-percentage">{((candidate.match_score || 0) * 100).toFixed(0)}%</span>
                <span className="score-label">{getScoreLabel(candidate.match_score || 0)}</span>
              </div>
              <div className="score-details compact">
                <div className="detail-item">
                  <span className="detail-label">Overall Score:</span>
                  <span className="detail-value blue">{candidate.overall_score || 0}/100</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Experience:</span>
                  <span className="detail-value">{formatExperience(candidate.experience_years || 0)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Skills Found:</span>
                  <span className="detail-value">{candidate.skills?.length || 0} skills</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information - Only if not anonymized */}
          {!isAnonymized && (
            <div className="detail-section">
              <h3>Contact Information</h3>
              <div className="contact-grid compact">
                <div className="contact-item">
                  <span className="contact-label">Email:</span>
                  <span className="contact-value">{candidate.email || 'Not provided'}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Phone:</span>
                  <span className="contact-value">{candidate.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Skills Section - Compact */}
          <div className="detail-section">
            <h3>Extracted Skills</h3>
            <div className="skills-grid compact">
              {candidate.skills && candidate.skills.length > 0 ? (
                candidate.skills.map((skill, index) => (
                  <span key={index} className="skill-badge compact">{skill}</span>
                ))
              ) : (
                <p className="no-data">No skills extracted from resume</p>
              )}
            </div>
          </div>

          {/* Education Section - Compact */}
          <div className="detail-section">
            <h3>Education</h3>
            <div className="education-content compact">
              {candidate.education ? (
                <p>{candidate.education}</p>
              ) : (
                <p className="no-data">No education information extracted</p>
              )}
            </div>
          </div>

          {/* Resume Preview - Compact */}
          <div className="detail-section">
            <h3>Resume Preview</h3>
            <div className="resume-preview-container">
              <div className="resume-preview">
                {candidate.resume_text ?
                  candidate.resume_text.substring(0, 300) + (candidate.resume_text.length > 300 ? '...' : '')
                  : 'No resume text available'
                }
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer compact">
          <button
            onClick={handleScheduleInterview}
            className="primary-btn action-btn"
          >
            Schedule Interview
          </button>
          <button
            onClick={handleSendEmail}
            className="primary-btn action-btn secondary"
          >
            Send Email
          </button>
          <button
            onClick={handleDownloadResume}
            className="primary-btn action-btn tertiary"
          >
            Download Resume
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="primary-btn action-btn"
              style={{ backgroundColor: '#e74c3c' }}
            >
              Delete Candidate
            </button>
          )}
          <button onClick={handleClose} className="primary-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
