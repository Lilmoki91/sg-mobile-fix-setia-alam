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

  if (windowElement.dataset.initialized === "true") return;
  windowElement.dataset.initialized = "true";

  let lastResponse = "";

  // 🔥 URL CLOUDFLARE WORKER KAU
  const WORKER_URL = "https://eliza-ai-backend.taihaulengcai.workers.dev/chat";

  // Measure the actual navigation bars, including safe-area padding.
  const topNav = document.querySelector("body > nav:not(.mobile-bottom-nav)");
  const bottomNav = document.querySelector(".mobile-bottom-nav");
  const updateChatBounds = () => {
    const viewport = window.visualViewport;
    const viewportTop = viewport?.offsetTop || 0;
    const viewportBottom = viewportTop + (viewport?.height || window.innerHeight);
    const top = Math.max(viewportTop, topNav?.getBoundingClientRect().bottom || 0);
    const bottomRect = bottomNav?.getBoundingClientRect();
    const bottom = bottomRect && bottomRect.height > 0
      ? Math.min(viewportBottom, bottomRect.top)
      : viewportBottom;
    windowElement.style.setProperty("--chatbot-top", `${top}px`);
    windowElement.style.setProperty("--chatbot-bottom", `${Math.max(0, window.innerHeight - bottom)}px`);
  };

  window.addEventListener("resize", updateChatBounds);
  window.visualViewport?.addEventListener("resize", updateChatBounds);
  window.visualViewport?.addEventListener("scroll", updateChatBounds);
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(updateChatBounds);
    if (topNav) observer.observe(topNav);
    if (bottomNav) observer.observe(bottomNav);
  }

  const showChat = () => {
    document.body.classList.add("chatbot-open");
    updateChatBounds();
    windowElement.inert = false;
    windowElement.setAttribute("aria-hidden", "false");
    windowElement.classList.add("visible");
    toggle.setAttribute("aria-expanded", "true");
    closeButton?.focus({ preventScroll: true });
    messages.scrollTop = messages.scrollHeight;
  };

  const hideChat = (restoreFocus = true) => {
    if (!windowElement.classList.contains("visible")) return;
    input.blur();
    windowElement.classList.remove("visible");
    windowElement.inert = true;
    windowElement.setAttribute("aria-hidden", "true");
    document.body.classList.remove("chatbot-open");
    toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) toggle.focus({ preventScroll: true });
  };

  const addMessage = (text, isUser) => {
    const wrapper = document.createElement("div");
    wrapper.className = `chatbot-message chatbot-message--${isUser ? "user" : "assistant"}`;

    const bubble = document.createElement("div");
    bubble.className = "chatbot-bubble";

    bubble.textContent = text;
    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  };

  // 🔥 Fungsi tunjuk animasi loading (Guna class CSS kau)
  const showLoading = () => {
    const wrapper = document.createElement("div");
    wrapper.id = "loading-bubble";
    wrapper.className = "chatbot-message chatbot-message--assistant";
    
    const bubble = document.createElement("div");
    bubble.className = "chatbot-bubble";
    bubble.style.opacity = "0.7"; // Optional: nampak sedikit pudar
    bubble.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Eliza sedang menaip...`;
    
    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  };

  // 🔥 Fungsi buang animasi loading
  const removeLoading = () => {
    const loader = document.getElementById("loading-bubble");
    if (loader) loader.remove();
  };

  const resizeInput = () => {
    input.style.height = "48px";
    input.style.height = `${Math.min(144, Math.max(48, input.scrollHeight + 2))}px`;
  };
  input.addEventListener("input", resizeInput);

  // 🔥 Fungsi Hantar Mesej ke Cloudflare Worker
  const sendMessage = async () => {
    const question = input.value.trim();
    if (!question) return;

    addMessage(question, true);
    input.value = "";
    resizeInput();
    
    showLoading();
    sendButton.disabled = true;

    try {
      const lang = document.documentElement.lang || "ms";

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
      sendButton.disabled = false;
    }
  };

  toggle.addEventListener("click", showChat);
  closeButton?.addEventListener("click", () => hideChat());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && windowElement.classList.contains("visible")) {
      event.preventDefault();
      hideChat();
    }
  });
  document.querySelectorAll(".mobile-bottom-nav [data-nav]").forEach((link) => {
    link.addEventListener("click", () => hideChat(false));
  });
  updateChatBounds();
  sendButton.addEventListener("click", sendMessage);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && !event.isComposing) {
      event.preventDefault();
      sendMessage();
    }
  });

  // 🔥 Fungsi TTS dengan pembersih emoji
  speakButton?.addEventListener("click", () => {
    if (!lastResponse || !window.speechSynthesis) return;

    const cleanText = lastResponse
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[*_#`~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const speech = new SpeechSynthesisUtterance(cleanText);
    const lang = document.documentElement.lang || "ms";
    speech.lang = lang === "en" ? "en-US" : "ms-MY";
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
  });
}
