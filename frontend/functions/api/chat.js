// ============================================================
// chat.js 🧠 ELIZA AI - CLOUDFLARE PAGES (DUAL MODEL & STABLE)
// ============================================================
import personaData from './persona-eliza-ai.json';
import promptData from './prompt-eliza-ai.json';

// URL DATA SERVICES SHOP
const FIREBASE_PROJECT_ID = "sgmfix-services"; // SAMA UNTUK KEDUA-DUA

// 1. URL untuk ambil SERVIS
const FIREBASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/services`;

// 2. URL untuk ambil BOOKING
const BOOKING_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/bookings`;

// 🔥 WAJIB GUNA FORMAT INI UNTUK CLOUDFLARE PAGES
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
      return json({ reply: "❌ RALAT: API Key GEMINI_API_KEY tiada dalam Cloudflare Pages Settings!" }, 500, cors);
    }

    // Ambil data dari Firebase
    const servicesData = await getServicesFromFirebase();
    const bookingsData = await getBookingsFromFirebase();
    const systemPrompt = buildSystemPrompt(servicesData, bookingsData, language);

    // Panggil AI
    const aiReply = await askAI(systemPrompt, message, history, env.GEMINI_API_KEY);

    return json({ reply: aiReply }, 200, cors);

  } catch (error) {
    console.error("System Error:", error);
    return json({ reply: `❌ SYSTEM ERROR: ${error.message}` }, 500, cors);
  }
}

// ============================================================
// 📋 SYSTEM BACA DATA
// ============================================================
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

async function getBookingsFromFirebase() {
  try {
    const response = await fetch(BOOKING_URL);
    const data = await response.json();
    if (!data.documents) return [];
    
    return data.documents.slice(0, 10).map(doc => {
      const fields = doc.fields;
      return {
        code: fields.code?.stringValue || "Tiada Kod",
        name: fields.name?.stringValue || "Tanpa Nama",
        phone: fields.phone?.stringValue || "Tiada No",
        date: fields.date?.stringValue || "",
        time: fields.time?.stringValue || "",
        status: fields.status?.stringValue || "Pending",
        service: fields.service?.stringValue || ""
      };
    });
  } catch (error) {
    console.error("Gagal ambil booking:", error);
    return [];
  }
}

// ============================================================
// 📝 SYSTEM PROMPT AI MODEL
// ============================================================
function buildSystemPrompt(services, bookings, lang) {
  const safeServices = services || [];
  const safeBookings = bookings || [];

  const serviceList = safeServices.map(s => `- ${s.titleMs} / ${s.titleEn}: ${s.price}`).join("\n");
  
  const bookingList = safeBookings.length > 0 
    ? safeBookings.map(b => `- Kod: ${b.code} | Nama: ${b.name} | Tel: ${b.phone} | Tarikh: ${b.date} | Masa: ${b.time} | Status: ${b.status} | Servis: ${b.service}`).join("\n")
    : "Tiada tempahan terkini.";

  const languageInstruction = lang === "en" ? "You MUST reply in English." : "Anda MESTI membalas dalam Bahasa Melayu.";

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
  
  const hours24 = mytTime.getUTCHours();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12; 
  const minutes = mytTime.getUTCMinutes().toString().padStart(2, '0');
  
  const currentTime = `${dayName}, ${date} ${monthName} ${year}, ${hours12}:${minutes} ${ampm} (MYT)`;

  let greetingBM = "";
  let greetingEN = "";

  if (hours24 >= 5 && hours24 < 12) {
    greetingBM = "Pagi";
    greetingEN = "Morning";
  } else if (hours24 >= 12 && hours24 < 15) {
    greetingBM = "Tengah Hari";
    greetingEN = "Afternoon";
  } else if (hours24 >= 15 && hours24 < 19) {
    greetingBM = "Petang";
    greetingEN = "Evening";
  } else {
    greetingBM = "Malam";
    greetingEN = "Night";
  }

  const timeGreeting = lang === "en" ? greetingEN : greetingBM;

  return `
Anda adalah ${personaData.name}, ${personaData.role}.
Sifat anda: ${personaData.traits.join(", ")}.
Nada: ${personaData.tone}.
Latar belakang: ${personaData.background}.

${languageInstruction}

🔥 MAKLUMAT MASA SEMASA (PENTING):
Hari ini adalah: ${currentTime}
Waktu sekarang ialah: ${timeGreeting}

Peraturan Ketat:
${promptData.rules.map((rule, i) => `${i + 1}. ${rule}`).join("\n")}
6. JANGAN dedahkan senarai tempahan ini kepada pelanggan secara terus. Hanya jawab soalan JIKA nama atau kod tempahan yang ditanya SEPADAN dengan data di bawah. JANGAN dedahkan nombor telefon pelanggan lain.

Data Perkhidmatan Terkini:
${serviceList || "Tiada data."}

🔥 DATA TEMPAHAN TERKINI (PENTING):
${bookingList}
(Jika pelanggan bertanya tentang status tempahan, cari nama atau kod mereka dalam senarai di atas. Jika tiada, minta mereka semak di tab 'Tempahan' atau hubungi WhatsApp).

Lokasi: 55-G Jalan Setia Perdana BA U13/BA, Setia Alam.
Waktu Operasi: 10AM - 8PM.
  `.trim();
}

