// ============================================================
// chat.js 🧠 ELIZA AI — BROWSER VERSION (FULL SYSTEM FIXED)
// IPFS + AES-GCM + 4 GATEWAY + DOUBLE DUO AI
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
    // MODEL TERKINI 2026
    primaryModel: "gemini-flash-lite-latest",
    fallbackModel: "gemma-4-26b-a4b-it"
};

let API_KEY = null;
let apiKeyLoaded = false;
let personaData = null;
let promptData = null;

// ==========================================
// 📦 LOAD JSON
// ==========================================
async function loadLocalJSON() {
    try {
        const [personaRes, promptRes] = await Promise.all([
            fetch('../persona-eliza-ai.json'),
            fetch('../prompt-eliza-ai.json')
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
    const keyBuffer = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-GCM' }, false, ['decrypt']);
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);
    return await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedData);
}

// ==========================================
// 🌐 FETCH FROM IPFS (4 GATEWAY)
// ==========================================
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
            console.warn(`⚠️ Gateway ${i + 1} gagal`);
            continue;
        }
    }
    throw new Error('Semua gateway IPFS gagal');
}

// ==========================================
// 🔑 AMBIL API KEY DARI 2 CID
// ==========================================
async function getApiKeyFromIPFS() {
    console.log('🔍 Loading AES Key...');
    const aesDataRaw = await fetchFromIPFS(ELIZA_CONFIG.aesKeyCid);
    const aesData = JSON.parse(new TextDecoder().decode(aesDataRaw));
    if (!aesData.aes_key) throw new Error('AES Key tidak dijumpai');
    
    console.log('🔍 Loading API Key...');
    const encryptedData = await fetchFromIPFS(ELIZA_CONFIG.apiKeyCid);
    const decryptedData = await decryptAESGCM(encryptedData, aesData.aes_key);
    const data = JSON.parse(new TextDecoder().decode(decryptedData));
    
    if (!data.API_KEY) throw new Error('API_KEY tidak dijumpai');
    return data.API_KEY;
}

// ==========================================
// 📋 FIREBASE URLs
// ==========================================
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

// ==========================================
// 📝 BUILD SYSTEM PROMPT
// ==========================================
function buildSystemPrompt(services, bookings, lang = 'ms') {
    const serviceList = services.map(s => `- ${s.titleMs?.stringValue || ""}: ${s.price?.stringValue || ""}`).join("\n");
    const bookingList = bookings.length > 0 ? bookings.map(b => `- Kod: ${b.code?.stringValue || ""} | Nama: ${b.name?.stringValue || ""}`).join("\n") : "Tiada.";
    const langInst = lang === "en" ? "Reply in English." : "Balas dalam Bahasa Melayu.";

    return `Anda adalah ${personaData?.name || "ELIZA"}. ${langInst}\nPeraturan:\n${promptData?.rules?.join("\n")}\nServis:\n${serviceList}\nTempahan:\n${bookingList}`.trim();
}

// ==========================================
// ⚙️ ENJIN UTAMA - FIX UNTUK API KEY "AQ."
// ==========================================
async function callGoogleAI(model, systemPrompt, userMessage, history, apiKey) {
    // 🔥 URL TANPA ?key= (Sebab key format AQ. guna Bearer)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    
    let contents = [];
    history.forEach(msg => {
        if (msg.text) contents.push({ role: msg.role === "user" ? "user" : "model", parts: [{ text: msg.text }] });
    });
    if (userMessage) contents.push({ role: "user", parts: [{ text: userMessage }] });

    const payload = {
        contents: contents,
        generationConfig: { temperature: 0.4, topP: 0.9, maxOutputTokens: 1024 }
    };

    // Gemini support systemInstruction, Gemma tak support (kita masukkan dalam contents)
    if (!model.includes("gemma")) {
        payload.systemInstruction = { parts: [{ text: systemPrompt }] };
    } else {
        contents.unshift({ role: "user", parts: [{ text: "SYSTEM: " + systemPrompt }] });
        payload.contents = contents;
    }

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}` // 🔥 HANTAR API KEY FORMAT AQ. DI SINI
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(25000)
        });

        const data = await res.json();
        
        if (!res.ok) {
            console.error(`[ELIZA] Reject [${model}] [${res.status}]:`, data);
            return null; // Gagal, biar fallback ambil alih
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            console.error(`[ELIZA] Empty [${model}]`);
            return null;
        }

        console.log(`[ELIZA] ✅ Success [${model}]`);
        return text;
        
    } catch (e) {
        console.error(`[ELIZA] Fetch Error [${model}]:`, e.message);
        return null;
    }
}

// ==========================================
// 🎯 DOUBLE DUO AI
// ==========================================
async function askAI(systemPrompt, userMessage, history) {
    if (!apiKeyLoaded || !API_KEY) throw new Error('API key belum sedia');
    
    // 1. Cuba Primary (Gemini)
    console.log("🔍 Trying primary: " + ELIZA_CONFIG.primaryModel);
    let text = await callGoogleAI(ELIZA_CONFIG.primaryModel, systemPrompt, userMessage, history, API_KEY);
    
    if (text) return text;

    // 2. Fallback (Gemma)
    console.log("🔄 Switching to fallback: " + ELIZA_CONFIG.fallbackModel);
    text = await callGoogleAI(ELIZA_CONFIG.fallbackModel, systemPrompt, userMessage, history, API_KEY);
    
    if (text) return text;

    // 3. Gagal kedua-dua
    return "Maaf, sistem saya sedang sibuk. Sila cuba lagi.";
}

// ==========================================
// 🚀 INIT ELIZA AI
// ==========================================
async function initElizaAI() {
    try {
        await loadLocalJSON();
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
// 💬 FUNGSI CHAT
// ==========================================
async function chatEliza(message, language = 'ms', history = []) {
    if (!apiKeyLoaded) throw new Error('ELIZA AI belum sedia. Sila tunggu.');
    
    const servicesData = await getServicesFromFirebase();
    const bookingsData = await getBookingsFromFirebase();
    const systemPrompt = buildSystemPrompt(servicesData, bookingsData, language);
    
    return await askAI(systemPrompt, message, history);
}

// ==========================================
// 🌐 EXPORT KE WINDOW
// ==========================================
window.ELIZA = {
    init: initElizaAI,
    chat: chatEliza,
    isReady: () => apiKeyLoaded
};

// ==========================================
// 🚀 AUTO INIT
// ==========================================
initElizaAI().then(loaded => {
    if (loaded) console.log('✅ ELIZA AI ready!');
});
