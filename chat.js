document.addEventListener("DOMContentLoaded", function() {
  loadChatHistory();
  const chatHistory = document.getElementById("chat-history");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  function addMessageToChat(message, sender) {
    const messageElement = document.createElement("div");
    const date = new Date();
    const timestamp = date.toLocaleTimeString();
    messageElement.textContent = `${timestamp} ${sender}: ${message}`;
    chatHistory.appendChild(messageElement);
    updateScroll();
    saveChatHistory();
}  
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

function processUserInput() {
  const userMessage = sanitizeInput(userInput.value.trim());
  if (userMessage !== "") {
      addMessageToChat(userMessage, "User");
      respondToUserMessage(userMessage);
      userInput.value = "";
  }
}

  function updateScroll(){
    var chatHistory = document.getElementById("chat-history");
    chatHistory.scrollTop = chatHistory.scrollHeight;
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
    addTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator();
        addMessageToChat(response, "Chat AI");
    }, 500);
  }
  function addTypingIndicator() {
    const typingIndicator = document.createElement("div");
    typingIndicator.textContent = "Chat AI is typing...";
    typingIndicator.id = "typing-indicator";
    chatHistory.appendChild(typingIndicator);
    updateScroll();
}
function removeTypingIndicator() {
  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
      chatHistory.removeChild(typingIndicator);
  }
}

function loadChatHistory() {
  const history = localStorage.getItem("chatHistory");
  if (history) {
      chatHistory.innerHTML = history;
  }
}

function saveChatHistory() {
  localStorage.setItem("chatHistory", chatHistory.innerHTML);
}
  sendButton.addEventListener("click", processUserInput);
  userInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      processUserInput();
    }
  });
});