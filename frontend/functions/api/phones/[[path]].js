// Cloudflare Pages Functions only. All product writes require a signed server session.
import { authenticated, cloudinary, validateFile } from '../gallery/[[path]].js';
import { getPhone, listPhones, savePhone, deletePhone } from '../../../lib/phones-store.js';
const PREFIX = 'shop-phones/';
const MAX_REQUEST = 31 * 1024 * 1024;
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
function fail(message, status = 400) { const e = new Error(message); e.status = status; throw e; }
function id(value) {
  if (typeof value !== 'string' || !/^[a-f0-9-]{36}$/.test(value)) fail('Kod rekod tidak sah. / Invalid record ID.');
  return value;
}
function text(input, key, max, required = false) {
  if (typeof input[key] !== 'string') fail('Medan tidak sah / Invalid field: ' + key);
  const value = input[key].trim();
  if (value.length > max || (required && !value)) fail('Medan wajib atau terlalu panjang / Required field or value too long: ' + key);
  return value;
}
function number(input, key, max, nullable = false, integer = false) {
  const value = input[key];
  if (nullable && value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max || (integer && !Number.isInteger(value))) fail('Nombor tidak sah / Invalid number: ' + key);
  return value;
}
function choice(input, key, values) {
  if (!values.includes(input[key])) fail('Pilihan tidak sah / Invalid choice: ' + key);
  return input[key];
}
function metadata(input) {
  if (!input || Array.isArray(input) || typeof input !== 'object') fail('Metadata tidak sah. / Invalid metadata.');
  const data = {
    name: text(input, 'name', 120, true), brand: text(input, 'brand', 60, true), model: text(input, 'model', 80, true),
    ram: text(input, 'ram', 30, true), storage: text(input, 'storage', 30, true), variant: choice(input, 'variant', ['', '4G', '5G']),
    condition: choice(input, 'condition', ['unknown', 'new', 'used', 'refurbished']),
    colorMs: text(input, 'colorMs', 60), colorEn: text(input, 'colorEn', 60),
    price: Math.round(number(input, 'price', 999999) * 100) / 100, stock: number(input, 'stock', 9999, true, true),
    status: choice(input, 'status', ['unknown', 'available', 'reserved', 'sold']), battery: number(input, 'battery', 100, true, true),
    set: choice(input, 'set', ['unknown', 'full', 'phoneOnly']), accessoriesMs: text(input, 'accessoriesMs', 1000), accessoriesEn: text(input, 'accessoriesEn', 1000),
    warrantyMs: text(input, 'warrantyMs', 200), warrantyEn: text(input, 'warrantyEn', 200), descriptionMs: text(input, 'descriptionMs', 3000), descriptionEn: text(input, 'descriptionEn', 3000)
  };
  if (typeof input.published !== 'boolean') fail('Status penerbitan tidak sah. / Invalid publication status.');
  data.published = input.published;
  if (!Array.isArray(input.images) || input.images.length > 6) fail('Maksimum 6 gambar. / Maximum 6 images.');
  if (data.published && (!input.images.length || !data.variant || data.condition === 'unknown' || data.status === 'unknown' || data.stock === null || !data.descriptionMs || !data.descriptionEn)) fail('Untuk terbit: lengkapkan gambar, varian, keadaan, status, stok dan penerangan BM/EN. / To publish: complete images, variant, condition, status, stock and BM/EN descriptions.');
  if (data.published && data.status === 'available' && data.stock < 1) fail('Produk tersedia mesti mempunyai stok. / Available products must have stock.');
  return data;
}
function cloudEnv(env) {
  if (!env.CLOUDINARY_PHONES_PRESET) fail('CLOUDINARY_PHONES_PRESET belum ditetapkan. / CLOUDINARY_PHONES_PRESET is missing.', 503);
  return { ...env, CLOUDINARY_GALLERY_PRESET: env.CLOUDINARY_PHONES_PRESET };
}
async function cleanup(env, images) {
  let warning = false;
  for (const image of images) {
    try {
      if (!image.publicId?.startsWith(PREFIX)) throw new Error('Unexpected asset prefix');
      const result = await cloudinary(cloudEnv(env), 'destroy', { public_id: image.publicId, invalidate: 'true' });
      if (!['ok', 'not found'].includes(result.result)) throw new Error('Destroy failed');
    } catch (e) { warning = true; console.error('Phones asset cleanup required:', image.publicId, e.message); }
  }
  return warning;
}
function publicProduct(p) {
  // Explicit whitelist: no updateTime or future private admin fields in public API.
  const keys = ['id', 'code', 'name', 'brand', 'model', 'ram', 'storage', 'variant', 'condition', 'colorMs', 'colorEn', 'price', 'stock', 'status', 'battery', 'set', 'accessoriesMs', 'accessoriesEn', 'warrantyMs', 'warrantyEn', 'descriptionMs', 'descriptionEn', 'createdAt'];
  const result = Object.fromEntries(keys.map(k => [k, p[k] ?? null]));
  result.images = (p.images || []).map(i => ({ url: i.url }));
  return result;
}
async function readBody(request) {
  // Bound streamed input even if Content-Length is absent or dishonest.
  const reader = request.body?.getReader();
  if (!reader) fail('Body diperlukan. / Request body required.');
  const chunks = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > MAX_REQUEST) { await reader.cancel(); fail('Permintaan terlalu besar. / Request too large.', 413); }
    chunks.push(value);
  }
  return new Response(new Blob(chunks), { headers: { 'Content-Type': request.headers.get('Content-Type') || '' } });
}
export async function onRequest({ request, env }) {
  try {
    const url = new URL(request.url), method = request.method;
    if (url.pathname.replace(/\/$/, '') !== '/api/phones/products') return json({ error: 'Not found' }, 404);
    if (!['GET', 'POST', 'DELETE'].includes(method)) return json({ error: 'Method not allowed' }, 405);
    const admin = url.searchParams.get('admin') === '1';
    if (method !== 'GET') {
      if (request.headers.get('Origin') !== url.origin) fail('Origin tidak dibenarkan. / Origin not allowed.', 403);
      if (Number(request.headers.get('Content-Length') || 0) > MAX_REQUEST) fail('Permintaan terlalu besar. / Request too large.', 413);
    }
    if ((method !== 'GET' || admin) && !await authenticated(request, env)) fail('Sesi tamat. Sahkan kata laluan galeri semula. / Session expired; verify the gallery password.', 401);
    if (method === 'GET') {
      const products = await listPhones(env, admin);
      return json({ products: admin ? products : products.filter(p => p.published === true).map(publicProduct) });
    }
    const body = await readBody(request);
    if (method === 'DELETE') {
      const input = await body.json(), productId = id(input.id), old = await getPhone(env, productId);
      if (!old) fail('Produk tidak dijumpai. / Product not found.', 404);
      if (old.updateTime !== input.updateTime) fail('Produk telah berubah. Muat semula. / Product changed; refresh.', 409);
      await deletePhone(env, productId, old.updateTime);
      return json({ success: true, warning: await cleanup(env, old.images || []) });
    }
    const form = await body.formData();
    const raw = form.get('metadata');
    if (typeof raw !== 'string' || raw.length > 20000) fail('Metadata tidak sah. / Invalid metadata.');
    let input; try { input = JSON.parse(raw); } catch { fail('JSON tidak sah. / Invalid JSON.'); }
    const data = metadata(input), productId = input.id ? id(input.id) : crypto.randomUUID();
    const old = input.id ? await getPhone(env, productId) : null;
    if (input.id && !old) fail('Produk tidak dijumpai. / Product not found.', 404);
    if (old && old.updateTime !== input.updateTime) fail('Produk telah berubah. Muat semula. / Product changed; refresh.', 409);
    const retained = new Set(), fileIndexes = new Set();
    // Validate every file/reference before any external upload.
    for (const image of input.images) {
      if (!image || typeof image !== 'object') fail('Gambar tidak sah. / Invalid image.');
      if (typeof image.publicId === 'string') {
        if (!old?.images.some(i => i.publicId === image.publicId) || retained.has(image.publicId)) fail('Rujukan gambar tidak sah. / Invalid image reference.');
        retained.add(image.publicId);
      } else {
        if (!Number.isInteger(image.fileIndex) || image.fileIndex < 0 || image.fileIndex > 5 || fileIndexes.has(image.fileIndex)) fail('Indeks fail tidak sah. / Invalid file index.');
        fileIndexes.add(image.fileIndex); await validateFile(form.get('file' + image.fileIndex));
      }
    }
    const uploaded = [], finalImages = [];
    let saved = false;
    try {
      for (const image of input.images) {
        if (image.publicId) { finalImages.push(old.images.find(i => i.publicId === image.publicId)); continue; }
        const publicId = PREFIX + crypto.randomUUID();
        // Remember generated IDs so validation/save failures can clean them up.
        uploaded.push({ publicId });
        const result = await cloudinary(cloudEnv(env), 'upload', { public_id: publicId, asset_folder: 'shop-phones', overwrite: 'false', upload_preset: env.CLOUDINARY_PHONES_PRESET }, form.get('file' + image.fileIndex));
        if (result.public_id !== publicId || result.resource_type !== 'image' || !['jpg', 'jpeg', 'png', 'webp'].includes(result.format) || result.bytes > 5 * 1024 * 1024 || !result.secure_url?.startsWith(`https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/`)) fail('Hasil upload tidak sah. / Invalid upload result.', 502);
        finalImages.push({ publicId, url: result.secure_url });
      }
      const now = new Date().toISOString();
      await savePhone(env, productId, { ...data, code: old?.code || 'PH-' + productId.toUpperCase(), images: finalImages, createdAt: old?.createdAt || now, updatedAt: now }, old?.updateTime);
      saved = true;
    } catch (e) {
      // A timeout can occur after Firestore commits. Never delete images referenced by a committed product.
      let current;
      try { current = await getPhone(env, productId); }
      catch { console.error('Phones save outcome unknown; inspect assets:', uploaded.map(i => i.publicId)); throw e; }
      const referenced = new Set((current?.images || []).map(i => i.publicId));
      await cleanup(env, uploaded.filter(i => !referenced.has(i.publicId)));
      throw e;
    }
    if (saved) {
      const warning = await cleanup(env, (old?.images || []).filter(i => !retained.has(i.publicId)));
      return json({ success: true, id: productId, warning });
    }
  } catch (e) {
    if (!e.status) console.error('Phones backend failed:', e.message);
    return json({ error: e.status ? e.message : 'Ralat backend telefon. Semak log Cloudflare. / Phone backend error; check Cloudflare logs.' }, e.status || 500);
  }
}
