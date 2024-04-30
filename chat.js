document.addEventListener("DOMContentLoaded", function() {
  const chatHistory = document.getElementById("chat-history");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");
  const fs = require('fs');
  let rawdata = fs.readFileSync('config.json');
  let config = JSON.parse(rawdata);
  const newsApiKey = config.newsApiKey;
  const axios = require('axios');

  async function fetchNews(keyword) {
    try {
      const response = await axios.get(`https://newsdata.io/api/1/news?apikey=${newsApiKey}&q=${keyword}`);
      return response.data.results.map(article => `${article.title}: ${article.link}`).join('\n');
    } catch (error) {
      console.error('Error fetching news:', error);
      return "Failed to retrieve news.";
    }
  }

 function addMessageToChat(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.className = 'message';
  messageElement.textContent = `${sender}: ${message}`;
  messageElement.classList.add(sender === 'User' ? 'user-message' : 'ai-message');
  chatHistory.appendChild(messageElement);
  updateScroll();
  saveChatHistory();
}

function scheduleMessage(command) {
  const parts = command.split(" ");
  const delay = parseInt(parts[1], 10);
  const message = parts.slice(2).join(" ");

  if (!isNaN(delay) && message) {
    addMessageToChat(`Scheduled message "${message}" to be sent in ${delay} seconds.`, "System");
    setTimeout(() => {
      addMessageToChat(message, "User");
      respondToUserMessage(message);
    }, delay * 1000);
  } else {
    addMessageToChat("Invalid schedule command. Use the format: /schedule [seconds] [message]", "System");
  }
}

  function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  function processUserInput() {
  const userMessage = userInput.value.trim();
  if (userMessage !== "") {
    if (userMessage.startsWith("/schedule")) {
      scheduleMessage(userMessage);
    } else {
      addMessageToChat(userMessage, "User");
      respondToUserMessage(userMessage);
    }
    userInput.value = "";
  }
}

  function updateScroll() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  function respondToUserMessage(message) {
    setTimeout(() => {
      addTypingIndicator();
      let response = generateResponse(message);
      setTimeout(() => {
          removeTypingIndicator();
          addMessageToChat(response, "Chat AI");
      }, 1000); // Simulate thinking delay
    }, 500); // Simulate typing delay
  }

  function generateResponse(input) {
    if (input.toLowerCase().startsWith("news about")) {
      const keyword = input.substring(11).trim();
      if (keyword) {
        return fetchNews(keyword);
      } else {
        return "Please specify a topic to get news about.";
      }
    }
  if (input.startsWith("/")) {
    switch (input) {
      case "/help":
        return "You can ask me anything! Try typing 'hello', 'how are you?', or 'what is your name?'.";
      default:
        return "Unknown command. Type '/help' for assistance.";
    }
  }
  const responses = {
    "hello": "Hello there! How can I assist you today?",
    "how are you?": "I'm just a chatbot, but I'm doing great, thanks!",
    "what is your name?": "I'm a friendly chatbot created to assist you.",
    "default": "Sorry, I didn't understand that. Can you try rephrasing?"
  };
  return responses[input.toLowerCase()] || responses["default"];
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

  loadChatHistory();
});
