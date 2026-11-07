// Server only: Firebase REST + Web Crypto, without an Admin SDK dependency.
import { token as serviceToken } from './phones-store.js';
const enc = new TextEncoder();
export const DAY = 86400000;
export const cookieNames = { pelanggan: '__Host-sgm_session', admin: '__Host-sgm_admin' };
export function fail(message, status = 400) { const e = new Error(message); e.status = status; throw e; }
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff', ...headers } });
}
export function origin(request) {
  if (request.headers.get('Origin') !== new URL(request.url).origin) fail('Origin tidak dibenarkan.', 403);
}
export async function body(request) {
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) fail('JSON diperlukan.', 415);
  const reader = request.body?.getReader(); if (!reader) fail('Body diperlukan.');
  let size = 0; const chunks = [];
  while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 20000) { await reader.cancel(); fail('Permintaan terlalu besar.', 413); } chunks.push(value); }
  try { const value = JSON.parse(await new Blob(chunks).text()); if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error(); return value; } catch { fail('JSON tidak sah.'); }
}
export async function hash(value) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(value)))].map(b => b.toString(16).padStart(2, '0')).join(''); }
export function equal(a, b) { let diff = a.length ^ b.length; for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return diff === 0; }
export const str = value => ({ stringValue: value });
export const stamp = ms => ({ timestampValue: new Date(ms).toISOString() });
export function docName(env, path) { return `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`; }
export async function rest(env, path, method = 'GET', data) {
  const r = await fetch(`https://firestore.googleapis.com/v1/${docName(env, '').replace(/\/$/, '')}${path.startsWith(':') ? '' : '/'}${path}`, {
    method, headers: { Authorization: 'Bearer ' + await serviceToken(env), 'Content-Type': 'application/json' }, ...(data ? { body: JSON.stringify(data) } : {}), signal: AbortSignal.timeout(20000)
  });
  if (r.status === 404 && ['GET', 'DELETE'].includes(method)) return null;
  const result = await r.json();
  if (!r.ok) { if ([409, 412].includes(r.status)) fail('Rekod sudah berubah. Cuba lagi.', 409); console.error('Auth Firestore:', r.status, result.error?.status); fail('Operasi database gagal.', 502); }
  return result;
}
export function fields(doc) {
  return Object.fromEntries(Object.entries(doc?.fields || {}).map(([k, v]) => [k, v.stringValue ?? v.booleanValue ?? (v.timestampValue ? v.timestampValue : Number(v.integerValue))]));
}
export async function queryOwned(env, collection, field, uid) {
  const result = await rest(env, ':runQuery', 'POST', { structuredQuery: { from: [{ collectionId: collection }], where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: str(uid) } } } });
  return result.filter(x => x.document).map(x => x.document);
}
export async function commit(env, writes) { return rest(env, ':commit', 'POST', { writes }); }
export function cookie(role, raw = '', age = 0) { return `${cookieNames[role]}=${raw}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`; }
export async function session(request, env, role = 'pelanggan') {
  const raw = (request.headers.get('Cookie') || '').split(';').map(x => x.trim()).find(x => x.startsWith(cookieNames[role] + '='))?.split('=')[1];
  if (!/^[a-f0-9]{64}$/.test(raw || '')) return null;
  const sid = await hash(raw), doc = await rest(env, 'authSessions/' + sid), s = fields(doc);
  if (!doc || s.role !== role || !s.uid || s.revoked !== false || !Number.isFinite(Date.parse(s.expiresAt)) || Date.parse(s.expiresAt) <= Date.now()) return null;
  return { ...s, sid };
}
export async function revoke(env, uid, role) {
  const docs = await queryOwned(env, 'authSessions', 'uid', uid);
  for (let i = 0; i < docs.length; i += 400) {
    const writes = docs.slice(i, i + 400).filter(d => fields(d).role === role).map(d => ({ delete: d.name }));
    if (writes.length) await commit(env, writes);
  }
}
function b64(bytes) { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_'); }
function unb64(text) { return Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)); }
async function sign(env, claims) {
  const pem = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  if (!pem) fail('Service account belum ditetapkan.', 503);
  const key = await crypto.subtle.importKey('pkcs8', unb64(pem), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const payload = b64(enc.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))) + '.' + b64(enc.encode(JSON.stringify(claims)));
  return payload + '.' + b64(new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(payload))));
}
export async function customToken(env, s) {
  const now = Math.floor(Date.now() / 1000);
  return sign(env, { iss: env.FIREBASE_CLIENT_EMAIL, sub: env.FIREBASE_CLIENT_EMAIL, aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit', iat: now, exp: now + 3600, uid: s.uid, claims: { sid: s.sid, role: s.role } });
}
let jwksCache;
export async function googleIdentity(env, idToken, recent = false) {
  if (typeof idToken !== 'string' || idToken.length > 12000) fail('Token Google tidak sah.', 401);
  const parts = idToken.split('.'); if (parts.length !== 3) fail('Token Google tidak sah.', 401);
  let header, claims;
  try { header = JSON.parse(new TextDecoder().decode(unb64(parts[0]))); claims = JSON.parse(new TextDecoder().decode(unb64(parts[1]))); } catch { fail('Token Google tidak sah.', 401); }
  if (!jwksCache || jwksCache.until < Date.now()) {
    const r = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com', { signal: AbortSignal.timeout(15000) });
    if (!r.ok) fail('Gagal mengesahkan Google.', 502);
    jwksCache = { keys: (await r.json()).keys, until: Date.now() + 300000 };
  }
  const jwk = jwksCache.keys.find(k => k.kid === header.kid);
  const now = Math.floor(Date.now() / 1000);
  if (header.alg !== 'RS256' || !jwk || claims.aud !== env.FIREBASE_PROJECT_ID || claims.iss !== `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}` || !claims.sub || claims.sub.length > 128 || !Number.isFinite(claims.exp) || !Number.isFinite(claims.iat) || claims.exp <= now || claims.iat > now + 30 || !Number.isFinite(claims.auth_time) || claims.auth_time > now + 30 || (recent && now - claims.auth_time > 300) || claims.firebase?.sign_in_provider !== 'google.com' || claims.email_verified !== true) fail('Sila login Google semula.', 401);
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, unb64(parts[2]), enc.encode(parts[0] + '.' + parts[1]))) fail('Token Google tidak sah.', 401);
  if (!env.FIREBASE_WEB_API_KEY) fail('FIREBASE_WEB_API_KEY belum ditetapkan.', 503);
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(env.FIREBASE_WEB_API_KEY)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }), signal: AbortSignal.timeout(15000) });
  const user = (await r.json()).users?.[0];
  if (!r.ok || !user || user.disabled || user.localId !== claims.sub) fail('Akaun Google tidak sah.', 401);
  return { uid: claims.sub, email: user.email, nama: user.displayName || claims.name || '', photoURL: user.photoUrl || claims.picture || '' };
}
export async function captcha(request, env, value, action) {
  if (!env.TURNSTILE_SECRET_KEY || !env.TURNSTILE_SITE_KEY || !env.TURNSTILE_HOSTNAME) fail('Turnstile backend belum dikonfigurasi.', 503);
  if (typeof value !== 'string' || !value || value.length > 2048) fail('Sila selesaikan CAPTCHA.', 403);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: value, ...(request.headers.get('CF-Connecting-IP') ? { remoteip: request.headers.get('CF-Connecting-IP') } : {}) }), signal: AbortSignal.timeout(15000) });
  const data = await r.json();
  if (!r.ok || !data.success || data.action !== action || data.hostname !== env.TURNSTILE_HOSTNAME) fail('CAPTCHA gagal atau tamat. Cuba lagi.', 403);
}
export async function issue(env, uid, role) {
  const raw = [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, '0')).join('');
  const sid = await hash(raw), now = Date.now(), expiresAt = now + DAY;
  await commit(env, [{ update: { name: docName(env, 'authSessions/' + sid), fields: { uid: str(uid), role: str(role), createdAt: stamp(now), expiresAt: stamp(expiresAt), revoked: { booleanValue: false } } }, currentDocument: { exists: false } }]);
  return { raw, sid, uid, role, expiresAt: new Date(expiresAt).toISOString() };
}
export async function adminAuthenticated(request, env) { return !!await session(request, env, 'admin'); }
