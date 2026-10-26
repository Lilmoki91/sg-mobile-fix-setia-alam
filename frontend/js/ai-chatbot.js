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
  const resetButton = document.getElementById("chatbot-reset");
  
  const API_ENDPOINT = "/api/chat";

  if (!toggle || !windowElement || !messages || !input || !sendButton) return;

  if (windowElement.dataset.initialized === "true") return;
  windowElement.dataset.initialized = "true";

  // 🧠 MEMORI & STATE
  let chatHistory = [];
  let lastResponse = "";
  let activeSpeech = null;
  let activeSpeakButton = null;
  let editingWrapper = null;
  let activeFetchController = null; // Untuk abort fetch kalau user hantar mesej baru

  // ==================== TTS (TEXT-TO-SPEECH) ====================
  const setSpeaking = (active) => {
    activeSpeakButton?.classList.toggle("is-speaking", active);
    activeSpeakButton?.setAttribute("aria-pressed", String(active));
    if (!active) activeSpeakButton = null;
  };

  const stopSpeaking = () => {
    if (activeSpeech) {
      activeSpeech = null;
      window.speechSynthesis?.cancel();
    }
    setSpeaking(false);
  };

  const addSpeakButton = (wrapper) => {
    const bubble = wrapper.querySelector(".chatbot-bubble");
    if (!bubble || wrapper.querySelector(".chatbot-message-speak")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "chatbot-message-speak";
    button.setAttribute("aria-pressed", "false");
    const updateLabel = () => {
      const label = document.documentElement.lang === "en"
        ? "Read this message / Stop reading"
        : "Baca mesej ini / Hentikan bacaan";
      button.setAttribute("aria-label", label);
      button.title = label;
    };
    updateLabel();
    button.addEventListener("focus", updateLabel);
    button.addEventListener("mouseenter", updateLabel);
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M11 5L6 9H3v6h3l5 4V5Z"/>
      <path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>
    </svg>`;
    button.disabled = !window.speechSynthesis || !window.SpeechSynthesisUtterance;
    
    button.addEventListener("click", () => {
      if (activeSpeakButton === button) {
        stopSpeaking();
        return;
      }
      stopSpeaking();
      // Bersihkan emoji sebelum baca
      const text = bubble.textContent.trim()
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/[*_#`~]/g, '').replace(/\s+/g, ' ').trim();
        
      if (!text) return;
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = document.documentElement.lang === "en" ? "en-US" : "ms-MY";
      speech.rate = 0.9;
      const finish = () => {
        if (activeSpeech !== speech) return;
        activeSpeech = null;
        setSpeaking(false);
      };
      speech.onend = finish;
      speech.onerror = finish;
      activeSpeech = speech;
      activeSpeakButton = button;
      setSpeaking(true);
      try {
        window.speechSynthesis.speak(speech);
      } catch (error) {
        finish();
        console.error("Gagal membaca mesej:", error);
      }
    });
    (wrapper.querySelector(".chatbot-message-actions") || wrapper).appendChild(button);
  };

  // ==================== MESSAGE ACTIONS (COPY, EDIT, RESEND) ====================
  const addMessageActions = (wrapper, question = "") => {
    const bubble = wrapper.querySelector(".chatbot-bubble");
    if (!bubble || wrapper.querySelector(".chatbot-message-actions")) return;
    const actions = document.createElement("div");
    actions.className = "chatbot-message-actions";
    wrapper.appendChild(actions);

    const status = document.createElement("span");
    status.className = "chatbot-action-status";
    status.setAttribute("role", "status");
    const label = (ms, en) => document.documentElement.lang === "en" ? en : ms;
    
    const createButton = (className, ms, en, paths) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `chatbot-message-action ${className}`;
      button.dataset.labelMs = ms;
      button.dataset.labelEn = en;
      const updateLabel = () => {
        button.title = label(ms, en);
        button.setAttribute("aria-label", button.title);
      };
      updateLabel();
      button.addEventListener("focus", updateLabel);
      button.addEventListener("mouseenter", updateLabel);
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
      actions.appendChild(button);
      return button;
    };

    // 1. BUTANG COPY
    const copy = createButton("chatbot-message-copy", "Salin teks", "Copy text",
      '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>');
    let statusTimer;
    copy.addEventListener("click", async () => {
      copy.disabled = true;
      let copied = false;
      const text = bubble.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        const previousFocus = document.activeElement;
        const field = document.createElement("textarea");
        field.value = text;
        field.style.cssText = "position:fixed;left:-9999px;top:0;";
        windowElement.appendChild(field);
        field.select();
        try { copied = document.execCommand("copy"); } catch { copied = false; }
        field.remove();
        previousFocus?.focus({ preventScroll: true });
      } finally {
        copy.disabled = false;
      }
      status.textContent = copied ? label("Teks disalin", "Text copied") : label("Gagal menyalin", "Could not copy");
      clearTimeout(statusTimer);
      statusTimer = setTimeout(() => { status.textContent = ""; }, 2500);
    });

    // 2. BUTANG EDIT (Hanya untuk User)
    if (wrapper.classList.contains("chatbot-message--user")) {
      const edit = createButton("chatbot-message-edit", "Edit mesej", "Edit message",
        '<path d="m16 3 5 5M4 20l4-1L21 6a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/>');
      edit.addEventListener("click", () => {
        stopSpeaking();
        editingWrapper?.querySelector(".chatbot-message-edit")?.setAttribute("aria-pressed", "false");
        editingWrapper = wrapper;
        edit.setAttribute("aria-pressed", "true");
        input.value = bubble.textContent;
        resizeInput();
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      });
      edit.setAttribute("aria-pressed", "false");
    } else {
      // 3. BUTANG RESEND (Hanya untuk Assistant)
      const resend = createButton("chatbot-message-resend", "Hantar semula", "Resend",
        '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.6-2L20 8M4 16l2.3 3A7 7 0 0 0 17.9 17"/>');
      resend.addEventListener("click", () => {
        stopSpeaking();
        if (question) sendQuestion(question);
      });
      addSpeakButton(wrapper);
    }
    actions.appendChild(status);
  };

  // ==================== UI & RESIZE ====================
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
    stopSpeaking();
    input.blur();
    windowElement.classList.remove("visible");
    windowElement.inert = true;
    windowElement.setAttribute("aria-hidden", "true");
    document.body.classList.remove("chatbot-open");
    toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) toggle.focus({ preventScroll: true });
  };

  // ==================== ADD MESSAGE (MARKDOWN PARSER) ====================
  const addMessage = (text, isUser, question = "") => {
    const wrapper = document.createElement("div");
    wrapper.className = `chatbot-message chatbot-message--${isUser ? "user" : "assistant"}`;

    const bubble = document.createElement("div");
    bubble.className = "chatbot-bubble";

    if (isUser) {
      bubble.textContent = text;
    } else {
      // Markdown parser
      let formattedText = text
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300 font-semibold">$1</a>')
        .replace(/(^|[^"'])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300 font-semibold break-all">$2</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
      bubble.innerHTML = formattedText;
    }
    
    wrapper.appendChild(bubble);
    addMessageActions(wrapper, question);
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  };

  // ==================== LOADING ====================
  const showLoading = () => {
    const wrapper = document.createElement("div");
    wrapper.id = "loading-bubble";
    wrapper.className = "chatbot-message chatbot-message--assistant";
    
    const lang = document.documentElement.lang || "ms";
    const typingText = lang === "en" ? "Eliza is typing..." : "Eliza sedang menaip...";

    const bubble = document.createElement("div");
    bubble.className = "chatbot-bubble";
    bubble.style.opacity = "0.7";
    bubble.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> ${typingText}`;
    
    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  };

  const removeLoading = () => {
    const loader = document.getElementById("loading-bubble");
    if (loader) loader.remove();
  };

  const resizeInput = () => {
    input.style.height = "48px";
    input.style.height = `${Math.min(144, Math.max(48, input.scrollHeight + 2))}px`;
  };
  input.addEventListener("input", resizeInput);

  // ==================== SEND MESSAGE (API FETCH) ====================
  const sendMessage = async () => {
    const question = input.value.trim();
    if (!question) return;

    const lang = document.documentElement.lang || "ms";

    // 🛡️ KESELAMATAN
    const wordCount = question.split(/\s+/).filter(Boolean).length;
    const lineCount = question.split('\n').length;

    if (wordCount > 500 || lineCount > 20) {
      const warnMsg = lang === "en" 
        ? "⚠️ Your message is too long. Please limit to 500 words or 20 lines only."
        : "⚠️ Mesej anda terlalu panjang. Sila hadkan kepada 500 perkataan atau 20 baris sahaja.";
      addMessage(warnMsg, false);
      return;
    }

    // Jika sedang edit mesej lama
    if (editingWrapper) {
      const oldText = editingWrapper.querySelector(".chatbot-bubble").textContent;
      editingWrapper.querySelector(".chatbot-bubble").textContent = question;
      editingWrapper.querySelector(".chatbot-message-edit").setAttribute("aria-pressed", "false");
      
      // Kemaskini history (buang mesej lama, ganti dengan baru)
      const index = chatHistory.findIndex(h => h.role === "user" && h.text === oldText);
      if (index !== -1) chatHistory = chatHistory.slice(0, index); 
      
      editingWrapper = null;
    } else {
      // Jika mesej baru
      addMessage(question, true);
    }

    input.value = "";
    resizeInput();
    
    showLoading();
    sendButton.disabled = true;

    if (activeFetchController) activeFetchController.abort();
    activeFetchController = new AbortController();
    const timeoutId = setTimeout(() => activeFetchController.abort(), 20000);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: question,
          language: lang,
          history: chatHistory 
        }),
        signal: activeFetchController.signal
      });

      if (!response.ok) throw new Error(`Server Error: ${response.status}`);
      const data = await response.json();

      if (data.reply) {
        lastResponse = data.reply;
        addMessage(lastResponse, false, question); // Hantar 'question' untuk fungsi Resend
        
        // Simpan dalam memori
        chatHistory.push({ role: "user", text: question });
        chatHistory.push({ role: "model", text: data.reply });
        if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
      } else {
        throw new Error("Tiada jawapan dari AI");
      }

    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg = lang === "en" 
        ? "Sorry, my system is busy right now. Please try again later." 
        : "Maaf, sistem saya sibuk sekarang. Sila cuba sebentar lagi.";
      addMessage(errorMsg, false);
    } finally {
      clearTimeout(timeoutId);
      removeLoading();
      sendButton.disabled = false;
      activeFetchController = null;
    }
  };

  // ==================== RESET CHAT ====================
  const resetChat = () => {
    stopSpeaking();
    if (activeFetchController) activeFetchController.abort();
    chatHistory = [];
    editingWrapper = null;
    messages.replaceChildren();
    input.value = "";
    resizeInput();
    input.focus({ preventScroll: true });
  };

  // Event Listeners
  toggle.addEventListener("click", showChat);
  closeButton?.addEventListener("click", () => hideChat());
  resetButton?.addEventListener("click", resetChat); // Butang Reset
  
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
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      sendMessage();
    }
  });

}
