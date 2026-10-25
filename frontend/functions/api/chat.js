// ============================================================
//  chat.js 🧠 ELIZA AI - BACKEND CLOUDFLARE PAGES (MUKTAMAD - FIXED ALTERNATION)
// ============================================================
import personaData from './persona-eliza-ai.json';
import promptData from './prompt-eliza-ai.json';

const FIREBASE_PROJECT_ID = "sgmfix-services";
const FIREBASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/services`;

export default {
  async fetch(request, env, ctx) {
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

      const servicesData = await getServicesFromFirebase();
      const systemPrompt = buildSystemPrompt(servicesData, language);

      const aiReply = await askAI(systemPrompt, message, history, env);

      return json({ reply: aiReply }, 200, cors);

    } catch (error) {
      console.error("Error:", error);
      return json({ reply: "Maaf, sistem saya sibuk. Sila cuba lagi." }, 500, cors);
    }
  },
};

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

  // 🔥 DAPATKAN MASA TERKINI SECARA MANUAL (Waktu Malaysia UTC+8)
  const now = new Date();
  const mytTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // Tambah 8 jam
  
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
(Gunakan maklumat ini jika pelanggan bertanya tentang hari ini, tarikh, atau masa).

Peraturan Ketat:
${promptData.rules.map((rule, i) => `${i + 1}. ${rule}`).join("\n")}

Data Perkhidmatan Terkini:
${serviceList || "Tiada data."}

Lokasi: 55-G Jalan Setia Perdana BA U13/BA, Setia Alam.
Waktu Operasi: 10AM - 8PM.
  `.trim();
}

async function askAI(systemPrompt, userMessage, history, env) {
  // Cuba Primary (Gemini)
  let text = await callGemini("gemini-flash-lite-latest", systemPrompt, userMessage, history, env.GEMINI_API_KEY);
  if (text) return text;

  // Cuba Fallback (Gemma)
  text = await callGemini("gemma-4-26b-a4b-it", systemPrompt, userMessage, history, env.GEMINI_API_KEY);
  if (text) return text;

  return "Maaf, otak saya sedang rehat. Sila WhatsApp 012-262 6434.";
}

async function callGemini(model, systemPrompt, userMessage, history, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  // 🔥 1. BINA CONTENTS YANG BERSIH & SELANG-SELI
  let contents = [];
  
  // Masukkan history (buang yang kosong)
  history.forEach(msg => {
    if (msg.text && msg.text.trim() !== "") {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text.trim() }]
      });
    }
  });

  // Masukkan mesej baru
  if (userMessage && userMessage.trim() !== "") {
    contents.push({
      role: "user",
      parts: [{ text: userMessage.trim() }]
    });
  }

  // 🔥 2. PASTIKAN IA MULAKAN DENGAN 'user' DAN BERSELANG-SELI
  const finalContents = [];
  for (const item of contents) {
    if (finalContents.length === 0) {
      // Mesti mula dengan user
      if (item.role === "user") finalContents.push(item);
    } else {
      const prev = finalContents[finalContents.length - 1];
      if (prev.role === item.role) {
        // Kalau sama role, gabungkan teks (elak error API)
        prev.parts[0].text += "\n" + item.parts[0].text;
      } else {
        finalContents.push(item);
      }
    }
  }

  // Kalau kosong (fallback), paksa masuk user message
  if (finalContents.length === 0) {
    finalContents.push({ role: "user", parts: [{ text: userMessage || "Hello" }] });
  }

  // 🔥 3. MASUKKAN SYSTEM PROMPT KE DALAM MESEJ USER PERTAMA
  // (Cara ini paling selamat, berfungsi untuk Gemini & Gemma)
  finalContents[0].parts[0].text = `${systemPrompt}\n\n[Mesej Pelanggan]: ${finalContents[0].parts[0].text}`;

  // 🔥 4. PAYLOAD
  const payload = {
    contents: finalContents,
    generationConfig: { temperature: 0.5, maxOutputTokens: 1024 }
  };

// abort error ------------------------------
  try {
  // 🔥 TAMBAH TIMEOUT 15 SAAT UNTUK GOOGLE API
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: controller.signal // 🔥 Masukkan signal
  });

  clearTimeout(timeoutId);

  const data = await res.json();
 
// ------------------------------------------    

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
