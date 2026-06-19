class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message) {
    // This check for empty messages is all we need for now.
    if (!message.trim()) {
      return;
    }
    // Any other text input can be logged for future development.
    console.log('User message:', message);
  }
}

export default MessageParser;
