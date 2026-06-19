import React from 'react';

const WidgetRenderer = (props) => {
  // This component intelligently finds and renders any widget by name.
  // It receives the widget's name from the payload.
  const { payload, widgetRegistry } = props;
  
  // Look up the widget component in the chatbot's registry.
  const Widget = widgetRegistry.getWidget(payload.widgetName);
  
  // Render the found widget, passing down all necessary props.
  return <Widget {...props} />;
};

export default WidgetRenderer;
