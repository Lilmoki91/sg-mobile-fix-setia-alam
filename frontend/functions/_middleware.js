// Never HTTP-cache API responses or the login/application shell.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/\/$/, '');
  const statusRole = { '/api/auth/logout-status': 'pelanggan', '/api/auth/admin-logout-status': 'admin' }[path];
  if (statusRole && context.request.method === 'GET') {
    // No Firestore lookup: only confirm whether this browser still sends the cookie.
    const name = statusRole === 'admin' ? '__Host-sgm_admin' : '__Host-sgm_session';
    const present = (context.request.headers.get('Cookie') || '').split(';').some(part => part.trim().startsWith(name + '='));
    return new Response(JSON.stringify({ cookieCleared: !present, role: statusRole }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff' }
    });
  }
  const logoutRole = { '/api/auth/logout': 'pelanggan', '/api/auth/admin-logout': 'admin' }[path];
  if (logoutRole && context.request.method === 'POST') {
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff' };
    if (context.request.headers.get('Origin') !== url.origin) {
      return new Response(JSON.stringify({ error: 'Origin tidak dibenarkan.' }), { status: 403, headers });
    }
    // Reply before loading the auth route or contacting Google/Firestore.
    const request = context.request;
    context.waitUntil((async () => {
      const { session, revoke } = await import('../lib/auth-server.js');
      const s = await session(request, context.env, logoutRole);
      if (s) await revoke(context.env, s.uid, logoutRole);
    })().catch(error => console.error('Logout revoke gagal; semak sesi dalam Firestore:', error.message)));
    const name = logoutRole === 'admin' ? '__Host-sgm_admin' : '__Host-sgm_session';
    headers['Set-Cookie'] = `${name}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
    // Cache eviction is not required to expire an HttpOnly cookie.
    return new Response(JSON.stringify({ success: true }), { headers });
  }
  const response = await context.next();
  if (url.pathname.startsWith('/api/') || /\.(?:html)$/.test(url.pathname) || url.pathname === '/' || url.pathname === '/index' || url.pathname === '/admin') {
    const result = new Response(response.body, response);
    result.headers.set('Cache-Control', 'no-store, private');
    result.headers.set('X-Content-Type-Options', 'nosniff');
    result.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return result;
  }
  return response;
}
