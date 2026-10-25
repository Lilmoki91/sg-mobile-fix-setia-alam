// ============================================================
// chat.js 🧠 ELIZA AI - BACKEND CLOUDFLARE PAGES (MUKTAMAD)
// ============================================================
import personaData from './persona-eliza-ai.json';
import promptData from './prompt-eliza-ai.json';

const FIREBASE_PROJECT_ID = "sgmfix-services";
const FIREBASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/services`;

// 🔥 FORMAT PAGES FUNCTION (BUKAN WORKER)
export async function onRequest(context) {
  const { request, env } = context;
  
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "POST") return json({ error: "Method Not Allowed" }, 405, cors);

  try {
    const { message, language, history = [] } = await request.json();
    if (!message) throw new Error("Mesej kosong");

    // Semak API Key
    if (!env.GEMINI_API_KEY) {
      return json({ reply: "❌ RALAT: API Key tiada dalam Settings Pages!" }, 500, cors);
    }

    const servicesData = await getServicesFromFirebase();
    const systemPrompt = buildSystemPrompt(servicesData, language);

    const aiReply = await askAI(systemPrompt, message, history, env.GEMINI_API_KEY);

    return json({ reply: aiReply }, 200, cors);

  } catch (error) {
    console.error("Error:", error);
    return json({ reply: "Maaf, sistem saya sibuk. Sila cuba lagi." }, 500, cors);
  }
}

async function getServicesFromFirebase() {
  try {
    const response = await fetch(FIREBASE_URL);
    const data = await response.json();
    if (!data.documents) return [];
    return data.documents.map(doc => {
      const fields = doc.fields;
      return {
        titleMs: fields.titleMs?.stringValue || "",
        titleEn: fields.titleEn?.stringValue || "",
        price: fields.price?.stringValue || "N/A",
        active: fields.active?.booleanValue !== false
      };
    }).filter(s => s.active);
  } catch (error) {
    return [];
  }
}

function buildSystemPrompt(services, lang) {
  const serviceList = services.map(s => `- ${s.titleMs} / ${s.titleEn}: ${s.price}`).join("\n");
  const languageInstruction = lang === "en" ? "You MUST reply in English." : "Anda MESTI membalas dalam Bahasa Melayu.";

  // DAPATKAN MASA TERKINI SECARA MANUAL (Waktu Malaysia UTC+8)
  const now = new Date();
  const mytTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); 
  
  const daysBM = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
  const daysEN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthsBM = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
  const monthsEN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const dayName = lang === "en" ? daysEN[mytTime.getUTCDay()] : daysBM[mytTime.getUTCDay()];
  const monthName = lang === "en" ? monthsEN[mytTime.getUTCMonth()] : monthsBM[mytTime.getUTCMonth()];
  const date = mytTime.getUTCDate();
  const year = mytTime.getUTCFullYear();
  const hours = mytTime.getUTCHours().toString().padStart(2, '0');
  const minutes = mytTime.getUTCMinutes().toString().padStart(2, '0');
  
  const currentTime = `${dayName}, ${date} ${monthName} ${year}, ${hours}:${minutes} (MYT)`;

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

Data Perkhidmatan Terkini:
${serviceList || "Tiada data."}

Lokasi: 55-G Jalan Setia Perdana BA U13/BA, Setia Alam.
Waktu Operasi: 10AM - 8PM.
  `.trim();
}

async function askAI(systemPrompt, userMessage, history, apiKey) {
  // Cuba Primary (Gemini)
  let text = await callGemini("gemini-flash-lite-latest", systemPrompt, userMessage, history, apiKey);
  if (text) return text;

  // Cuba Fallback (Gemma)
  text = await callGemini("gemma-4-26b-a4b-it", systemPrompt, userMessage, history, apiKey);
  if (text) return text;

  return "Maaf, otak saya sedang rehat. Sila WhatsApp 012-262 6434.";
}

async function callGemini(model, systemPrompt, userMessage, history, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  // 1. BINA CONTENTS YANG BERSIH & SELANG-SELI
  let contents = [];
  
  history.forEach(msg => {
    if (msg.text && msg.text.trim() !== "") {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text.trim() }]
      });
    }
  });

  if (userMessage && userMessage.trim() !== "") {
    contents.push({
      role: "user",
      parts: [{ text: userMessage.trim() }]
    });
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

  // MASUKKAN SYSTEM PROMPT KE DALAM MESEJ USER PERTAMA
  finalContents[0].parts[0].text = `${systemPrompt}\n\n[Mesej Pelanggan]: ${finalContents[0].parts[0].text}`;

  const payload = {
    contents: finalContents,
    generationConfig: { temperature: 0.5, maxOutputTokens: 1024 }
  };

  // 🔥 ABORT CONTROLLER (TIMEOUT 15 SAAT)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await res.json();
    
    // Log ralat jika API tolak
    if (!res.ok || !data.candidates || !data.candidates[0].content.parts[0].text) {
      console.error("API Reject:", JSON.stringify(data));
      return null;
    }

    return data.candidates[0].content.parts[0].text;
  } catch (e) {
    console.error("Gemini Error:", e);
    return null;
  }
}

function json(obj, status, extra) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...extra, "Content-Type": "application/json" },
  });
}
