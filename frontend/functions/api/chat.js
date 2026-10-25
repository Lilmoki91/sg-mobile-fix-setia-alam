export async function onRequest(context) {
  return new Response(JSON.stringify({ reply: "✅ UJIAN BERJAYA: Route /api/chat berfungsi!" }), {
    headers: { "Content-Type": "application/json" }
  });
}
