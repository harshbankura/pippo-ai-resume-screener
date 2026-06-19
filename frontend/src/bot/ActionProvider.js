class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.jobDescription = ''; // Store job description here
    this.jobRole = ''; // Store job role here
  }

  promptForJobDescription = () => {
    this.setState((prevState) => ({
      ...prevState,
      messages: [
        ...prevState.messages.filter((msg) => msg.widget !== 'startButtonsWidget'),
        this.createChatBotMessage(
          "Please enter the job title and paste the job description you're hiring for below.",
          { widget: 'jobDescriptionWidget' }
        ),
      ],
    }));
  };

  handleJobDescription = (jobRole, jdText) => {
    // Store the job role and description for later use
    this.jobRole = jobRole || 'Unassigned';
    this.jobDescription = jdText;
    
    this.setState((prevState) => ({
      ...prevState,
      currentJobRole: jobRole || 'Unassigned',
      currentJobDescription: jdText,
      messages: [
        ...prevState.messages.filter((msg) => msg.widget !== 'jobDescriptionWidget'),
        this.createChatBotMessage(
          `Thank you. I have received the details for the "${this.jobRole}" role. Shall we proceed to the resume upload?`,
          { widget: 'confirmButtonsWidget' }
        ),
      ],
    }));
  };

  promptForResumes = () => {
    this.setState((prevState) => ({
      ...prevState,
      messages: [
        ...prevState.messages.filter((msg) => msg.widget !== 'confirmButtonsWidget'),
        this.createChatBotMessage(
          `Great! Now, please provide the resumes for the ${prevState.currentJobRole} role analysis.`,
          { 
            widget: 'resumeUploadWidget',
            payload: { jobDescription: prevState.currentJobDescription, jobRole: prevState.currentJobRole },
            widgetProps: { jobDescription: prevState.currentJobDescription, jobRole: prevState.currentJobRole }
          }
        ),
      ],
    }));
  };

  handleResumeUpload = (files) => {
    this.setState((prevState) => ({
      ...prevState,
      messages: [
        ...prevState.messages.filter((msg) => msg.widget !== 'resumeUploadWidget'),
        this.createChatBotMessage(
          `Understood. Analyzing ${files.length} resume(s)...`
        ),
      ],
    }));

    setTimeout(() => {
      this.setState((prevState) => ({
        ...prevState,
        messages: [
          ...prevState.messages.slice(0, -1),
          this.createChatBotMessage(
            "Analysis complete! You can now view the ranked results on your dashboard.",
            { widget: 'resultsWidget' }
          ),
        ],
      }));
    }, 2500);
  };

  handleViewResults = () => {
    window.dispatchEvent(new CustomEvent('navigate-to-dashboard'));
  };
}

export default ActionProvider;
