// ============================================================
// chat.js 🧠 ELIZA AI — BROWSER VERSION
// IPFS + AES-GCM + 4 GATEWAY + DOUBLE DUO AI
// Jalan di Cloudflare Pages (static site)
// ============================================================

// ==========================================
// 🔐 IPFS + AES-GCM CONFIG
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

// ==========================================
// 📦 LOAD JSON (GUNA FETCH, BUKAN IMPORT)
// ==========================================
let personaData = null;
let promptData = null;

async function loadLocalJSON() {
    try {
        const [personaRes, promptRes] = await Promise.all([
            fetch('./persona-eliza-ai.json'),
            fetch('./prompt-eliza-ai.json')
        ]);
        personaData = await personaRes.json();
        promptData = await promptRes.json();
        console.log('✅ JSON dimuatkan');
    } catch (error) {
        console.error('❌ Gagal load JSON:', error);
        throw error;
    }
}

// ==========================================
// 🔓 DECRYPT AES-GCM
// ==========================================
async function decryptAESGCM(combined, keyBase64) {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error('Web Crypto API tidak disokong');
    }
    
    try {
        const keyBuffer = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
        const key = await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'AES-GCM' },
            false,
            ['decrypt']
        );
        
        const iv = combined.slice(0, 12);
        const encryptedData = combined.slice(12);
        
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encryptedData
        );
        
        return decrypted;
    } catch (error) {
        console.error('❌ Decrypt error:', error);
        throw error;
    }
}

