import React from 'react';
import './WidgetStyles.css';

const StartButtonsWidget = (props) => {
  return (
    // This container applies the specific 57px indentation rule.
    <div className="indented-widget-container">
      <button 
        className="widget-button-inline" 
        onClick={props.actionProvider.promptForJobDescription}
      >
        Let's Begin
      </button>
    </div>
  );
};

export default StartButtonsWidget;
