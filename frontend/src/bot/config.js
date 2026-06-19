import { createChatBotMessage } from 'react-chatbot-kit';

// Import all your widgets
import StartButtonsWidget from '../components/StartButtonsWidget';
import JobDescriptionWidget from '../components/JobDescriptionWidget';
import ConfirmButtonsWidget from '../components/ConfirmButtonsWidget';
import ResumeUploadWidget from '../components/ResumeUploadWidget';
import ResultsWidget from '../components/ResultsWidget';

const botName = 'Pippo';

const config = {
  botName: botName,
  initialMessages: [
    createChatBotMessage("Hi, I am Pippo, a resume assistant. Shall we begin?", {
      widget: 'startButtonsWidget',
    })
  ],
  state: {
    currentJobRole: 'Unassigned',
    currentJobDescription: ''
  },
  // We only need to register the widgets. No customMessages needed for this.
  widgets: [
    { 
      widgetName: 'startButtonsWidget', 
      widgetFunc: (props) => <StartButtonsWidget {...props} /> 
    },
    { 
      widgetName: 'jobDescriptionWidget', 
      widgetFunc: (props) => <JobDescriptionWidget {...props} /> 
    },
    { 
      widgetName: 'confirmButtonsWidget', 
      widgetFunc: (props) => <ConfirmButtonsWidget {...props} /> 
    },
    { 
      widgetName: 'resumeUploadWidget', 
      widgetFunc: (props) => <ResumeUploadWidget {...props} /> 
    },
    { 
      widgetName: 'resultsWidget', 
      widgetFunc: (props) => <ResultsWidget {...props} /> 
    },
  ],
};

export default config;
