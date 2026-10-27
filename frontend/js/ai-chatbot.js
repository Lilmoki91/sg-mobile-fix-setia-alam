// ==================== ELIZA AI + AI CHATBOT (GABUNGAN FINAL) ====================
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
    primaryModel: "gemini-3.1-flash-lite",
    fallbackModel: "gemma-4-26b-a4b-it"
};

let API_KEY = null;
let apiKeyLoaded = false;
let initError = "Sedang memulakan...";
let personaData = null;
let promptData = null;

// ==========================================
// 📦 2. FUNGSI SOKONGAN AI
// ==========================================
async function loadLocalJSON() {
    try {
        // 🔥 PATH DARI PERSPEKTIF INDEX.HTML (Naik ke folder js/)
        // Tambah ?v=2 untuk paksa browser ambil fail baru (bypass cache)
        const [personaRes, promptRes] = await Promise.all([
            fetch('./js/persona-eliza-ai.json?v=2'),
            fetch('./js/prompt-eliza-ai.json?v=2')
        ]);

        // Semak sama ada ia betul-betul fail JSON (bukan page HTML 404)
        const contentType = personaRes.headers.get("content-type");
        if (!personaRes.ok || !promptRes.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error("Fail JSON tak jumpa (404). Pastikan path betul dan fail telah di-deploy.");
        }

        personaData = await personaRes.json();
        promptData = await promptRes.json();
        console.log('✅ JSON Persona & Prompt berjaya dimuatkan!');
        
    } catch (error) {
        console.error('❌ Gagal muat JSON:', error.message);
        throw error; // Lempar error untuk tunjuk di UI
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
    throw new Error('Semua gateway IPFS gagal');
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
        if (!data.documents || !Array.isArray(data.documents)) return [];
        return data.documents.map(doc => doc.fields).filter(s => s.active?.booleanValue !== false);
    } catch (error) { return []; }
}

async function getBookingsFromFirebase() {
    try {
        const response = await fetch(BOOKING_URL);
        const data = await response.json();
        if (!data.documents || !Array.isArray(data.documents)) return [];
        return data.documents.slice(0, 10).map(doc => doc.fields);
    } catch (error) { return []; }
}

// 🔥 KOD ASAL BOS DENGAN PERLINDUNGAN ARRAY & TARIK DATA KONTAK DARI JSON
function buildSystemPrompt(services, bookings, lang = 'ms') {
  const safeServices = Array.isArray(services) ? services : [];
  const safeBookings = Array.isArray(bookings) ? bookings : [];

  const serviceList = safeServices.map(s => `- ${s.titleMs?.stringValue || s.titleMs || ""} / ${s.titleEn?.stringValue || s.titleEn || ""}: ${s.price?.stringValue || s.price || ""}`).join("\n");
  
  const bookingList = safeBookings.length > 0 
    ? safeBookings.map(b => `- Kod: ${b.code?.stringValue || b.code || ""} | Nama: ${b.name?.stringValue || b.name || ""} | Status: ${b.status?.stringValue || b.status || ""}`).join("\n")
    : "Tiada tempahan terkini.";

  const languageInstruction = lang === "en" ? "You MUST reply in English." : "Anda MESTI membalas dalam Bahasa Melayu.";

  const now = new Date();
  const mytTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); 
  
  const daysBM = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
  const monthsBM = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];

  const dayName = daysBM[mytTime.getUTCDay()];
  const monthName = monthsBM[mytTime.getUTCMonth()];
  const date = mytTime.getUTCDate();
  const year = mytTime.getUTCFullYear();
  
  const hours24 = mytTime.getUTCHours();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12; 
  const minutes = mytTime.getUTCMinutes().toString().padStart(2, '0');
  
  const currentTime = `${dayName}, ${date} ${monthName} ${year}, ${hours12}:${minutes} ${ampm} (MYT)`;

  // Tarik data dari JSON (personaData)
  const kontak = personaData?.kontak || {};
  const infoKedai = `
📍 **MAKLUMAT KEDAI**:
- Lokasi: ${kontak.lokasi}
- Google Maps: [Klik di sini](${kontak.google_maps})
- Waze: [Klik di sini](${kontak.waze})
- WhatsApp: ${kontak.whatsapp}
- Link WhatsApp: [Klik untuk WhatsApp](${kontak.link_whatsapp})
- Waktu Operasi: ${kontak.waktu_operasi}
  `;

  return `
Anda adalah ${personaData.name}, ${personaData.role}.
Sifat anda: ${personaData.traits.join(", ")}.
Nada: ${personaData.tone}.
Latar belakang: ${personaData.background}.

${languageInstruction}

🔥 MAKLUMAT MASA SEMASA (PENTING):
Hari ini adalah: ${currentTime}

Peraturan Ketat:
${promptData.rules.map((rule, i) => `${i + 1}. ${rule}`).join("\n")}
6. JANGAN dedahkan senarai tempahan ini kepada pelanggan secara terus. Hanya jawab soalan JIKA nama atau kod tempahan yang ditanya SEPADAN dengan data di bawah. JANGAN dedahkan nombor telefon pelanggan lain.

${infoKedai}

Data Perkhidmatan Terkini:
${serviceList || "Tiada data."}

🔥 DATA TEMPAHAN TERKINI (PENTING):
${bookingList}

  `.trim();
}

