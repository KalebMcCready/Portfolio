document.addEventListener("DOMContentLoaded", function() {
  const chatHistory = document.getElementById("chat-history");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  function addMessageToChat(message, sender) {
    const messageElement = document.createElement("div");
    messageElement.textContent = `${sender}: ${message}`;
    chatHistory.appendChild(messageElement);
  }

  function processUserInput() {
    const userMessage = userInput.value.trim();
    if (userMessage !== "") {
      addMessageToChat(userMessage, "User");
      respondToUserMessage(userMessage);
      userInput.value = "";
    }
  }

  function respondToUserMessage(message) {
    let response;
    // Example responses based on user input
    switch (message.toLowerCase()) {
      case "hi":
      case "hello":
        response = "Hello there!";
        break;
      case "how are you?":
        response = "I'm just a chatbot, but thanks for asking!";
        break;
      case "who is Kaleb McCready?":
        response = "Kaleb McCready is a talented individual with skills in various areas.";
        break;
      // Add more responses as needed
      default:
        response = "I'm sorry, I don't understand that, but you know who would? Kaleb McCready!";
    }
    setTimeout(() => addMessageToChat(response, "Chat AI"), 500); // Simulate typing delay
  }

  sendButton.addEventListener("click", processUserInput);
  userInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      processUserInput();
    }
  });
});