import React, { useState } from 'react';
import './WidgetStyles.css';

const JobDescriptionWidget = (props) => {
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const { actionProvider } = props;

  const handleSubmit = () => {
    if (jobDescription.trim() === '') {
      return; 
    }
    actionProvider.handleJobDescription(jobRole.trim() || 'Unassigned', jobDescription);
  };

  return (
    <div className="widget-container">
      <input
        type="text"
        className="widget-input"
        placeholder="Job Title/Role (e.g. Software Engineer)..."
        value={jobRole}
        onChange={(e) => setJobRole(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
      />
      <textarea
        className="widget-textarea"
        placeholder="Paste the full job description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
      <button className="widget-button" onClick={handleSubmit}>
        Submit Description
      </button>
    </div>
  );
};

export default JobDescriptionWidget;
