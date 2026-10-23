// ==================== AI CHATBOT ====================
"use strict";

async function initChatbot() {
  const container = document.getElementById("ai-chatbot-container");
  if (container && !document.getElementById("chatbot-toggle")) {
    if (container.dataset.loading === "true") return;
    container.dataset.loading = "true";

    try {
      const response = await fetch("ai-chatbot.html");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      container.innerHTML = await response.text();

      const lang = document.documentElement.lang || "ms";
      const translation = window.translations?.[lang] || window.translations?.ms;
      if (translation) {
        container.querySelectorAll("[data-i18n-key]").forEach((element) => {
          const text = translation[element.dataset.i18nKey];
          if (text) element.innerHTML = text;
        });
        container.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
          const text = translation[element.dataset.i18nPlaceholder];
          if (text) element.placeholder = text;
        });
      }
    } catch (error) {
      console.error("Gagal memuatkan AI chatbot:", error);
      return;
    } finally {
      delete container.dataset.loading;
    }
  }

  const toggle = document.getElementById("chatbot-toggle");
  const windowElement = document.getElementById("chatbot-window");
  const closeButton = document.getElementById("chatbot-close");
  const messages = document.getElementById("chatbot-messages");
  const input = document.getElementById("chatbot-input");
  const sendButton = document.getElementById("chatbot-send");
  const speakButton = document.getElementById("chatbot-speak");

  if (!toggle || !windowElement || !messages || !input || !sendButton) return;

  let lastResponse = "";

  // 🔥 URL CLOUDFLARE WORKER KAU
  const WORKER_URL = "https://eliza-ai-backend.taihaulengcai.workers.dev/chat";

  const showChat = () => {
    windowElement.classList.remove("opacity-0", "translate-y-5", "invisible");
    windowElement.classList.add("opacity-100", "translate-y-0", "visible");
  };

  const hideChat = () => {
    windowElement.classList.remove("opacity-100", "translate-y-0", "visible");
    windowElement.classList.add("opacity-0", "translate-y-5", "invisible");
  };

  const addMessage = (text, isUser) => {
    const wrapper = document.createElement("div");
    wrapper.className = isUser ? "flex justify-end" : "flex justify-start";

    const bubble = document.createElement("div");
    bubble.className = isUser
      ? "bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-xs shadow text-sm"
      : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs shadow text-sm";

    bubble.textContent = text;
    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  };

  // Fungsi tunjuk animasi menaip
  const showLoading = () => {
    const wrapper = document.createElement("div");
    wrapper.id = "loading-bubble";
    wrapper.className = "flex justify-start";
    wrapper.innerHTML = `
      <div class="bg-gray-100 text-gray-500 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs shadow text-sm italic flex items-center gap-2">
        <i class="fas fa-circle-notch fa-spin"></i> Eliza sedang menaip...
      </div>
    `;
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  };

  // Fungsi buang animasi menaip
  const removeLoading = () => {
    const loader = document.getElementById("loading-bubble");
    if (loader) loader.remove();
  };

  // 🔥 Fungsi hantar mesej ke Cloudflare Worker
  const sendMessage = async () => {
    const question = input.value.trim();
    if (!question) return;

    // 1. Papar mesej user
    addMessage(question, true);
    input.value = "";

    // 2. Papar animasi loading & matikan butang sementara
    showLoading();
    sendButton.disabled = true;

    try {
      const lang = document.documentElement.lang || "ms";

      // 3. Hantar ke Backend Eliza AI
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: question,
          language: lang 
        })
      });

      const data = await response.json();
      removeLoading();

      // 4. Papar jawapan
      if (data.reply) {
        lastResponse = data.reply;
        addMessage(lastResponse, false);
      } else {
        throw new Error("Tiada jawapan dari AI");
      }

    } catch (error) {
      removeLoading();
      console.error("Chat error:", error);
      const errorMsg = document.documentElement.lang === "en" 
        ? "Sorry, my system is busy right now. Please try again later." 
        : "Maaf, sistem saya sibuk sekarang. Sila cuba sebentar lagi.";
      addMessage(errorMsg, false);
    } finally {
      // 5. Hidupkan semula butang hantar
      sendButton.disabled = false;
    }
  };

  toggle.addEventListener("click", () => {
    windowElement.classList.contains("opacity-100") ? hideChat() : showChat();
  });

  closeButton?.addEventListener("click", hideChat);
  sendButton.addEventListener("click", sendMessage);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

  speakButton?.addEventListener("click", () => {
    if (!lastResponse || !window.speechSynthesis) return;

    const speech = new SpeechSynthesisUtterance(lastResponse);
    const lang = document.documentElement.lang || "ms";
    speech.lang = lang === "en" ? "en-US" : "ms-MY";
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
  });
}
