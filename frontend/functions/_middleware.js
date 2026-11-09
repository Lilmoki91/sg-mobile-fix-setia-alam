// Never HTTP-cache API responses or the login/application shell.
export async function onRequest(context) {
  const response = await context.next();
  const url = new URL(context.request.url);
  if (url.pathname.startsWith('/api/') || /\.(?:html)$/.test(url.pathname) || url.pathname === '/' || url.pathname === '/index' || url.pathname === '/admin') {
    const result = new Response(response.body, response);
    result.headers.set('Cache-Control', 'no-store, private');
    result.headers.set('X-Content-Type-Options', 'nosniff');
    result.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return result;
  }
  return response;
}
  
