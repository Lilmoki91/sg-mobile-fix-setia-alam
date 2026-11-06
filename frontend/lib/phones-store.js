// lib/phones-store.js
// Server only. Firestore REST uses a service account; no browser credentials.
const encoder = new TextEncoder();
let cachedToken = null;
function fail(message, status = 503) { const e = new Error(message); e.status = status; throw e; }
function base64url(bytes) {
  let text = ''; for (const byte of bytes) text += String.fromCharCode(byte);
  return btoa(text).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
export async function token(env, scope = 'https://www.googleapis.com/auth/datastore') {
  if (!env.FIREBASE_PROJECT_ID || !/^[a-z0-9-]+$/.test(env.FIREBASE_PROJECT_ID) || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) fail('Konfigurasi service account Firestore belum lengkap. / Firestore service account configuration is incomplete.');
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.email === env.FIREBASE_CLIENT_EMAIL && cachedToken.scope === scope && cachedToken.expires > now + 60) return cachedToken.value;
  const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  let key;
  try {
    key = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(privateKey), c => c.charCodeAt(0)), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  } catch { fail('Private key Firestore tidak sah. / Invalid Firestore private key.'); }
  const header = base64url(encoder.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const claims = base64url(encoder.encode(JSON.stringify({ iss: env.FIREBASE_CLIENT_EMAIL, scope, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })));
  const payload = header + '.' + claims;
  const signature = base64url(new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(payload))));
  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: payload + '.' + signature }), signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  if (!response.ok || !data.access_token) fail('Autentikasi Firestore gagal. Semak service account. / Firestore authentication failed.');
  cachedToken = { email: env.FIREBASE_CLIENT_EMAIL, scope, value: data.access_token, expires: now + Number(data.expires_in || 3600) };
  return data.access_token;
}
function encode(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)])) } };
}
function decode(v) {
  if ('nullValue' in v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decode);
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, decode(x)]));
  return v.timestampValue || null;
}
function documentValue(doc) { return { ...Object.fromEntries(Object.entries(doc.fields || {}).map(([k, v]) => [k, decode(v)])), id: doc.name.split('/').pop(), updateTime: doc.updateTime }; }
async function request(env, path, method = 'GET', body) {
  const accessToken = await token(env);
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents${path}`, {
    method, headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000)
  });
  if (response.status === 404 && method === 'GET' && path.startsWith('/phones/')) return null;
  let data; try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) {
    console.error('Phones Firestore REST:', response.status, data.error?.status);
    if ([409, 412].includes(response.status) || data.error?.status === 'FAILED_PRECONDITION') fail('Produk telah diubah oleh admin lain. Muat semula sebelum edit. / Product changed; refresh before editing.', 409);
    fail('Operasi Firestore gagal. Semak IAM dan database. / Firestore operation failed; check IAM and database.', 502);
  }
  return data;
}
export async function getPhone(env, id) { const doc = await request(env, '/phones/' + id); return doc ? documentValue(doc) : null; }
export async function listPhones(env, admin) {
  // Public query never reads drafts. This single-field query needs no composite index.
  const structuredQuery = { from: [{ collectionId: 'phones' }], ...(admin ? {} : { where: { fieldFilter: { field: { fieldPath: 'published' }, op: 'EQUAL', value: { booleanValue: true } } } }) };
  const result = await request(env, ':runQuery', 'POST', { structuredQuery });
  return result.filter(item => item.document).map(item => documentValue(item.document));
}
export async function savePhone(env, id, value, oldUpdateTime) {
  const precondition = oldUpdateTime ? { updateTime: oldUpdateTime } : { exists: false };
  await request(env, ':commit', 'POST', { writes: [{ update: { name: `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/phones/${id}`, fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)])) }, currentDocument: precondition }] });
}
export async function deletePhone(env, id, updateTime) {
  await request(env, ':commit', 'POST', { writes: [{ delete: `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/phones/${id}`, currentDocument: { updateTime } }] });
}
