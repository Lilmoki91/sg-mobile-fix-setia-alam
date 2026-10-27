// ==================== ELIZA AI + AI CHATBOT (GABUNGAN) ====================
"use strict";

// ==========================================
// 🔐 1. KONFIGURASI IPFS & MODEL AI
// ==========================================
const ELIZA_CONFIG = {
    apiKeyCid: "QmWrpDR5vvquNBHv7mWNJK3tLK47E4jZvZ3e6o2a8qV7DC",
    aesKeyCid: "QmPxbi8UGcuZBf3Anon2fBG5ZKzZDWfvWTeNGnxWCrGWdS",
    gateways: [
        "https://gateway.pinata.cloud/ipfs/",
        "https://ipfs.io/ipfs/",
        "https://cloudflare-ipfs.com/ipfs/",
        "https://dweb.link/ipfs/"
    ],
    primaryModel: "gemini-flash-lite-latest",
    fallbackModel: "gemma-4-26b-a4b-it"
};

let API_KEY = null;
let apiKeyLoaded = false;
let initError = null;
let personaData = null;
let promptData = null;

// ==========================================
// 📦 2. FUNGSI SOKONGAN AI (DARI CHAT.JS)
// ==========================================
async function loadLocalJSON() {
    try {
        // NOTA: Jika fail JSON berada di luar folder js, tukar kepada '../persona-eliza-ai.json'
        const [personaRes, promptRes] = await Promise.all([
            fetch('/persona-eliza-ai.json'),
            fetch('/prompt-eliza-ai.json')
        ]);
        if (!personaRes.ok || !promptRes.ok) {
            throw new Error("Fail JSON (persona/prompt) tak jumpa di folder utama.");
        }
        personaData = await personaRes.json();
        promptData = await promptRes.json();
    } catch (error) {
        throw new Error(`Gagal load JSON: ${error.message}`);
    }
}

async function decryptAESGCM(combined, keyBase64) {
    const keyBuffer = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-GCM' }, false, ['decrypt']);
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);
    return await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedData);
}

async function fetchFromIPFS(cid) {
    for (let i = 0; i < ELIZA_CONFIG.gateways.length; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(ELIZA_CONFIG.gateways[i] + cid, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return new Uint8Array(await response.arrayBuffer());
        } catch (error) {
            continue;
        }
    }
    throw new Error('Semua gateway IPFS gagal (Check internet)');
}

async function getApiKeyFromIPFS() {
    const aesDataRaw = await fetchFromIPFS(ELIZA_CONFIG.aesKeyCid);
    const aesKey = JSON.parse(new TextDecoder().decode(aesDataRaw)).aes_key;
    const encryptedData = await fetchFromIPFS(ELIZA_CONFIG.apiKeyCid);
    const decryptedData = await decryptAESGCM(encryptedData, aesKey);
    return JSON.parse(new TextDecoder().decode(decryptedData)).API_KEY;
}

const FIREBASE_PROJECT_ID = "sgmfix-services";
const FIREBASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/services`;
const BOOKING_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/bookings`;

async function getServicesFromFirebase() {
    try {
        const response = await fetch(FIREBASE_URL);
        const data = await response.json();
        return data.documents ? data.documents.map(doc => doc.fields) : [];
    } catch (error) { return []; }
}

async function getBookingsFromFirebase() {
    try {
        const response = await fetch(BOOKING_URL);
        const data = await response.json();
        return data.documents ? data.documents.slice(0, 10).map(doc => doc.fields) : [];
    } catch (error) { return []; }
}

function buildSystemPrompt(services, bookings, lang = 'ms') {
    const serviceList = services.map(s => `- ${s.titleMs?.stringValue || ""}: ${s.price?.stringValue || ""}`).join("\n");
    const bookingList = bookings.length > 0 ? bookings.map(b => `- Kod: ${b.code?.stringValue || ""}`).join("\n") : "Tiada.";
    const langInst = lang === "en" ? "Reply in English." : "Balas dalam Bahasa Melayu.";

    return `Anda adalah ${personaData?.name || "ELIZA"}. ${langInst}\nPeraturan:\n${promptData?.rules?.join("\n")}\nServis:\n${serviceList}\nTempahan:\n${bookingList}`.trim();
}

