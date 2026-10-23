// ============================================================
// 🧠 ELIZA AI - CLOUDFLARE WORKER BACKEND
// ============================================================
import { GoogleGenAI } from '@google/genai';
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
      const { message, language } = await request.json();
      if (!message) throw new Error("Mesej kosong");

      // 1. Ambil data dari Firebase
      const servicesData = await getServicesFromFirebase();
      
      // 2. Bina prompt (gabungkan persona & rules)
      const systemPrompt = buildSystemPrompt(servicesData, language);

      // 3. Panggil AI (Double Duo)
      const aiReply = await askAI(systemPrompt, message, env);

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

  return `
Anda adalah ${personaData.name}, ${personaData.role}.
Sifat anda: ${personaData.traits.join(", ")}.
Nada: ${personaData.tone}.
Latar belakang: ${personaData.background}.

${languageInstruction}

Peraturan Ketat:
${promptData.rules.map((rule, i) => `${i + 1}. ${rule}`).join("\n")}

Data Perkhidmatan Terkini:
${serviceList || "Tiada data."}

Lokasi: 55-G Jalan Setia Perdana BA U13/BA, Setia Alam.
Waktu Operasi: 10AM - 8PM.
  `.trim();
}

async function askAI(systemPrompt, userMessage, env) {
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const fullPrompt = `${systemPrompt}\n\nPelanggan: ${userMessage}\nEliza:`;

  try {
    // 1. Primary (Gemini)
    const primary = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    });
    if (primary.text) return primary.text;
  } catch (e) { console.warn("Primary gagal:", e); }

  try {
    // 2. Fallback (Gemma)
    const fallback = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it',
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    });
    if (fallback.text) return fallback.text;
  } catch (e) { console.error("Fallback gagal:", e); }

  return "Maaf, otak saya sedang rehat. Sila WhatsApp 012-262 6434.";
}

function json(obj, status, extra) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...extra, "Content-Type": "application/json" },
  });
}