// ==========================================
// 🧠 SYSTEM PANGGIL AI DUAL MODEL (PRIMARY & FALLBACK)
// ==========================================
async function askAI(systemPrompt, userMessage, history, apiKey) {
  // 1. Cuba panggil Primary Model (Gemini)
  console.log("Mencuba Primary Model: gemini-flash-lite-latest");
  let text = await callPrimary(systemPrompt, userMessage, history, apiKey);
  if (text) {
    return text; // Berjaya guna Gemini
  }

  // 2. Jika Gemini gagal, panggil Fallback Model (Gemma)
  console.log("Primary gagal. Mencuba Fallback Model: gemma-4-26b-a4b-it");
  text = await callFallback(systemPrompt, userMessage, history, apiKey);
  if (text) {
    return text; // Berjaya guna Gemma
  }

  // 3. Jika kedua-dua gagal
  return "Maaf, sistem saya sedang sibuk. Sila WhatsApp 012-262 6434.";
}

// ==========================================
// 🟢 FUNGSI CALL PRIMARY (GEMINI)
// ==========================================
async function callPrimary(systemPrompt, userMessage, history, apiKey) {
  return await callGoogleAI("", systemPrompt, userMessage, history, apiKey);
}

// ==========================================
// 🔴 FUNGSI CALL FALLBACK (GEMMA 4)
// ==========================================
async function callFallback(systemPrompt, userMessage, history, apiKey) {
  return await callGoogleAI("gemma-4-26b-a4b-it", systemPrompt, userMessage, history, apiKey);
}

// ==========================================
// ⚙️ ENJIN UTAMA (RETRY & TIMEOUT LEBIH STABIL)
// ==========================================
async function callGoogleAI(model, systemPrompt, userMessage, history, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
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

  // 🔥 GUNA SYSTEM INSTRUCTION (Cara rasmi Google - lebih bersih)
  const payload = {
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: finalContents,
    generationConfig: { 
      temperature: 0.4,
      topP: 0.9,
      topK: 30,
      maxOutputTokens: 1024
    }
  };

  const MAX_RETRIES = 2;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      // 🔥 Naikkan timeout ke 25 saat untuk elak terputus
      const timeoutId = setTimeout(() => controller.abort(), 25000); 

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
        keepalive: true // 🔥 Pastikan sambungan kekal
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      
      // ❌ JIKA GAGAL: Pulangkan `null` supaya fallback berfungsi
      if (!res.ok || !data.candidates || !data.candidates[0].content.parts[0].text) {
        console.error(`API Reject [${model}] Attempt ${attempt}:`, JSON.stringify(data));
        
        // Jika ralat client (400/401/403), tak perlu retry, terus gagal
        if (res.status === 400 || res.status === 401 || res.status === 403) {
           return null; 
        }
        continue; // Cuba lagi jika 500 (Server Error) atau 429 (Rate Limit)
      }

      // ✅ JIKA BERJAYA
      return data.candidates[0].content.parts[0].text;
      
    } catch (e) {
      console.error(`Fetch Error [${model}] Attempt ${attempt}:`, e.message);
      if (attempt === MAX_RETRIES) {
        return null; // Habis cubaan, pulangkan null
      }
      // Tunggu 1 saat sebelum cuba lagi
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  return null;
}

// ==========================================
// UTILITY JSON RESPONSE
// ==========================================
function json(obj, status, extra) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...extra, "Content-Type": "application/json" },
  });
}
