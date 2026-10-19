export default {
  async fetch(request, env) {
    // 1. Tetapan CORS (Kebenaran akses dari web anda)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", 
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle Preflight (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // 2. Route untuk Login
    if (url.pathname === "/login" && request.method === "POST") {
      try {
        const body = await request.json();
        const userPassword = body.password;

        // Semak dengan password dalam Cloudflare Secrets
        if (userPassword === env.ADMIN_PASSWORD) {
          return new Response(JSON.stringify({ 
            success: true, 
            token: env.ADMIN_TOKEN // Pulangkan token jika betul
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else {
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Password salah" 
          }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (e) {
        return new Response(JSON.stringify({ error: "Format tidak sah" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Jika tiada route yang padan
    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
