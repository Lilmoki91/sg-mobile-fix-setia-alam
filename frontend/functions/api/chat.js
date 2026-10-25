export async function onRequest(context) {
  const { request, env } = context;
  
  // Setup CORS
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  try {
    // 1. Semak API Key
    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ reply: "❌ ERROR: API Key GEMINI_API_KEY tiada dalam Cloudflare Pages Settings!" }), { status: 200, headers: cors });
    }

    // 2. Semak input
    const { message } = await request.json();
    if (!message) {
      return new Response(JSON.stringify({ reply: "❌ ERROR: Mesej kosong." }), { status: 200, headers: cors });
    }

    // 3. Panggil Google API Terus
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${env.GEMINI_API_KEY}`;
    
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: message }] }]
      })
    });

    const data = await res.json();
    
    // 4. Kalau Google tolak, tunjuk ralat sebenar
    if (!res.ok) {
      return new Response(JSON.stringify({ reply: `❌ RALAT GOOGLE: ${JSON.stringify(data.error?.message || data)}` }), { status: 200, headers: cors });
    }

    // 5. Kalau berjaya
    return new Response(JSON.stringify({ reply: data.candidates[0].content.parts[0].text }), { status: 200, headers: cors });

  } catch (error) {
    return new Response(JSON.stringify({ reply: `❌ RALAT SISTEM: ${error.message}` }), { status: 200, headers: cors });
  }
}
