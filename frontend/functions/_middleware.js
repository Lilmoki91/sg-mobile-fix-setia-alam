// Never HTTP-cache API responses or the login/application shell.
// functions/_middleware.js
import { cookieNames } from '../lib/auth-server.js'; // Pastikan cookieNames dieksport dari auth-server.js

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/\/$/, '');
  
  // Default Security Headers untuk semua response
  const securityHeaders = {
    'Cache-Control': 'no-store, private',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  // 1. Handle CORS Preflight (OPTIONS) di peringkat middleware
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': url.origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
        ...securityHeaders
      }
    });
  }

  // 2. Fast Path: Logout Status Check (Tanpa Firestore)
  const statusRole = { 
    '/api/auth/logout-status': 'pelanggan', 
    '/api/auth/admin-logout-status': 'admin' 
  }[path];

  if (statusRole && context.request.method === 'GET') {
    const cookieName = statusRole === 'admin' ? cookieNames.admin : cookieNames.pelanggan;
    const cookieHeader = context.request.headers.get('Cookie') || '';
    const present = cookieHeader.split(';').some(part => part.trim().startsWith(cookieName + '='));
    
    return new Response(JSON.stringify({ cookieCleared: !present, role: statusRole }), {
      headers: { ...securityHeaders, 'Content-Type': 'application/json' }
    });
  }

  // 3. Fast Path: Logout Action (Reply dulu, Revoke di belakang)
  const logoutRole = { 
    '/api/auth/logout': 'pelanggan', 
    '/api/auth/admin-logout': 'admin' 
  }[path];

  if (logoutRole && context.request.method === 'POST') {
    const origin = context.request.headers.get('Origin');
    
    // CSRF Protection: Pastikan request datang dari domain yang sah
    if (origin && origin !== url.origin) {
      return new Response(JSON.stringify({ error: 'Origin tidak dibenarkan.' }), { 
        status: 403, 
        headers: { ...securityHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Jalankan revoke di background (waitUntil) supaya response laju
    context.waitUntil((async () => {
      const { session, revoke } = await import('../lib/auth-server.js');
      const s = await session(context.request, context.env, logoutRole);
      if (s) await revoke(context.env, s.uid, logoutRole);
    })().catch(error => console.error('Logout revoke gagal; semak sesi dalam Firestore:', error.message)));

    const cookieName = logoutRole === 'admin' ? cookieNames.admin : cookieNames.pelanggan;
    
    // Clear Cookie serta-merta
    const headers = { 
      ...securityHeaders, 
      'Content-Type': 'application/json',
      'Set-Cookie': `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
    };
    
    return new Response(JSON.stringify({ success: true }), { headers });
  }

  // 4. Normal Flow: Teruskan ke route asal ([[path]].js atau HTML)
  const response = await context.next();
  
  // Tambah security headers untuk API dan fail HTML/PWA
  if (url.pathname.startsWith('/api/') || /\.(?:html)$/.test(url.pathname) || url.pathname === '/' || url.pathname === '/index' || url.pathname === '/admin') {
    const result = new Response(response.body, response);
    Object.entries(securityHeaders).forEach(([key, value]) => result.headers.set(key, value));
    return result;
  }
  
  return response;
}
