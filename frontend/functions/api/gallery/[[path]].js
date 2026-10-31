// Cloudflare Pages Functions only: tidak dimuatkan sebagai skrip browser.
const COOKIE = 'sgm_gallery_session';
const PREFIX = 'shop-gallery/';
const MAX_BYTES = 5 * 1024 * 1024;
const encoder = new TextEncoder();

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra }
  });
}
function fail(message, status = 400) {
  const error = new Error(message); error.status = status; throw error;
}
async function hash(value, algorithm = 'SHA-256') {
  const digest = await crypto.subtle.digest(algorithm, encoder.encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
function same(a, b) {
  if (a.length !== b.length) return false;
  let different = 0;
  for (let i = 0; i < a.length; i++) different |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return different === 0;
}
async function sessionSignature(value, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const result = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return [...new Uint8Array(result)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
async function authenticated(request, env) {
  if (!env.GALLERY_SESSION_SECRET || env.GALLERY_SESSION_SECRET.length < 32) return false;
  const cookie = (request.headers.get('Cookie') || '').split(';').map(value => value.trim()).find(value => value.startsWith(`${COOKIE}=`));
  if (!cookie) return false;
  const token = cookie.slice(COOKIE.length + 1);
  const [expiry, nonce, signature, extra] = token.split('.');
  if (extra || !/^\d+$/.test(expiry || '') || !/^[a-f0-9-]{36}$/.test(nonce || '') || !/^[a-f0-9]{64}$/.test(signature || '')) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Number(expiry) <= now || Number(expiry) > now + 3600) return false;
  return same(signature, await sessionSignature(`${expiry}.${nonce}`, env.GALLERY_SESSION_SECRET));
}
function cookie(value, age) {
  return `${COOKIE}=${value}; Path=/api/gallery; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
}
function requireCloudinary(env) {
  if (!env.CLOUDINARY_CLOUD_NAME || !/^[a-zA-Z0-9_-]+$/.test(env.CLOUDINARY_CLOUD_NAME) || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET || !env.CLOUDINARY_GALLERY_PRESET) {
    fail('Konfigurasi Cloudinary belum lengkap pada Pages Functions.', 503);
  }
}
async function cloudinary(env, action, parameters, file = null) {
  requireCloudinary(env);
  const signed = { ...parameters, timestamp: String(Math.floor(Date.now() / 1000)) };
  const signingText = Object.keys(signed).sort().map(key => `${key}=${signed[key]}`).join('&');
  const signature = await hash(signingText + env.CLOUDINARY_API_SECRET, 'SHA-1');
  const body = new FormData();
  Object.entries(signed).forEach(([key, value]) => body.append(key, value));
  body.append('api_key', env.CLOUDINARY_API_KEY);
  body.append('signature', signature);
  if (file) body.append('file', file, file.name);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/${action}`, {
    method: 'POST', body, signal: AbortSignal.timeout(30000)
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    console.error('Cloudinary operation failed:', action, response.status);
    fail('Cloudinary menolak permintaan. Semak preset dan konfigurasi backend.', 502);
  }
  return data;
}
async function destroy(env, publicId) {
  // Hanya aset yang dicipta oleh modul ini boleh dipadam.
  if (!publicId || !publicId.startsWith(PREFIX)) fail('ID aset tidak sah.');
  const result = await cloudinary(env, 'destroy', { public_id: publicId, invalidate: 'true' });
  if (!['ok', 'not found'].includes(result.result)) fail('Pemadaman Cloudinary gagal.', 502);
}
async function cleanup(env, publicId) {
  try { await destroy(env, publicId); return ''; }
  catch (error) {
    console.error('Cloudinary cleanup required:', publicId, error.message);
    return 'Rekod galeri disimpan, tetapi gambar lama belum dipadam dari Cloudinary. Semak log Pages Functions dan padam aset lama di Cloudinary.';
  }
}
async function records(env) {
  const items = [];
  let cursor;
  do {
    const result = await env.GALLERY_KV.list({ prefix: 'image:', limit: 1000, ...(cursor ? { cursor } : {}) });
    const values = await Promise.all(result.keys.map(key => env.GALLERY_KV.get(key.name, 'json')));
    items.push(...values.filter(Boolean));
    cursor = result.list_complete ? null : result.cursor;
  } while (cursor);
  return items.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
function validateId(id) {
  if (typeof id !== 'string' || !/^[a-f0-9-]{36}$/.test(id)) fail('ID gambar tidak sah.');
  return id;
}
function metadata(input) {
  if (typeof input.title !== 'string' || !input.title.trim() || input.title.trim().length > 120) fail('Tajuk wajib, maksimum 120 aksara.');
  const order = Number(input.order);
  if (!Number.isInteger(order) || order < 0 || order > 9999) fail('Susunan mesti antara 0 hingga 9999.');
  if (![true, false, 'true', 'false'].includes(input.active)) fail('Status paparan tidak sah.');
  return { title: input.title.trim(), order, active: input.active === true || input.active === 'true' };
}
async function readJson(request) {
  const text = await request.text();
  if (text.length > 10000) fail('Permintaan terlalu besar.', 413);
  try { const data = JSON.parse(text); if (!data || Array.isArray(data) || typeof data !== 'object') fail('JSON tidak sah.'); return data; }
  catch { fail('JSON tidak sah.'); }
}
async function validateFile(file) {
  if (!file || typeof file.arrayBuffer !== 'function' || !file.size) fail('Sila pilih gambar.');
  if (file.size > MAX_BYTES) fail('Gambar melebihi 5 MB.', 413);
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
  const webp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  if (!((jpeg && file.type === 'image/jpeg') || (png && file.type === 'image/png') || (webp && file.type === 'image/webp'))) fail('Hanya JPEG, PNG atau WebP dibenarkan.');
}

export async function onRequest({ request, env }) {
  try {
    const url = new URL(request.url);
    const route = url.pathname.replace(/^\/api\/gallery\/?/, '').replace(/\/$/, '');
    const method = request.method;
    if (!['session', 'images'].includes(route)) return json({ error: 'Endpoint tidak dijumpai.' }, 404);
    if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(method)) return json({ error: 'Kaedah tidak dibenarkan.' }, 405);
    if (method !== 'GET') {
      // Tiada CORS terbuka; semua perubahan mesti datang dari origin laman yang sama.
      if (request.headers.get('Origin') !== url.origin) fail('Origin tidak dibenarkan.', 403);
      const length = Number(request.headers.get('Content-Length') || 0);
      if (length > MAX_BYTES + 65536) fail('Permintaan terlalu besar.', 413);
    }
    if (route === 'session') {
      if (method === 'GET') return json({ authenticated: await authenticated(request, env) });
      if (method === 'DELETE') return json({ success: true }, 200, { 'Set-Cookie': cookie('', 0) });
      if (method !== 'POST') return json({ error: 'Kaedah tidak dibenarkan.' }, 405);
      if (!env.GALLERY_ADMIN_PASSWORD || !env.GALLERY_SESSION_SECRET || env.GALLERY_SESSION_SECRET.length < 32) fail('Secret sesi galeri belum dikonfigurasi pada Cloudflare.', 503);
      if (!env.GALLERY_KV) fail('Binding GALLERY_KV belum dikonfigurasi.', 503);
      const data = await readJson(request);
      // KV ialah perlindungan best-effort sahaja; tambah rate limiting di edge.
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const attemptKey = `login:${await hash(ip + env.GALLERY_SESSION_SECRET)}`;
      const attempts = await env.GALLERY_KV.get(attemptKey, 'json');
      const recent = attempts && Date.now() - attempts.since < 15 * 60 * 1000;
      if (recent && attempts.count >= 8) fail('Terlalu banyak percubaan. Cuba lagi selepas 15 minit.', 429);
      if (typeof data.password !== 'string' || data.password.length > 256 || !same(await hash(data.password), await hash(env.GALLERY_ADMIN_PASSWORD))) {
        await env.GALLERY_KV.put(attemptKey, JSON.stringify({ since: recent ? attempts.since : Date.now(), count: recent ? attempts.count + 1 : 1 }), { expirationTtl: 900 });
        fail('Kata laluan galeri salah.', 401);
      }
      await env.GALLERY_KV.delete(attemptKey);
      const payload = `${Math.floor(Date.now() / 1000) + 3600}.${crypto.randomUUID()}`;
      const token = `${payload}.${await sessionSignature(payload, env.GALLERY_SESSION_SECRET)}`;
      return json({ success: true }, 200, { 'Set-Cookie': cookie(token, 3600) });
    }
    const admin = url.searchParams.get('admin') === '1';
    if (method !== 'GET' || admin) {
      if (!await authenticated(request, env)) fail('Sesi galeri tamat. Sila sahkan kata laluan semula.', 401);
    }
    if (!env.GALLERY_KV) fail('Binding GALLERY_KV belum dikonfigurasi.', 503);
    if (method === 'GET') {
      const configured = (await env.GALLERY_KV.get('gallery:configured')) === 'true';
      const images = await records(env);
      return json({ configured, images: admin ? images : images.filter(image => image.active).map(({ id, url, title, order }) => ({ id, url, title, order })) });
    }
    if (method === 'POST') {
      const body = await request.formData();
      const fields = { title: body.get('title'), order: body.get('order'), active: body.get('active') };
      const meta = metadata(fields);
      const suppliedId = body.get('id');
      const id = suppliedId ? validateId(suppliedId) : crypto.randomUUID();
      const old = suppliedId ? await env.GALLERY_KV.get(`image:${id}`, 'json') : null;
      if (suppliedId && !old) fail('Gambar tidak dijumpai.', 404);
      if (!old && (await records(env)).length >= 50) fail('Maksimum 50 gambar galeri.');
      const file = body.get('file');
      await validateFile(file);
      // Unique public_id mengelakkan cache gambar lama dan overwrite aset lain.
      const publicId = `${PREFIX}${crypto.randomUUID()}`;
      const uploaded = await cloudinary(env, 'upload', {
        public_id: publicId, overwrite: 'false', upload_preset: env.CLOUDINARY_GALLERY_PRESET
      }, file);
      if (uploaded.public_id !== publicId || uploaded.resource_type !== 'image' || !['jpg', 'jpeg', 'png', 'webp'].includes(uploaded.format) || uploaded.bytes > MAX_BYTES || !uploaded.secure_url?.startsWith(`https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/`)) {
        await cleanup(env, publicId);
        fail('Format atau saiz hasil upload tidak sah.', 502);
      }
      const record = { id, ...meta, url: uploaded.secure_url, publicId, updatedAt: new Date().toISOString() };
      try {
        await env.GALLERY_KV.put(`image:${id}`, JSON.stringify(record));
      } catch (error) {
        await cleanup(env, publicId);
        throw error;
      }
      // Setelah aktif, galeri kosong tetap kosong; gambar asal tidak muncul semula.
      let warning = '';
      try { await env.GALLERY_KV.put('gallery:configured', 'true'); }
      catch { warning = 'Gambar disimpan tetapi galeri belum diaktifkan. Cuba simpan semula.'; }
      if (old?.publicId) warning = (await cleanup(env, old.publicId)) || warning;
      return json({ success: true, image: record, warning });
    }
    const input = await readJson(request);
    const id = validateId(input.id);
    const old = await env.GALLERY_KV.get(`image:${id}`, 'json');
    if (!old) fail('Gambar tidak dijumpai.', 404);
    if (method === 'DELETE') {
      requireCloudinary(env);
      await env.GALLERY_KV.delete(`image:${id}`);
      const warning = await cleanup(env, old.publicId);
      return json({ success: true, warning });
    }
    const record = { ...old, ...metadata(input), updatedAt: new Date().toISOString() };
    await env.GALLERY_KV.put(`image:${id}`, JSON.stringify(record));
    await env.GALLERY_KV.put('gallery:configured', 'true');
    return json({ success: true });
  } catch (error) {
    if (!error.status) console.error('Gallery backend failed:', error.message);
    return json({ error: error.status ? error.message : 'Ralat backend galeri. Semak log Pages Functions.' }, error.status || 500);
  }
}
