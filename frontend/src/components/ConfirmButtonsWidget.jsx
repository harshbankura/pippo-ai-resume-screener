import React from 'react';
import './WidgetStyles.css';

const ConfirmButtonsWidget = (props) => {
  const { actionProvider } = props;

  const handleConfirm = () => {
    actionProvider.promptForResumes(); 
  };

  const handleEdit = () => {
    actionProvider.promptForJobDescription(); 
  };

  return (
    <div className="widget-container widget-inline-buttons">
      <button className="widget-button-inline-confirm" onClick={handleConfirm}>
        Yes, Correct
      </button>
      <button className="widget-button-inline-edit" onClick={handleEdit}>
        No, Edit
      </button>
    </div>
  );
};

export default ConfirmButtonsWidget;
