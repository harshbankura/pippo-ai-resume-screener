// frontend/src/components/ConfirmJobWidget.jsx

import React from 'react';
import './WidgetStyles.css';

const ConfirmJobWidget = ({ actionProvider, payload }) => {
  const handleConfirm = (isCorrect) => {
    actionProvider.handleJobConfirmation(isCorrect, payload);
  };

  return (
    <div className="widget-container">
      <div className="widget-button-group">
        <button 
          className="widget-confirm-btn widget-confirm-yes"
          onClick={() => handleConfirm(true)}
        >
          ✅ Yes, Looks Good
        </button>
        <button 
          className="widget-confirm-btn widget-confirm-no"
          onClick={() => handleConfirm(false)}
        >
          ❌ No, Let Me Edit
        </button>
      </div>
    </div>
  );
};

export default ConfirmJobWidget;
