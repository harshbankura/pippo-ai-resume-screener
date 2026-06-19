import React, { useState, useEffect } from 'react';
import './AnonymizationToggle.css';

const AnonymizationToggle = ({ isAnonymized, onToggle }) => {
  const [isToggled, setIsToggled] = useState(isAnonymized);

  useEffect(() => {
    setIsToggled(isAnonymized);
  }, [isAnonymized]);

  const handleToggle = () => {
    const newState = !isToggled;
    setIsToggled(newState);
    onToggle(newState);
    
    // Store preference in localStorage
    localStorage.setItem('anonymizationEnabled', newState.toString());
  };

  return (
    <div className="anonymization-toggle-container">
      <div className="toggle-label-group">
        <i className="fi fi-rr-eye-crossed toggle-icon"></i>
        <span className="toggle-label">Anonymize Data</span>
      </div>
      
      <div className="toggle-switch-container">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={isToggled}
            onChange={handleToggle}
            className="toggle-input"
          />
          <span className="toggle-slider">
            <span className="toggle-thumb"></span>
          </span>
        </label>
        <span className="toggle-status">
          {isToggled ? 'ON' : 'OFF'}
        </span>
      </div>
    </div>
  );
};

export default AnonymizationToggle;