// ==========================================
// 🌐 FETCH FROM IPFS (4 GATEWAY)
// ==========================================
async function fetchFromIPFS(cid) {
    for (let i = 0; i < ELIZA_CONFIG.gateways.length; i++) {
        const gateway = ELIZA_CONFIG.gateways[i];
        const url = gateway + cid;
        
        try {
            console.log(`🌐 Gateway ${i + 1}/${ELIZA_CONFIG.gateways.length}: ${gateway}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(url, { signal: controller.signal });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = new Uint8Array(await response.arrayBuffer());
            console.log(`✅ Berjaya: ${data.length} bytes`);
            return data;
            
        } catch (error) {
            console.warn(`⚠️ Gateway ${i + 1} gagal: ${error.message}`);
            continue;
        }
    }
    
    throw new Error('Semua gateway IPFS gagal');
}

// ==========================================
// 🔑 AMBIL API KEY DARI IPFS
// ==========================================
async function getApiKeyFromIPFS() {
    console.log('🔍 Loading AES Key dari IPFS...');
    
    // 1. Fetch AES Key
    const aesDataRaw = await fetchFromIPFS(ELIZA_CONFIG.aesKeyCid);
    const aesData = JSON.parse(new TextDecoder().decode(aesDataRaw));
    const aesKey = aesData.aes_key;
    
    if (!aesKey) throw new Error('AES Key tidak dijumpai');
    console.log('✅ AES Key berjaya diambil');
    
    // 2. Fetch API Key encrypted
    console.log('🔍 Loading API Key dari IPFS...');
    const encryptedData = await fetchFromIPFS(ELIZA_CONFIG.apiKeyCid);
    
    // 3. Decrypt
    const decryptedData = await decryptAESGCM(encryptedData, aesKey);
    const data = JSON.parse(new TextDecoder().decode(decryptedData));
    
    if (!data.API_KEY) throw new Error('API_KEY tidak dijumpai');
    
    console.log('✅ API Key berjaya diambil!');
    return data.API_KEY;
}

// ==========================================
// 📋 FIREBASE URLs
// ==========================================
const FIREBASE_PROJECT_ID = "sgmfix-services";
const FIREBASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/services`;
const BOOKING_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/bookings`;

// ==========================================
// 📋 FIREBASE READERS
// ==========================================
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
        console.warn('Gagal ambil servis:', error);
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

// ==========================================
// 📝 BUILD SYSTEM PROMPT
// ==========================================
function buildSystemPrompt(services, bookings, lang = 'ms') {
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
// ⚙️ ENJIN UTAMA - CALL GOOGLE AI
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
            console.log(`[ELIZA] Attempt ${attempt}/${MAX_RETRIES} → ${model}`);

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(25000)
            });

            const data = await res.json();
            
            if (!res.ok) {
                console.error(`[ELIZA] Reject [${model}] [${res.status}]`);
                if ([400, 401, 403].includes(res.status)) return null;
                if (attempt < MAX_RETRIES) {
                    await new Promise(r => setTimeout(r, 1000));
                    continue;
                }
                return null;
            }

            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text || text.trim() === "") {
                console.error(`[ELIZA] Empty [${model}]`);
                if (attempt < MAX_RETRIES) {
                    await new Promise(r => setTimeout(r, 1000));
                    continue;
                }
                return null;
            }

            console.log(`[ELIZA] ✅ Success [${model}] — ${text.length} chars`);
            return text;
            
        } catch (e) {
            console.error(`[ELIZA] Error [${model}] Attempt ${attempt}:`, e.message);
            if (attempt === MAX_RETRIES) return null;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    
    return null;
}

// ==========================================
// 🎯 DOUBLE DUO AI — PRIMARY + FALLBACK
// ==========================================
async function askAI(systemPrompt, userMessage, history) {
    if (!apiKeyLoaded || !API_KEY) {
        throw new Error('API key belum sedia');
    }
    
    // 1. Primary (Gemini)
    console.log("🔍 Trying primary: " + ELIZA_CONFIG.primaryModel);
    let text = await callGoogleAI(
        ELIZA_CONFIG.primaryModel,
        systemPrompt,
        userMessage,
        history,
        API_KEY
    );
    
    if (text) return text;

    // 2. Fallback (Gemma)
    console.log("🔄 Switching to fallback: " + ELIZA_CONFIG.fallbackModel);
    text = await callGoogleAI(
        ELIZA_CONFIG.fallbackModel,
        systemPrompt,
        userMessage,
        history,
        API_KEY
    );
    
    if (text) return text;

    return "Maaf, sistem saya sedang sibuk. Sila WhatsApp 012-262 6434.";
}

// ==========================================
// 🚀 INIT ELIZA AI
// ==========================================
async function initElizaAI() {
    try {
        // 1. Load persona & prompt JSON
        await loadLocalJSON();
        
        // 2. Load API key dari IPFS
        API_KEY = await getApiKeyFromIPFS();
        apiKeyLoaded = true;
        
        console.log('✅ ELIZA AI sedia! 🌙✨');
        return true;
        
    } catch (error) {
        console.error('❌ Gagal init ELIZA AI:', error);
        return false;
    }
}

// ==========================================
// 💬 FUNGSI CHAT (PANGGIL DARI HTML)
// ==========================================
async function chatEliza(message, language = 'ms', history = []) {
    if (!apiKeyLoaded) {
        throw new Error('ELIZA AI belum sedia. Sila tunggu.');
    }
    
    // 1. Fetch Firebase
    const servicesData = await getServicesFromFirebase();
    const bookingsData = await getBookingsFromFirebase();
    
    // 2. Build system prompt
    const systemPrompt = buildSystemPrompt(servicesData, bookingsData, language);
    
    // 3. Call AI (Double Duo)
    const reply = await askAI(systemPrompt, message, history);
    
    return reply;
}

// ==========================================
// 🌐 EXPORT KE WINDOW (UNTUK HTML)
// ==========================================
window.ELIZA = {
    init: initElizaAI,
    chat: chatEliza,
    isReady: () => apiKeyLoaded
};

// ==========================================
// 🚀 AUTO INIT MASA PAGE LOAD
// ==========================================
initElizaAI().then(loaded => {
    if (loaded) {
        console.log('✅ ELIZA AI ready!');
        // Enable UI
        const input = document.getElementById('user-input');
        const btn = document.getElementById('send-btn');
        if (input) input.disabled = false;
        if (btn) btn.disabled = false;
    }
});