async function callGoogleAI(model, systemPrompt, userMessage, history, apiKey) {
    // 🔥 URL TANPA ?key= (Sebab guna Authorization Bearer untuk key AQ.)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    
    let contents = [];
    // Masukkan System Prompt sebagai mesej biasa (Paling selamat untuk Gemini & Gemma)
    contents.push({ role: "user", parts: [{ text: systemPrompt }] });
    contents.push({ role: "model", parts: [{ text: "Faham. Saya akan patuhi arahan ini." }] });

    history.forEach(msg => {
        if (msg.text) contents.push({ role: msg.role === "user" ? "user" : "model", parts: [{ text: msg.text }] });
    });
    
    contents.push({ role: "user", parts: [{ text: userMessage }] });

    const payload = {
        contents: contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 }
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}` // 🔥 WAJIB UNTUK KEY AQ.
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(25000)
        });

        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(`API Error (${res.status}): ${data.error?.message || JSON.stringify(data)}`);
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Google API pulangkan jawapan kosong.");
        
        return text;
        
    } catch (e) {
        throw e; 
    }
}

async function askAI(systemPrompt, userMessage, history) {
    if (!apiKeyLoaded || !API_KEY) throw new Error('API key belum sedia');
    
    try {
        return await callGoogleAI(ELIZA_CONFIG.primaryModel, systemPrompt, userMessage, history, API_KEY);
    } catch (errPrimary) {
        try {
            return await callGoogleAI(ELIZA_CONFIG.fallbackModel, systemPrompt, userMessage, history, API_KEY);
        } catch (errFallback) {
            throw new Error(`Primary: ${errPrimary.message} | Fallback: ${errFallback.message}`);
        }
    }
}

async function chatEliza(message, language = 'ms', history = []) {
    if (!apiKeyLoaded) throw new Error(initError || 'ELIZA AI belum sedia.');
    try {
        const services = await getServicesFromFirebase();
        const bookings = await getBookingsFromFirebase();
        const sysPrompt = buildSystemPrompt(services, bookings, language);
        return await askAI(sysPrompt, message, history);
    } catch (error) {
        return `❌ RALAT: ${error.message}`;
    }
}

async function initElizaAI() {
    try {
        await loadLocalJSON();
        API_KEY = await getApiKeyFromIPFS();
        apiKeyLoaded = true;
        console.log('✅ ELIZA AI sedia!');
        return true;
    } catch (error) {
        console.error('❌ Gagal init:', error.message);
        initError = error.message; 
        return false;
    }
}


// ==========================================
// 💬 3. FUNGSI UI CHATBOT (DARI AI-CHATBOT.JS)
// ==========================================
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

  if (!toggle || !windowElement || !messages || !input || !sendButton) return;

  if (windowElement.dataset.initialized === "true") return;
  windowElement.dataset.initialized = "true";

  let chatHistory = [];
  let lastResponse = "";
  let activeSpeech = null;
  let activeSpeakButton = null;
  let editingWrapper = null;

  // ==================== AUDIO ====================
  let audioCtx = null;
  const playTone = (type) => {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      const volume = 1.0;
      if (type === 'send') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'receive') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.15);
        const osc2 = audioCtx.createOscillator(); const gain2 = audioCtx.createGain();
        osc2.connect(gain2); gain2.connect(audioCtx.destination);
        osc2.type = 'triangle'; osc2.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.15);
        gain2.gain.setValueAtTime(volume, audioCtx.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc2.start(audioCtx.currentTime + 0.15); osc2.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  // ==================== TTS ====================
  const setSpeaking = (active) => {
    activeSpeakButton?.classList.toggle("is-speaking", active);
    activeSpeakButton?.setAttribute("aria-pressed", String(active));
    if (!active) activeSpeakButton = null;
  };
  const stopSpeaking = () => {
    if (activeSpeech) { activeSpeech = null; window.speechSynthesis?.cancel(); }
    setSpeaking(false);
  };
  const addSpeakButton = (wrapper) => {
    const bubble = wrapper.querySelector(".chatbot-bubble");
    if (!bubble || wrapper.querySelector(".chatbot-message-speak")) return;
    const button = document.createElement("button");
    button.type = "button"; button.className = "chatbot-message-speak"; button.setAttribute("aria-pressed", "false");
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></svg>`;
    button.disabled = !window.speechSynthesis || !window.SpeechSynthesisUtterance;
    button.addEventListener("click", () => {
      if (activeSpeakButton === button) { stopSpeaking(); return; }
      stopSpeaking();
      const text = bubble.textContent.trim().replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1').replace(/[*_#`~]/g, '').replace(/\s+/g, ' ').trim();
      if (!text) return;
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = document.documentElement.lang === "en" ? "en-US" : "ms-MY";
      speech.rate = 0.9;
      const finish = () => { if (activeSpeech !== speech) return; activeSpeech = null; setSpeaking(false); };
      speech.onend = finish; speech.onerror = finish; activeSpeech = speech; activeSpeakButton = button; setSpeaking(true);
      try { window.speechSynthesis.speak(speech); } catch (error) { finish(); }
    });
    (wrapper.querySelector(".chatbot-message-actions") || wrapper).appendChild(button);
  };

  // ==================== MESSAGE ACTIONS ====================
  const addMessageActions = (wrapper, question = "") => {
    const bubble = wrapper.querySelector(".chatbot-bubble");
    if (!bubble || wrapper.querySelector(".chatbot-message-actions")) return;
    const actions = document.createElement("div"); actions.className = "chatbot-message-actions"; wrapper.appendChild(actions);
    const status = document.createElement("span"); status.className = "chatbot-action-status"; status.setAttribute("role", "status");
    const createButton = (className, title, paths) => {
      const button = document.createElement("button");
      button.type = "button"; button.className = `chatbot-message-action ${className}`; button.title = title; button.setAttribute("aria-label", title);
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
      actions.appendChild(button); return button;
    };
    const copy = createButton("chatbot-message-copy", "Salin teks", '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>');
    let statusTimer;
    copy.addEventListener("click", async () => {
      copy.disabled = true; const text = bubble.textContent.trim();
      try { await navigator.clipboard.writeText(text); } catch {
        const field = document.createElement("textarea"); field.value = text; field.style.cssText = "position:fixed;left:-9999px;top:0;";
        windowElement.appendChild(field); field.select(); document.execCommand("copy"); field.remove();
      } finally { copy.disabled = false; }
      status.textContent = "Teks disalin!"; clearTimeout(statusTimer); statusTimer = setTimeout(() => { status.textContent = ""; }, 2500);
    });

    if (wrapper.classList.contains("chatbot-message--user")) {
      const edit = createButton("chatbot-message-edit", "Edit mesej", '<path d="m16 3 5 5M4 20l4-1L21 6a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/>');
      edit.addEventListener("click", () => {
        stopSpeaking(); editingWrapper?.querySelector(".chatbot-message-edit")?.setAttribute("aria-pressed", "false");
        editingWrapper = wrapper; edit.setAttribute("aria-pressed", "true"); input.value = bubble.textContent;
        resizeInput(); input.focus(); input.setSelectionRange(input.value.length, input.value.length);
      });
    } else {
      const resend = createButton("chatbot-message-resend", "Hantar semula", '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.6-2L20 8M4 16l2.3 3A7 7 0 0 0 17.9 17"/>');
      resend.addEventListener("click", () => { stopSpeaking(); if (question) { playTone('send'); addMessage(question, true); sendToAPI(question); } });
      addSpeakButton(wrapper);
    }
    actions.appendChild(status);
  };

  // ==================== UI ====================
  const updateChatBounds = () => {
    const viewport = window.visualViewport;
    const viewportTop = viewport?.offsetTop || 0;
    const viewportBottom = viewportTop + (viewport?.height || window.innerHeight);
    const bottomRect = document.querySelector(".mobile-bottom-nav")?.getBoundingClientRect();
    const bottom = bottomRect && bottomRect.height > 0 ? Math.min(viewportBottom, bottomRect.top) : viewportBottom;
    windowElement.style.setProperty("--chatbot-bottom", `${Math.max(0, window.innerHeight - bottom)}px`);
  };
  window.addEventListener("resize", updateChatBounds);
  window.visualViewport?.addEventListener("resize", updateChatBounds);

  const showChat = () => {
    document.body.classList.add("chatbot-open"); updateChatBounds();
    windowElement.inert = false; windowElement.setAttribute("aria-hidden", "false");
    windowElement.classList.add("visible"); toggle.setAttribute("aria-expanded", "true");
    messages.scrollTop = messages.scrollHeight;
  };
  const hideChat = (restoreFocus = true) => {
    if (!windowElement.classList.contains("visible")) return;
    stopSpeaking(); input.blur(); windowElement.classList.remove("visible"); windowElement.inert = true;
    document.body.classList.remove("chatbot-open"); toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) toggle.focus({ preventScroll: true });
  };
  const addMessage = (text, isUser, question = "") => {
    const wrapper = document.createElement("div"); wrapper.className = `chatbot-message chatbot-message--${isUser ? "user" : "assistant"}`;
    const bubble = document.createElement("div"); bubble.className = "chatbot-bubble";
    if (isUser) { bubble.textContent = text; } else {
      let formattedText = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-400 underline font-semibold">$1</a>')
        .replace(/(^|[^"'])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" class="text-blue-400 underline font-semibold break-all">$2</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
      bubble.innerHTML = formattedText;
    }
    wrapper.appendChild(bubble); addMessageActions(wrapper, question); messages.appendChild(wrapper); messages.scrollTop = messages.scrollHeight;
  };
  const showLoading = () => {
    const wrapper = document.createElement("div"); wrapper.id = "loading-bubble"; wrapper.className = "chatbot-message chatbot-message--assistant";
    const typingText = document.documentElement.lang === "en" ? "Eliza is typing..." : "Eliza sedang menaip...";
    const bubble = document.createElement("div"); bubble.className = "chatbot-bubble"; bubble.style.opacity = "0.7";
    bubble.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> ${typingText}`;
    wrapper.appendChild(bubble); messages.appendChild(wrapper); messages.scrollTop = messages.scrollHeight;
  };
  const removeLoading = () => { document.getElementById("loading-bubble")?.remove(); };
  const resizeInput = () => { input.style.height = "48px"; input.style.height = `${Math.min(144, Math.max(48, input.scrollHeight + 2))}px`; };
  input.addEventListener("input", resizeInput);

  // ==================== HANTAR KE AI ====================
  const sendToAPI = async (question) => {
    const lang = document.documentElement.lang || "ms";
    const wordCount = question.split(/\s+/).filter(Boolean).length;
    if (wordCount > 500) { addMessage("⚠️ Mesej terlalu panjang.", false); return; }

    showLoading(); sendButton.disabled = true;

    try {
      if (!apiKeyLoaded) {
        throw new Error(initError || "ELIZA AI belum sedia. Sila refresh.");
      }
      const reply = await chatEliza(question, lang, chatHistory);
      removeLoading(); lastResponse = reply; addMessage(lastResponse, false, question); playTone('receive');
      chatHistory.push({ role: "user", text: question }); chatHistory.push({ role: "model", text: reply });
      if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
    } catch (error) {
      console.error("Chat error:", error);
      removeLoading(); addMessage(error.message, false);
    } finally {
      removeLoading(); sendButton.disabled = false;
    }
  };

  // ==================== BUTANG SEND ====================
  const sendMessage = () => {
    const question = input.value.trim(); if (!question) return;
    playTone('send');
    if (editingWrapper) {
      const oldText = editingWrapper.querySelector(".chatbot-bubble").textContent;
      editingWrapper.querySelector(".chatbot-bubble").textContent = question;
      editingWrapper.querySelector(".chatbot-message-edit").setAttribute("aria-pressed", "false");
      const index = chatHistory.findIndex(h => h.role === "user" && h.text === oldText);
      if (index !== -1) chatHistory = chatHistory.slice(0, index); editingWrapper = null; sendToAPI(question);
    } else { addMessage(question, true); sendToAPI(question); }
    input.value = ""; resizeInput();
  };

  const resetChat = () => {
    stopSpeaking(); chatHistory = []; editingWrapper = null; messages.replaceChildren();
    input.value = ""; resizeInput(); input.focus({ preventScroll: true });
  };

  toggle.addEventListener("click", showChat);
  closeButton?.addEventListener("click", () => hideChat());
  resetButton?.addEventListener("click", resetChat);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && windowElement.classList.contains("visible")) { event.preventDefault(); hideChat(); } });
  document.querySelectorAll(".mobile-bottom-nav [data-nav]").forEach((link) => { link.addEventListener("click", () => hideChat(false)); });
  updateChatBounds();
  sendButton.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (event) => { if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && !event.isComposing) { event.preventDefault(); sendMessage(); } });
}

// ==========================================
// 🚀 4. AUTO MULA
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Hidupkan enjin AI (IPFS & API Key)
    await initElizaAI();
    
    // 2. Hidupkan UI Chatbot
    initChatbot();
});
