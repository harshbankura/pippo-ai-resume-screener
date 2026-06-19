import React from 'react';
import './WidgetStyles.css';

const ResultsWidget = (props) => {
  const handleViewResults = () => {
    props.actionProvider.handleViewResults();
  };

  return (
    <div className="indented-widget-container">
      <button className="widget-button-inline" onClick={handleViewResults}>
        View Results
      </button>
    </div>
  );
};

export default ResultsWidget;
