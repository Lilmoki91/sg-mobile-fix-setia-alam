
// ==================== AI CHATBOT ====================
"use strict";

function initChatbot() {
  const toggle = document.getElementById("chatbot-toggle");
  const windowElement = document.getElementById("chatbot-window");
  const closeButton = document.getElementById("chatbot-close");
  const messages = document.getElementById("chatbot-messages");
  const input = document.getElementById("chatbot-input");
  const sendButton = document.getElementById("chatbot-send");
  const speakButton = document.getElementById("chatbot-speak");

  if (!toggle || !windowElement || !messages || !input || !sendButton) return;

  let lastResponse = "";

  const responses = {
    ms: {
      harga: "Harga servis bermula daripada RM80 bergantung kepada model dan kerosakan.",
      tempoh: "Kebanyakan pembaikan boleh siap dalam masa 1 hingga 2 jam.",
      model: "Kami membaiki iPhone, Samsung, Xiaomi, Huawei, OPPO dan pelbagai model Android.",
      waktu: "Waktu operasi kami ialah setiap hari dari 10 pagi hingga 8 malam.",
      lokasi: "Kedai kami berada di 55-G Jalan Setia Perdana BA U13/BA, Setia Alam, Selangor.",
      default: "Sila tanya tentang harga, tempoh, model telefon, waktu operasi atau lokasi."
    },
    en: {
      harga: "Service prices start from RM80 depending on model and damage.",
      tempoh: "Most repairs can be completed within 1 to 2 hours.",
      model: "We repair iPhone, Samsung, Xiaomi, Huawei, OPPO and various Android models.",
      waktu: "Our operating hours are daily from 10 AM to 8 PM.",
      lokasi: "Our shop is located at 55-G Jalan Setia Perdana BA U13/BA, Setia Alam, Selangor.",
      default: "Please ask about price, duration, phone models, operating hours, or location."
    }
  };

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

  const getResponse = (question) => {
    const lang = document.documentElement.lang || "ms";
    const resp = responses[lang] || responses.ms;
    const value = question.toLowerCase();

    if (value.includes("harga") || value.includes("kos") || value.includes("price") || value.includes("cost")) return resp.harga;
    if (value.includes("lama") || value.includes("tempoh") || value.includes("siap") || value.includes("long") || value.includes("duration")) {
      return resp.tempoh;
    }
    if (value.includes("model") || value.includes("iphone") || value.includes("android") || value.includes("samsung")) {
      return resp.model;
    }
    if (value.includes("waktu") || value.includes("buka") || value.includes("jam") || value.includes("hour") || value.includes("time")) {
      return resp.waktu;
    }
    if (value.includes("lokasi") || value.includes("alamat") || value.includes("mana") || value.includes("location") || value.includes("address") || value.includes("where")) {
      return resp.lokasi;
    }

    return resp.default;
  };

  const sendMessage = () => {
    const question = input.value.trim();
    if (!question) return;

    addMessage(question, true);
    input.value = "";

    setTimeout(() => {
      lastResponse = getResponse(question);
      addMessage(lastResponse, false);
    }, 400);
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