async function callGoogleAI(model, systemPrompt, userMessage, history, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    let contents = [];
    history.forEach(msg => {
        if (msg.text && msg.text.trim() !== "") {
            contents.push({ role: msg.role === "user" ? "user" : "model", parts: [{ text: msg.text.trim() }] });
        }
    });

    if (userMessage && userMessage.trim() !== "") {
        contents.push({ role: "user", parts: [{ text: userMessage.trim() }] });
    }

    const finalContents = [];
    for (const item of contents) {
        if (finalContents.length === 0) {
            if (item.role === "user") finalContents.push(item);
        } else {
            const prev = finalContents[finalContents.length - 1];
            if (prev.role === item.role) {
                prev.parts[0].text += "\n" + item.parts[0].text;
            } else {
                finalContents.push(item);
            }
        }
    }

    if (finalContents.length === 0) {
        finalContents.push({ role: "user", parts: [{ text: userMessage || "Hello" }] });
    }

    const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: finalContents,
        generationConfig: { temperature: 0.4, topP: 0.9, topK: 30, maxOutputTokens: 1024 }
    };

    const MAX_RETRIES = 2;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(25000)
            });

            const data = await res.json();
            
            if (!res.ok) {
                console.error(`API Reject [${model}] [${res.status}]:`, data);
                if ([400, 401, 403].includes(res.status)) return `API Error ${res.status}: ${data.error?.message || "Invalid Key"}`; 
                if (attempt < MAX_RETRIES) { await new Promise(r => setTimeout(r, 1000)); continue; }
                return null;
            }

            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                if (attempt < MAX_RETRIES) { await new Promise(r => setTimeout(r, 1000)); continue; }
                return null;
            }
            return text;
        } catch (e) {
            if (attempt === MAX_RETRIES) return null;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    return null;
}

async function askAI(systemPrompt, userMessage, history) {
    if (!apiKeyLoaded || !API_KEY) throw new Error('API key belum sedia');
    
    let text = await callGoogleAI(ELIZA_CONFIG.primaryModel, systemPrompt, userMessage, history, API_KEY);
    if (text) return text;

    text = await callGoogleAI(ELIZA_CONFIG.fallbackModel, systemPrompt, userMessage, history, API_KEY);
    if (text) return text;

    return "Maaf, sistem saya sedang sibuk. Sila WhatsApp 012-262 6434.";
}

async function initElizaAI() {
    try {
        await loadLocalJSON(); 
        API_KEY = await getApiKeyFromIPFS();
        apiKeyLoaded = true;
        initError = "";
        console.log('✅ ELIZA AI sedia!');
        return true;
    } catch (error) {
        console.error('❌ Gagal init:', error);
        initError = `Gagal buka sistem: ${error.message}`;
        return false;
    }
}

async function chatEliza(message, language = 'ms', history = []) {
    if (!apiKeyLoaded) throw new Error(initError || 'ELIZA AI belum sedia.');
    const services = await getServicesFromFirebase();
    const bookings = await getBookingsFromFirebase();
    const sysPrompt = buildSystemPrompt(services, bookings, language);
    return await askAI(sysPrompt, message, history);
}

// ==========================================
// 💬 3. FUNGSI UI CHATBOT
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

  const setSpeaking = (active) => {
    activeSpeakButton?.classList.toggle("is-speaking", active);
    activeSpeakButton?.setAttribute("aria-pressed", String(active));
    if (!active) activeSpeakButton = null;
  };
  const stopSpeaking = () => {
    if (activeSpeech) { activeSpeech = null; window.speechSynthesis?.cancel(); }
    setSpeaking(false);
  };

// ==========================================
// TTS SKIP SEBUT EMOJI ICON 

  const addSpeakButton = (wrapper) => {
  const bubble = wrapper.querySelector(".chatbot-bubble");
  if (!bubble || wrapper.querySelector(".chatbot-message-speak")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "chatbot-message-speak";
  button.setAttribute("aria-pressed", "false");
  
  button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></svg>`;
  button.disabled = !window.speechSynthesis || !window.SpeechSynthesisUtterance;
  
  button.addEventListener("click", () => {
    if (activeSpeakButton === button) {
      stopSpeaking();
      return;
    }
    stopSpeaking();
    
    const text = bubble.textContent.trim()
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1') // Tukar markdown link ke teks
      // 🔥 KUNCI UTAMA: HANYA KEKALKAN HURUF (A-Z), NOMBOR (0-9), RUANG, & TANDA BACA ASAS. BUANG SEMUA EMOJI & SIMBOL.
      .replace(/[^\p{L}\p{N}\s.,!?;:\-\(\)]/gu, '')
      .replace(/\s+/g, ' ').trim();
      
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
    }
  });
  (wrapper.querySelector(".chatbot-message-actions") || wrapper).appendChild(button);
};

// ==========================================

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

  const sendToAPI = async (question) => {
    const lang = document.documentElement.lang || "ms";
    if (question.split(/\s+/).filter(Boolean).length > 500) { addMessage("⚠️ Mesej terlalu panjang.", false); return; }

    showLoading(); sendButton.disabled = true;

    try {
      if (!apiKeyLoaded) throw new Error(initError || "ELIZA AI belum sedia.");
      
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

document.addEventListener("DOMContentLoaded", async () => {
    await initElizaAI();
    initChatbot();
});
