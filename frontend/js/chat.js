// ============================================================
// chat.js 🧠 ELIZA AI — FINAL FIX (BEARER TOKEN & JSON PATH)
// ============================================================

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
let personaData = null;
let promptData = null;

async function loadLocalJSON() {
    try {
        // Naik satu folder (../) sebab chat.js ada dalam folder /js/
        const [personaRes, promptRes] = await Promise.all([
            fetch('../persona-eliza-ai.json'),
            fetch('../prompt-eliza-ai.json')
        ]);
        if (!personaRes.ok || !promptRes.ok) throw new Error("Fail JSON tak jumpa. Pastikan ia ada di folder utama.");
        personaData = await personaRes.json();
        promptData = await promptRes.json();
        console.log('✅ JSON dimuatkan');
    } catch (error) {
        console.error('❌ Gagal load JSON:', error);
        throw error;
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

// 🔥 FIX API CALL: MENGGUNAKAN AUTHORIZATION BEARER
async function callGoogleAI(model, systemPrompt, userMessage, history, apiKey) {
    // Buang ?key= dari URL
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    
    let contents = [];
    
    // Masukkan System Prompt sebagai mesej pertama (Paling selamat untuk Gemini & Gemma)
    contents.push({ role: "user", parts: [{ text: systemPrompt }] });
    contents.push({ role: "model", parts: [{ text: "Faham. Saya akan patuhi arahan ini." }] });

    // Masukkan history
    history.forEach(msg => {
        if (msg.text) contents.push({ role: msg.role === "user" ? "user" : "model", parts: [{ text: msg.text }] });
    });
    
    // Masukkan soalan terkini
    contents.push({ role: "user", parts: [{ text: userMessage }] });

    const payload = {
        contents: contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 }
    };

    try {
        console.log(`[ELIZA] Calling ${model}...`);
        
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
        console.error(`[ELIZA] Fail [${model}]:`, e.message);
        throw e; // Lempar error sebenar ke atas
    }
}

async function askAI(systemPrompt, userMessage, history) {
    if (!apiKeyLoaded || !API_KEY) throw new Error('API key belum sedia');
    
    try {
        return await callGoogleAI(ELIZA_CONFIG.primaryModel, systemPrompt, userMessage, history, API_KEY);
    } catch (errPrimary) {
        console.warn(`Primary (${ELIZA_CONFIG.primaryModel}) gagal: ${errPrimary.message}`);
        try {
            return await callGoogleAI(ELIZA_CONFIG.fallbackModel, systemPrompt, userMessage, history, API_KEY);
        } catch (errFallback) {
            console.error(`Fallback gagal: ${errFallback.message}`);
            throw new Error(`Primary: ${errPrimary.message} | Fallback: ${errFallback.message}`);
        }
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
        return false;
    }
}

async function chatEliza(message, language = 'ms', history = []) {
    if (!apiKeyLoaded) throw new Error('ELIZA AI belum sedia.');
    try {
        const services = await getServicesFromFirebase();
        const bookings = await getBookingsFromFirebase();
        const sysPrompt = buildSystemPrompt(services, bookings, language);
        return await askAI(sysPrompt, message, history);
    } catch (error) {
        // Pulangkan ralat sebenar supaya UI boleh paparkan
        return `❌ RALAT: ${error.message}`;
    }
}

window.ELIZA = { chat: chatEliza, isReady: () => apiKeyLoaded };
initElizaAI();
